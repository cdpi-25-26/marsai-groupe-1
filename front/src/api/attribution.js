import api from "./config";

// Lancer l'attribution automatique (round-robin sur tous les jurés)
export const runAutoAttribution = () =>
  api.post("/admin/attributions/auto");

// Récupérer toutes les attributions (vue admin)
export const fetchAttributions = () =>
  api.get("/admin/attributions");

// Attribuer manuellement un film à un juré
export const assignFilmToJury = (filmId, userId) =>
  api.post("/admin/attributions/manual", { filmId, userId });

// Retirer une attribution
export const removeAttribution = (attributionId) =>
  api.delete(`/admin/attributions/${attributionId}`);

// Récupérer tous les jurés avec leur charge actuelle
export const fetchJuryMembers = () =>
  api.get("/admin/jury-members");
