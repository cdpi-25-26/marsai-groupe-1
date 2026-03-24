/**
 * @bref Routes Event - Gestion des événements
 */

import express from "express";
import EventController from "../controllers/EventController.js";
import { requireAuth } from "../middlewares/AuthMiddleware.js";
import { validateRequired } from "../middlewares/validation.js";

const eventRouter = express.Router();

/**
 * @bref Routes publiques (pas d'auth requise)
 */
eventRouter.get("/", EventController.getEvents);

/**
 * @bref Routes fixes AVANT les routes paramétriques /:id
 */
eventRouter.get("/my-registrations", requireAuth(), EventController.getMyRegistrations);
eventRouter.get("/scan-history", requireAuth(["ADMIN"]), EventController.getScanHistory);
eventRouter.post("/scan/:qrToken", requireAuth(["ADMIN"]), EventController.scanQrCode);

/**
 * @bref Routes paramétriques
 */
eventRouter.get("/:id", EventController.getEventById);
eventRouter.post("/:id/register", requireAuth(), EventController.registerForEvent);
eventRouter.get("/:id/registrations", requireAuth(["ADMIN"]), EventController.getEventRegistrations);

eventRouter.post(
  "/",
  requireAuth(["ADMIN"]),
  validateRequired(["title", "type", "startDate", "endDate"]),
  EventController.createEvent
);
eventRouter.put("/:id", requireAuth(["ADMIN"]), EventController.updateEvent);
eventRouter.delete("/:id", requireAuth(["ADMIN"]), EventController.deleteEvent);

export default eventRouter;
