import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

class Score extends Model {}

Score.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    quiz_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 10,
      },
    },
    quiz_difficulty: {
      type: DataTypes.STRING, // Stores 'easy', 'medium', or 'hard'
      allowNull: false,
    },
    categories: {
      type: DataTypes.JSON, // Stores an array of categories (e.g., ['science', 'math'])
      allowNull: true,
    },
    is_niche: {
      type: DataTypes.JSON, // Stores an array of boolean values
      allowNull: true,
    },
    time_taken: {
      type: DataTypes.INTEGER, // Store duration in seconds
      allowNull: false,
    },
    quiz_mode: {
      type: DataTypes.STRING, // Stores 'daily', 'blitz', or 'category'
      allowNull: false,
      defaultValue: "daily",
      validate: {
        isIn: [["daily", "blitz", "category"]],
      },
    },
    category_name: {
      type: DataTypes.STRING, // Stores the category name for category quizzes (e.g., 'Music', 'Film & TV')
      allowNull: true,
    },
    date_taken: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "user",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: "score",
  }
);

export default Score;
