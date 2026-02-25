/**
 * @bref Contrôleur Profile - Profils publics et gestion du compte
 */

import ProfileService from "../services/ProfileService.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import logger from "../utils/logger.js";

/**
 * @bref Récupère le profil public d'un utilisateur par son username
 * GET /api/profile/:username
 */
export const getPublicProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const requesterId = req.user?.id ?? null;
  const profile = await ProfileService.getPublicProfile(username, requesterId);
  logger.info("Public profile fetched", { username });
  res.json(profile);
});

/**
 * @bref Récupère le profil complet de l'utilisateur connecté
 * GET /api/profile/me
 */
export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await ProfileService.getMyProfile(req.user.id);
  logger.info("My profile fetched", { userId: req.user.id });
  res.json(profile);
});

/**
 * @bref Met à jour le profil de l'utilisateur connecté
 * PUT /api/profile/me
 */
export const updateMyProfile = asyncHandler(async (req, res) => {
  const profile = await ProfileService.updateMyProfile(req.user.id, req.body);
  logger.info("Profile updated", { userId: req.user.id });
  res.json({ message: "Profil mis à jour", profile });
});

/**
 * @bref Suivre un utilisateur
 * POST /api/profile/:username/follow
 */
export const followUser = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const result = await ProfileService.followUser(req.user.id, username);
  logger.info("Follow created", { followerId: req.user.id, username });
  res.status(201).json(result);
});

/**
 * @bref Se désabonner d'un utilisateur
 * DELETE /api/profile/:username/follow
 */
export const unfollowUser = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const result = await ProfileService.unfollowUser(req.user.id, username);
  logger.info("Follow removed", { followerId: req.user.id, username });
  res.json(result);
});

export default { getPublicProfile, getMyProfile, updateMyProfile, followUser, unfollowUser };
