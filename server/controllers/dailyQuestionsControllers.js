import { DailyQuestions } from "../models/index.js";
import { toDateCT } from "../utils/dates.js";
import { fetchTriviaQuestions } from "../utils/trivia.js";

// Get or create daily questions for a specific date
export const getDailyQuestions = async (req, res) => {
  try {
    const todayDate = toDateCT();

    // Try to find existing questions for today
    let dailyQuestions = await DailyQuestions.findOne({
      where: { date: todayDate },
    });

    // If no questions exist for today, create them
    if (!dailyQuestions) {
      const questions = await fetchTriviaQuestions();

      dailyQuestions = await DailyQuestions.create({
        date: todayDate,
        questions: questions,
      });
    }

    res.status(200).json({
      date: dailyQuestions.date,
      questions: dailyQuestions.questions,
    });
  } catch (error) {
    console.error("Error getting daily questions:", error);
    res.status(500).json({ error: "Failed to get daily questions" });
  }
};

// Get daily questions for a specific date (optional, for historical quizzes)
export const getDailyQuestionsByDate = async (req, res) => {
  try {
    const { date } = req.params;

    const dailyQuestions = await DailyQuestions.findOne({
      where: { date },
    });

    if (!dailyQuestions) {
      return res
        .status(404)
        .json({ error: "No questions found for this date" });
    }

    res.status(200).json({
      date: dailyQuestions.date,
      questions: dailyQuestions.questions,
    });
  } catch (error) {
    console.error("Error getting daily questions by date:", error);
    res.status(500).json({ error: "Failed to get daily questions" });
  }
};
