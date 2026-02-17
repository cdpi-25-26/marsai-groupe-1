import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";
import crypto from "crypto";

/**
 * @bref Réservation pour workshops / conférences (CdC §11 - Bonus)
 * QR code: on stocke un token unique + état de check-in.
 */
const EventRegistration = sequelize.define(
  "EventRegistration",
  {
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "events", key: "id" },
      onDelete: "CASCADE",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    registeredAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },

    /**
     * @bref QR / contrôle d'accès
     */
    qrToken: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: "event_registrations_qr_token_uq",
      comment: "Token opaque encodé dans le QR (64 hex chars)",
    },
    qrIssuedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    checkedInAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Date/heure du premier scan (entrée)",
    },
    checkedInByUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
      onDelete: "SET NULL",
      comment: "Admin/agent ayant scanné le QR",
    },
    checkInCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Nombre de scans enregistrés (anti-abus / audit simple)",
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "QR révoqué (si besoin)",
    },
  },
  {
    tableName: "event_registrations",
    underscored: true,
    timestamps: true,
    indexes: [
      { name: "event_registrations_event_user_uq", unique: true, fields: ["event_id", "user_id"] },
      { name: "event_registrations_qr_token_uq", unique: true, fields: ["qr_token"] },
      { name: "event_registrations_event_checkedin_idx", fields: ["event_id", "checked_in_at"] },
    ],
  }
);

/**
 * @bref Génère automatiquement le token QR à la création
 * @param {any} registration - Instance Sequelize EventRegistration
 * @returns {void}
 */
EventRegistration.beforeValidate((registration) => {
  if (!registration.qrToken) {
    /**
     * @bref Token opaque de 64 chars (hex)
     */
    registration.qrToken = crypto.randomBytes(32).toString("hex");
  }
});

export default EventRegistration;
