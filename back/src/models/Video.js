import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

/**
 * @bref Modèle Video (legacy) — conservé pour compatibilité
 */
const Video = sequelize.define(
  "Video",
  {
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "videos_title_uq",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "videos",
    underscored: true,
    timestamps: true,
    indexes: [
      { name: "videos_title_uq", unique: true, fields: ["title"] },
    ],
  }
);

export default Video;
