import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

// One row per quiz played. The server keeps the questions (with answers)
// and grades every answer, so the browser never sees a correct answer early.
class QuizSession extends Model {}

QuizSession.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // random, so sessions can't be guessed
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // null for logged-out players
      references: { model: "user", key: "id" },
      onDelete: "CASCADE",
    },
    mode: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["daily", "blitz", "category", "survival", "zen", "challenge"]],
      },
    },
    settings: {
      type: DataTypes.JSON, // e.g. { timeLimit: 60 } or { category: "music" }
      allowNull: false,
      defaultValue: {},
    },
    daily_date: {
      type: DataTypes.STRING, // YYYY-MM-DD in Central Time, daily quizzes only
      allowNull: true,
    },
    questions: {
      type: DataTypes.JSON, // full Trivia API questions, including answers
      allowNull: false,
    },
    answers: {
      type: DataTypes.JSON, // [{ answer, correct }], one per question answered
      allowNull: false,
      defaultValue: [],
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    question_started_at: {
      type: DataTypes.DATE, // when the current question was sent (Survival timer)
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    finished_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    time_taken: {
      type: DataTypes.INTEGER, // seconds
      allowNull: true,
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: "quiz_session",
  }
);

export default QuizSession;