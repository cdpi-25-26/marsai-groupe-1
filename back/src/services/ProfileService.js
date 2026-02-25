/**
 * @bref Service Profile - Logique métier pour les profils publics
 * Gère : profil public, mise à jour du profil, suivi/désabonnement
 */

import User from "../models/User.js";
import Film from "../models/Film.js";
import Follow from "../models/Follow.js";
import { AppError } from "../middlewares/errorHandler.js";
import logger from "../utils/logger.js";
import { Op } from "sequelize";
import sequelize from "../db/connection.js";

class ProfileService {
  /**
   * @bref Retourne le profil public d'un utilisateur avec ses films et stats
   * @param {string} username - Nom d'utilisateur
   * @param {number|null} requesterId - ID de l'utilisateur connecté (optionnel)
   * @returns {Promise<object>}
   */
  async getPublicProfile(username, requesterId = null) {
    try {
      const user = await User.findOne({
        where: { username },
        attributes: { exclude: ["password", "email", "newsletter"] },
      });

      if (!user) {
        throw new AppError("Utilisateur introuvable", 404);
      }

      const [films, followersCount, followingCount, isFollowing] = await Promise.all([
        Film.findAll({
          where: { userId: user.id, status: "APPROVED" },
          attributes: ["id", "title", "description", "posterPath", "youtubeId", "duration", "country", "status", "createdAt"],
          order: [["createdAt", "DESC"]],
        }),
        Follow.count({ where: { followingId: user.id } }),
        Follow.count({ where: { followerId: user.id } }),
        requesterId
          ? Follow.findOne({ where: { followerId: requesterId, followingId: user.id } })
          : Promise.resolve(null),
      ]);

      logger.info("Public profile fetched", { username });

      return {
        id: user.id,
        username: user.username,
        biography: user.biography,
        country: user.country,
        socialLinks: user.socialLinks,
        role: user.role,
        createdAt: user.createdAt,
        stats: {
          films: films.length,
          followers: followersCount,
          following: followingCount,
        },
        isFollowing: !!isFollowing,
        films,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error("Error fetching public profile", { username, error: error.message });
      throw new AppError("Erreur lors de la récupération du profil", 500);
    }
  }

  /**
   * @bref Retourne le profil complet de l'utilisateur connecté
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<object>}
   */
  async getMyProfile(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        throw new AppError("Utilisateur introuvable", 404);
      }

      const [films, followersCount, followingCount] = await Promise.all([
        Film.findAll({
          where: { userId },
          order: [["createdAt", "DESC"]],
        }),
        Follow.count({ where: { followingId: userId } }),
        Follow.count({ where: { followerId: userId } }),
      ]);

      logger.info("My profile fetched", { userId });

      return {
        ...user.toJSON(),
        stats: {
          films: films.length,
          followers: followersCount,
          following: followingCount,
        },
        films,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error("Error fetching my profile", { userId, error: error.message });
      throw new AppError("Erreur lors de la récupération du profil", 500);
    }
  }

  /**
   * @bref Met à jour les informations du profil de l'utilisateur connecté
   * @param {number} userId - ID de l'utilisateur
   * @param {object} data - Données à mettre à jour
   * @returns {Promise<object>}
   */
  async updateMyProfile(userId, data) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new AppError("Utilisateur introuvable", 404);
      }

      const { biography, country, socialLinks, preferredLanguage } = data;

      if (biography !== undefined) user.biography = biography;
      if (country !== undefined) user.country = country;
      if (socialLinks !== undefined) user.socialLinks = socialLinks;
      if (preferredLanguage !== undefined && ["fr", "en"].includes(preferredLanguage)) {
        user.preferredLanguage = preferredLanguage;
      }

      await user.save();

      logger.info("Profile updated", { userId });

      const response = user.toJSON();
      delete response.password;
      return response;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error("Error updating profile", { userId, error: error.message });
      throw new AppError("Erreur lors de la mise à jour du profil", 500);
    }
  }

  /**
   * @bref Suivre un utilisateur
   * @param {number} followerId - ID de l'utilisateur qui suit
   * @param {string} username - Username de l'utilisateur à suivre
   * @returns {Promise<object>}
   */
  async followUser(followerId, username) {
    try {
      const target = await User.findOne({ where: { username } });
      if (!target) {
        throw new AppError("Utilisateur introuvable", 404);
      }

      if (target.id === followerId) {
        throw new AppError("Vous ne pouvez pas vous suivre vous-même", 400);
      }

      const [, created] = await Follow.findOrCreate({
        where: { followerId, followingId: target.id },
      });

      if (!created) {
        throw new AppError("Vous suivez déjà cet utilisateur", 409);
      }

      const followersCount = await Follow.count({ where: { followingId: target.id } });

      logger.info("User followed", { followerId, targetUsername: username });

      return { message: "Abonnement effectué", followersCount };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error("Error following user", { followerId, username, error: error.message });
      throw new AppError("Erreur lors de l'abonnement", 500);
    }
  }

  /**
   * @bref Se désabonner d'un utilisateur
   * @param {number} followerId - ID de l'utilisateur qui se désabonne
   * @param {string} username - Username de l'utilisateur à ne plus suivre
   * @returns {Promise<object>}
   */
  async unfollowUser(followerId, username) {
    try {
      const target = await User.findOne({ where: { username } });
      if (!target) {
        throw new AppError("Utilisateur introuvable", 404);
      }

      const deleted = await Follow.destroy({
        where: { followerId, followingId: target.id },
      });

      if (!deleted) {
        throw new AppError("Vous ne suivez pas cet utilisateur", 404);
      }

      const followersCount = await Follow.count({ where: { followingId: target.id } });

      logger.info("User unfollowed", { followerId, targetUsername: username });

      return { message: "Désabonnement effectué", followersCount };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error("Error unfollowing user", { followerId, username, error: error.message });
      throw new AppError("Erreur lors du désabonnement", 500);
    }
  }
}

export default new ProfileService();
