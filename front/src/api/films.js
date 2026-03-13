import instance from "./config.js";

async function getFilms(params = {}) {
  return await instance.get("films", { params });
}

/**
 * Récupère les films approuvés pour le feed TikTok (avec s3Url vidéo)
 * @param {number} page
 * @param {number} limit
 */
async function getFeedFilms(page = 1, limit = 10) {
  return await instance.get("films", { params: { status: "APPROVED", page, limit } });
}

async function getFilmById(id) {
  return await instance.get(`films/${id}`);
}

async function getSelectionOfficielle() {
  return await instance.get("films/selection-officielle");
}

async function updateFilmStatus(id, data) {
  return await instance.patch(`films/${id}/status`, data);
}

/**
 * Upload d'un sous-titre (.srt / .vtt) pour un film
 * POST /api/videos/subtitle
 */
export async function uploadSubtitle(filmId, file, language) {
  const formData = new FormData();
  formData.append("subtitle", file);
  formData.append("language", language);
  if (filmId) formData.append("filmId", filmId);
  return instance.post("/videos/subtitle", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/**
 * Upload d'un thumbnail image pour un film
 * POST /api/videos/thumbnail
 * @param {File} file
 * @param {number|null} videoUploadId - ID du VideoUpload à lier (optionnel)
 */
export async function uploadThumbnail(file, videoUploadId = null) {
  const formData = new FormData();
  formData.append("thumbnail", file);
  if (videoUploadId) formData.append("videoUploadId", videoUploadId);
  return instance.post("/videos/thumbnail", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/**
 * Récupère les films en sélection officielle (route publique)
 * Retourne un tableau de films avec User inclus
 */
export const fetchSelectionOfficielle = () =>
  instance.get("/films/selection-officielle");

export { getFilms, getFilmById, getSelectionOfficielle, updateFilmStatus, getFeedFilms };
