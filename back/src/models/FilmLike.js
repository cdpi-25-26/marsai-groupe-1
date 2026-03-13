import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

const FilmLike = sequelize.define(
  "FilmLike",
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
  },
  {
    tableName: "film_likes",
    underscored: true,
    timestamps: true,
    indexes: [
      { name: "film_likes_film_id_idx", fields: ["film_id"] },
      { name: "film_likes_user_id_idx", fields: ["user_id"] },
      {
        name: "film_likes_film_user_unique",
        unique: true,
        fields: ["film_id", "user_id"],
      },
    ],
  }
);

export default FilmLike;

