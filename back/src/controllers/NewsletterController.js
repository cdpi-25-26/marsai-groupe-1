/**
 * @bref Controller Newsletter - endpoints d'abonnement et d'envoi
 */

import NewsletterService from "../services/NewsletterService.js";
import { asyncHandler, AppError } from "../middlewares/errorHandler.js";

/**
 * POST /api/newsletter/subscribe
 * Body: { email, language? }
 */
export const subscribe = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const { email, language } = body;
  const userId = req.user?.id || null;

  if (!email) {
    throw new AppError("L'email est obligatoire", 400);
  }

  const subscriber = await NewsletterService.subscribe(email, language, userId);

  res.status(201).json({
    message: "Inscription à la newsletter enregistrée",
    subscriber,
  });
});

/**
 * POST /api/newsletter/send
 * Body: { subject, htmlContent }
 * Auth: ADMIN
 */
export const sendNewsletter = asyncHandler(async (req, res) => {
  const { subject, htmlContent } = req.body;
  const result = await NewsletterService.sendToAll({ subject, htmlContent });

  res.status(202).json({
    message: "Newsletter envoyée",
    ...result,
  });
});

export default { subscribe, sendNewsletter };

