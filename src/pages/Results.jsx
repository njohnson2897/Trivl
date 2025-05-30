import { useEffect, useState } from "react";
import { formatTime } from "../utils/helpers";

export default function Results() {
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [timeTaken, setTimeTaken] = useState(0);

  useEffect(() => {
    const loadedQuestions =
      JSON.parse(localStorage.getItem("triviaQuestions")) || [];
    setTotalQuestions(loadedQuestions.length);
    setQuestions(loadedQuestions);

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
  }, []);

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
