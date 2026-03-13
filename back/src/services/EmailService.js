/**
 * @bref Service d'envoi d'emails via Brevo SMTP (Nodemailer)
 */

import nodemailer from "nodemailer";
import logger from "../utils/logger.js";
import { AppError } from "../middlewares/errorHandler.js";

const SMTP_HOST = process.env.SMTP_HOST || "smtp-relay.brevo.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || process.env.BREVO_SENDER_EMAIL;
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || process.env.BREVO_SENDER_NAME || "marsAI";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!SMTP_USER || !SMTP_PASS) {
    logger.warn("SMTP_USER ou SMTP_PASS manquant — emails désactivés");
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter;
}

/**
 * @typedef {Object} EmailRecipient
 * @property {string} email
 * @property {string} [name]
 */

class EmailService {
  /**
   * @param {Object} options
   * @param {EmailRecipient|EmailRecipient[]} options.to
   * @param {string} options.subject
   * @param {string} options.htmlContent
   * @returns {Promise<void>}
   */
  async sendTransactionalEmail({ to, subject, htmlContent } = {}) {
    const smtp = getTransporter();
    if (!smtp) {
      logger.warn("Email non envoyé — transport SMTP non configuré");
      return;
    }

    if (!subject || !htmlContent) {
      throw new AppError("Sujet et contenu HTML requis", 400);
    }

    const recipients = Array.isArray(to) ? to : [to];
    const toList = recipients
      .filter(Boolean)
      .map((r) => (typeof r === "string" ? r : r.name ? `"${r.name}" <${r.email}>` : r.email))
      .filter(Boolean);

    if (toList.length === 0) {
      throw new AppError("Aucun destinataire email valide fourni", 400);
    }

    try {
      const info = await smtp.sendMail({
        from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
        to: toList.join(", "),
        subject,
        html: htmlContent,
      });

      logger.info("Email envoyé via SMTP", {
        messageId: info.messageId,
        to: toList,
      });
    } catch (error) {
      logger.error("Erreur envoi email SMTP", {
        error: error.message,
        to: toList,
      });
      throw new AppError("Impossible d'envoyer l'email pour le moment", 502);
    }
  }
}

export default new EmailService();
