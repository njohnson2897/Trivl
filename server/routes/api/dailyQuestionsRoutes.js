import express from "express";
import {
  getDailyQuestions,
  getDailyQuestionsByDate,
} from "../../controllers/dailyQuestionsController.js";

const router = express.Router();

// GET /api/daily-questions - Get today's daily questions (creates if not exists)
router.get("/", getDailyQuestions);

// GET /api/daily-questions/:date - Get daily questions for a specific date
router.get("/:date", getDailyQuestionsByDate);

export default router;
