import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

const FilmComment = sequelize.define(
  "FilmComment",
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "film_comments",
    underscored: true,
    timestamps: true,
    indexes: [
      { name: "film_comments_film_id_idx", fields: ["film_id"] },
      { name: "film_comments_user_id_idx", fields: ["user_id"] },
      { name: "film_comments_created_at_idx", fields: ["created_at"] },
    ],
  }
);

export default FilmComment;

