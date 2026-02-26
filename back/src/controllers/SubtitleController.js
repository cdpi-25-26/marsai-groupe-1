import SubtitleService from "../services/SubtitleService.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import logger from "../utils/logger.js";

/**
 * @brief Upload un fichier de sous-titres pour un film
 * POST /api/films/:filmId/subtitles
 */
export const addSubtitle = asyncHandler(async (req, res) => {
  const { filmId } = req.params;
  const { language } = req.body;
  const userId = req.user.id;

  if (!language) {
    return res.status(400).json({ error: "Le code langue est requis (ex: fr, en)" });
  }
  if (!req.file) {
    return res.status(400).json({ error: "Fichier de sous-titres manquant" });
  }

  const subtitle = await SubtitleService.addSubtitle(
    parseInt(filmId),
    userId,
    req.file,
    language.toLowerCase()
  );

  logger.info("Subtitle uploaded", { filmId, language, subtitleId: subtitle.id });
  res.status(201).json({ message: "Sous-titre ajouté", subtitle });
});

/**
 * @brief Liste les sous-titres d'un film
 * GET /api/films/:filmId/subtitles
 */
export const getSubtitles = asyncHandler(async (req, res) => {
  const { filmId } = req.params;
  const subtitles = await SubtitleService.getSubtitlesByFilm(parseInt(filmId));
  res.json(subtitles);
});

/**
 * @brief Supprime un sous-titre
 * DELETE /api/films/:filmId/subtitles/:id
 */
export const deleteSubtitle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  await SubtitleService.deleteSubtitle(parseInt(id), userId);
  logger.info("Subtitle deleted", { subtitleId: id, userId });
  res.json({ message: "Sous-titre supprimé" });
});

/**
 * @brief Lie des sous-titres déjà uploadés en S3 à un film (création en lot)
 * POST /api/films/:filmId/subtitles/batch
 */
export const linkSubtitles = asyncHandler(async (req, res) => {
  const { filmId } = req.params;
  const { subtitles } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(subtitles) || subtitles.length === 0) {
    return res.status(400).json({ error: "Le tableau 'subtitles' est requis" });
  }

  const created = await SubtitleService.linkSubtitlesToFilm(
    parseInt(filmId),
    userId,
    subtitles
  );

  logger.info("Subtitles linked to film", { filmId, count: created.length });
  res.status(201).json({ message: "Sous-titres liés au film", subtitles: created });
});

export default { addSubtitle, getSubtitles, deleteSubtitle, linkSubtitles };
