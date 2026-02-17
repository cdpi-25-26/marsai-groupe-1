import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

/**
 * Statuts du workflow de soumission (CdC §4)
 * PENDING → APPROVED | REJECTED → SELECTION_OFFICIELLE (finalistes) ou HORS_COMPETITION
 */
const FILM_STATUS = [
  "PENDING",           // En attente modération admin
  "APPROVED",          // Validé, visible galerie
  "REJECTED",          // Refusé (motif obligatoire)
  "SELECTION_OFFICIELLE", // Finaliste (max 50 pour le jury)
  "HORS_COMPETITION",
];

/**
 * Fiche d'identité IA obligatoire (CdC §4.2)
 * Chaque champ = nom de l'outil IA utilisé (scénario, image, vidéo, son, post-production)
 */
const defaultAiIdentity = {
  scenario: null,
  image: null,
  video: null,
  sound: null,
  postProduction: null,
};

const Film = sequelize.define(
  "Film",
  {
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Durée en secondes (max 60)",
      validate: { min: 1, max: 60 },
    },
    // Lien YouTube - validation via API (CdC §4.3)
    youtubeId: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "ID vidéo YouTube (ex: dQw4w9WgXcQ)",
    },
    // Poster : JPG, PNG, GIF max 2 Mo - chemin stocké après upload
    posterPath: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    // Pays du réalisateur au moment de la soumission (filtre galerie CdC §5.1)
    country: {
      type: DataTypes.STRING(3),
      allowNull: false,
      comment: "Code ISO pays réalisateur",
    },
    status: {
      type: DataTypes.ENUM(...FILM_STATUS),
      defaultValue: "PENDING",
      allowNull: false,
    },
    // Motif obligatoire en cas de refus (CdC §3.4)
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Fiche d'identité IA (CdC §4.2)
    aiIdentity: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: defaultAiIdentity,
    },
    // Réalisateur (User REALISATEUR)
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "films",
    underscored: true,
    timestamps: true,
    indexes: [
      { name: "films_status_idx", fields: ["status"] },
      { name: "films_country_idx", fields: ["country"] },
      { name: "films_user_id_idx", fields: ["user_id"] },
      { name: "films_created_at_idx", fields: ["created_at"] },
    ],
  }
);

/**
 * @bref Hooks Sequelize pour contraintes métier
 */

/**
 * @bref Hook beforeValidate : Validations de format (YouTube ID, durée)
 * @param {any} film - Instance Sequelize Film
 * @returns {void}
 */
Film.beforeValidate((film) => {
  /**
   * @bref Valider YouTube ID (11 caractères alphanumériques)
   */
  if (film.youtubeId) {
    const youtubeRegex = /^[a-zA-Z0-9_-]{11}$/;
    if (!youtubeRegex.test(film.youtubeId)) {
      throw new Error("Format YouTube ID invalide (11 caractères alphanumériques requis)");
    }
  }

  /**
   * @bref Valider durée (1-60 secondes)
   */
  if (film.duration !== null && film.duration !== undefined) {
    if (film.duration < 1 || film.duration > 60) {
      throw new Error("La durée doit être entre 1 et 60 secondes");
    }
  }

  /**
   * @bref Normaliser le pays en majuscules
   */
  if (film.country) {
    film.country = film.country.toUpperCase();
  }
});

/**
 * @bref Hook beforeSave : Vérifie que rejectionReason est présent si status = REJECTED (CdC §3.4)
 * @param {any} film - Instance Sequelize Film
 * @returns {Promise<void>}
 */
Film.beforeSave(async (film) => {
  if (film.status === "REJECTED" && !film.rejectionReason) {
    throw new Error("Un motif de refus est obligatoire lorsque le statut est REJECTED");
  }
});

/**
 * @bref Hook beforeUpdate : Vérifie le nombre max de films en SELECTION_OFFICIELLE (50 max - CdC §3.3)
 * @param {any} film - Instance Sequelize Film
 * @returns {Promise<void>}
 */
Film.beforeUpdate(async (film) => {
  if (film.changed("status") && film.status === "SELECTION_OFFICIELLE") {
    const count = await Film.count({
      where: { status: "SELECTION_OFFICIELLE" },
    });

    if (count >= 50) {
      throw new Error("La sélection officielle est complète (50 films maximum)");
    }
  }
});

export default Film;
export { FILM_STATUS, defaultAiIdentity };
