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

export default { addSubtitle, getSubtitles, deleteSubtitle };
