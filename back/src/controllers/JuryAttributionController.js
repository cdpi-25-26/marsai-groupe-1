import { Op } from "sequelize";
import JuryAttribution from "../models/JuryAttribution.js";
import User from "../models/User.js";
import Film from "../models/Film.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import logger from "../utils/logger.js";

/* ── Tous les jurés (role JURY) ──────────────────────────── */
export const getJuryMembers = asyncHandler(async (req, res) => {
  const jurors = await User.findAll({
    where: { role: "JURY" },
    attributes: ["id", "username", "email", "country"],
  });
  res.json(jurors);
});

/* ── Toutes les attributions (vue admin) ─────────────────── */
export const getAttributions = asyncHandler(async (req, res) => {
  const attributions = await JuryAttribution.findAll({
    include: [
      { model: User,  attributes: ["id", "username"] },
      { model: Film,  attributes: ["id", "title"] },
    ],
    order: [["created_at", "DESC"]],
  });
  res.json(attributions);
});

/* ── Attribution automatique (round-robin) ───────────────── */
export const autoAttribution = asyncHandler(async (req, res) => {
  // 1. Récupérer les 50 films finalistes
  const films = await Film.findAll({
    where: { status: "SELECTION_OFFICIELLE" },
    attributes: ["id"],
  });

  if (films.length === 0) {
    return res.status(400).json({ message: "Aucun film en sélection officielle." });
  }

  // 2. Récupérer tous les jurés
  const jurors = await User.findAll({
    where: { role: "JURY" },
    attributes: ["id"],
  });

  if (jurors.length === 0) {
    return res.status(400).json({ message: "Aucun juré enregistré." });
  }

  // 3. Supprimer les attributions AUTO existantes (ne touche pas les MANUAL)
  await JuryAttribution.destroy({ where: { mode: "AUTO" } });

  // 4. Mélanger les films (Fisher-Yates shuffle)
  const shuffled = [...films];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // 5. Construire les attributions en round-robin
  //    On exclut les films déjà attribués manuellement au même juré
  const existing = await JuryAttribution.findAll({ where: { mode: "MANUAL" }, attributes: ["filmId", "userId"] });
  const manualSet = new Set(existing.map((a) => `${a.filmId}-${a.userId}`));

  const rows = [];
  let idx = 0;
  for (const film of shuffled) {
    // Trouver le prochain juré disponible pour ce film
    let tries = 0;
    while (tries < jurors.length) {
      const juror = jurors[idx % jurors.length];
      const key = `${film.id}-${juror.id}`;
      if (!manualSet.has(key)) {
        rows.push({ filmId: film.id, userId: juror.id, mode: "AUTO" });
        idx++;
        break;
      }
      idx++;
      tries++;
    }
  }

  // 6. Insérer en masse (ignore les doublons éventuels)
  await JuryAttribution.bulkCreate(rows, { ignoreDuplicates: true });

  logger.info("Auto attribution completed", { films: films.length, jurors: jurors.length, rows: rows.length });

  res.status(201).json({
    message: `${rows.length} films attribués à ${jurors.length} jurés.`,
    count: rows.length,
  });
});

/* ── Attribution manuelle : assigner un film à un juré ───── */
export const manualAssign = asyncHandler(async (req, res) => {
  const { filmId, userId } = req.body;

  if (!filmId || !userId) {
    return res.status(400).json({ message: "filmId et userId requis." });
  }

  // Vérifier que le film est en sélection officielle
  const film = await Film.findOne({ where: { id: filmId, status: "SELECTION_OFFICIELLE" } });
  if (!film) return res.status(404).json({ message: "Film non trouvé en sélection officielle." });

  // Vérifier que l'utilisateur est bien JURY
  const juror = await User.findOne({ where: { id: userId, role: "JURY" } });
  if (!juror) return res.status(404).json({ message: "Juré introuvable." });

  const [attribution, created] = await JuryAttribution.findOrCreate({
    where: { filmId, userId },
    defaults: { mode: "MANUAL" },
  });

  logger.info("Manual attribution", { filmId, userId, created });

  res.status(created ? 201 : 200).json(attribution);
});

/* ── Supprimer une attribution ───────────────────────────── */
export const removeAttribution = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const attr = await JuryAttribution.findByPk(id);
  if (!attr) return res.status(404).json({ message: "Attribution introuvable." });

  await attr.destroy();
  logger.info("Attribution removed", { id });

  res.json({ message: "Attribution supprimée." });
});

export default { getJuryMembers, getAttributions, autoAttribution, manualAssign, removeAttribution };
