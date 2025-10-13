import { DailyQuestions } from "../models/index.js";

// Helper function to get today's date in Central Time
const getTodayDateCT = () => {
  const today = new Date();
  // Convert to Central Time (America/Chicago)
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(today);
  const year = parts.find((p) => p.type === "year").value;
  const month = parts.find((p) => p.type === "month").value;
  const day = parts.find((p) => p.type === "day").value;
  return `${year}-${month}-${day}`;
};

// Fetch questions from external API
const fetchQuestionsFromAPI = async () => {
  try {
    const response = await fetch(
      "https://the-trivia-api.com/api/questions?limit=10"
    );
    const data = await response.json();
    return Array.isArray(data) ? data : data.value || data;
  } catch (error) {
    console.error("Error fetching questions from API:", error);
    throw error;
  }
};

// Get or create daily questions for a specific date
export const getDailyQuestions = async (req, res) => {
  try {
    const todayDate = getTodayDateCT();

    // Try to find existing questions for today
    let dailyQuestions = await DailyQuestions.findOne({
      where: { date: todayDate },
    });

    // If no questions exist for today, create them
    if (!dailyQuestions) {
      console.log(`No questions found for ${todayDate}, fetching from API...`);
      const questions = await fetchQuestionsFromAPI();

      dailyQuestions = await DailyQuestions.create({
        date: todayDate,
        questions: questions,
      });

      console.log(`Created daily questions for ${todayDate}`);
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
