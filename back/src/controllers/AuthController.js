/**
 * @bref Contrôleur Auth - Refactorisé avec architecture professionnelle
 */

import AuthService from "../services/AuthService.js";
import UserService from "../services/UserService.js";
import VideoService from "../services/VideoService.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import logger from "../utils/logger.js";

/**
 * @bref Connexion utilisateur
 */
export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const result = await AuthService.login(username, password);
  logger.info("Login successful", { username });
  res.json(result);
});

/**
 * @bref Inscription utilisateur
 */
export const register = asyncHandler(async (req, res) => {
  const result = await AuthService.register(req.body);
  logger.info("Registration successful", { email: req.body.email });
  res.status(201).json(result);
});

/**
 * @bref Récupère le profil de l'utilisateur connecté
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await UserService.getUserById(req.user.id);
  res.json(user);
});

/**
 * @bref Met à jour le profil de l'utilisateur connecté
 * Champs autorisés : biography, username, country, socialLinks
 */
export const updateMe = asyncHandler(async (req, res) => {
  const { biography, username, country, socialLinks } = req.body;
  const user = await UserService.updateUser(req.user.id, {
    biography,
    username,
    country,
    socialLinks,
  });
  logger.info("Profile updated", { userId: req.user.id });
  res.json({ message: "Profil mis à jour", user });
});

/**
 * @bref Upload la photo de profil de l'utilisateur connecté (S3)
 */
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier envoyé" });
  }
  const { s3Url } = await VideoService.uploadAvatarToS3(req.file);
  const user = await UserService.updateUser(req.user.id, { profilePicture: s3Url });
  logger.info("Avatar updated", { userId: req.user.id, s3Url });
  res.json({ message: "Photo de profil mise à jour", profilePicture: s3Url, user });
});

export default { login, register, getMe, updateMe, uploadAvatar };
