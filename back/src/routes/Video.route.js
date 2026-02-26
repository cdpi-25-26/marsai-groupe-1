/**
 * @bref Routes Video — upload YouTube (unlisted) + copyright + Scaleway S3
 */

import express from "express";
import multer from "multer";
import VideoController from "../controllers/VideoController.js";
import { requireAuth } from "../middlewares/AuthMiddleware.js";

const videoRouter = express.Router();

/**
 * @bref Multer — stockage en mémoire, formats vidéo acceptés, limite 500 Mo
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Format vidéo non supporté (mp4, mov, avi, webm)"), false);
    }
  },
});

/**
 * @bref Multer — stockage en mémoire, formats image acceptés, limite 10 Mo
 */
const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Format image non supporté (jpg, png, webp)"), false);
    }
  },
});

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /api/videos/upload
 * Upload YouTube (unlisted) + vérification copyright + upload S3
 * Requiert authentification pour pouvoir envoyer les notifications (approuvée/rejetée).
 * Body (multipart/form-data): video (file), title (string, optionnel)
 */
videoRouter.post("/upload", requireAuth(), upload.single("video"), VideoController.uploadVideo);

/**
 * GET /api/videos/list
 * Liste toutes les vidéos dans le bucket Scaleway S3
 */
videoRouter.get("/list", VideoController.listVideos);

/**
 * GET /api/videos/download?key=grp1/uuid.mp4
 * Télécharge (stream) une vidéo depuis Scaleway S3
 */
videoRouter.get("/download", VideoController.downloadVideo);

/**
 * DELETE /api/videos/delete
 * Supprime une vidéo depuis Scaleway S3
 * Body: { key: "grp1/uuid.mp4" }
 */
videoRouter.delete("/delete", VideoController.deleteVideo);

/**
 * GET /api/videos/upload/:id/status
 * Récupère le statut d'un upload vidéo (copyright check)
 */
videoRouter.get("/upload/:id/status", VideoController.getUploadStatus);

/**
 * POST /api/videos/thumbnail
 * Upload d'un thumbnail vers Scaleway S3
 * Body (multipart/form-data): thumbnail (file image)
 */
videoRouter.post("/thumbnail", requireAuth(), uploadImage.single("thumbnail"), VideoController.uploadThumbnail);

/**
 * @bref Multer — stockage en mémoire, formats SRT/VTT, limite 5 Mo
 */
const uploadSubtitle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.split(".").pop().toLowerCase();
    if (["srt", "vtt"].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Format non supporté (srt, vtt uniquement)"), false);
    }
  },
});

/**
 * POST /api/videos/subtitle
 * Pré-upload d'un sous-titre vers S3 (sans filmId, sera lié plus tard)
 * Body (multipart/form-data): subtitle (file), language (string)
 */
videoRouter.post("/subtitle", requireAuth(), uploadSubtitle.single("subtitle"), VideoController.uploadSubtitle);

/**
 * GET /api/videos/status/:id
 * Alias de compatibilité pour le statut d'upload vidéo
 */
videoRouter.get("/status/:id", VideoController.getUploadStatus);

export default videoRouter;
