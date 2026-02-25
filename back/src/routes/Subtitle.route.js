import express from "express";
import multer from "multer";
import path from "path";
import SubtitleController from "../controllers/SubtitleController.js";
import { requireAuth } from "../middlewares/AuthMiddleware.js";

const subtitleRouter = express.Router({ mergeParams: true });

/**
 * @brief Multer — stockage en mémoire, formats SRT et VTT uniquement, limite 5 Mo
 * On filtre par extension car les MIME types de SRT/VTT varient selon les OS
 */
const subtitleUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ([".srt", ".vtt"].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Format non supporté (srt, vtt uniquement)"), false);
    }
  },
});

/**
 * GET /api/films/:filmId/subtitles
 * Liste les sous-titres d'un film (public)
 */
subtitleRouter.get("/", SubtitleController.getSubtitles);

/**
 * POST /api/films/:filmId/subtitles
 * Upload un fichier de sous-titres (auth: REALISATEUR)
 * Body multipart/form-data: subtitle (file), language (string)
 */
subtitleRouter.post(
  "/",
  requireAuth(["REALISATEUR"]),
  subtitleUpload.single("subtitle"),
  SubtitleController.addSubtitle
);

/**
 * DELETE /api/films/:filmId/subtitles/:id
 * Supprime un sous-titre (auth: REALISATEUR)
 */
subtitleRouter.delete(
  "/:id",
  requireAuth(["REALISATEUR"]),
  SubtitleController.deleteSubtitle
);

export default subtitleRouter;
