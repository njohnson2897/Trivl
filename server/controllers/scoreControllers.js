import { QueryTypes } from "sequelize";
import sequelize from "../config/connection.js";
import Score from "../models/Score.js";
import User from "../models/User.js";

const LEADERBOARD_MODES = ["daily", "blitz", "category", "survival"];
const LEADERBOARD_SORTS = ["averageScore", "bestScore", "gamesPlayed"];

// GET /api/scores/leaderboard?mode=blitz&timeLimit=30&sortBy=averageScore
// Top 100 players for one mode, ranked by the database.
export const getLeaderboard = async (req, res) => {
  const { mode, timeLimit = null, category = null } = req.query;
  // sortBy goes straight into the SQL below, so only allow known column names.
  const sortBy = LEADERBOARD_SORTS.includes(req.query.sortBy) ? req.query.sortBy : "averageScore";

  if (!LEADERBOARD_MODES.includes(mode)) {
    return res.status(400).json({ error: "Unknown quiz mode" });
  }

  try {
    const players = await sequelize.query(
      `SELECT u.id, u.username,
         CAST(ROUND(AVG(s.quiz_score), 2) AS float) AS "averageScore",
         MAX(s.quiz_score) AS "bestScore",
         CAST(COUNT(*) AS int) AS "gamesPlayed",
         CAST(COALESCE(ROUND(AVG(s.time_taken)), 0) AS int) AS "averageDuration"
       FROM score s
       JOIN "user" u ON u.id = s.user_id
       WHERE s.quiz_mode = :mode
         AND (:timeLimit IS NULL OR s.quiz_difficulty = :timeLimit)
         AND (:category IS NULL OR s.category_name = :category)
       GROUP BY u.id
       ORDER BY "${sortBy}" DESC
       LIMIT 100`,
      { replacements: { mode, timeLimit, category }, type: QueryTypes.SELECT }
    );
    res.json(players);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Error fetching leaderboard" });
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
    });

    res.status(200).json({ scores });

  } catch (error) {
    console.error("Error fetching user scores:", error);
    res.status(500).json({ error: "Error fetching user scores" });
  }
};
