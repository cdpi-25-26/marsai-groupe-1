import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

const FilmSubtitle = sequelize.define(
  "FilmSubtitle",
  {
    filmId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "films", key: "id" },
      onDelete: "CASCADE",
    },
    language: {
      type: DataTypes.STRING(5),
      allowNull: false,
      comment: "Code langue ISO 639-1 (fr, en, es...)",
    },
    format: {
      type: DataTypes.ENUM("srt", "vtt"),
      allowNull: false,
    },
    s3Key: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: "Chemin S3 ex: grp1/subtitles/uuid_fr.srt",
    },
    s3Url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: "URL complète S3",
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Nom original du fichier",
    },
  },
  {
    tableName: "film_subtitles",
    underscored: true,
    timestamps: true,
    indexes: [
      { name: "film_subtitles_film_id_idx", fields: ["film_id"] },
      { name: "film_subtitles_lang_idx", fields: ["language"] },
    ],
  }
);

export default FilmSubtitle;
