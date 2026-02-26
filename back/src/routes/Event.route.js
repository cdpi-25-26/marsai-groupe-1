/**
 * @bref Routes Event - Gestion des événements (Admin uniquement)
 */

import express from "express";
import EventController from "../controllers/EventController.js";
import { requireAuth } from "../middlewares/AuthMiddleware.js";
import { validateRequired } from "../middlewares/validation.js";

const eventRouter = express.Router();

/**
 * @bref Toutes les routes nécessitent l'authentification Admin
 */
eventRouter.use(requireAuth(["ADMIN"]));

/**
 * @bref Routes publiques / authentifiées
 */
// IMPORTANT: les routes fixes doivent être déclarées AVANT les routes paramétriques /:id
eventRouter.get("/scan-history", requireAuth(["ADMIN"]), EventController.getScanHistory);
eventRouter.get("/my-registrations", requireAuth(), EventController.getMyRegistrations);

/**
 * @bref Routes CRUD Admin
 */
eventRouter.get("/", EventController.getEvents);
eventRouter.get("/:id", EventController.getEventById);
eventRouter.post(
  "/",
  validateRequired(["title", "type", "startDate", "endDate"]),
  EventController.createEvent
);
eventRouter.put("/:id", EventController.updateEvent);
eventRouter.delete("/:id", EventController.deleteEvent);

/**
 * @bref Routes réservation
 */
eventRouter.post("/:id/register", requireAuth(), EventController.registerForEvent);
eventRouter.get("/:id/registrations", requireAuth(["ADMIN"]), EventController.getEventRegistrations);
eventRouter.post("/scan/:qrToken", requireAuth(["ADMIN"]), EventController.scanQrCode);

export default eventRouter;
