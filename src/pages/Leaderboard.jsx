import { useState, useEffect } from "react";
import axiosInstance from "../../axiosConfig.js";
import { formatTime } from "../utils/helpers.js";
import LoadingSpinner from "../components/LoadingSpinner";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("lifetimeScore");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/users");

      // Process users data to calculate scores
      const processedUsers = response.data.map((user) => {
        const scores = user.quizScores || [];
        const lifetimeScore = scores.reduce(
          (sum, score) => sum + score.quiz_score,
          0
        );
        const averageScore =
          scores.length > 0
            ? (
                scores.reduce((sum, score) => sum + score.quiz_score, 0) /
                scores.length
              ).toFixed(1)
            : 0;

        // Calculate average duration
        const totalDuration = scores.reduce(
          (sum, score) => sum + (score.quiz_duration || 0),
          0
        );
        const averageDuration =
          scores.length > 0 ? totalDuration / scores.length : 0;

        return {
          id: user.id,
          username: user.username,
          lifetimeScore,
          averageScore: parseFloat(averageScore),
          gamesPlayed: scores.length,
          averageDuration,
        };
      });

      setUsers(processedUsers);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.error || "Failed to load leaderboard data");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Sort users and get top 100 based on current filter
  const topUsers = [...users]
    .sort((a, b) => {
      // Special handling for duration - faster times should rank higher
      if (filter === "averageDuration") {
        return a[filter] - b[filter]; // Ascending order for duration
      }
      return b[filter] - a[filter]; // Descending order for other metrics
    })
    .slice(0, 100);

  if (loading) {
    return (
      <div className="content-container">
        <div className="quiz-content">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-container">
        <div className="quiz-content">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="quiz-content">
        <h2>Leaderboard</h2>
        <div className="filter-container">
          <label htmlFor="filter">Sort By:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="lifetimeScore">Lifetime Score</option>
            <option value="averageScore">Average Score</option>
            <option value="gamesPlayed">Games Played</option>
            <option value="averageDuration">Average Duration</option>
          </select>
        </div>
        <div className="leaderboard-grid">
          {topUsers.map((user, index) => (
            <div
              key={user.id}
              className="leaderboard-card"
              style={{ transition: "transform 0.2s" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.02)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <h3>
                #{index + 1} {user.username}
              </h3>
              <p>Lifetime Score: {user.lifetimeScore.toLocaleString()}</p>
              <p>Average Score: {user.averageScore}%</p>
              <p>Games Played: {user.gamesPlayed}</p>
              <p>Average Duration: {formatTime(user.averageDuration)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
