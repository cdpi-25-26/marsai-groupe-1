import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

/**
 * Verrouillage temporel de la soumission (CdC §4.1)
 * Période fixe de 2 mois - fermeture automatique côté serveur.
 */
const SubmissionConfig = sequelize.define(
  "SubmissionConfig",
  {
    key: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    value: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "submission_config",
    underscored: true,
    timestamps: true,
  }
);

export default SubmissionConfig;
