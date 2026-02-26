import path from "path";
import FilmSubtitle from "../models/FilmSubtitle.js";
import Film from "../models/Film.js";
import VideoService from "./VideoService.js";
import { AppError } from "../middlewares/errorHandler.js";

/**
 * @brief Upload un fichier de sous-titres et crée l'entrée en base
 * @param {number} filmId - ID du film
 * @param {number} userId - ID de l'utilisateur authentifié
 * @param {Express.Multer.File} file - Fichier SRT ou VTT
 * @param {string} language - Code langue ISO 639-1
 * @returns {Promise<FilmSubtitle>} Entrée sous-titre créée
 */
async function addSubtitle(filmId, userId, file, language) {
  const film = await Film.findByPk(filmId);
  if (!film) throw new AppError("Film introuvable", 404);
  if (film.userId !== userId) throw new AppError("Action non autorisée", 403);

  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
  if (!["srt", "vtt"].includes(ext)) {
    throw new AppError("Format non supporté (srt, vtt)", 400);
  }

  // Supprimer l'ancien sous-titre de la même langue s'il existe
  const existing = await FilmSubtitle.findOne({ where: { filmId, language } });
  if (existing) {
    await VideoService.deleteSubtitleFromS3(existing.s3Key).catch(() => {});
    await existing.destroy();
  }

  const { s3Url, key } = await VideoService.uploadSubtitleToS3(file, language);

  const subtitle = await FilmSubtitle.create({
    filmId,
    language,
    format: ext,
    s3Key: key,
    s3Url,
    filename: file.originalname,
  });

  return subtitle;
}

/**
 * @brief Récupère tous les sous-titres d'un film
 * @param {number} filmId - ID du film
 * @returns {Promise<FilmSubtitle[]>}
 */
async function getSubtitlesByFilm(filmId) {
  const film = await Film.findByPk(filmId);
  if (!film) throw new AppError("Film introuvable", 404);

  return FilmSubtitle.findAll({ where: { filmId }, order: [["language", "ASC"]] });
}

/**
 * @brief Supprime un sous-titre (S3 + DB)
 * @param {number} subtitleId - ID du sous-titre
 * @param {number} userId - ID de l'utilisateur authentifié
 * @returns {Promise<void>}
 */
async function deleteSubtitle(subtitleId, userId) {
  const subtitle = await FilmSubtitle.findByPk(subtitleId, {
    include: [{ model: Film, as: "film" }],
  });
  if (!subtitle) throw new AppError("Sous-titre introuvable", 404);
  if (subtitle.film.userId !== userId) throw new AppError("Action non autorisée", 403);

  await VideoService.deleteSubtitleFromS3(subtitle.s3Key).catch(() => {});
  await subtitle.destroy();
}

/**
 * @brief Lie des sous-titres déjà uploadés en S3 à un film (création en lot)
 * @param {number} filmId - ID du film
 * @param {number} userId - ID de l'utilisateur authentifié
 * @param {Array<{s3Url: string, s3Key: string, language: string, format: string, filename: string}>} subtitles
 * @returns {Promise<FilmSubtitle[]>} Entrées créées
 */
async function linkSubtitlesToFilm(filmId, userId, subtitles) {
  const film = await Film.findByPk(filmId);
  if (!film) throw new AppError("Film introuvable", 404);
  if (film.userId !== userId) throw new AppError("Action non autorisée", 403);

  const created = [];
  for (const sub of subtitles) {
    const existing = await FilmSubtitle.findOne({ where: { filmId, language: sub.language } });
    if (existing) {
      await VideoService.deleteSubtitleFromS3(existing.s3Key).catch(() => {});
      await existing.destroy();
    }

    const entry = await FilmSubtitle.create({
      filmId,
      language: sub.language,
      format: sub.format,
      s3Key: sub.s3Key,
      s3Url: sub.s3Url,
      filename: sub.filename,
    });
    created.push(entry);
  }

  return created;
}

export default { addSubtitle, getSubtitlesByFilm, deleteSubtitle, linkSubtitlesToFilm };
