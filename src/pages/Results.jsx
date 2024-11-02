import { useEffect, useState } from 'react';

export default function Results() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const questions = JSON.parse(localStorage.getItem('triviaQuestions')) || [];
    const correctCount = questions.reduce((count, _, index) => {
      return localStorage.getItem(`question${index}`) === 'correct' ? count + 1 : count;
    }, 0);
    setScore(correctCount);
  }, []);

  return (
    <div className="results-container">
      <h2>Your Score</h2>
      <p>{`You scored ${score} out of ${localStorage.getItem('triviaQuestions')?.length || 5}`}</p>
    </div>
  );
}