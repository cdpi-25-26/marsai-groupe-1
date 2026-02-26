import EventService from "../services/EventService.js";
import { AppError } from "../middlewares/errorHandler.js";

class EventController {
  async getEvents(req, res, next) {
    try {
      const events = await EventService.getEvents();
      res.json(events);
    } catch (err) {
      next(err);
    }
  }

  async registerForEvent(req, res, next) {
    try {
      const { id } = req.params;
      const { ticketType = "standard" } = req.body;
      const userId = req.user.id;

      const validTypes = ["standard", "vip", "pmr", "press"];
      if (!validTypes.includes(ticketType)) {
        throw new AppError(`Type de billet invalide. Types valides: ${validTypes.join(", ")}`, 400);
      }

      const result = await EventService.registerForEvent(id, userId, ticketType);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getMyRegistrations(req, res, next) {
    try {
      const userId = req.user.id;
      const registrations = await EventService.getMyRegistrations(userId);
      res.json(registrations);
    } catch (err) {
      next(err);
    }
  }

  async scanQrCode(req, res, next) {
    try {
      const { qrToken } = req.params;
      const adminUserId = req.user.id;
      const result = await EventService.scanQrCode(qrToken, adminUserId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getEventRegistrations(req, res, next) {
    try {
      const { id } = req.params;
      const registrations = await EventService.getEventRegistrations(id);
      res.json(registrations);
    } catch (err) {
      next(err);
    }
  }

  async getScanHistory(req, res, next) {
    try {
      const adminUserId = req.user.id;
      const history = await EventService.getScanHistory(adminUserId);
      res.json(history);
    } catch (err) {
      next(err);
    }
  }
}

export default new EventController();
