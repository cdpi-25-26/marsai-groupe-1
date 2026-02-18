/**
 * @bref Contrôleur Video — upload YouTube (unlisted) + copyright + Scaleway S3
 */

import Video from "../models/Video.js";
import VideoService from "../services/VideoService.js";
import { asyncHandler, AppError } from "../middlewares/errorHandler.js";
import logger from "../utils/logger.js";

/**
 * @bref Liste des vidéos (legacy DB)
 */
async function getVideos(_req, res) {
  const videos = await Video.findAll();
  res.json(videos);
}

/**
 * @bref Crée une vidéo (legacy DB)
 */
async function createVideo(req, res) {
  if (!req.body) return res.status(400).json({ error: "Données manquantes" });

  const { title, description } = req.body;
  if (!title || !description) return res.status(400).json({ error: "Tous les champs sont requis" });

  const existing = await Video.findOne({ where: { title } });
  if (existing) return res.status(409).json({ error: "Vidéo déjà existante" });

  const newVideo = await Video.create({ title, description });
  res.status(201).json(newVideo);
}

/**
 * @bref Upload une vidéo vers YouTube (unlisted) puis Scaleway S3 après vérification copyright
 * Body (multipart/form-data):
 *   - video  (file)    — fichier vidéo
 *   - title  (string)  — titre (optionnel)
 *
 * Flow :
 *   1. Upload YouTube unlisted → youtubeVideoId
 *   2. Vérification copyright Content ID
 *   3. Upload Scaleway S3
 */
export const uploadVideo = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError("Fichier vidéo requis (champ 'video')", 400);

  const title = req.body.title || req.file.originalname;

  logger.info("Video upload request", { filename: req.file.originalname, size: req.file.size });

  let youtubeVideoId = null;

  // Étape 1 — Upload YouTube unlisted (optionnel)
  try {
    const result = await VideoService.uploadToYoutube(req.file, title);
    youtubeVideoId = result.youtubeVideoId;

    // Étape 2 — Vérification copyright
    await VideoService.checkYoutubeCopyright(youtubeVideoId);
    logger.info("YouTube upload and copyright check passed", { youtubeVideoId });
  } catch (err) {
    logger.warn("YouTube upload failed, continuing with S3 only", { error: err.message });
    // Continuer avec S3 même si YouTube échoue
  }

  // Étape 3 — Upload Scaleway S3 (toujours nécessaire)
  const { s3Url, key } = await VideoService.uploadToS3(req.file);

  logger.info("Video upload complete", { youtubeVideoId, key });

  res.status(201).json({ 
    message: "Vidéo uploadée avec succès",
    youtubeVideoId: youtubeVideoId || null,
    s3Url, 
    key,
    youtubeStatus: youtubeVideoId ? "success" : "failed_but_s3_ok"
  });
});

/**
 * @bref Liste toutes les vidéos dans le bucket Scaleway S3
 */
export const listVideos = asyncHandler(async (_req, res) => {
  const files = await VideoService.listVideos();
  res.json({ count: files.length, files });
});

/**
 * @bref Télécharge une vidéo depuis Scaleway S3
 * Param : key (encodé en base64 ou passé en query string)
 */
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

/**
 * @bref Supprime une vidéo depuis Scaleway S3
 * Body : { key: "grp1/uuid.mp4" }
 */
export const deleteVideo = asyncHandler(async (req, res) => {
  const { key } = req.body;
  if (!key) throw new AppError("Paramètre 'key' requis", 400);

  await VideoService.deleteFromS3(key);
  res.json({ message: "Vidéo supprimée avec succès", key });
});

export default { getVideos, createVideo, uploadVideo, listVideos, downloadVideo, deleteVideo };
