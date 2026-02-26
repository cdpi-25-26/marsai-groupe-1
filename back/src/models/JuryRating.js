import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

/**
 * Notation du Jury (CdC §3.3)
 * - Accès à la liste des 50 films finalistes (SELECTION_OFFICIELLE)
 * - Note confidentielle 1 à 10
 * - Commentaires internes (non publics) pour délibération
 */
const JuryRating = sequelize.define(
  "JuryRating",
  {
    filmId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "films", key: "id" },
      onDelete: "CASCADE",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    score: {
      type: DataTypes.ENUM("TRES_BIEN", "BIEN", "BOF", "JAIME_PAS"),
      allowNull: false,
    },
    internalComment: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Commentaire interne (non public) pour délibération",
    },
  },
  {
    tableName: "jury_ratings",
    underscored: true,
    timestamps: true,
    indexes: [
      { name: "jury_ratings_film_user_uq", unique: true, fields: ["film_id", "user_id"] },
    ],
  }
);

export default JuryRating;
