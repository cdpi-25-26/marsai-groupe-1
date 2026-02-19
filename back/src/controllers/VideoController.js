import Video from "../models/Video.js";
import { uploadToS3, deleteFromS3 } from "../config/upload.js";

// Liste
function getVideos(req, res) {
  Video.findAll().then((videos) => {
    res.json(videos);
  });
}

// Création
function createVideo(req, res) {
  if (!req.body) {
    return res.status(400).json({ error: "Données manquantes" });
  }

  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  Video.findOne({ where: { title } }).then((video) => {
    if (video) {
      res.json(video);
    } else {
      Video.create({ title: title, description: description }).then(
        (newVideo) => {
          res.status(201).json(newVideo);
        },
      );
    }
  });
}

// Upload thumbnail vers S3
async function uploadThumbnail(req, res) {
  const { id } = req.params;

  console.log("[UPLOAD] Requête reçue pour vidéo ID:", id);
  console.log("[UPLOAD] req.file:", req.file ? { name: req.file.originalname, size: req.file.size, mime: req.file.mimetype } : "AUCUN FICHIER");

  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier fourni" });
  }

  try {
    const video = await Video.findByPk(id);
    if (!video) {
      console.log("[UPLOAD] Vidéo non trouvée:", id);
      return res.status(404).json({ error: "Vidéo non trouvée" });
    }

    // Supprimer l'ancien thumbnail du S3 si existant
    if (video.thumbnail) {
      console.log("[UPLOAD] Suppression ancien thumbnail:", video.thumbnail);
      await deleteFromS3(video.thumbnail).catch((err) => console.log("[UPLOAD] Erreur suppression:", err.message));
    }

    // Upload vers S3
    console.log("[UPLOAD] Envoi vers S3...");
    const url = await uploadToS3(req.file);
    console.log("[UPLOAD] S3 URL reçue:", url);

    video.thumbnail = url;
    const updatedVideo = await video.save();
    console.log("[UPLOAD] Vidéo mise à jour en DB");
    res.json(updatedVideo);
  } catch (error) {
    console.error("[UPLOAD] ERREUR:", error);
    res.status(500).json({ error: "Erreur lors de l'upload: " + error.message });
  }
}

export default { getVideos, createVideo, uploadThumbnail };
