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
 * Récupère les films en sélection officielle (route publique)
 * Retourne un tableau de films avec User inclus
 */
export const fetchSelectionOfficielle = () =>
  instance.get("/films/selection-officielle");

async function uploadSubtitle(filmId, file, language) {
  const formData = new FormData();
  formData.append("subtitle", file);
  formData.append("language", language);
  return await instance.post(`films/${filmId}/subtitles`, formData);
}

export { getFilms, getFilmById, getSelectionOfficielle, updateFilmStatus, uploadSubtitle };
