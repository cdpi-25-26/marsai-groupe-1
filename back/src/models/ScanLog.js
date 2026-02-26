import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

const ScanLog = sequelize.define(
  "ScanLog",
  {
    qrToken: {
      type: DataTypes.STRING(64),
      allowNull: false,
      comment: "Token scanné",
    },
    scannedByUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
      onDelete: "SET NULL",
      comment: "Admin/agent ayant scanné",
    },
    registrationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "event_registrations", key: "id" },
      onDelete: "SET NULL",
      comment: "Inscription trouvée (null si ticket invalide)",
    },
    status: {
      type: DataTypes.ENUM("valid", "invalid", "expired", "revoked"),
      allowNull: false,
      defaultValue: "valid",
    },
    message: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Message d'erreur si invalide",
    },
  },
  {
    tableName: "scan_logs",
    underscored: true,
    timestamps: true,
    updatedAt: false,
    indexes: [
      { name: "scan_logs_scanned_by_idx", fields: ["scanned_by_user_id"] },
      { name: "scan_logs_registration_idx", fields: ["registration_id"] },
      { name: "scan_logs_created_at_idx", fields: ["created_at"] },
    ],
  }
);

export default ScanLog;
