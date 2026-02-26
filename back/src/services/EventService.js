import crypto from "crypto";
import { Event, EventRegistration, ScanLog, User } from "../models/index.js";
import { AppError } from "../middlewares/errorHandler.js";

class EventService {
  async getEvents() {
    return Event.findAll({ order: [["startDate", "ASC"]] });
  }

  async registerForEvent(eventId, userId, ticketType = "standard") {
    const event = await Event.findByPk(eventId);
    if (!event) throw new AppError("Événement introuvable", 404);

    const existing = await EventRegistration.findOne({ where: { eventId, userId } });
    if (existing) throw new AppError("Vous êtes déjà inscrit à cet événement", 409);

    const count = await EventRegistration.count({ where: { eventId } });
    if (count >= event.maxParticipants) throw new AppError("Événement complet", 409);

    const qrToken = crypto.randomBytes(32).toString("hex");
    const registration = await EventRegistration.create({
      eventId,
      userId,
      ticketType,
      qrToken,
      expiresAt: event.endDate,
    });

    return { registration, event };
  }

  async getMyRegistrations(userId) {
    return EventRegistration.findAll({
      where: { userId },
      include: [{ model: Event }],
      order: [["createdAt", "DESC"]],
    });
  }

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

    return registration;
  }

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

  async getEventRegistrations(eventId) {
    return EventRegistration.findAll({
      where: { eventId },
      include: [{ model: User, attributes: ["id", "username", "email", "role"] }],
      order: [["createdAt", "ASC"]],
    });
  }
}

export default new EventService();
