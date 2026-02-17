/**
 * @bref Contrôleur User - Refactorisé avec architecture professionnelle
 * Controller → Service → Model
 * Gestion d'erreurs centralisée avec asyncHandler
 */

import UserService from "../services/UserService.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import logger from "../utils/logger.js";

/**
 * @bref Récupère tous les utilisateurs
 * @param {any} req - Requête Express
 * @param {any} res - Réponse Express
 * @returns {Promise<void>}
 */
export const getUsers = asyncHandler(async (req, res) => {
  const users = await UserService.getAllUsers();
  logger.info("Users fetched", { count: users.length });
  res.json(users);
});

/**
 * @bref Récupère un utilisateur par ID
 * @param {any} req - Requête Express
 * @param {any} res - Réponse Express
 * @returns {Promise<void>}
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await UserService.getUserById(id);
  logger.info("User fetched by ID", { userId: id });
  res.json(user);
});

/**
 * @bref Crée un nouvel utilisateur
 * @param {any} req - Requête Express
 * @param {any} res - Réponse Express
 * @returns {Promise<void>}
 */
export const createUser = asyncHandler(async (req, res) => {
  const user = await UserService.createUser(req.body);
  logger.info("User created", { userId: user.id });
  res.status(201).json({
    message: "Utilisateur créé avec succès",
    user,
  });
});

/**
 * @bref Met à jour un utilisateur
 * @param {any} req - Requête Express
 * @param {any} res - Réponse Express
 * @returns {Promise<void>}
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await UserService.updateUser(id, req.body);
  logger.info("User updated", { userId: id });
  res.json(user);
});

/**
 * @bref Supprime un utilisateur
 * @param {any} req - Requête Express
 * @param {any} res - Réponse Express
 * @returns {Promise<void>}
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await UserService.deleteUser(id);
  logger.info("User deleted", { userId: id });
  res.status(204).send();
});

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
