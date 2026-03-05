import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

const Submission = sequelize.define("Submission", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  director: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  aiTools: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const value = this.getDataValue("aiTools");
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue("aiTools", JSON.stringify(value));
    },
  },
  videoPath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  thumbnailPath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Submission;
