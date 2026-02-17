/**
 * @bref Contrôleur Video (legacy) — à migrer vers Film
 */

import Video from "../models/Video.js";

/**
 * @bref Liste des vidéos (legacy)
 * @param {any} req - Requête Express
 * @param {any} res - Réponse Express
 * @returns {Promise<void>}
 */
async function getVideos(req, res) {
  const videos = await Video.findAll();
  res.json(videos);
}

/**
 * @bref Crée une vidéo (legacy)
 * @param {any} req - Requête Express
 * @param {any} res - Réponse Express
 * @returns {Promise<void>}
 */
async function createVideo(req, res) {
  if (!req.body) {
    return res.status(400).json({ error: "Données manquantes" });
  }

  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  const existing = await Video.findOne({ where: { title } });
  if (existing) return res.status(409).json({ error: "Vidéo déjà existante" });

  const newVideo = await Video.create({ title, description });
  res.status(201).json(newVideo);
}

export default { getVideos, createVideo };
