import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

class Challenge extends Model {}

Challenge.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    challengerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "user",
        key: "id",
      },
    },
    challengedId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "user",
        key: "id",
      },
    },
    questions: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "in_progress", "completed"),
      defaultValue: "pending",
    },
    challengerScore: {
      type: DataTypes.INTEGER,
      defaultValue: null,
    },
    challengedScore: {
      type: DataTypes.INTEGER,
      defaultValue: null,
    },
    challengerTimeTaken: {
      type: DataTypes.INTEGER,
      defaultValue: null,
    },
    challengedTimeTaken: {
      type: DataTypes.INTEGER,
      defaultValue: null,
    },
    winnerId: {
      type: DataTypes.INTEGER,
      defaultValue: null,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    completedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: "challenge",
  }
);

export default Challenge;
