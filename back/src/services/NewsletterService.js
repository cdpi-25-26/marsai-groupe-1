/**
 * @bref Service Newsletter - gestion des abonnes et synchronisation Brevo
 */

import NewsletterSubscriber from "../models/NewsletterSubscriber.js";
import logger from "../utils/logger.js";
import { AppError } from "../middlewares/errorHandler.js";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = "https://api.brevo.com/v3/contacts";

/**
 * Cree ou met a jour un contact sur Brevo via l'API HTTP
 */
async function syncContactToBrevo(email, attributes = {}) {
  if (!BREVO_API_KEY) {
    logger.warn("BREVO_API_KEY manquante — synchronisation Brevo desactivee");
    return null;
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        attributes,
        updateEnabled: true,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok || response.status === 201) {
      logger.info("Contact synced to Brevo", { email, brevoId: data.id });
      return data;
    }

    if (data.code === "duplicate_parameter") {
      logger.info("Contact already exists on Brevo", { email });
      return data;
    }

    logger.warn("Brevo API error", {
      status: response.status,
      code: data.code,
      message: data.message,
      email,
    });
    return null;
  } catch (error) {
    logger.error("Brevo API request failed", { email, error: error.message });
    return null;
  }
}

class NewsletterService {
  /**
   * @bref Inscrit un email a la newsletter (DB locale + Brevo)
   */
  async subscribe(email, language = "fr", userId = null) {
    if (!email) {
      throw new AppError("Email obligatoire pour l'inscription newsletter", 400);
    }

    const normalizedLanguage = ["fr", "en"].includes(language) ? language : "fr";

    const [subscriber, created] = await NewsletterSubscriber.findOrCreate({
      where: { email },
      defaults: {
        email,
        language: normalizedLanguage,
        userId,
      },
    });

    if (!created) {
      let changed = false;

      if (subscriber.language !== normalizedLanguage) {
        subscriber.language = normalizedLanguage;
        changed = true;
      }

      if (userId && !subscriber.userId) {
        subscriber.userId = userId;
        changed = true;
      }

      if (changed) {
        await subscriber.save();
      }
    }

    await syncContactToBrevo(email, {
      LANGUE: normalizedLanguage.toUpperCase(),
      SOURCE: "marsai_newsletter",
    });

    return subscriber;
  }

  /**
   * @bref Ajoute un contact Brevo lors de l'inscription utilisateur
   */
  async syncUserToBrevo(user) {
    if (!user?.email) return;

    await syncContactToBrevo(user.email, {
      PRENOM: user.username || "",
      LANGUE: (user.preferredLanguage || "fr").toUpperCase(),
      SOURCE: "marsai_register",
    });
  }

  /**
   * @bref Envoie une newsletter simple a tous les abonnes (via EmailService SMTP)
   */
  async sendToAll({ subject, htmlContent }) {
    if (!subject || !htmlContent) {
      throw new AppError("Sujet et contenu HTML sont requis", 400);
    }

    const { default: EmailService } = await import("./EmailService.js");

    const subscribers = await NewsletterSubscriber.findAll({
      attributes: ["email"],
    });

    if (!subscribers.length) {
      return { count: 0 };
    }

    const to = subscribers.map((s) => ({ email: s.email }));

    await EmailService.sendTransactionalEmail({
      to,
      subject,
      htmlContent,
    });

    logger.info("Newsletter sent to all subscribers", { count: to.length });
    return { count: to.length };
  }
}

export default new NewsletterService();

