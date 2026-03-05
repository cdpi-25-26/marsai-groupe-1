
import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

const Category = sequelize.define(
  "Category",
  {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "categories",
    underscored: true,
    timestamps: true,
  }
);

export default Category;
