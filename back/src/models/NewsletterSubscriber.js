import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

/**
 * Inscription à la newsletter du festival (CdC §3.2 - Public)
 * Peut être liée à un compte User ou email seul (visiteur non inscrit).
 */
const NewsletterSubscriber = sequelize.define(
  "NewsletterSubscriber",
  {
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "newsletter_subscribers_email_uq",
      validate: { isEmail: true },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
      onDelete: "SET NULL",
    },
    language: {
      type: DataTypes.ENUM("fr", "en"),
      defaultValue: "fr",
      allowNull: false,
    },
    subscribedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    tableName: "newsletter_subscribers",
    underscored: true,
    timestamps: true,
  }
);

export default NewsletterSubscriber;
