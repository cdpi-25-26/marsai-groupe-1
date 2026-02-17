/**
 * @bref Contrôleur Film - Refactorisé avec architecture professionnelle
 * Gère les films, soumissions, modération, sélection officielle
 */

import FilmService from "../services/FilmService.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import logger from "../utils/logger.js";

/**
 * @bref Récupère tous les films avec filtres et pagination (galerie publique)
 */
export const getFilms = asyncHandler(async (req, res) => {
  const { status, country, page, limit } = req.query;
  const result = await FilmService.getAllFilms({
    status,
    country,
    page,
    limit,
    includeUser: true,
  });
  logger.info("Films fetched", { count: result.films.length, filters: { status, country } });
  res.json(result);
});

/**
 * @bref Récupère un film par ID
 */
export const getFilmById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const film = await FilmService.getFilmById(id, true);
  logger.info("Film fetched by ID", { filmId: id });
  res.json(film);
});

/**
 * @bref Crée un nouveau film (soumission réalisateur)
 */
export const createFilm = asyncHandler(async (req, res) => {
  /**
   * @bref User id injecté par le middleware d'auth
   */
  const userId = req.user.id;
  const film = await FilmService.createFilm(req.body, userId);
  logger.info("Film created", { filmId: film.id, userId });
  res.status(201).json({
    message: "Film soumis avec succès",
    film,
  });
});

/**
 * @bref Met à jour le statut d'un film (modération admin)
 */
export const updateFilmStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;
  const film = await FilmService.updateFilmStatus(id, status, rejectionReason);
  logger.info("Film status updated", { filmId: id, status });
  res.json({
    message: "Statut du film mis à jour",
    film,
  });
});

/**
 * @bref Récupère les films en sélection officielle (pour le jury)
 */
export const getSelectionOfficielle = asyncHandler(async (req, res) => {
  const films = await FilmService.getSelectionOfficielle();
  logger.info("Selection officielle fetched", { count: films.length });
  res.json(films);
});

export default {
  getFilms,
  getFilmById,
  createFilm,
  updateFilmStatus,
  getSelectionOfficielle,
};
