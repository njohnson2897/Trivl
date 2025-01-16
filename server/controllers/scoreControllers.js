import Score from "../models/Score.js";
import User from "../models/User.js";

export const logScore = async (req, res) => {
  try {
    const { userId, quiz_score, quiz_difficulty, categories, is_niche, time_taken  } = req.body;

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
    });

    res.status(201).json(newScore);
  } catch (error) {
    console.error("Error logging score:", error);
    res.status(500).json({ error: "Error logging score" });
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
