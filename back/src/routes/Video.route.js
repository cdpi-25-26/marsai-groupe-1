/**
 * @bref Routes Video (legacy) — à migrer vers /films
 */

import express from "express";
import VideoController from "../controllers/VideoController.js";

const videoRouter = express.Router();

/**
 * @bref Routes legacy (admin attendu côté sécurité)
 */
videoRouter.get("/", VideoController.getVideos);
videoRouter.post("/", VideoController.createVideo);

/**
 * @bref Upload vidéo (placeholder)
 * @param {any} req - Requête Express
 * @param {any} res - Réponse Express
 * @returns {void}
 */
videoRouter.post("/upload", (req, res) => {
  /**
   * @bref Code à faire
   */
  res.send("Upload de vidéo");
});

export default videoRouter;
