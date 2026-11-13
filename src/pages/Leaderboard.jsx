import { useState, useEffect } from "react";
import axiosInstance from "../../axiosConfig.js";
import { formatTime } from "../utils/helpers.js";
import LoadingSpinner from "../components/LoadingSpinner";
import { CATEGORIES } from "../utils/categories.js";

const TABS = [
  { mode: "daily", label: "📅 Daily Quiz" },
  { mode: "blitz", label: "⚡ Blitz Mode" },
  { mode: "category", label: "🎯 Category Quiz" },
  { mode: "survival", label: "🏃 Survival Mode" },
];

const BLITZ_TIMES = [
  { value: "30", label: "30 seconds" },
  { value: "60", label: "1 minute" },
  { value: "120", label: "2 minutes" },
  { value: "180", label: "3 minutes" },
];

const SORT_LABELS = {
  averageScore: "Average Score",
  bestScore: "Best Score",
  gamesPlayed: "Total Quizzes Taken",
};

const RANK_CLASSES = ["rank-gold", "rank-silver", "rank-bronze"];
const RANK_MEDALS = ["🥇", "🥈", "🥉"];

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("daily");
  const [blitzTime, setBlitzTime] = useState("30");
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].label);
  const [sortBy, setSortBy] = useState("averageScore");

  // The server ranks players; refetch whenever a filter changes.
  useEffect(() => {
    const params = { mode: activeTab, sortBy };
    if (activeTab === "blitz") params.timeLimit = blitzTime;
    if (activeTab === "category") params.category = selectedCategory;

    setLoading(true);
    axiosInstance
      .get("/api/scores/leaderboard", { params })
      .then(({ data }) => {
        setPlayers(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Error fetching leaderboard:", err);
        setError(err.response?.data?.error || "Failed to load leaderboard data");
        setPlayers([]);
      })
      .finally(() => setLoading(false));
  }, [activeTab, blitzTime, selectedCategory, sortBy]);

  const modeDisplayName =
    activeTab === "blitz"
      ? `⚡ Blitz Mode - ${BLITZ_TIMES.find((t) => t.value === blitzTime).label}`
      : activeTab === "category"
      ? `🎯 Category Quiz - ${selectedCategory}`
      : TABS.find((t) => t.mode === activeTab).label;

  // Best score only means something in Survival, where scores aren't capped at 10.
  const sortOptions =
    activeTab === "survival"
      ? ["averageScore", "bestScore", "gamesPlayed"]
      : ["averageScore", "gamesPlayed"];

  return (
    <div className="content-container">
      <div className="quiz-content">
        <h1>Leaderboards</h1>

        <div className="leaderboard-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.mode}
              className={`tab-button ${activeTab === tab.mode ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.mode);
                setSortBy("averageScore");
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="leaderboard-header-compact">
          <div className="header-left">
            <h2>{modeDisplayName}</h2>
            <p className="leaderboard-subtitle">Ranked by {SORT_LABELS[sortBy]}</p>
          </div>

          <div className="header-filters">
            {activeTab === "blitz" && (
              <select
                value={blitzTime}
                onChange={(e) => setBlitzTime(e.target.value)}
                className="text-input compact"
              >
                {BLITZ_TIMES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            )}

            {activeTab === "category" && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-input compact"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.label}>
                    {c.label}
                  </option>
                ))}
              </select>
            )}

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-input compact"
            >
              {sortOptions.map((option) => (
                <option key={option} value={option}>
                  {SORT_LABELS[option]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : players.length === 0 ? (
          <div className="empty-state">
            <p>No users found on the {modeDisplayName} leaderboard.</p>
          </div>
        ) : (
          <div className="leaderboard-grid">
            {players.map((player, index) => {
              const rankClass = RANK_CLASSES[index] || "";
              return (
                <div key={player.id} className={`panel leaderboard-card ${rankClass}`}>
                  <div className={`leaderboard-rank ${rankClass}`}>
                    {RANK_MEDALS[index] || `#${index + 1}`}
                  </div>
                  <div className="leaderboard-content">
                    <h3>{player.username}</h3>
                    <div className="leaderboard-stats">
                      <div className="tile stat-item">
                        <span className="stat-label">Average Score:</span>
                        <span className="stat-value highlight">
                          {activeTab === "survival"
                            ? `${player.averageScore.toFixed(2)} correct`
                            : `${player.averageScore.toFixed(2)}/10`}
                        </span>
                      </div>
                      {activeTab === "survival" && (
                        <div className="tile stat-item">
                          <span className="stat-label">Best Score:</span>
                          <span className="stat-value">{player.bestScore} correct</span>
                        </div>
                      )}
                      <div className="tile stat-item">
                        <span className="stat-label">Total Quizzes:</span>
                        <span className="stat-value">{player.gamesPlayed}</span>
                      </div>
                      <div className="tile stat-item">
                        <span className="stat-label">Avg. Duration:</span>
                        <span className="stat-value">{formatTime(player.averageDuration)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
