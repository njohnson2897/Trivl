import { useState, useEffect } from "react";
import axiosInstance from "../../axiosConfig";
import { jwtDecode } from "jwt-decode";
import { formatTime } from "../utils/helpers";
import LoadingSpinner from "../components/LoadingSpinner";

const QuizHistory = () => {
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedQuiz, setExpandedQuiz] = useState(null);

  useEffect(() => {
    const fetchQuizHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;

        const response = await axiosInstance.get(`/api/scores/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setQuizHistory(response.data.scores);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch quiz history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizHistory();
  }, []);

  const filteredHistory = quizHistory.filter((quiz) => {
    if (filter === "all") return true;
    if (
      filter === "daily" ||
      filter === "blitz" ||
      filter === "category" ||
      filter === "survival"
    ) {
      return quiz.quiz_mode === filter;
    }
    return quiz.quiz_difficulty.toLowerCase() === filter.toLowerCase();
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.date_taken) - new Date(a.date_taken);
    }
    if (sortBy === "score") {
      return b.quiz_score - a.quiz_score;
    }
    return 0;
  });

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
        <h1>Quiz History</h1>

        <div className="filter-container">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="settings-dropdown"
          >
            <option value="all">All Quizzes</option>
            <option value="daily">Daily Quiz</option>
            <option value="blitz">Blitz Mode</option>
            <option value="category">Category Quiz</option>
            <option value="survival">Survival Mode</option>
            <option value="challenge">Challenge Quiz</option>
            <option value="easy">Easy Difficulty</option>
            <option value="medium">Medium Difficulty</option>
            <option value="hard">Hard Difficulty</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="settings-dropdown"
          >
            <option value="date">Sort by Date</option>
            <option value="score">Sort by Score</option>
          </select>
        </div>

        <div className="quiz-history-grid">
          {sortedHistory.map((quiz) => (
            <div
              key={quiz.id}
              className={`quiz-history-card ${
                expandedQuiz === quiz.id ? "expanded" : ""
              }`}
            >
              <div className="quiz-history-header">
                <div className="quiz-header-content">
                  <h3>
                    {new Date(quiz.date_taken).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </h3>
                  <p className="quiz-time">
                    {new Date(quiz.date_taken).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="quiz-badges">
                  <span className={`quiz-mode-badge ${quiz.quiz_mode}`}>
                    {quiz.quiz_mode === "blitz"
                      ? "⚡ Blitz"
                      : quiz.quiz_mode === "category"
                      ? "🎯 Category"
                      : quiz.quiz_mode === "survival"
                      ? "🏃 Survival"
                      : quiz.quiz_mode === "challenge"
                      ? "🎯 Challenge"
                      : "📅 Daily"}
                  </span>
                  <span
                    className={`difficulty-badge ${quiz.quiz_difficulty.toLowerCase()}`}
                  >
                    {quiz.quiz_difficulty}
                  </span>
                </div>
              </div>

              <div className="quiz-history-summary">
                <div className="summary-stat">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-content">
                    <span className="stat-label">Score</span>
                    <span className="stat-value">
                      {quiz.quiz_mode === "survival"
                        ? quiz.quiz_score
                        : `${quiz.quiz_score}/10`}
                    </span>
                  </div>
                </div>
                <div className="summary-stat">
                  <div className="stat-icon">⏱️</div>
                  <div className="stat-content">
                    <span className="stat-label">Time</span>
                    <span className="stat-value">
                      {formatTime(quiz.time_taken)}
                    </span>
                  </div>
                </div>
                {quiz.quiz_mode === "category" && quiz.category_name && (
                  <div className="summary-stat">
                    <div className="stat-icon">📚</div>
                    <div className="stat-content">
                      <span className="stat-label">Category</span>
                      <span className="stat-value">{quiz.category_name}</span>
                    </div>
                  </div>
                )}
              </div>

              {expandedQuiz === quiz.id && (
                <div className="quiz-details-expanded">
                  <div className="details-section">
                    <h4>Quiz Information</h4>
                    <div className="details-grid">
                      <div className="detail-row">
                        <span className="detail-label">Mode:</span>
                        <span className="detail-value">
                          {quiz.quiz_mode === "blitz"
                            ? "Blitz Mode"
                            : quiz.quiz_mode === "category"
                            ? "Category Quiz"
                            : quiz.quiz_mode === "survival"
                            ? "Survival Mode"
                            : quiz.quiz_mode === "challenge"
                            ? "Challenge Quiz"
                            : "Daily Quiz"}
                        </span>
                      </div>
                      {quiz.quiz_mode === "challenge" &&
                        quiz.opponent_username && (
                          <>
                            <div className="detail-row">
                              <span className="detail-label">Opponent:</span>
                              <span className="detail-value">
                                {quiz.opponent_username}
                              </span>
                            </div>
                            {quiz.won_challenge !== null && (
                              <div className="detail-row">
                                <span className="detail-label">Result:</span>
                                <span className="detail-value">
                                  {quiz.won_challenge ? "🏆 Won" : "❌ Lost"}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      <div className="detail-row">
                        <span className="detail-label">Difficulty:</span>
                        <span className="detail-value">
                          {quiz.quiz_difficulty}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Questions:</span>
                        <span className="detail-value">
                          {quiz.quiz_mode === "survival"
                            ? quiz.quiz_score + 1
                            : 10}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Accuracy:</span>
                        <span className="detail-value">
                          {quiz.quiz_mode === "survival"
                            ? `${Math.round(
                                (quiz.quiz_score / (quiz.quiz_score + 1)) * 100
                              )}%`
                            : `${quiz.quiz_score * 10}%`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {quiz.categories && quiz.categories.length > 0 && (
                    <div className="details-section">
                      <h4>Categories Covered</h4>
                      <div className="categories-list">
                        {[...new Set(quiz.categories)].map((cat, idx) => (
                          <span key={idx} className="category-tag">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="details-section">
                    <h4>Performance Metrics</h4>
                    <div className="performance-bars">
                      <div className="performance-item">
                        <div className="performance-label">
                          <span>Score</span>
                          <span className="performance-value">
                            {quiz.quiz_mode === "survival"
                              ? `${quiz.quiz_score} correct`
                              : `${quiz.quiz_score}/10`}
                          </span>
                        </div>
                        <div className="performance-bar">
                          <div
                            className="performance-fill"
                            style={{
                              width:
                                quiz.quiz_mode === "survival"
                                  ? `${Math.min(
                                      (quiz.quiz_score / 20) * 100,
                                      100
                                    )}%`
                                  : `${quiz.quiz_score * 10}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                className="view-details-btn"
                onClick={() =>
                  setExpandedQuiz(expandedQuiz === quiz.id ? null : quiz.id)
                }
              >
                {expandedQuiz === quiz.id ? "▲ Hide Details" : "▼ View Details"}
              </button>
            </div>
          ))}
        </div>

        {sortedHistory.length === 0 && (
          <div className="empty-state">
            <p>
              You haven&apos;t taken any quizzes yet. Start playing to see your
              quiz history here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizHistory;
