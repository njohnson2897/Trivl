import { useEffect, useState } from "react";
import { formatTime } from "../utils/helpers";
import { Link } from "react-router-dom";

export default function Results() {
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [timeTaken, setTimeTaken] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasQuizData, setHasQuizData] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const loadedQuestions =
      JSON.parse(localStorage.getItem("triviaQuestions")) || [];

    if (loadedQuestions.length > 0) {
      setTotalQuestions(loadedQuestions.length);
      setQuestions(loadedQuestions);
      setHasQuizData(true);

      const correctCount = loadedQuestions.reduce((count, _, index) => {
        return localStorage.getItem(`question${index}`) === "correct"
          ? count + 1
          : count;
      }, 0);
      setScore(correctCount);

      const storedTime = localStorage.getItem("quizTimeTaken");
      if (storedTime) {
        setTimeTaken(parseInt(storedTime));
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
          <p>{`Score: ${score}/${totalQuestions}`}</p>
          {timeTaken > 0 && <p>{`Time: ${formatTime(timeTaken)}`}</p>}
        </div>

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
