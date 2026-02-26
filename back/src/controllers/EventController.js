/**
 * @bref Contrôleur Event - Gestion des événements
 */

import EventService from "../services/EventService.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import logger from "../utils/logger.js";

/**
 * @bref Récupère tous les événements
 */
export const getEvents = asyncHandler(async (req, res) => {
  try {
    const events = await EventService.getAllEvents();
    logger.info("Events fetched", { count: events.length });
    res.json(events);
  } catch (error) {
    logger.error("Error in getEvents controller", { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * @bref Récupère un événement par ID
 */
export const getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const event = await EventService.getEventById(id);
  logger.info("Event fetched by ID", { eventId: id });
  res.json(event);
});

/**
 * @bref Crée un nouvel événement
 */
export const createEvent = asyncHandler(async (req, res) => {
  const event = await EventService.createEvent(req.body);
  logger.info("Event created", { eventId: event.id });
  res.status(201).json({
    message: "Événement créé avec succès",
    event,
  });
});

/**
 * @bref Met à jour un événement
 */
export const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const event = await EventService.updateEvent(id, req.body);
  logger.info("Event updated", { eventId: id });
  res.json(event);
});

/**
 * @bref Supprime un événement
 */
export const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await EventService.deleteEvent(id);
  logger.info("Event deleted", { eventId: id });
  res.status(204).send();
});

/**
 * @bref Inscription à un événement (réservation avec ticket)
 */
export const registerForEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { ticketType = "standard" } = req.body;
  const userId = req.user.id;
  const result = await EventService.registerForEvent(id, userId, ticketType);
  res.status(201).json(result);
});

/**
 * @bref Récupère les réservations de l'utilisateur connecté
 */
export const getMyRegistrations = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const registrations = await EventService.getMyRegistrations(userId);
  res.json(registrations);
});

/**
 * @bref Scan d'un QR code (check-in admin)
 */
export const scanQrCode = asyncHandler(async (req, res) => {
  const { qrToken } = req.params;
  const adminUserId = req.user.id;
  const result = await EventService.scanQrCode(qrToken, adminUserId);
  res.json(result);
});

/**
 * @bref Liste des inscriptions d'un événement (admin)
 */
export const getEventRegistrations = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const registrations = await EventService.getEventRegistrations(id);
  res.json(registrations);
});

/**
 * @bref Historique des scans QR (admin)
 */
export const getScanHistory = asyncHandler(async (req, res) => {
  const adminUserId = req.user.id;
  const history = await EventService.getScanHistory(adminUserId);
  res.json(history);
});

export default {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getMyRegistrations,
  scanQrCode,
  getEventRegistrations,
  getScanHistory,
};
