/**
 * @bref Service Auth - Gestion de l'authentification
 */

import UserService from "./UserService.js";
import { comparePassword } from "../utils/password.js";
import jwt from "jsonwebtoken";
import { AppError } from "../middlewares/errorHandler.js";
import logger from "../utils/logger.js";

class AuthService {
  /**
   * @bref Authentifie un utilisateur et génère un token JWT
   * @param {string} username - Identifiant (username)
   * @param {string} password - Mot de passe en clair
   * @returns {Promise<{message: string, user: any, token: string}>}
   */
  async login(username, password) {
    try {
      const user = await UserService.getUserByUsername(username);

      if (!user) {
        throw new AppError("Identifiants invalides", 401);
      }

      const isMatch = await comparePassword(password, user.password);

      if (!isMatch) {
        throw new AppError("Identifiants invalides", 401);
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || "24h",
        }
      );

      logger.info("User logged in", { userId: user.id, username: user.username });

      const userResponse = user.toJSON();
      delete userResponse.password;

      return {
        message: "Connexion réussie",
        user: userResponse,
        token,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error("Error during login", { username, error: error.message });
      throw new AppError("Erreur lors de la connexion", 500);
    }
  }

  /**
   * @bref Enregistre un nouvel utilisateur
   * @param {any} userData - Données d'inscription (body)
   * @returns {Promise<{message: string, user: any}>}
   */
  async register(userData) {
    try {
      const user = await UserService.createUser(userData);
      logger.info("User registered", { userId: user.id });
      return {
        message: "Inscription réussie",
        user,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error("Error during registration", { error: error.message });
      throw new AppError("Erreur lors de l'inscription", 500);
    }
  }
}

export default new AuthService();
