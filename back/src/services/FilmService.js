/**
 * @bref Service Film - Logique métier pour les films
 * Gère le workflow de soumission, modération, sélection officielle
 */

import Film, { FILM_STATUS } from "../models/Film.js";
import User from "../models/User.js";
import SubmissionConfig from "../models/SubmissionConfig.js";
import Notification from "../models/Notification.js";
import { AppError } from "../middlewares/errorHandler.js";
import logger from "../utils/logger.js";

class FilmService {
  /**
   * @bref Vérifie si la période de soumission est ouverte (CdC §4.1)
   * @returns {Promise<boolean>}
   */
  async checkSubmissionPeriod() {
    try {
      const opensAt = await SubmissionConfig.findOne({ where: { key: "submission_opens_at" } });
      const closesAt = await SubmissionConfig.findOne({ where: { key: "submission_closes_at" } });

      if (!opensAt || !closesAt) {
        throw new AppError("Période de soumission non configurée", 500);
      }

      const now = new Date();
      const openDate = new Date(opensAt.value);
      const closeDate = new Date(closesAt.value);

      if (now < openDate) {
        throw new AppError("La période de soumission n'est pas encore ouverte", 403);
      }

      if (now > closeDate) {
        throw new AppError("La période de soumission est fermée", 403);
      }

      return true;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error("Error checking submission period", { error: error.message });
      throw new AppError("Erreur lors de la vérification de la période de soumission", 500);
    }
  }

  /**
   * @bref Vérifie le nombre max de films en sélection officielle (50 max - CdC §3.3)
   * @returns {Promise<number>}
   */
  async checkMaxSelectionOfficielle() {
    try {
      const count = await Film.count({
        where: { status: "SELECTION_OFFICIELLE" },
      });

      if (count >= 50) {
        throw new AppError("La sélection officielle est complète (50 films maximum)", 400);
      }

      return count;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error("Error checking max selection officielle", { error: error.message });
      throw error;
    }
  }

  /**
   * @bref Récupère tous les films avec filtres et pagination
   * @param {any} options - { status, country, page, limit, includeUser }
   * @returns {Promise<{films: any[], pagination: {total: number, page: number, limit: number, totalPages: number}}>}
   */
  async getAllFilms(options = {}) {
    try {
      const {
        status,
        country,
        page = 1,
        limit = 20,
        includeUser = false,
      } = options;

      const where = {};
      if (status) where.status = status;
      if (country) where.country = country.toUpperCase();

      const offset = (page - 1) * limit;

      const { count, rows } = await Film.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: includeUser ? [{ model: User, attributes: ["id", "username", "country"] }] : [],
        order: [["created_at", "DESC"]],
      });

      return {
        films: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      logger.error("Error fetching films", { error: error.message });
      throw new AppError("Erreur lors de la récupération des films", 500);
    }
  }

  /**
   * @bref Récupère un film par ID
   * @param {string|number} id - Identifiant film
   * @param {boolean} includeUser - Inclure le réalisateur
   * @returns {Promise<any>}
   */
  async getFilmById(id, includeUser = false) {
    try {
      const film = await Film.findByPk(id, {
        include: includeUser ? [{ model: User, attributes: ["id", "username", "biography", "country"] }] : [],
      });

      if (!film) {
        throw new AppError("Film non trouvé", 404);
      }

      return film;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error("Error fetching film by ID", { id, error: error.message });
      throw new AppError("Erreur lors de la récupération du film", 500);
    }
  }

  /**
   * @bref Crée un nouveau film (soumission)
   * @param {any} filmData - Données film (body)
   * @param {number} userId - Id du réalisateur
   * @returns {Promise<any>}
   */
  async createFilm(filmData, userId) {
    try {
      /**
       * @bref Vérifier la période de soumission
       */
      await this.checkSubmissionPeriod();

      const {
        title,
        description,
        duration,
        youtubeId,
        posterPath,
        country,
        aiIdentity,
      } = filmData;

      /**
       * @bref Valider la fiche IA (au moins un outil doit être renseigné)
       */
      const aiTools = Object.values(aiIdentity || {}).filter(Boolean);
      if (aiTools.length === 0) {
        throw new AppError("Au moins un outil IA doit être renseigné dans la fiche d'identité", 400);
      }

      const newFilm = await Film.create({
        title,
        description,
        duration,
        youtubeId,
        posterPath,
        country,
        aiIdentity: aiIdentity || {},
        userId,
        status: "PENDING",
      });

      logger.info("Film created", { filmId: newFilm.id, userId, title: newFilm.title });

      return newFilm;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error("Error creating film", { error: error.message });
      throw new AppError("Erreur lors de la création du film", 500);
    }
  }

  /**
   * @bref Met à jour le statut d'un film (modération admin)
   * @param {string|number} id - Identifiant film
   * @param {string} status - Nouveau statut
   * @param {string|null} rejectionReason - Motif si refus
   * @returns {Promise<any>}
   */
  async updateFilmStatus(id, status, rejectionReason = null) {
    try {
      const film = await Film.findByPk(id);
      if (!film) {
        throw new AppError("Film non trouvé", 404);
      }

      /**
       * @bref Valider le statut
       */
      if (!FILM_STATUS.includes(status)) {
        throw new AppError(`Statut invalide. Statuts valides: ${FILM_STATUS.join(", ")}`, 400);
      }

      /**
       * @bref Vérifier rejectionReason si REJECTED
       */
      if (status === "REJECTED" && !rejectionReason) {
        throw new AppError("Un motif de refus est obligatoire", 400);
      }

      /**
       * @bref Vérifier max 50 films si SELECTION_OFFICIELLE
       */
      if (status === "SELECTION_OFFICIELLE" && film.status !== "SELECTION_OFFICIELLE") {
        await this.checkMaxSelectionOfficielle();
      }

      const oldStatus = film.status;
      film.status = status;
      if (rejectionReason) film.rejectionReason = rejectionReason;
      await film.save();

      /**
       * @bref Créer notification pour le réalisateur
       */
      await this.createStatusChangeNotification(film.userId, film.id, status, oldStatus);

      logger.info("Film status updated", { filmId: id, oldStatus, newStatus: status });

      return film;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error("Error updating film status", { id, error: error.message });
      throw new AppError("Erreur lors de la mise à jour du statut", 500);
    }
  }

  /**
   * @bref Crée une notification lors du changement de statut
   * @param {number} userId - Id du réalisateur
   * @param {number} filmId - Id du film
   * @param {string} newStatus - Nouveau statut
   * @param {string} oldStatus - Ancien statut
   * @returns {Promise<void>}
   */
  async createStatusChangeNotification(userId, filmId, newStatus, oldStatus) {
    try {
      let notificationType, title, message;

      switch (newStatus) {
        case "APPROVED":
          notificationType = "FILM_VALIDATED";
          title = "Film validé";
          message = "Votre film a été validé et est maintenant visible dans la galerie.";
          break;
        case "REJECTED":
          notificationType = "FILM_REJECTED";
          title = "Film refusé";
          message = "Votre film a été refusé. Consultez les détails pour plus d'informations.";
          break;
        case "SELECTION_OFFICIELLE":
          notificationType = "SELECTION_OFFICIELLE";
          title = "Sélection officielle";
          message = "Félicitations ! Votre film a été sélectionné pour la compétition officielle.";
          break;
        default:
          /**
           * @bref Pas de notification pour les autres statuts
           */
          return;
      }

      await Notification.create({
        userId,
        type: notificationType,
        title,
        message,
        relatedId: filmId,
      });

      logger.info("Notification created", { userId, filmId, type: notificationType });
    } catch (error) {
      logger.error("Error creating notification", { error: error.message });
      /**
       * @bref Ne pas faire échouer la mise à jour du film si la notification échoue
       */
    }
  }

  /**
   * @bref Récupère les films en sélection officielle (pour le jury)
   * @returns {Promise<any[]>}
   */
  async getSelectionOfficielle() {
    try {
      const films = await Film.findAll({
        where: { status: "SELECTION_OFFICIELLE" },
        include: [{ model: User, attributes: ["id", "username", "country"] }],
        order: [["created_at", "DESC"]],
      });

      return films;
    } catch (error) {
      logger.error("Error fetching selection officielle", { error: error.message });
      throw new AppError("Erreur lors de la récupération de la sélection officielle", 500);
    }
  }
}

export default new FilmService();
