import instance from "./config.js";

async function getFilms(params = {}) {
  return await instance.get("films", { params });
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
 */
export async function uploadThumbnail(file) {
  const formData = new FormData();
  formData.append("thumbnail", file);
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

export { getFilms, getFilmById, getSelectionOfficielle, updateFilmStatus };
