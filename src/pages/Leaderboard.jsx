import { useState, useEffect } from "react";
import axiosInstance from "../../axiosConfig.js";
import { formatTime } from "../utils/helpers.js";
import LoadingSpinner from "../components/LoadingSpinner";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("daily");
  const [blitzTime, setBlitzTime] = useState("30");
  const [selectedCategory, setSelectedCategory] = useState("Arts & Literature");
  const [sortBy, setSortBy] = useState("averageScore");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/users");

      // Process users data to calculate scores
      const processedUsers = response.data.map((user) => {
        const allScores = user.Scores || [];

        // Calculate stats for each mode
        const modeStats = {};
        const modes = ["daily", "blitz", "category", "survival"];

        modes.forEach((mode) => {
          const scores = allScores.filter((s) => s.quiz_mode === mode);

          const averageScore =
            scores.length > 0
              ? parseFloat(
                  (
                    scores.reduce((sum, score) => sum + score.quiz_score, 0) /
                    scores.length
                  ).toFixed(2)
                )
              : 0;
          const totalDuration = scores.reduce(
            (sum, score) => sum + (score.time_taken || 0),
            0
          );
          const averageDuration =
            scores.length > 0 ? Math.round(totalDuration / scores.length) : 0;
          const bestScore =
            scores.length > 0
              ? Math.max(...scores.map((s) => s.quiz_score))
              : 0;

          modeStats[mode] = {
            averageScore,
            gamesPlayed: scores.length,
            averageDuration,
            bestScore,
          };

          // For blitz mode, also calculate per-time-limit stats
          if (mode === "blitz") {
            const timeLimits = ["30", "60", "120", "180"];
            modeStats.blitzByTime = {};

            timeLimits.forEach((timeLimit) => {
              const timeScores = scores.filter(
                (s) => s.quiz_difficulty === timeLimit
              );

              modeStats.blitzByTime[timeLimit] = {
                averageScore:
                  timeScores.length > 0
                    ? parseFloat(
                        (
                          timeScores.reduce(
                            (sum, score) => sum + score.quiz_score,
                            0
                          ) / timeScores.length
                        ).toFixed(2)
                      )
                    : 0,
                gamesPlayed: timeScores.length,
                averageDuration:
                  timeScores.length > 0
                    ? Math.round(
                        timeScores.reduce(
                          (sum, score) => sum + (score.time_taken || 0),
                          0
                        ) / timeScores.length
                      )
                    : 0,
                bestScore:
                  timeScores.length > 0
                    ? Math.max(...timeScores.map((s) => s.quiz_score))
                    : 0,
              };
            });
          }

          // For category mode, also calculate per-category stats
          if (mode === "category") {
            const categories = [
              "Arts & Literature",
              "Film & TV",
              "Food & Drink",
              "General Knowledge",
              "Geography",
              "History",
              "Music",
              "Science",
              "Society & Culture",
              "Sport & Leisure",
            ];
            modeStats.categoryByName = {};

            categories.forEach((category) => {
              // Filter scores where category_name matches OR where ALL categories in the array match
              const categoryScores = scores.filter((s) => {
                // Check if category_name matches (for new quizzes)
                if (s.category_name === category) return true;

                // Fallback: Check if ALL categories in the array are the same and match this category (for old quizzes)
                if (
                  s.categories &&
                  Array.isArray(s.categories) &&
                  s.categories.length > 0
                ) {
                  // Check if every category in the array is the same as the target category
                  return s.categories.every((cat) => cat === category);
                }

                return false;
              });

              modeStats.categoryByName[category] = {
                averageScore:
                  categoryScores.length > 0
                    ? parseFloat(
                        (
                          categoryScores.reduce(
                            (sum, score) => sum + score.quiz_score,
                            0
                          ) / categoryScores.length
                        ).toFixed(2)
                      )
                    : 0,
                gamesPlayed: categoryScores.length,
                averageDuration:
                  categoryScores.length > 0
                    ? Math.round(
                        categoryScores.reduce(
                          (sum, score) => sum + (score.time_taken || 0),
                          0
                        ) / categoryScores.length
                      )
                    : 0,
                bestScore:
                  categoryScores.length > 0
                    ? Math.max(...categoryScores.map((s) => s.quiz_score))
                    : 0,
              };
            });
          }
        });

        return {
          id: user.id,
          username: user.username,
          modeStats,
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

  // Get current stats based on active tab and filters
  const getCurrentStats = (user) => {
    if (activeTab === "blitz") {
      return user.modeStats.blitzByTime?.[blitzTime] || {};
    }
    if (activeTab === "category") {
      return user.modeStats.categoryByName?.[selectedCategory] || {};
    }
    return user.modeStats[activeTab] || {};
  };

  // Filter users based on mode (only show users who have played that mode)
  const filteredUsers = users.filter((user) => {
    const stats = getCurrentStats(user);
    return stats && stats.gamesPlayed > 0;
  });

  // Sort users and get top 100 based on current sort criteria
  const topUsers = [...filteredUsers]
    .sort((a, b) => {
      const aValue = getCurrentStats(a)?.[sortBy] || 0;
      const bValue = getCurrentStats(b)?.[sortBy] || 0;

      return bValue - aValue; // Descending order for all metrics
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

  // Get display info
  const getModeDisplayName = () => {
    switch (activeTab) {
      case "daily":
        return "📅 Daily Quiz";
      case "blitz": {
        const timeLabel =
          blitzTime === "30"
            ? "30 seconds"
            : blitzTime === "60"
            ? "1 minute"
            : blitzTime === "120"
            ? "2 minutes"
            : "3 minutes";
        return `⚡ Blitz Mode - ${timeLabel}`;
      }
      case "category":
        return `🎯 Category Quiz - ${selectedCategory}`;
      case "survival":
        return "🏃 Survival Mode";
      default:
        return "";
    }
  };

  const getSortDisplayName = () => {
    switch (sortBy) {
      case "averageScore":
        return "Average Score";
      case "bestScore":
        return "Best Score";
      case "gamesPlayed":
        return "Total Quizzes Taken";
      default:
        return sortBy;
    }
  };

  // Get available sort options based on active tab
  const getSortOptions = () => {
    if (activeTab === "survival") {
      return [
        { value: "averageScore", label: "Average Score" },
        { value: "bestScore", label: "Best Score" },
        { value: "gamesPlayed", label: "Total Quizzes Taken" },
      ];
    }
    return [
      { value: "averageScore", label: "Average Score" },
      { value: "gamesPlayed", label: "Total Quizzes Taken" },
    ];
  };

  return (
    <div className="content-container">
      <div className="quiz-content">
        <h1>Leaderboards</h1>

        {/* Mode Tabs */}
        <div className="leaderboard-tabs">
          <button
            className={`tab-button ${activeTab === "daily" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("daily");
              setSortBy("averageScore");
            }}
          >
            📅 Daily Quiz
          </button>
          <button
            className={`tab-button ${activeTab === "blitz" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("blitz");
              setSortBy("averageScore");
            }}
          >
            ⚡ Blitz Mode
          </button>
          <button
            className={`tab-button ${activeTab === "category" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("category");
              setSortBy("averageScore");
            }}
          >
            🎯 Category Quiz
          </button>
          <button
            className={`tab-button ${activeTab === "survival" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("survival");
              setSortBy("averageScore");
            }}
          >
            🏃 Survival Mode
          </button>
        </div>

        {/* Compact Header with Filters */}
        <div className="leaderboard-header-compact">
          <div className="header-left">
            <h2>{getModeDisplayName()}</h2>
            <p className="leaderboard-subtitle">
              Ranked by {getSortDisplayName()}
            </p>
          </div>

          <div className="header-filters">
            {activeTab === "blitz" && (
              <select
                value={blitzTime}
                onChange={(e) => setBlitzTime(e.target.value)}
                className="settings-dropdown compact"
              >
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="120">2 minutes</option>
                <option value="180">3 minutes</option>
              </select>
            )}

            {activeTab === "category" && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="settings-dropdown compact"
              >
                <option value="Arts & Literature">Arts & Literature</option>
                <option value="Film & TV">Film & TV</option>
                <option value="Food & Drink">Food & Drink</option>
                <option value="General Knowledge">General Knowledge</option>
                <option value="Geography">Geography</option>
                <option value="History">History</option>
                <option value="Music">Music</option>
                <option value="Science">Science</option>
                <option value="Society & Culture">Society & Culture</option>
                <option value="Sport & Leisure">Sport & Leisure</option>
              </select>
            )}

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="settings-dropdown compact"
            >
              {getSortOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="leaderboard-grid">
          {topUsers.map((user, index) => {
            const stats = getCurrentStats(user);
            const rankClass =
              index === 0
                ? "rank-gold"
                : index === 1
                ? "rank-silver"
                : index === 2
                ? "rank-bronze"
                : "";

            return (
              <div key={user.id} className={`leaderboard-card ${rankClass}`}>
                <div className={`leaderboard-rank ${rankClass}`}>
                  {index === 0
                    ? "🥇"
                    : index === 1
                    ? "🥈"
                    : index === 2
                    ? "🥉"
                    : `#${index + 1}`}
                </div>
                <div className="leaderboard-content">
                  <h3>{user.username}</h3>
                  <div className="leaderboard-stats">
                    <div className="stat-item">
                      <span className="stat-label">Average Score:</span>
                      <span className="stat-value highlight">
                        {activeTab === "survival"
                          ? `${stats.averageScore.toFixed(2)} correct`
                          : `${stats.averageScore.toFixed(2)}/10`}
                      </span>
                    </div>
                    {activeTab === "survival" && (
                      <div className="stat-item">
                        <span className="stat-label">Best Score:</span>
                        <span className="stat-value">
                          {stats.bestScore} correct
                        </span>
                      </div>
                    )}
                    <div className="stat-item">
                      <span className="stat-label">Total Quizzes:</span>
                      <span className="stat-value">{stats.gamesPlayed}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Avg. Duration:</span>
                      <span className="stat-value">
                        {formatTime(stats.averageDuration)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {topUsers.length === 0 && (
          <div className="empty-state">
            <p>No users found on the {getModeDisplayName()} leaderboard.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
