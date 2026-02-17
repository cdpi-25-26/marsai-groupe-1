/**
 * @bref Routes Film - Gestion des films et soumissions
 */

import express from "express";
import FilmController from "../controllers/FilmController.js";
import { requireAuth } from "../middlewares/AuthMiddleware.js";
import {
  validateRequired,
  validateYouTubeId,
  validateCountryCode,
  validateDuration,
} from "../middlewares/validation.js";

const filmRouter = express.Router();

/**
 * @bref Routes publiques (galerie)
 */
filmRouter.get("/", FilmController.getFilms);
filmRouter.get("/selection-officielle", FilmController.getSelectionOfficielle);
filmRouter.get("/:id", FilmController.getFilmById);

/**
 * @bref Routes authentifiées — réalisateur uniquement
 */
filmRouter.post(
  "/",
  requireAuth(["REALISATEUR"]),
  validateRequired(["title", "youtubeId", "country", "aiIdentity"]),
  validateYouTubeId,
  validateCountryCode,
  validateDuration,
  FilmController.createFilm
);

/**
 * @bref Routes admin uniquement — modération
 */
filmRouter.patch(
  "/:id/status",
  requireAuth(["ADMIN"]),
  validateRequired(["status"]),
  FilmController.updateFilmStatus
);

export default filmRouter;
