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
        <h1>{quizMode === "challenge" ? "Challenge Results" : "Your Results"}</h1>
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
              : quizMode === "zen"
              ? "🧘 Practice Quiz"
              : "📅 Daily Quiz"}
          </p>
          <p>
            {quizMode === "survival"
              ? `Score: ${score}`
              : `Score: ${score}/${totalQuestions}`}
          </p>
          {timeTaken > 0 && <p>{`Time: ${formatTime(timeTaken)}`}</p>}
        </div>

        {/* Challenge Results Side-by-Side */}
        {quizMode === "challenge" && challengeData && (
          <>
          {challengeData.status === "completed" && challengeData.winner && (
            <div className="challenge-winner">
              <h3>🎉 Winner: {challengeData.winner.username}</h3>
            </div>
          )}
          <div className="challenge-results-grid">
            <div className="challenge-column">
              <h3>{challengeData.challenger?.username || "Challenger"}</h3>
              {challengeData.challengerScore != null && (
                <p>Score: {challengeData.challengerScore}/10</p>
              )}
              {challengeData.challengerTimeTaken != null && (
                <p>Time: {formatTime(challengeData.challengerTimeTaken)}</p>
              )}
              <div className="questions-container">
                {Array.isArray(challengeData.challengerAnswers)
                  ? questions.map((q, idx) => {
                      const ans = (challengeData.challengerAnswers || [])[idx];
                      const userSelectedAnswer = ans?.selectedAnswer;
                      const correctAnswer = ans?.correctAnswer || q.correctAnswer;
                      const userAnswerStatus = ans ? (ans.isCorrect ? "correct" : "incorrect") : null;
                      const options = [correctAnswer, ...(q.incorrectAnswers || [])];
                      return (
                        <div key={`c-${idx}`} className="question-block">
                          <p>{`Q${idx + 1}: ${q.question}`}</p>
                          <div className="options">
                            {options.map((option, oIdx) => (
                              <p
                                key={oIdx}
                                className={`option 
                                  ${option === correctAnswer ? "correct" : ""}
                                  ${
                                    option === userSelectedAnswer && userAnswerStatus === "incorrect"
                                      ? "user-incorrect"
                                      : ""
                                  }
                                `}
                              >
                                {option}
                              </p>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  : (
                      <p>Waiting for this player to complete the challenge...</p>
                    )}
              </div>
            </div>
            <div className="challenge-column">
              <h3>{challengeData.challenged?.username || "Challenged"}</h3>
              {challengeData.challengedScore != null && (
                <p>Score: {challengeData.challengedScore}/10</p>
              )}
              {challengeData.challengedTimeTaken != null && (
                <p>Time: {formatTime(challengeData.challengedTimeTaken)}</p>
              )}
              <div className="questions-container">
                {Array.isArray(challengeData.challengedAnswers)
                  ? questions.map((q, idx) => {
                      const ans = (challengeData.challengedAnswers || [])[idx];
                      const userSelectedAnswer = ans?.selectedAnswer;
                      const correctAnswer = ans?.correctAnswer || q.correctAnswer;
                      const userAnswerStatus = ans ? (ans.isCorrect ? "correct" : "incorrect") : null;
                      const options = [correctAnswer, ...(q.incorrectAnswers || [])];
                      return (
                        <div key={`d-${idx}`} className="question-block">
                          <p>{`Q${idx + 1}: ${q.question}`}</p>
                          <div className="options">
                            {options.map((option, oIdx) => (
                              <p
                                key={oIdx}
                                className={`option 
                                  ${option === correctAnswer ? "correct" : ""}
                                  ${
                                    option === userSelectedAnswer && userAnswerStatus === "incorrect"
                                      ? "user-incorrect"
                                      : ""
                                  }
                                `}
                              >
                                {option}
                              </p>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  : (
                      <p>Waiting for this player to complete the challenge...</p>
                    )}
              </div>
            </div>
          </div>
          </>
        )}

        {quizMode !== "challenge" && (
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
        )}
      </div>
    </div>
  );
}
