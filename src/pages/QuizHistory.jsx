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
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
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
            <div key={quiz.id} className="quiz-history-card">
              <div className="quiz-history-header">
                <h3>
                  Quiz on {new Date(quiz.date_taken).toLocaleDateString()}
                </h3>
                <span
                  className={`difficulty-badge ${quiz.quiz_difficulty.toLowerCase()}`}
                >
                  {quiz.quiz_difficulty}
                </span>
              </div>

              <div className="quiz-history-details">
                <div className="detail-item">
                  <span className="detail-label">Score:</span>
                  <span className="detail-value">{quiz.quiz_score}/10</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Time:</span>
                  <span className="detail-value">
                    {formatTime(quiz.time_taken)}
                  </span>
                </div>
              </div>

              <button className="view-details-btn">View Details</button>
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
