import Score from "../models/Score.js";
import User from "../models/User.js";
import { checkAchievements } from "./achievementControllers.js";

export const logScore = async (req, res) => {
  try {
    const {
      quiz_score,
      quiz_difficulty,
      categories,
      is_niche,
      time_taken,
      quiz_mode = "daily", // Default to 'daily' for backward compatibility
      category_name = null, // Category name for category quizzes
      challenge_id = null,
      opponent_id = null,
      opponent_username = null,
      won_challenge = null,
    } = req.body;

    // Get userId from authenticated user (from auth middleware)
    const userId = req.user.id;

    console.log("Logging score for userId:", userId, "quiz_mode:", quiz_mode);

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create a new score entry
    const newScore = await Score.create({
      user_id: userId,
      quiz_score,
      quiz_difficulty, // Store aggregated quiz difficulty
      categories,
      is_niche,
      time_taken,
      quiz_mode,
      category_name, // Store category name for category quizzes
      challenge_id, // For challenge quizzes
      opponent_id, // Opponent's user ID
      opponent_username, // Opponent's username
      won_challenge, // Whether the user won the challenge
    });

    // Update user's lastQuizDate to current time (ONLY for daily quiz mode)
    // Other modes don't have cooldowns, so they shouldn't update lastQuizDate
    if (quiz_mode === "daily") {
      await user.update({
        lastQuizDate: new Date(),
      });
    }

    // Check for new achievements
    await checkAchievements(userId);

    res.status(201).json(newScore);
  } catch (error) {
    console.error("Error logging score:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({ error: `Error logging score: ${error.message}` });
  }
};

// GET scores by user ID
export const getScoresByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get all scores for the user, ordered by date (most recent first)
    const scores = await Score.findAll({
      where: { user_id: userId },
      order: [["date_taken", "DESC"]],
      //   include: [
      //     {
      //       model: User,
      //       attributes: "username", // Include only specific user fields
      //     },
      //   ],
    });

    // Calculate some statistics
    // const totalScores = scores.length;
    // const averageScore = totalScores > 0
    //     ? (scores.reduce((sum, score) => sum + score.quiz_score, 0) / totalScores).toFixed(1)
    //     : 0;
    // const highestScore = totalScores > 0
    //     ? Math.max(...scores.map(score => score.quiz_score))
    //     : 0;

    res.status(200).json({
      scores,
      // stats: {
      //     totalQuizzesTaken: totalScores,
      //     averageScore,
      //     highestScore
      // }
    });
  } catch (error) {
    console.error("Error fetching user scores:", error);
    res.status(500).json({ error: "Error fetching user scores" });
  }
};
