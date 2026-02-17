/**
 * @bref Contrôleur Auth - Refactorisé avec architecture professionnelle
 */

import AuthService from "../services/AuthService.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import logger from "../utils/logger.js";

/**
 * @bref Connexion utilisateur
 * @param {any} req - Requête Express
 * @param {any} res - Réponse Express
 * @returns {Promise<void>}
 */
export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const result = await AuthService.login(username, password);
  logger.info("Login successful", { username });
  res.json(result);
});

/**
 * @bref Inscription utilisateur
 * @param {any} req - Requête Express
 * @param {any} res - Réponse Express
 * @returns {Promise<void>}
 */
export const register = asyncHandler(async (req, res) => {
  const result = await AuthService.register(req.body);
  logger.info("Registration successful", { email: req.body.email });
  res.status(201).json(result);
});

export default { login, register };
