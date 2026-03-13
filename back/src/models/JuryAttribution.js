import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

const JuryAttribution = sequelize.define(
  "JuryAttribution",
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
      comment: "Juré assigné (role: JURY)",
    },
    mode: {
      type: DataTypes.ENUM("AUTO", "MANUAL"),
      allowNull: false,
      defaultValue: "MANUAL",
    },
  },
  {
    tableName: "jury_attributions",
    underscored: true,
    timestamps: true,
    indexes: [
      // Un film ne peut être attribué qu'une seule fois au même juré
      { name: "jury_attributions_film_user_uq", unique: true, fields: ["film_id", "user_id"] },
    ],
  }
);

export default JuryAttribution;
