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
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="quiz-content">
        <h1>Leaderboard</h1>

        <div className="filter-container">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="settings-dropdown"
          >
            <option value="lifetimeScore">Lifetime Score</option>
            <option value="averageScore">Average Score</option>
            <option value="gamesPlayed">Games Played</option>
            <option value="averageDuration">Average Duration</option>
          </select>
        </div>

        <div className="leaderboard-grid">
          {topUsers.map((user, index) => (
            <div key={user.id} className="leaderboard-card">
              <div className="leaderboard-rank">#{index + 1}</div>
              <div className="leaderboard-content">
                <h3>{user.username}</h3>
                <div className="leaderboard-stats">
                  <div className="stat-item">
                    <span className="stat-label">Lifetime Score:</span>
                    <span className="stat-value">
                      {user.lifetimeScore.toLocaleString()}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Average Score:</span>
                    <span className="stat-value">{user.averageScore}/10</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Games Played:</span>
                    <span className="stat-value">{user.gamesPlayed}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Avg. Duration:</span>
                    <span className="stat-value">
                      {formatTime(user.averageDuration)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {topUsers.length === 0 && (
          <div className="empty-state">
            <p>No users found on the leaderboard.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
