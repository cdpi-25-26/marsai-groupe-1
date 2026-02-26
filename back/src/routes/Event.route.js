import { Router } from "express";
import EventController from "../controllers/EventController.js";
import { requireAuth } from "../middlewares/AuthMiddleware.js";

const router = Router();

// Public: liste des événements
router.get("/", EventController.getEvents.bind(EventController));

// Authentifié: mes réservations
router.get("/my-registrations", requireAuth(), EventController.getMyRegistrations.bind(EventController));

// Authentifié: s'inscrire à un événement
router.post("/:id/register", requireAuth(), EventController.registerForEvent.bind(EventController));

// Admin: scanner un QR code (check-in)
router.post("/scan/:qrToken", requireAuth(["ADMIN"]), EventController.scanQrCode.bind(EventController));

// Admin: liste des inscriptions d'un événement
router.get("/:id/registrations", requireAuth(["ADMIN"]), EventController.getEventRegistrations.bind(EventController));

// Admin: historique des scans QR
router.get("/scan-history", requireAuth(["ADMIN"]), EventController.getScanHistory.bind(EventController));

export default router;
