import { useEffect, useState } from 'react';

export default function Results() {
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const loadedQuestions = JSON.parse(localStorage.getItem('triviaQuestions')) || [];
    setTotalQuestions(loadedQuestions.length);
    setQuestions(loadedQuestions);

    const correctCount = loadedQuestions.reduce((count, _, index) => {
      return localStorage.getItem(`question${index}`) === 'correct' ? count + 1 : count;
    }, 0);
    setScore(correctCount);
  }, []);

  return (
    <div className="results-container">
      <h2>Your Score</h2>
      <p>{`You scored ${score} out of ${totalQuestions}`}</p>

      <div className="questions-container">
        {questions.map((question, index) => {
          const userAnswer = localStorage.getItem(`question${index}`);
          const isCorrect = userAnswer === 'correct';
          const userSelectedAnswer = localStorage.getItem(`userAnswer${index}`);
          const correctAnswer = question.correctAnswer;

          return (
            <div key={index} className="question-block">
              <p>{`Question ${index + 1}: ${question.question}`}</p>
              <div className="options">
                {[
                  question.correctAnswer,
                  ...question.incorrectAnswers,
                ].map((option, idx) => (
                  <p
                    key={idx}
                    className={`option ${option === correctAnswer ? 'correct' : ''} ${
                      option === userSelectedAnswer ? (isCorrect ? 'user-correct' : 'user-incorrect') : ''
                    }`}
                  >
                    {option}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
