import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axiosInstance from '../../axiosConfig.js';
import bell from '../assets/button_click.mp3';

const oneDayCountdown = 24 * 60 * 60 * 1000; // 1 day in milliseconds

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState("");
  const [quizStatus, setQuizStatus] = useState('not_started');
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const navigate = useNavigate();
  const bellSound = new Audio(bell);


  // Comprehensive status check on mount
  useEffect(() => {
    // Inside the checkQuizState function in useEffect
const checkQuizState = () => {
  const lastUpdateTime = localStorage.getItem("lastUpdateTime");
  const currentTime = new Date().getTime();

  // Check if quiz is in cooldown
  if (lastUpdateTime) {
    if (currentTime - parseInt(lastUpdateTime) >= oneDayCountdown) {
      // Clear all quiz-related data from localStorage
      for (let i = 0; i < 10; i++) { // Assuming max 10 questions
        localStorage.removeItem(`question${i}`);
        localStorage.removeItem(`userAnswer${i}`);
      }
      localStorage.removeItem("lastUpdateTime");
      localStorage.removeItem("quizStatus");
      localStorage.removeItem("triviaQuestions");
      localStorage.removeItem("currentQuestionIndex");
      setQuizStatus('not_started');
      return;
    } else if (currentTime - parseInt(lastUpdateTime) < oneDayCountdown) {
      setQuizStatus('cooldown');
      startCooldownTimer();
      return;
    }
  }

  // Rest of the existing code...
  const storedQuestions = localStorage.getItem("triviaQuestions");
  const storedQuizStatus = localStorage.getItem("quizStatus");
  
  if (storedQuizStatus === 'in_progress' && storedQuestions) {
    const parsedQuestions = JSON.parse(storedQuestions);
    const savedQuestionIndex = parseInt(localStorage.getItem("currentQuestionIndex") || 0);
    
    setQuestions(parsedQuestions);
    setCurrentQuestionIndex(savedQuestionIndex);
    setQuizStatus('in_progress');
    shuffleOptionsForCurrentQuestion(parsedQuestions[savedQuestionIndex]);
  } else if (storedQuizStatus === 'completed') {
    setQuizStatus('completed');
    navigate("/results");
  }
};

    checkQuizState();
  }, [navigate]);

  // Start cooldown timer
  const startCooldownTimer = () => {
    const interval = setInterval(() => {
      const lastUpdateTime = parseInt(localStorage.getItem("lastUpdateTime") || "0");
      const currentTime = new Date().getTime();
      const remainingTime = oneDayCountdown - (currentTime - lastUpdateTime);
      
      if (remainingTime <= 0) {
        clearInterval(interval);
        localStorage.removeItem("lastUpdateTime");
        localStorage.removeItem("quizStatus");
        setQuizStatus('not_started');
        setTimer("");
      } else {
        const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
        const seconds = Math.floor((remainingTime / 1000) % 60);
        
        setTimer(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);
  
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  };

  // Start the quiz
  const startQuiz = () => {
    fetch("https://the-trivia-api.com/api/questions")
      .then((response) => response.json())
      .then((data) => {
        setQuestions(data);
        setQuizStatus('in_progress');
        setCurrentQuestionIndex(0);
        
        // Persist quiz state
        localStorage.setItem("triviaQuestions", JSON.stringify(data));
        localStorage.setItem("quizStatus", 'in_progress');
        localStorage.setItem("currentQuestionIndex", '0');
        
        shuffleOptionsForCurrentQuestion(data[0]);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        alert("Failed to load questions. Please try again.");
      });
  };

  // Shuffle options for the current question
  const shuffleOptionsForCurrentQuestion = (question) => {
    const options = [question.correctAnswer, ...question.incorrectAnswers];
    setShuffledOptions(options.sort(() => Math.random() - 0.5));
  };

  // Handle answer selection
  const handleAnswer = (selectedAnswer) => {
    bellSound.play();

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = currentQuestion.correctAnswer === selectedAnswer;

    // Store answer status and selected answer
    localStorage.setItem(
      `question${currentQuestionIndex}`,
      isCorrect ? "correct" : "incorrect"
    );
    localStorage.setItem(`userAnswer${currentQuestionIndex}`, selectedAnswer);
    
    // Move to next question or complete quiz
    if (currentQuestionIndex + 1 < questions.length) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      
      // Persist current question index
      localStorage.setItem("currentQuestionIndex", nextIndex.toString());
      
      shuffleOptionsForCurrentQuestion(questions[nextIndex]);
    } else {
      handleQuizCompletion();
    }
  };

  // Handle quiz completion
  const handleQuizCompletion = async () => {
    // Record last update time and set status
    localStorage.setItem("lastUpdateTime", new Date().getTime().toString());
    localStorage.setItem("quizStatus", 'completed');
    
    // Remove in-progress quiz state
    localStorage.removeItem("currentQuestionIndex");
    
    setQuizStatus('completed');

    // Log score if token exists
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;

        // Calculate score
        const correctCount = questions.reduce((count, _, index) => {
          return localStorage.getItem(`question${index}`) === 'correct' ? count + 1 : count;
        }, 0);

        await axiosInstance.post("/api/scores/logscore", {
          userId,
          quiz_score: correctCount,
        });
      } catch (error) {
        console.error("Error logging score:", error);
      }
    }

    navigate("/results");
  };

  // Render different views based on quiz status
  const renderQuizContent = () => {
    switch (quizStatus) {
      case 'not_started':
        return (
          <div className="quiz-start-container">
            <h2 className='quiz-start-title'>Daily Trivia Quiz</h2>
            <button className='quiz-start-button' onClick={startQuiz}>Start Quiz</button>
          </div>
        );
      
      case 'cooldown':
        return (
          <div className="timer-modal">
            <p>You can take the quiz again in:</p>
            <h3>{timer}</h3>
            <p>
              <Link to="/results">Click here to see your results</Link>
            </p>
          </div>
        );
      
      case 'in_progress':
        return (
          <div className="quiz-content">
            <h2>Trivia Quiz</h2>
            <div className="question-block">
              <p>{`Question ${currentQuestionIndex + 1}: ${
                questions[currentQuestionIndex].question
              }`}</p>
              {shuffledOptions.map((option, index) => (
                <button key={index} onClick={() => handleAnswer(option)}>
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      
      case 'completed':
        return null; // Automatically navigates to results
      
      default:
        return null;
    }
  };

  return (
    <div className="content-container">
      {renderQuizContent()}
    </div>
  );
}