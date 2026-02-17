/**
 * @bref Middleware de gestion d'erreurs centralisée
 * Capture toutes les erreurs et retourne une réponse standardisée
 */

import logger from "../utils/logger.js";

/**
 * @bref Erreur applicative standardisée
 */
class AppError extends Error {
  /**
   * @bref Construit une AppError
   * @param {string} message - Message d'erreur
   * @param {number} statusCode - Code HTTP
   * @returns {AppError}
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * @bref Middleware de gestion d'erreurs Express
 * @param {any} err - Erreur levée
 * @param {any} req - Requête Express
 * @param {any} res - Réponse Express
 * @param {Function} next - Next middleware
 * @returns {void}
 */
export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  /**
   * @bref Log de l'erreur
   */
  logger.error("Error occurred", {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  /**
   * @bref Réponse en développement (détails complets)
   */
  if (process.env.NODE_ENV === "development") {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  /**
   * @bref Réponse en production (message générique pour erreurs serveur)
   */
  if (err.statusCode === 500) {
    return res.status(500).json({
      status: "error",
      message: "Une erreur interne est survenue",
    });
  }

  /**
   * @bref Réponse pour erreurs opérationnelles (400, 401, 404, etc.)
   */
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

/**
 * @bref Wrapper pour les fonctions async (évite try/catch répétitifs)
 * @param {Function} fn - Handler async (req, res, next)
 * @returns {(req: any, res: any, next: Function) => void} Handler wrappé
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * @bref Classe d'erreur personnalisée
 */
export { AppError };
