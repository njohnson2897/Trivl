import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import bulmaCarousel from 'bulma-carousel';

const oneDayCountdown = 24 * 60 * 60 * 1000; // 1 day in milliseconds

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState('');
  const navigate = useNavigate();

  // Load questions from the API or localStorage
  useEffect(() => {
    const fetchQuestions = () => {
      const lastUpdateTime = localStorage.getItem('lastUpdateTime');
      const currentTime = new Date().getTime();

      if (lastUpdateTime && (currentTime - parseInt(lastUpdateTime) < oneDayCountdown)) {
        const savedQuestions = JSON.parse(localStorage.getItem('triviaQuestions'));
        if (savedQuestions) setQuestions(savedQuestions);
      } else {
        fetch('https://the-trivia-api.com/api/questions')
          .then(response => response.json())
          .then(data => {
            localStorage.setItem('triviaQuestions', JSON.stringify(data));
            localStorage.setItem('lastUpdateTime', currentTime.toString());
            setQuestions(data);
          })
          .catch(error => console.error('Fetch error:', error));
      }
    };

    fetchQuestions();
    setupTimer();
  }, []);

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
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  // Answer selection and navigation
  const handleAnswer = (selectedAnswer) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.correctAnswer === selectedAnswer) {
      localStorage.setItem(`question${currentQuestionIndex}`, 'correct');
    } else {
      localStorage.setItem(`question${currentQuestionIndex}`, 'incorrect');
    }

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      navigate('/results');
    }
  };

  // Shuffle options for each question
  const shuffleOptions = (options) => {
    return options.sort(() => Math.random() - 0.5);
  };

  return (
    <div className="quiz-container">
      <h2>Trivia Quiz</h2>
      <p>Time remaining for new quiz: {timer}</p>

      {questions.length > 0 ? (
        <div className="question-block">
          <p>{`Question ${currentQuestionIndex + 1}: ${questions[currentQuestionIndex].question}`}</p>
          {shuffleOptions([
            questions[currentQuestionIndex].correctAnswer,
            ...questions[currentQuestionIndex].incorrectAnswers,
          ]).map((option, index) => (
            <button key={index} onClick={() => handleAnswer(option)}>
              {option}
            </button>
          ))}
        </div>
      ) : (
        <p>Loading questions...</p>
      )}
    </div>
  );
}