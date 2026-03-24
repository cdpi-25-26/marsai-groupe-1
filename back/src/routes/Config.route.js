import express from "express";
import SubmissionConfig from "../models/SubmissionConfig.js";
import Film from "../models/Film.js";
import User from "../models/User.js";
import JuryRating from "../models/JuryRating.js";
import { requireAuth } from "../middlewares/AuthMiddleware.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { Sequelize } from "sequelize";

const configRouter = express.Router();

configRouter.get(
  "/public",
  asyncHandler(async (_req, res) => {
    const PUBLIC_KEYS = ["current_phase", "submission_open", "finalists_public", "submission_end", "festival_date"];
    const configs = await SubmissionConfig.findAll({ where: { key: PUBLIC_KEYS } });
    const result = {};
    configs.forEach((c) => { result[c.key] = c.value; });
    res.json(result);
  })
);

configRouter.get(
  "/winners",
  asyncHandler(async (_req, res) => {
    const phaseConfig = await SubmissionConfig.findOne({ where: { key: "current_phase" } });
    if (!phaseConfig || phaseConfig.value !== "3") {
      return res.json({ winners: [], phase: phaseConfig?.value || "1" });
    }

    const films = await Film.findAll({
      where: { status: "SELECTION_OFFICIELLE" },
      include: [{ model: User, attributes: ["id", "username", "country"] }],
    });

    const filmIds = films.map((f) => f.id);
    const ratings = filmIds.length
      ? await JuryRating.findAll({
          where: { filmId: filmIds },
          attributes: [
            "filmId",
            [Sequelize.fn("SUM", Sequelize.literal("CASE WHEN score = 'JAIME' THEN 1 ELSE 0 END")), "likes"],
            [Sequelize.fn("SUM", Sequelize.literal("CASE WHEN score = 'JAIME_PAS' THEN 1 ELSE 0 END")), "dislikes"],
            [Sequelize.fn("COUNT", Sequelize.col("id")), "totalVotes"],
          ],
          group: ["filmId"],
          raw: true,
        })
      : [];

    const ratingMap = {};
    ratings.forEach((r) => {
      ratingMap[r.filmId] = { likes: parseInt(r.likes) || 0, dislikes: parseInt(r.dislikes) || 0, total: parseInt(r.totalVotes) || 0 };
    });

    const ranked = films
      .map((f) => ({
        id: f.id,
        title: f.title,
        director: f.User?.username || "Anonyme",
        country: f.country,
        posterPath: f.posterPath,
        youtubeId: f.youtubeId,
        juryLikes: ratingMap[f.id]?.likes || 0,
        juryDislikes: ratingMap[f.id]?.dislikes || 0,
        juryTotal: ratingMap[f.id]?.total || 0,
      }))
      .sort((a, b) => b.juryLikes - a.juryLikes);

    const PRIZES = [
      { rank: 1, label: "Grand Prix MarsAI 2026" },
      { rank: 2, label: "Prix du Jury" },
      { rank: 3, label: "Prix de la Créativité IA" },
    ];

    const winners = ranked.slice(0, 3).map((film, i) => ({
      ...film,
      prize: PRIZES[i]?.label || `${i + 1}e place`,
      rank: i + 1,
    }));

    res.json({ winners, phase: "3" });
  })
);

configRouter.get(
  "/export",
  requireAuth(["ADMIN"]),
  asyncHandler(async (req, res) => {
    const type = req.query.type || "films";

    if (type === "films") {
      const films = await Film.findAll({ include: [{ model: User, attributes: ["username", "email"] }] });
      const csv = ["id,title,director,email,country,status,youtubeId,createdAt"]
        .concat(films.map((f) => `${f.id},"${f.title}","${f.User?.username || ""}","${f.User?.email || ""}","${f.country}","${f.status}","${f.youtubeId || ""}","${f.createdAt}"`))
        .join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=marsai_films_${Date.now()}.csv`);
      return res.send(csv);
    }

    if (type === "emails") {
      const users = await User.findAll({ attributes: ["email", "username", "role"] });
      const csv = ["email,username,role"].concat(users.map((u) => `"${u.email}","${u.username}","${u.role}"`)).join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=marsai_emails_${Date.now()}.csv`);
      return res.send(csv);
    }

    if (type === "votes") {
      const votes = await JuryRating.findAll({ include: [{ model: User, attributes: ["username"] }] });
      const csv = ["filmId,userId,juror,score,comment,createdAt"]
        .concat(votes.map((v) => `${v.filmId},${v.userId},"${v.User?.username || ""}","${v.score}","${(v.internalComment || "").replace(/"/g, '""')}","${v.createdAt}"`))
        .join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=marsai_votes_${Date.now()}.csv`);
      return res.send(csv);
    }

    if (type === "ranking") {
      const films = await Film.findAll({
        where: { status: "SELECTION_OFFICIELLE" },
        include: [{ model: User, attributes: ["username"] }],
      });
      const csv = ["rank,id,title,director,country"]
        .concat(films.map((f, i) => `${i + 1},${f.id},"${f.title}","${f.User?.username || ""}","${f.country}"`))
        .join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=marsai_ranking_${Date.now()}.csv`);
      return res.send(csv);
    }

    res.status(400).json({ error: "Type d'export inconnu" });
  })
);

configRouter.get(
  "/",
  requireAuth(["ADMIN"]),
  asyncHandler(async (_req, res) => {
    const configs = await SubmissionConfig.findAll();
    const result = {};
    configs.forEach((c) => {
      result[c.key] = c.value;
    });
    res.json(result);
  })
);

configRouter.put(
  "/",
  requireAuth(["ADMIN"]),
  asyncHandler(async (req, res) => {
    const entries = req.body;
    if (!entries || typeof entries !== "object") {
      return res.status(400).json({ error: "Body must be a key-value object" });
    }

    for (const [key, value] of Object.entries(entries)) {
      await SubmissionConfig.upsert({ key, value: String(value) });
    }

    const configs = await SubmissionConfig.findAll();
    const result = {};
    configs.forEach((c) => {
      result[c.key] = c.value;
    });
    res.json({ message: "Configuration mise à jour", config: result });
  })
);

export default configRouter;
