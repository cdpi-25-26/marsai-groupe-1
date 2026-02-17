import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

/**
 * Module Événement Physique (CdC §11 - Bonus)
 * Agenda 2 jours : projections, conférences, workshops.
 * Jauge participants, réservations. Clôture 13 juin à Marseille.
 */
const Event = sequelize.define(
  "Event",
  {
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("workshop", "conference", "projection", "closing"),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    maxParticipants: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Jauge max (workshops/conférences)",
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "events",
    underscored: true,
    timestamps: true,
  }
);

export default Event;
