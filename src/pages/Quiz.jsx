import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axiosInstance from "../../axiosConfig.js";
import bell from "../assets/button_click.mp3";
import LoadingSpinner from "../components/LoadingSpinner";

const oneDayCountdown = 24 * 60 * 60 * 1000; // 1 day in milliseconds

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState("");
  const [quizStatus, setQuizStatus] = useState("not_started");
  const [quizMode, setQuizMode] = useState("daily"); // "daily" or "blitz"
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [dailyQuizOnCooldown, setDailyQuizOnCooldown] = useState(false);
  const [cooldownTimeRemaining, setCooldownTimeRemaining] = useState("");
  const [selectedBlitzTime, setSelectedBlitzTime] = useState(90); // Default to 90 seconds
  const [showBlitzTimeSelection, setShowBlitzTimeSelection] = useState(false);
  const cooldownIntervalRef = useRef(null);
  const questionTimerRef = useRef(null);
  const navigate = useNavigate();
  const bellSound = new Audio(bell);

  // Blitz time options
  const blitzTimeOptions = [
    { value: 30, label: "30 seconds", description: "Lightning fast!" },
    { value: 60, label: "1 minute", description: "Quick challenge" },
    { value: 120, label: "2 minutes", description: "Balanced pace" },
    { value: 180, label: "3 minutes", description: "More time to think" },
  ];

  // Helper function to format time
  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 120) {
      return "1m";
    } else {
      return `${Math.floor(seconds / 60)}m`;
    }
  };

  // Clear quiz state when component mounts or when user logs in
  useEffect(() => {
    const clearCompletedQuizState = () => {
      const token = localStorage.getItem("token");

      // Clear ALL quiz data when a user logs in/out to prevent interference
      const storedQuizStatus = localStorage.getItem("quizStatus");
      if (
        storedQuizStatus === "completed" ||
        storedQuizStatus === "in_progress"
      ) {
        localStorage.removeItem("quizStatus");
        localStorage.removeItem("quizTimeTaken");
        localStorage.removeItem("triviaQuestions");
        localStorage.removeItem("currentQuestionIndex");
        localStorage.removeItem("quizStartTime");
        // Clear question answers
        for (let i = 0; i < 10; i++) {
          localStorage.removeItem(`question${i}`);
          localStorage.removeItem(`userAnswer${i}`);
        }
      }

      // Always clear timer and reset quiz status when user state changes
      setTimer("");
      setQuizStatus("not_started");

      // Clear any running timers
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
        cooldownIntervalRef.current = null;
      }
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
        questionTimerRef.current = null;
      }

      // Trigger a refresh of the quiz state
      setRefreshTrigger((prev) => prev + 1);
    };

    // Clear on mount
    clearCompletedQuizState();

    // Listen for login/logout events
    window.addEventListener("userLogin", clearCompletedQuizState);
    window.addEventListener("userLogout", clearCompletedQuizState);

    return () => {
      window.removeEventListener("userLogin", clearCompletedQuizState);
      window.removeEventListener("userLogout", clearCompletedQuizState);
    };
  }, []); // Run on every mount

  // Comprehensive status check on mount
  useEffect(() => {
    const checkQuizState = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        // If no token, check localStorage for quiz state and cooldown
        const lastUpdateTime = localStorage.getItem("lastUpdateTime");
        const currentTime = new Date().getTime();

        // Check if quiz is in cooldown (for non-logged in users)
        if (lastUpdateTime) {
          if (currentTime - parseInt(lastUpdateTime) >= oneDayCountdown) {
            // Clear all quiz-related data from localStorage
            for (let i = 0; i < 10; i++) {
              localStorage.removeItem(`question${i}`);
              localStorage.removeItem(`userAnswer${i}`);
            }
            localStorage.removeItem("lastUpdateTime");
            localStorage.removeItem("quizStatus");
            localStorage.removeItem("quizMode");
            localStorage.removeItem("triviaQuestions");
            localStorage.removeItem("currentQuestionIndex");
            setQuizStatus("not_started");
            setDailyQuizOnCooldown(false);
            return;
          } else if (currentTime - parseInt(lastUpdateTime) < oneDayCountdown) {
            setDailyQuizOnCooldown(true);
            setQuizStatus("not_started"); // Show quiz mode selection
            startCooldownTimer();
            return;
          }
        }

        // Check for in-progress quiz
        const storedQuestions = localStorage.getItem("triviaQuestions");
        const storedQuizStatus = localStorage.getItem("quizStatus");

        if (storedQuizStatus === "in_progress" && storedQuestions) {
          const parsedQuestions = JSON.parse(storedQuestions);
          const savedQuestionIndex = parseInt(
            localStorage.getItem("currentQuestionIndex") || 0
          );
          const savedQuizMode = localStorage.getItem("quizMode") || "daily";

          setQuestions(parsedQuestions);
          setCurrentQuestionIndex(savedQuestionIndex);
          setQuizMode(savedQuizMode);
          setQuizStatus("in_progress");
          shuffleOptionsForCurrentQuestion(parsedQuestions[savedQuestionIndex]);

          // Restart quiz timer if in Blitz mode
          if (savedQuizMode === "blitz") {
            startQuizTimer(90); // Restart with 90 seconds
          }
        } else if (storedQuizStatus === "completed") {
          setQuizStatus("completed");
          navigate("/results");
        } else {
          setQuizStatus("not_started");
        }
        return;
      }

      try {
        // Check cooldown status from backend (only for daily quiz)
        const response = await axiosInstance.get("/api/users/cooldown");
        const cooldownData = response.data;

        // Only apply cooldown for daily quiz mode
        if (!cooldownData.canTakeQuiz) {
          setDailyQuizOnCooldown(true);
          setQuizStatus("not_started"); // Show quiz mode selection
          startCooldownTimer(cooldownData.timeRemaining);
          return;
        }

        // Check for in-progress quiz in localStorage (only for in_progress, not completed)
        const storedQuestions = localStorage.getItem("triviaQuestions");
        const storedQuizStatus = localStorage.getItem("quizStatus");

        if (storedQuizStatus === "in_progress" && storedQuestions) {
          const parsedQuestions = JSON.parse(storedQuestions);
          const savedQuestionIndex = parseInt(
            localStorage.getItem("currentQuestionIndex") || 0
          );
          const savedQuizMode = localStorage.getItem("quizMode") || "daily";

          setQuestions(parsedQuestions);
          setCurrentQuestionIndex(savedQuestionIndex);
          setQuizMode(savedQuizMode);
          setQuizStatus("in_progress");
          shuffleOptionsForCurrentQuestion(parsedQuestions[savedQuestionIndex]);

          // Restart quiz timer if in Blitz mode
          if (savedQuizMode === "blitz") {
            startQuizTimer(90); // Restart with 90 seconds
          }
        } else {
          // If logged in, don't check for completed status in localStorage
          // The cooldown check above already handles this via the backend
          setQuizStatus("not_started");
        }
      } catch (error) {
        console.error("Error checking cooldown status:", error);
        // Fallback to localStorage check (only for in_progress, not completed)
        const storedQuestions = localStorage.getItem("triviaQuestions");
        const storedQuizStatus = localStorage.getItem("quizStatus");

        if (storedQuizStatus === "in_progress" && storedQuestions) {
          const parsedQuestions = JSON.parse(storedQuestions);
          const savedQuestionIndex = parseInt(
            localStorage.getItem("currentQuestionIndex") || 0
          );
          const savedQuizMode = localStorage.getItem("quizMode") || "daily";

          setQuestions(parsedQuestions);
          setCurrentQuestionIndex(savedQuestionIndex);
          setQuizMode(savedQuizMode);
          setQuizStatus("in_progress");
          shuffleOptionsForCurrentQuestion(parsedQuestions[savedQuestionIndex]);

          // Restart quiz timer if in Blitz mode
          if (savedQuizMode === "blitz") {
            startQuizTimer(90); // Restart with 90 seconds
          }
        } else {
          // If logged in, don't check for completed status in localStorage
          setQuizStatus("not_started");
        }
      }
    };

    checkQuizState();
  }, [navigate, refreshTrigger]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
        cooldownIntervalRef.current = null;
      }
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
        questionTimerRef.current = null;
      }
    };
  }, []);

  // Start cooldown timer
  const startCooldownTimer = (initialTimeRemaining = null) => {
    // Clear any existing timer first
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
      cooldownIntervalRef.current = null;
    }

    let timeRemaining = initialTimeRemaining;

    cooldownIntervalRef.current = setInterval(() => {
      if (timeRemaining === null) {
        // Fallback to localStorage calculation
        const lastUpdateTime = parseInt(
          localStorage.getItem("lastUpdateTime") || "0"
        );
        const currentTime = new Date().getTime();
        timeRemaining = oneDayCountdown - (currentTime - lastUpdateTime);
      } else {
        // Use provided time and countdown
        timeRemaining -= 1000;
      }

      if (timeRemaining <= 0) {
        clearInterval(cooldownIntervalRef.current);
        cooldownIntervalRef.current = null;
        localStorage.removeItem("lastUpdateTime");
        localStorage.removeItem("quizStatus");
        setDailyQuizOnCooldown(false);
        setCooldownTimeRemaining("");
        setTimer("");
      } else {
        const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeRemaining / (1000 * 60)) % 60);
        const seconds = Math.floor((timeRemaining / 1000) % 60);

        const timeString = `${hours}h ${minutes}m ${seconds}s`;
        setTimer(timeString);
        setCooldownTimeRemaining(timeString);
      }
    }, 1000);
  };

  // Start quiz timer for Blitz mode (total time for entire quiz)
  const startQuizTimer = (timeLimit = null) => {
    const actualTimeLimit = timeLimit || selectedBlitzTime;

    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
    }

    setQuestionTimer(actualTimeLimit);

    // Store start time for more accurate timing
    const startTime = Date.now();
    const endTime = startTime + actualTimeLimit * 1000;

    questionTimerRef.current = setInterval(() => {
      const currentTime = Date.now();
      const timeRemaining = Math.max(
        0,
        Math.ceil((endTime - currentTime) / 1000)
      );

      setQuestionTimer(timeRemaining);

      if (timeRemaining <= 0) {
        // Time's up! Auto-submit all remaining questions as incorrect
        clearInterval(questionTimerRef.current);
        questionTimerRef.current = null;
        handleQuizTimeout();
      }
    }, 100); // Check every 100ms for more precision
  };

  // Handle quiz timeout - mark all remaining questions as incorrect
  const handleQuizTimeout = () => {
    // Mark all remaining questions as incorrect
    for (let i = currentQuestionIndex; i < questions.length; i++) {
      localStorage.setItem(`question${i}`, "incorrect");
      localStorage.setItem(`userAnswer${i}`, "Time's up!");
    }

    // Complete the quiz
    handleQuizCompletion();
  };

  // Start the quiz
  const startQuiz = async (mode = "daily") => {
    // Check cooldown only for daily quiz
    if (mode === "daily") {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axiosInstance.get("/api/users/cooldown");
          const cooldownData = response.data;

          if (!cooldownData.canTakeQuiz) {
            setDailyQuizOnCooldown(true);
            startCooldownTimer(cooldownData.timeRemaining);
            return;
          }
        } catch (error) {
          console.error("Error checking cooldown:", error);
          // Continue with quiz if cooldown check fails
        }
      } else {
        // Check localStorage cooldown for non-logged in users
        const lastUpdateTime = localStorage.getItem("lastUpdateTime");
        if (lastUpdateTime) {
          const currentTime = new Date().getTime();
          if (currentTime - parseInt(lastUpdateTime) < oneDayCountdown) {
            setDailyQuizOnCooldown(true);
            startCooldownTimer();
            return;
          }
        }
      }
    }

    const startTime = new Date().getTime(); // Record the quiz start time
    localStorage.setItem("quizStartTime", startTime); // Save it to local storage
    localStorage.setItem("quizMode", mode); // Save quiz mode
    setQuizMode(mode);

    fetch("https://the-trivia-api.com/api/questions")
      .then((response) => response.json())
      .then((data) => {
        setQuestions(data);
        setQuizStatus("in_progress");
        setCurrentQuestionIndex(0);

        // Persist quiz state
        localStorage.setItem("triviaQuestions", JSON.stringify(data));
        localStorage.setItem("quizStatus", "in_progress");
        localStorage.setItem("currentQuestionIndex", "0");

        shuffleOptionsForCurrentQuestion(data[0]);

        // Start quiz timer if in Blitz mode
        if (mode === "blitz") {
          startQuizTimer(selectedBlitzTime);
        }
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
    // Don't clear the timer for Blitz mode - it should run for the entire quiz
    // Only clear it for daily quiz (which doesn't use this timer anyway)
    if (quizMode !== "blitz" && questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
      questionTimerRef.current = null;
    }

    bellSound.play();

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect =
      selectedAnswer === ""
        ? false
        : currentQuestion.correctAnswer === selectedAnswer;
    const userAnswer = selectedAnswer === "" ? "Time's up!" : selectedAnswer;

    // Store answer status and selected answer
    localStorage.setItem(
      `question${currentQuestionIndex}`,
      isCorrect ? "correct" : "incorrect"
    );
    localStorage.setItem(`userAnswer${currentQuestionIndex}`, userAnswer);

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

  const handleQuizCompletion = async () => {
    const quizStartTime = localStorage.getItem("quizStartTime");
    const timeTaken = quizStartTime
      ? Math.floor((new Date().getTime() - parseInt(quizStartTime)) / 1000) // Time in seconds
      : null;
    localStorage.setItem("quizTimeTaken", timeTaken.toString());
    localStorage.setItem("quizStatus", "completed");
    localStorage.removeItem("currentQuestionIndex");
    setQuizStatus("completed");

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;

        // Calculate score
        const correctCount = questions.reduce((count, question, index) => {
          return localStorage.getItem(`question${index}`) === "correct"
            ? count + 1
            : count;
        }, 0);

        // Collect data for categories, difficulties, and isNiche
        const categories = questions.map((q) => q.category);
        const difficulties = questions.map((q) => q.difficulty);
        const isNicheArray = questions.map((q) => q.isNiche);

        // Determine quiz difficulty (mode of difficulties array)
        const difficultyCounts = difficulties.reduce((counts, difficulty) => {
          counts[difficulty] = (counts[difficulty] || 0) + 1;
          return counts;
        }, {});

        const quizDifficulty = Object.keys(difficultyCounts).reduce((a, b) =>
          difficultyCounts[a] > difficultyCounts[b] ? a : b
        );

        // Post the data to the backend
        await axiosInstance.post("/api/scores/logscore", {
          userId,
          quiz_score: correctCount,
          quiz_difficulty: quizDifficulty,
          categories,
          is_niche: isNicheArray,
          time_taken: timeTaken,
          quiz_mode: quizMode, // New field for quiz type
        });
      } catch (error) {
        console.error("Error logging score:", error);
      }
    } else {
      // For non-logged in users, set lastUpdateTime for cooldown (only for daily quiz)
      if (quizMode === "daily") {
        localStorage.setItem("lastUpdateTime", new Date().getTime().toString());
      }
    }

    navigate("/results");
  };

  // Render different views based on quiz status
  const renderQuizContent = () => {
    switch (quizStatus) {
      case "not_started":
        return (
          <div className="quiz-start-container">
            <h2 className="quiz-start-title">Choose Your Quiz Mode</h2>
            <div className="quiz-mode-selection">
              <div
                className={`quiz-mode-card ${
                  dailyQuizOnCooldown ? "cooldown" : ""
                }`}
              >
                <h3>Daily Quiz</h3>
                <p>Take your time with each question</p>
                <ul>
                  <li>No time limit per question</li>
                  <li>10 random questions</li>
                  <li>Once per day</li>
                </ul>
                {dailyQuizOnCooldown ? (
                  <div className="cooldown-info">
                    <div className="cooldown-timer">
                      <strong>Available in:</strong>
                      <span className="timer-display">
                        {cooldownTimeRemaining}
                      </span>
                    </div>
                    <button className="quiz-start-button disabled" disabled>
                      Daily Quiz on Cooldown
                    </button>
                  </div>
                ) : (
                  <button
                    className="quiz-start-button"
                    onClick={() => startQuiz("daily")}
                  >
                    Start Daily Quiz
                  </button>
                )}
              </div>

              <div className="quiz-mode-card blitz-mode">
                <h3>⚡ Blitz Mode</h3>
                <p>Fast-paced, high-pressure trivia!</p>

                {!showBlitzTimeSelection ? (
                  <>
                    <ul>
                      <li>Choose your time limit</li>
                      <li>10 random questions</li>
                      <li>Unlimited attempts</li>
                    </ul>
                    <div className="current-time-selection">
                      <span className="time-display">
                        {formatTime(selectedBlitzTime)}
                      </span>
                      <span className="time-label">selected</span>
                    </div>
                    <div className="blitz-buttons">
                      <button
                        className="quiz-start-button blitz-button secondary"
                        onClick={() => setShowBlitzTimeSelection(true)}
                      >
                        Change Time
                      </button>
                      <button
                        className="quiz-start-button blitz-button primary"
                        onClick={() => startQuiz("blitz")}
                      >
                        Start Blitz Quiz
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="time-selection">
                    <h4>Choose Your Time Limit</h4>
                    <div className="time-options">
                      {blitzTimeOptions.map((option) => (
                        <button
                          key={option.value}
                          className={`time-option ${
                            selectedBlitzTime === option.value ? "selected" : ""
                          }`}
                          onClick={() => {
                            setSelectedBlitzTime(option.value);
                            setShowBlitzTimeSelection(false);
                          }}
                        >
                          <div className="time-value">
                            {formatTime(option.value)}
                          </div>
                          <div className="time-description">
                            {option.description}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="time-selection-actions">
                      <button
                        className="quiz-start-button blitz-button secondary"
                        onClick={() => setShowBlitzTimeSelection(false)}
                      >
                        Back
                      </button>
                      <button
                        className="quiz-start-button blitz-button primary"
                        onClick={() => startQuiz("blitz")}
                      >
                        Start Quiz
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "in_progress":
        return (
          <div className="quiz-content">
            <h2>
              {quizMode === "blitz" ? "⚡ Blitz Quiz" : "Daily Trivia Quiz"}
            </h2>
            {quizMode === "blitz" && (
              <div className="quiz-timer">
                <div
                  className={`timer-circle ${
                    questionTimer <= 10 ? "warning" : ""
                  }`}
                >
                  {questionTimer}
                </div>
                <span>seconds remaining for entire quiz</span>
              </div>
            )}
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

      case "completed":
        return null; // Automatically navigates to results

      default:
        return null;
    }
  };

  return <div className="content-container">{renderQuizContent()}</div>;
}
