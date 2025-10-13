import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

class DailyQuestions extends Model {}

DailyQuestions.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: DataTypes.DATEONLY, // Stores just the date (YYYY-MM-DD)
      allowNull: false,
      unique: true,
    },
    questions: {
      type: DataTypes.JSON, // Array of 10 question objects
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: "daily_questions",
  }
);

export default DailyQuestions;
