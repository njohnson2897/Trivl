import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const oneDayCountdown = 24 * 60 * 60 * 1000; // 1 day in milliseconds

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState('');
  const [quizTakenToday, setQuizTakenToday] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const navigate = useNavigate();

  // Check if the quiz has already been taken today
  useEffect(() => {
    const lastUpdateTime = localStorage.getItem('lastUpdateTime');
    const currentTime = new Date().getTime();

    if (lastUpdateTime && currentTime - parseInt(lastUpdateTime) < oneDayCountdown) {
      setQuizTakenToday(true);
      setupTimer();
    } else {
      fetchQuestions();
    }
  }, []);

  // Fetch questions from the API or load from localStorage if available
  const fetchQuestions = () => {
    fetch('https://the-trivia-api.com/api/questions')
      .then(response => response.json())
      .then(data => {
        localStorage.setItem('triviaQuestions', JSON.stringify(data));
        localStorage.setItem('lastUpdateTime', new Date().getTime().toString());
        setQuestions(data);
        setQuizTakenToday(false);
        shuffleOptionsForCurrentQuestion(data[0]);
      })
      .catch(error => console.error('Fetch error:', error));
  };

  // Timer setup
  const setupTimer = () => {
    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const lastUpdateTime = parseInt(localStorage.getItem('lastUpdateTime') || 0);
      const expiryTime = oneDayCountdown - (currentTime - lastUpdateTime);

      const hours = Math.floor((expiryTime / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((expiryTime / (1000 * 60)) % 60);
      const seconds = Math.floor((expiryTime / 1000) % 60);

      setTimer(`${hours}h ${minutes}m ${seconds}s`);

      if (expiryTime <= 0) {
        clearInterval(interval);
        localStorage.removeItem('triviaQuestions');
        setQuestions([]);
        setQuizTakenToday(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  // Shuffle options for the current question once
  const shuffleOptionsForCurrentQuestion = (question) => {
    const options = [question.correctAnswer, ...question.incorrectAnswers];
    setShuffledOptions(options.sort(() => Math.random() - 0.5));
  };

  // Handle answer selection
const handleAnswer = (selectedAnswer) => {
  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = currentQuestion.correctAnswer === selectedAnswer;

  // Store if the answer is correct and the answer itself
  localStorage.setItem(`question${currentQuestionIndex}`, isCorrect ? 'correct' : 'incorrect');
  localStorage.setItem(`userAnswer${currentQuestionIndex}`, selectedAnswer); // Store the user's selected answer

  if (currentQuestionIndex + 1 < questions.length) {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    shuffleOptionsForCurrentQuestion(questions[currentQuestionIndex + 1]);
  } else {
    navigate('/results');
  }
};

  return (
    <div className="quiz-container">
      {quizTakenToday ? (
        <div className="timer-modal">
          <p>You can take the quiz again in:</p>
          <h3>{timer}</h3>
          <p><Link to='/results'>Click here to see your results</Link></p>
        </div>
      ) : (
        <div className="quiz-content">
          <h2>Trivia Quiz</h2>
          {questions.length > 0 ? (
            <div className="question-block">
              <p>{`Question ${currentQuestionIndex + 1}: ${questions[currentQuestionIndex].question}`}</p>
              {shuffledOptions.map((option, index) => (
                <button key={index} onClick={() => handleAnswer(option)}>
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <p>Loading questions...</p>
          )}
        </div>
      )}
    </div>
  );
}
