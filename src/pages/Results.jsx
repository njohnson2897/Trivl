import { useEffect, useState } from "react";
import { formatTime } from "../utils/helpers";
import { Link } from "react-router-dom";
import axiosInstance from "../../axiosConfig.js";
import { jwtDecode } from "jwt-decode";

// Category options for display names
const categoryOptions = [
  { value: "film_and_tv", label: "Film & TV" },
  { value: "music", label: "Music" },
  { value: "food_and_drink", label: "Food & Drink" },
  { value: "geography", label: "Geography" },
  { value: "history", label: "History" },
  { value: "science", label: "Science" },
  { value: "sport_and_leisure", label: "Sport & Leisure" },
  { value: "general_knowledge", label: "General Knowledge" },
];

export default function Results() {
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [timeTaken, setTimeTaken] = useState(0);
  const [quizMode, setQuizMode] = useState("daily");
  const [quizCategory, setQuizCategory] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasQuizData, setHasQuizData] = useState(false);
  const [challengeData, setChallengeData] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) {
      const decodedToken = jwtDecode(token);
      setUserId(decodedToken.id);
    }

    const loadedQuestions =
      JSON.parse(localStorage.getItem("triviaQuestions")) || [];

    if (loadedQuestions.length > 0) {
      setQuestions(loadedQuestions);
      setHasQuizData(true);

      // Get quiz mode once
      const storedQuizMode = localStorage.getItem("quizMode");

      // For survival mode, total questions is the same as the number answered
      if (storedQuizMode === "survival") {
        setTotalQuestions(loadedQuestions.length);
      } else {
        setTotalQuestions(loadedQuestions.length);
      }

      // For survival mode, use the stored correct count
      if (storedQuizMode === "survival") {
        const survivalCorrectCount = parseInt(
          localStorage.getItem("survivalCorrectCount") || "0"
        );
        setScore(survivalCorrectCount);
      } else {
        const correctCount = loadedQuestions.reduce((count, _, index) => {
          return localStorage.getItem(`question${index}`) === "correct"
            ? count + 1
            : count;
        }, 0);
        setScore(correctCount);
      }

      const storedTime = localStorage.getItem("quizTimeTaken");
      if (storedTime) {
        setTimeTaken(parseInt(storedTime));
      }

      if (storedQuizMode) {
        setQuizMode(storedQuizMode);
      }

      // Load category name for category quizzes
      const storedQuizCategory = localStorage.getItem("quizCategory");
      if (storedQuizCategory) {
        setQuizCategory(storedQuizCategory);
      }

      // Load challenge data if it's a challenge quiz
      if (storedQuizMode === "challenge") {
        const challengeId = localStorage.getItem("challengeId");
        if (challengeId) {
          // Fetch challenge details immediately and set up polling
          const fetchChallengeData = async () => {
            try {
              const response = await axiosInstance.get(
                `/api/challenges/${challengeId}`
              );
              const challenge = response.data.challenge;
              setChallengeData(challenge);

              // Keep polling if not completed
              if (challenge.status !== "completed") {
                setTimeout(fetchChallengeData, 2000);
              }
            } catch (error) {
              console.error("Error fetching challenge data:", error);
            }
          };

          // Initial fetch
          fetchChallengeData();
        }
      }
    } else {
      setHasQuizData(false);
    }
  }, []);

  // Show different content based on user state
  if (isLoggedIn && !hasQuizData) {
    return (
      <div className="content-container">
        <div className="quiz-content">
          <h1>No Recent Quiz Results</h1>
          <p>You don't have any recent quiz results to display.</p>
          <p>
            This might be because you logged in during another user's quiz
            session.
          </p>
          <div className="mt-4">
            <Link to="/quiz-history" className="btn btn-primary me-3">
              View Quiz History
            </Link>
            <Link to="/" className="btn btn-outline-primary">
              Take New Quiz
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!hasQuizData) {
    return (
      <div className="content-container">
        <div className="quiz-content">
          <h1>No Quiz Results</h1>
          <p>You don't have any quiz results to display.</p>
          <div className="mt-4">
            <Link to="/" className="btn btn-primary">
              Take a Quiz
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="quiz-content">
        <h1>Your Results</h1>
        <div className="results-summary">
          <p className="quiz-mode-indicator">
            {quizMode === "blitz"
              ? "⚡ Blitz Mode"
              : quizMode === "category"
              ? `🎯 ${
                  quizCategory
                    ? categoryOptions.find((c) => c.value === quizCategory)
                        ?.label
                    : "Category"
                } Quiz`
              : quizMode === "survival"
              ? "🏃 Survival Mode"
              : quizMode === "challenge"
              ? "🎯 Challenge Quiz"
              : "📅 Daily Quiz"}
          </p>
          <p>
            {quizMode === "survival"
              ? `Score: ${score}`
              : `Score: ${score}/${totalQuestions}`}
          </p>
          {timeTaken > 0 && <p>{`Time: ${formatTime(timeTaken)}`}</p>}
        </div>

        {/* Challenge Results Comparison */}
        {quizMode === "challenge" && challengeData && (
          <div className="challenge-results">
            <h2>Challenge Results</h2>
            {challengeData.status === "completed" && (
              <>
                <div className="challenge-comparison">
                  <div className="challenge-player">
                    <h3>{challengeData.challenger.username}</h3>
                    <p>
                      Score: {challengeData.challengerScore || "Pending"}/10
                    </p>
                    {challengeData.challengerTimeTaken && (
                      <p>
                        Time: {formatTime(challengeData.challengerTimeTaken)}
                      </p>
                    )}
                  </div>
                  <div className="challenge-vs">VS</div>
                  <div className="challenge-player">
                    <h3>{challengeData.challenged.username}</h3>
                    <p>
                      Score: {challengeData.challengedScore || "Pending"}/10
                    </p>
                    {challengeData.challengedTimeTaken && (
                      <p>
                        Time: {formatTime(challengeData.challengedTimeTaken)}
                      </p>
                    )}
                  </div>
                </div>
                {challengeData.winner && (
                  <div className="challenge-winner">
                    <h3>🎉 Winner: {challengeData.winner.username}</h3>
                  </div>
                )}
              </>
            )}
            {challengeData.status !== "completed" && (
              <p>Waiting for opponent to complete the challenge...</p>
            )}
          </div>
        )}

        <div className="questions-container">
          {questions.map((question, index) => {
            const userAnswerStatus = localStorage.getItem(`question${index}`);
            const userSelectedAnswer = localStorage.getItem(
              `userAnswer${index}`
            );
            const correctAnswer = question.correctAnswer;

            return (
              <div key={index} className="question-block">
                <p>{`Question ${index + 1}: ${question.question}`}</p>
                <div className="options">
                  {[correctAnswer, ...question.incorrectAnswers].map(
                    (option, idx) => (
                      <p
                        key={idx}
                        className={`option 
                        ${option === correctAnswer ? "correct" : ""} 
                        ${
                          option === userSelectedAnswer &&
                          userAnswerStatus === "incorrect"
                            ? "user-incorrect"
                            : ""
                        }
                      `}
                      >
                        {option}
                      </p>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
