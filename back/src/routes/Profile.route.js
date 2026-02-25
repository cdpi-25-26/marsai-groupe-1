/**
 * @bref Routes Profile - Profils publics et gestion du compte utilisateur
 *
 * Routes publiques (sans auth) :
 *   GET  /api/profile/:username          → profil public + films approuvés + stats
 *
 * Routes privées (token requis) :
 *   GET  /api/profile/me                 → profil complet de l'utilisateur connecté
 *   PUT  /api/profile/me                 → mise à jour biography, country, socialLinks
 *   POST /api/profile/:username/follow   → s'abonner à un utilisateur
 *   DELETE /api/profile/:username/follow → se désabonner
 */

import express from "express";
import ProfileController from "../controllers/ProfileController.js";
import { requireAuth } from "../middlewares/AuthMiddleware.js";

const profileRouter = express.Router();

/* ── Routes privées (me en premier pour ne pas matcher /:username) ── */
profileRouter.get("/me",  requireAuth(), ProfileController.getMyProfile);
profileRouter.put("/me",  requireAuth(), ProfileController.updateMyProfile);

/* ── Routes publiques ── */
profileRouter.get("/:username", ProfileController.getPublicProfile);

/* ── Follow / Unfollow (auth requise) ── */
profileRouter.post(  "/:username/follow", requireAuth(), ProfileController.followUser);
profileRouter.delete("/:username/follow", requireAuth(), ProfileController.unfollowUser);

export default profileRouter;
