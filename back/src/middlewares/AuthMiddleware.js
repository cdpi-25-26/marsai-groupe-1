/**
 * @bref Middleware d'authentification JWT avec gestion des rôles
 * Pattern factory : requireAuth() ou requireAuth(["ADMIN"])
 */

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError } from "./errorHandler.js";
import logger from "../utils/logger.js";

/**
 * @bref Factory de middleware d'authentification
 * @param {string[]} roles - Rôles autorisés (vide = tous les rôles authentifiés)
 * @returns {(req: any, res: any, next: Function) => Promise<void>} Middleware Express standard
 */
export const requireAuth = (roles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.header("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError("Token Bearer manquant", 401);
      }

      const token = authHeader.split(" ")[1];

      if (!token) {
        throw new AppError("Token d'authentification requis", 401);
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded?.username) {
        throw new AppError("Payload du token invalide", 401);
      }

      const user = await User.findOne({
        where: { username: decoded.username },
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        throw new AppError("Utilisateur introuvable", 401);
      }

      /**
       * @bref Vérification des rôles
       */
      if (roles.length > 0 && !roles.includes(user.role)) {
        logger.warn("Access denied", { userId: user.id, role: user.role, requiredRoles: roles });
        throw new AppError("Permission refusée", 403);
      }

      req.user = user;
      next();
    } catch (error) {
      if (error instanceof AppError) return next(error);
      if (error.name === "JsonWebTokenError") return next(new AppError("Token invalide", 401));
      if (error.name === "TokenExpiredError") return next(new AppError("Token expiré", 401));
      next(new AppError("Erreur d'authentification", 401));
    }
  };
};

/**
 * @bref Middleware par défaut (compatibilité legacy) - accepte tous les rôles authentifiés
 */
const AuthMiddleware = requireAuth();

export default AuthMiddleware;
