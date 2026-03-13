/**
 * @bref Service Auth - Gestion de l'authentification
 */

import UserService from "./UserService.js";
import EmailService from "./EmailService.js";
import NewsletterService from "./NewsletterService.js";
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

      /**
       * @bref Email de bienvenue (non bloquant)
       */
      try {
        const lang = user.preferredLanguage === "en" ? "en" : "fr";
        const subject =
          lang === "fr"
            ? "Bienvenue sur la plateforme marsAI"
            : "Welcome to the marsAI platform";
        const htmlContent =
          lang === "fr"
            ? `<h1>Bienvenue ${user.username || ""}</h1>
<p>Votre compte a bien été créé sur la plateforme <strong>marsAI</strong>.</p>
<p>Vous pouvez dès maintenant vous connecter, soumettre vos films et découvrir la sélection.</p>`
            : `<h1>Welcome ${user.username || ""}</h1>
<p>Your account has been created on the <strong>marsAI</strong> platform.</p>
<p>You can now log in, submit your films and explore the selection.</p>`;

        await EmailService.sendTransactionalEmail({
          to: { email: user.email, name: user.username },
          subject,
          htmlContent,
        });
      } catch (emailError) {
        logger.warn("Registration welcome email failed", {
          userId: user.id,
          email: user.email,
          error: emailError.message,
        });
      }

      try {
        await NewsletterService.syncUserToBrevo(user);
      } catch (brevoError) {
        logger.warn("Brevo contact sync failed", {
          userId: user.id,
          error: brevoError.message,
        });
      }

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
