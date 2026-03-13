/**
 * @bref Routes Newsletter - abonnement et envoi massif (admin)
 */

import express from "express";
import NewsletterController from "../controllers/NewsletterController.js";
import { requireAuth } from "../middlewares/AuthMiddleware.js";

const newsletterRouter = express.Router();

/**
 * @bref Abonnement public à la newsletter
 * POST /api/newsletter/subscribe
 */
newsletterRouter.post("/subscribe", NewsletterController.subscribe);

/**
 * @bref Envoi d'une newsletter à tous les abonnés (ADMIN)
 * POST /api/newsletter/send
 */
newsletterRouter.post("/send", requireAuth(["ADMIN"]), NewsletterController.sendNewsletter);

export default newsletterRouter;

