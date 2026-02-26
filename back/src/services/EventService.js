/**
 * @bref Service Event - Logique métier pour les événements
 */

import crypto from "crypto";
import Event from "../models/Event.js";
import EventRegistration from "../models/EventRegistration.js";
import ScanLog from "../models/ScanLog.js";
import User from "../models/User.js";
import NotificationService from "./NotificationService.js";
import { AppError } from "../middlewares/errorHandler.js";
import logger from "../utils/logger.js";
import { Op } from "sequelize";

class EventService {
  /**
   * @bref Récupère tous les événements
   * @returns {Promise<any[]>}
   */
  async getAllEvents() {
    try {
      const events = await Event.findAll({
        order: [["created_at", "DESC"]],
      });

      const eventsWithRegistrations = await Promise.all(
        events.map(async (event) => {
          let registrations = 0;
          try {
            registrations = await EventRegistration.count({
              where: { eventId: event.id },
            });
          } catch (err) {
            logger.warn("Could not count registrations", { eventId: event.id, error: err.message });
          }

          const json = event.toJSON ? event.toJSON() : event;
          json.ticketsSold = registrations;
          return json;
        })
      );

      return eventsWithRegistrations;
    } catch (error) {
      logger.error("Error fetching events", { 
        error: error.message, 
        stack: error.stack,
        name: error.name 
      });
      throw new AppError(`Erreur lors de la récupération des événements: ${error.message}`, 500);
    }
  }

  /**
   * @bref Récupère un événement par ID
   * @param {string|number} id - Identifiant événement
   * @returns {Promise<any>}
   */
  async getEventById(id) {
    try {
      const event = await Event.findByPk(id);
      if (!event) {
        throw new AppError("Événement non trouvé", 404);
      }

      let registrations = 0;
      try {
        registrations = await EventRegistration.count({
          where: { eventId: id },
        });
      } catch (err) {
        logger.warn("Could not count registrations", { eventId: id, error: err.message });
      }

      const json = event.toJSON ? event.toJSON() : event;
      json.ticketsSold = registrations;
      return json;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error("Error fetching event by ID", { id, error: error.message });
      throw new AppError("Erreur lors de la récupération de l'événement", 500);
    }
  }

  /**
   * @bref Crée un nouvel événement
   * @param {any} eventData - Données événement
   * @returns {Promise<any>}
   */
  async createEvent(eventData) {
    try {
      const {
        title,
        type,
        description,
        startDate,
        endDate,
        location,
        maxParticipants,
      } = eventData;

      const newEvent = await Event.create({
        title,
        type,
        description: description || null,
        startDate,
        endDate,
        location: location || null,
        maxParticipants: maxParticipants || null,
      });

      logger.info("Event created", { eventId: newEvent.id, title: newEvent.title });

      const registrations = await EventRegistration.count({
        where: { eventId: newEvent.id },
      }).catch(() => 0);

      const json = newEvent.toJSON();
      json.ticketsSold = registrations;
      return json;
    } catch (error) {
      logger.error("Error creating event", { 
        error: error.message, 
        stack: error.stack,
        name: error.name,
        data: eventData 
      });
      throw new AppError(`Erreur lors de la création de l'événement: ${error.message}`, 500);
    }
  }

  /**
   * @bref Met à jour un événement
   * @param {string|number} id - Identifiant événement
   * @param {any} eventData - Données à mettre à jour
   * @returns {Promise<any>}
   */
  async updateEvent(id, eventData) {
    try {
      const event = await Event.findByPk(id);
      if (!event) {
        throw new AppError("Événement non trouvé", 404);
      }

      const {
        title,
        type,
        description,
        startDate,
        endDate,
        location,
        maxParticipants,
      } = eventData;

      if (title != null) event.title = title;
      if (type != null) event.type = type;
      if (description != null) event.description = description;
      if (startDate != null) event.startDate = startDate;
      if (endDate != null) event.endDate = endDate;
      if (location != null) event.location = location;
      if (maxParticipants != null) event.maxParticipants = maxParticipants;

      await event.save();

      const registrations = await EventRegistration.count({
        where: { eventId: id },
      });

      logger.info("Event updated", { eventId: event.id });

      const json = event.toJSON();
      json.ticketsSold = registrations;
      return json;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error("Error updating event", { id, error: error.message });
      throw new AppError("Erreur lors de la mise à jour de l'événement", 500);
    }
  }

  /**
   * @bref Supprime un événement
   * @param {string|number} id - Identifiant événement
   * @returns {Promise<{message: string}>}
   */
  async deleteEvent(id) {
    try {
      const event = await Event.findByPk(id);
      if (!event) {
        throw new AppError("Événement non trouvé", 404);
      }

      try {
        await EventRegistration.destroy({ where: { eventId: id } });
      } catch (err) {
        logger.warn("Could not delete registrations", { eventId: id, error: err.message });
      }
      await event.destroy();

      logger.info("Event deleted", { eventId: id });

      return { message: "Événement supprimé avec succès" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error("Error deleting event", { id, error: error.message });
      throw new AppError("Erreur lors de la suppression de l'événement", 500);
    }
  }

  /**
   * @bref Envoie une notification aux utilisateurs inscrits à un événement
   * @param {number} eventId - ID de l'événement
   * @param {string} title - Titre de la notification
   * @param {string} message - Message de la notification
   * @returns {Promise<number>} - Nombre de notifications envoyées
   */
  async notifyRegisteredUsers(eventId, title, message) {
    try {
      const event = await Event.findByPk(eventId);
      if (!event) {
        throw new AppError("Événement non trouvé", 404);
      }

      /**
       * @bref Récupérer les utilisateurs inscrits
       */
      const registrations = await EventRegistration.findAll({
        where: { eventId },
        attributes: ["userId"],
      });

      const userIds = registrations.map(r => r.userId);
      let notificationCount = 0;

      /**
       * @bref Envoyer une notification à chaque utilisateur inscrit
       */
      for (const userId of userIds) {
        try {
          await NotificationService.createAndSendNotification(
            userId,
            "EVENT_REMINDER",
            title,
            message,
            eventId
          );
          notificationCount++;
        } catch (err) {
          logger.warn("Error sending notification to user", { userId, eventId, error: err.message });
        }
      }

      logger.info("Event notifications sent", { eventId, count: notificationCount });
      return notificationCount;
    } catch (error) {
      logger.error("Error notifying registered users", { eventId, error: error.message });
      throw error;
    }
  }

  /**
   * @bref Inscription d'un utilisateur à un événement (réservation + QR)
   */
  async registerForEvent(eventId, userId, ticketType = "standard") {
    const event = await Event.findByPk(eventId);
    if (!event) throw new AppError("Événement introuvable", 404);

    const existing = await EventRegistration.findOne({ where: { eventId, userId } });
    if (existing) throw new AppError("Vous êtes déjà inscrit à cet événement", 409);

    if (event.maxParticipants != null) {
      const count = await EventRegistration.count({ where: { eventId } });
      if (count >= event.maxParticipants) throw new AppError("Événement complet", 409);
    }

    const qrToken = crypto.randomBytes(32).toString("hex");
    const registration = await EventRegistration.create({
      eventId,
      userId,
      ticketType,
      qrToken,
    });

    logger.info("Event registration created", { eventId, userId, ticketType });
    return { registration, event };
  }

  /**
   * @bref Récupère les réservations de l'utilisateur connecté
   */
  async getMyRegistrations(userId) {
    return EventRegistration.findAll({
      where: { userId },
      include: [{ model: Event }],
      order: [["createdAt", "DESC"]],
    });
  }

  /**
   * @bref Scan d'un QR code (check-in admin)
   */
  async scanQrCode(qrToken, adminUserId) {
    const registration = await EventRegistration.findOne({
      where: { qrToken },
      include: [
        { model: User, attributes: ["id", "username", "email", "role"] },
        { model: Event },
      ],
    });

    if (!registration) {
      await ScanLog.create({ qrToken, scannedByUserId: adminUserId, status: "invalid", message: "Ticket introuvable" });
      throw new AppError("Ticket introuvable", 404);
    }

    if (registration.revokedAt) {
      await ScanLog.create({ qrToken, scannedByUserId: adminUserId, registrationId: registration.id, status: "revoked", message: "Ticket révoqué" });
      throw new AppError("Ticket révoqué", 400);
    }

    if (registration.expiresAt && new Date() > new Date(registration.expiresAt)) {
      await ScanLog.create({ qrToken, scannedByUserId: adminUserId, registrationId: registration.id, status: "expired", message: "QR code expiré" });
      throw new AppError("QR code expiré", 400);
    }

    await registration.update({
      checkedInAt: registration.checkedInAt || new Date(),
      checkedInByUserId: adminUserId,
      checkInCount: registration.checkInCount + 1,
    });

    await ScanLog.create({ qrToken, scannedByUserId: adminUserId, registrationId: registration.id, status: "valid" });

    logger.info("QR scan successful", { qrToken, adminUserId, registrationId: registration.id });
    return registration;
  }

  /**
   * @bref Historique des scans QR (admin)
   */
  async getScanHistory(adminUserId, limit = 100) {
    return ScanLog.findAll({
      where: { scannedByUserId: adminUserId },
      include: [
        {
          model: EventRegistration,
          as: "registration",
          include: [
            { model: User, attributes: ["id", "username", "email"] },
            { model: Event, attributes: ["id", "title"] },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
    });
  }

  /**
   * @bref Liste des inscriptions d'un événement (admin)
   */
  async getEventRegistrations(eventId) {
    return EventRegistration.findAll({
      where: { eventId },
      include: [{ model: User, attributes: ["id", "username", "email", "role"] }],
      order: [["createdAt", "ASC"]],
    });
  }
}

export default new EventService();
