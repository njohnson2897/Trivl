import { useEffect, useState } from "react";
import axiosInstance from '../../axiosConfig.js';
import { jwtDecode } from "jwt-decode";

export default function QuizHistory() {
  const [quizHistory, setQuizHistory] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizHistory = async () => {
      try {
        // Fetch quiz scores using the existing getScores endpoint
        const token = localStorage.getItem("token");
        const decodedToken = jwtDecode(token)
        const userId = decodedToken.id
        const response = await axiosInstance.get(`/api/scores/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setQuizHistory(response.data.scores); // Adjust based on the structure of your response
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

  if (loading) {
    return <p>Loading your quiz history...</p>;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  if (quizHistory.length === 0) {
    return <p>You haven't taken any quizzes yet. Start playing to see your quiz history here!</p>;
  }

  return (
    <div className="content-container">
      <div className="quiz-content">
        <h1 className="mb-4">Your Quiz History</h1>
        <div className="quiz-history-grid">
          {quizHistory.map((quiz) => (
            <div key={quiz.id} className="quiz-history-card">
              <p><strong>Date:</strong> {new Date(quiz.date_taken).toLocaleDateString()}</p>
              <p><strong>Score:</strong> {quiz.quiz_score}</p>
              <p><strong>Time Taken:</strong> {quiz.time_taken}</p>
              <p><strong>Difficulty:</strong> {quiz.quiz_difficulty}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
