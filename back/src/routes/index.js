/**
 * @bref Routes principales - Point d'entrée de toutes les routes API
 */

import express from "express";
import userRouter from "./User.route.js";
import videoRouter from "./Video.route.js";
import filmRouter from "./Film.route.js";
import authRouter from "./Auth.route.js";
import eventRouter from "./Event.route.js";
import notificationRouter from "./Notification.route.js";
import juryRatingRouter from "./JuryRating.route.js";
import subtitleRouter from "./Subtitle.route.js";
import newsletterRouter from "./Newsletter.route.js";
import configRouter from "./Config.route.js";

const router = express.Router();

/**
 * @bref Routes
 */
router.use("/auth", authRouter);
router.use("/users", userRouter);
/**
 * @bref Legacy (à migrer vers /films)
 */
router.use("/videos", videoRouter);
router.use("/films", filmRouter);
router.use("/films/:filmId/subtitles", subtitleRouter);
router.use("/events", eventRouter);
router.use("/notifications", notificationRouter);
router.use("/newsletter", newsletterRouter);
/**
 * @bref Votes du jury (JURY → soumettre/modifier, ADMIN → délibération)
 */
router.use("/jury-ratings", juryRatingRouter);
router.use("/config", configRouter);

/**
 * @bref Route de santé (health check)
 */
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API marsAI opérationnelle" });
});

export default router;
