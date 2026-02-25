import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

/**
 * @bref Modèle Follow - Relation d'abonnement entre utilisateurs
 * Un utilisateur (follower) peut suivre un autre utilisateur (following).
 */
const Follow = sequelize.define(
  "Follow",
  {
    followerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    followingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "follows",
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["follower_id", "following_id"],
        name: "follows_unique_pair_idx",
      },
      { fields: ["follower_id"], name: "follows_follower_idx" },
      { fields: ["following_id"], name: "follows_following_idx" },
    ],
  }
);

export default Follow;
