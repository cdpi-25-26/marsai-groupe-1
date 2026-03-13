/**
 * @bref Contrôleur Video — upload S3 + vérification copyright YouTube en arrière-plan
 */

import VideoUpload from "../models/VideoUpload.js";
import Film from "../models/Film.js";
import Notification from "../models/Notification.js";
import VideoService from "../services/VideoService.js";
import { asyncHandler, AppError } from "../middlewares/errorHandler.js";
import logger from "../utils/logger.js";

// Délai avant la vérification copyright (4 minutes)
const COPYRIGHT_CHECK_DELAY = 4 * 60 * 1000;

// ─── Upload vidéo (asynchrone) ───────────────────────────────────────────────

/**
 * POST /api/videos/upload
 * 1. Upload S3 immédiat → réponse PENDING
 * 2. Upload YouTube + vérification copyright en arrière-plan (4 min)
 * 3. Statut mis à jour : APPROVED ou REJECTED
 */
export const uploadVideo = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError("Fichier vidéo requis (champ 'video')", 400);

  const title = req.body.title || req.file.originalname;
  const userId = req.user?.id || null;
  const { country, category, synopsis } = req.body;
  const aiTools = req.body.aiTools ? JSON.parse(req.body.aiTools) : null;

  // Upload S3 immédiat
  const { s3Url, key } = await VideoService.uploadToS3(req.file);

  // Créer l'enregistrement PENDING avec toutes les métadonnées
  const upload = await VideoUpload.create({
    userId,
    filename: req.file.originalname,
    title,
    s3Key: key,
    s3Url,
    fileSize: req.file.size,
    copyrightStatus: "PENDING",
    country:  country  || null,
    category: category || null,
    synopsis: synopsis || null,
    aiTools:  aiTools  || null,
  });

  logger.info("Video upload created", { id: upload.id, key });

  // Lancer la vérification copyright en arrière-plan
  checkCopyrightAsync(upload.id, req.file.buffer, req.file.mimetype, req.file.originalname, title);

  res.status(201).json({
    message: "Vidéo uploadée. Vérification copyright en cours...",
    id: upload.id,
    s3Url,
    key,
    copyrightStatus: "PENDING",
  });
});

/**
 * @bref Vérification copyright en arrière-plan
 * Upload YouTube → attente 4 min → vérification copyright → APPROVED ou REJECTED
 */
async function checkCopyrightAsync(uploadId, fileBuffer, mimeType, filename, title) {
  try {
    const upload = await VideoUpload.findByPk(uploadId);
    if (!upload) return;

    // 1. Upload YouTube
    const file = { buffer: fileBuffer, mimetype: mimeType, originalname: filename };
    const { youtubeVideoId } = await VideoService.uploadToYoutube(file, title);
    await upload.update({ youtubeVideoId });
    logger.info("YouTube upload done", { uploadId, youtubeVideoId });

    // 2. Attendre 4 minutes pour que YouTube Content ID scanne la vidéo
    logger.info(`Waiting ${COPYRIGHT_CHECK_DELAY / 1000}s before copyright check`, { uploadId, youtubeVideoId });
    await new Promise(resolve => setTimeout(resolve, COPYRIGHT_CHECK_DELAY));

    // 3. Vérifier le copyright
    await upload.update({ lastCopyrightCheckAt: new Date(), copyrightCheckAttempts: 1 });
    await VideoService.checkYoutubeCopyright(youtubeVideoId);

    // 4. Pas de copyright → APPROVED
    await upload.update({ copyrightStatus: "APPROVED", lastCopyrightCheckAt: new Date() });
    logger.info("Video APPROVED", { uploadId, youtubeVideoId });

    // Chercher un Film existant lié à cet upload
    let film = await Film.findOne({ where: { videoUploadId: uploadId } });
    if (film) {
      await film.update({ youtubeId: youtubeVideoId });
      logger.info("Film youtubeId synced", { filmId: film.id, youtubeVideoId });
    } else if (upload.userId) {
      // Construire aiIdentity depuis les outils sélectionnés
      const toolsList = Array.isArray(upload.aiTools) ? upload.aiTools : [];
      const SCENARIO_TOOLS  = ["chatgpt", "claude", "gemini"];
      const IMAGE_TOOLS     = ["midjourney", "dalle", "stablediff", "flux"];
      const VIDEO_TOOLS     = ["sora", "runway", "kling", "pika"];
      const SOUND_TOOLS     = ["elevenlabs", "suno", "udio"];

      const pick = (ids) => {
        const matched = toolsList.filter((t) => ids.includes(t));
        return matched.length ? matched.join(", ") : null;
      };

      const aiIdentity = {
        scenario:       pick(SCENARIO_TOOLS),
        image:          pick(IMAGE_TOOLS),
        video:          pick(VIDEO_TOOLS),
        sound:          pick(SOUND_TOOLS),
        postProduction: null,
      };

      // Créer le Film directement (bypass FilmService pour éviter les contraintes
      // sur posterPath et la période de soumission, gérées en amont)
      film = await Film.create({
        title:         upload.title || upload.filename,
        description:   upload.synopsis || null,
        country:       upload.country  ? upload.country.toUpperCase() : null,
        youtubeId:     youtubeVideoId,
        videoUploadId: upload.id,
        posterPath:    upload.thumbnailPath || null,
        aiIdentity,
        userId:        upload.userId,
        status:        "PENDING",
      });
      logger.info("Film auto-créé après approbation copyright", { filmId: film.id, uploadId });
    }

    if (upload.userId) {
      await Notification.create({
        userId: upload.userId,
        type: "VIDEO_UPLOAD_APPROVED",
        title: "Vidéo approuvée",
        message: `Votre vidéo "${upload.title || upload.filename}" a été approuvée.`,
        relatedId: upload.id,
      });
    }
  } catch (err) {
    const upload = await VideoUpload.findByPk(uploadId);
    if (!upload) return;

    const isCopyright = err.statusCode === 422;

    if (isCopyright) {
      // Copyright détecté → REJECTED + suppression S3
      await upload.update({
        copyrightStatus: "REJECTED",
        copyrightDetectedAt: new Date(),
        rejectionReason: err.message,
        lastCopyrightCheckAt: new Date(),
      });

      try { await VideoService.deleteFromS3(upload.s3Key); } catch {}
      logger.info("Video REJECTED", { uploadId, reason: err.message });

      if (upload.userId) {
        await Notification.create({
          userId: upload.userId,
          type: "VIDEO_UPLOAD_REJECTED",
          title: "Vidéo rejetée - Copyright",
          message: `Votre vidéo "${upload.title || upload.filename}" a été rejetée (droits d'auteur).`,
          relatedId: upload.id,
        });
      }
    } else {
      // Erreur technique (quota YouTube, API, etc.) → FAILED + suppression S3 + notification
      await upload.update({
        copyrightStatus: "FAILED",
        rejectionReason: err.message || "Erreur technique lors de la vérification",
        lastCopyrightCheckAt: new Date(),
      });

      try {
        await VideoService.deleteFromS3(upload.s3Key);
      } catch {}
      logger.error("Video check FAILED (technical error), S3 file removed", { uploadId, error: err.message });

      if (upload.userId) {
        await Notification.create({
          userId: upload.userId,
          type: "VIDEO_UPLOAD_FAILED",
          title: "Vidéo non traitée",
          message: `La vérification de votre vidéo "${upload.title || upload.filename}" a échoué (erreur technique). Vous pouvez réessayer plus tard.`,
          relatedId: upload.id,
        });
      }
    }
  }
}

// ─── Autres routes ───────────────────────────────────────────────────────────

export const listVideos = asyncHandler(async (_req, res) => {
  res.json({ files: await VideoService.listVideos() });
});

export const downloadVideo = asyncHandler(async (req, res) => {
  const key = req.params.key
    ? Buffer.from(req.params.key, "base64").toString("utf8")
    : req.query.key;
  if (!key) throw new AppError("Paramètre 'key' requis", 400);

  const { stream, contentType, contentLength } = await VideoService.downloadFromS3(key);
  res.setHeader("Content-Type", contentType || "video/mp4");
  if (contentLength) res.setHeader("Content-Length", contentLength);
  stream.pipe(res);
});

export const deleteVideo = asyncHandler(async (req, res) => {
  const { key } = req.body;
  if (!key) throw new AppError("Paramètre 'key' requis", 400);
  await VideoService.deleteFromS3(key);
  res.json({ message: "Vidéo supprimée", key });
});

export const getUploadStatus = asyncHandler(async (req, res) => {
  const upload = await VideoUpload.findByPk(req.params.id);
  if (!upload) throw new AppError("Upload introuvable", 404);

  res.json({
    id: upload.id,
    filename: upload.filename,
    title: upload.title,
    copyrightStatus: upload.copyrightStatus,
    copyrightCheckAttempts: upload.copyrightCheckAttempts,
    lastCopyrightCheckAt: upload.lastCopyrightCheckAt,
    copyrightDetectedAt: upload.copyrightDetectedAt,
    rejectionReason: upload.rejectionReason,
    s3Url: upload.s3Url,
    youtubeVideoId: upload.youtubeVideoId,
    createdAt: upload.createdAt,
  });
});

/**
 * POST /api/videos/thumbnail
 * Upload d'une miniature (thumbnail) vers Scaleway S3
 */
export const uploadThumbnail = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError("Fichier image requis (champ 'thumbnail')", 400);

  const { url, key } = await VideoService.uploadThumbnailToS3(req.file);

  // Si un videoUploadId est fourni, lier la thumbnail au VideoUpload
  const videoUploadId = req.body.videoUploadId ? parseInt(req.body.videoUploadId) : null;
  if (videoUploadId) {
    await VideoUpload.update({ thumbnailPath: url }, { where: { id: videoUploadId } });
    logger.info("Thumbnail linked to VideoUpload", { videoUploadId, url });
  }

  res.status(201).json({
    message: "Thumbnail uploadé avec succès",
    url,
    key,
  });
});

/**
 * POST /api/videos/subtitle
 * Upload d'un fichier de sous-titres vers Scaleway S3 (pré-upload sans filmId)
 */
export const uploadSubtitle = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError("Fichier de sous-titres requis (champ 'subtitle')", 400);

  const language = (req.body.language || "").toLowerCase();
  if (!language) throw new AppError("Le code langue est requis (ex: fr, en)", 400);

  const { s3Url, key } = await VideoService.uploadSubtitleToS3(req.file, language);

  res.status(201).json({
    message: "Sous-titre uploadé avec succès",
    s3Url,
    s3Key: key,
    language,
    format: req.file.originalname.split(".").pop().toLowerCase(),
    filename: req.file.originalname,
  });
});

export default { uploadVideo, listVideos, uploadThumbnail, uploadSubtitle, downloadVideo, deleteVideo, getUploadStatus };
