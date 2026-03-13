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
      type: DataTypes.ENUM("screening", "workshop", "masterclass", "concert", "party", "conference", "projection", "closing"),
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
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    maxParticipants: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.ENUM("upcoming", "ongoing", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "upcoming",
    },
  },
  {
    tableName: "events",
    underscored: true,
    timestamps: true,
  }
);

export default Event;
