import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

/**
 * Modèle User - Plateforme marsAI (CdC Lyon NERD)
 * Rôles : ADMIN (Gestionnaire), JURY (Évaluateur), REALISATEUR (Contributeur)
 * Le Public (Visiteur) accède sans compte à la galerie.
 */
const User = sequelize.define(
  "User",
  {
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "users_email_uq",
      validate: { isEmail: true },
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "users_username_uq",
      comment: "Nom ou pseudo (profil public)",
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Hash bcrypt",
    },
    role: {
      type: DataTypes.ENUM("ADMIN", "JURY", "REALISATEUR"),
      defaultValue: "REALISATEUR",
      allowNull: false,
    },
    // Profil public (Réalisateur - CdC §3.1)
    biography: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(3),
      allowNull: true,
      comment: "Code ISO 3166-1 alpha-2 (ex: FR)",
    },
    // Liens réseaux sociaux optionnels
    socialLinks: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: "Ex: { website, twitter, instagram, linkedin }",
    },
    // Inscription newsletter (Public - CdC §3.2)
    newsletter: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    preferredLanguage: {
      type: DataTypes.ENUM("fr", "en"),
      defaultValue: "fr",
      allowNull: false,
    },
  },
  {
    tableName: "users",
    underscored: true,
    timestamps: true,
  }
);

export default User;
