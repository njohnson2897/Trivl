import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axiosInstance from "../../axiosConfig.js";
import bell from "../assets/button_click.mp3";

const oneDayCountdown = 24 * 60 * 60 * 1000; // 1 day in milliseconds

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizStatus, setQuizStatus] = useState("not_started");
  const [quizMode, setQuizMode] = useState("daily"); // "daily", "blitz", "category", or "survival"
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [dailyQuizOnCooldown, setDailyQuizOnCooldown] = useState(false);
  const [cooldownTimeRemaining, setCooldownTimeRemaining] = useState("");
  const [selectedBlitzTime, setSelectedBlitzTime] = useState(90); // Default to 90 seconds
  const [showBlitzTimeSelection, setShowBlitzTimeSelection] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const [quizCategory, setQuizCategory] = useState(null);
  const [survivalQuestionTimer, setSurvivalQuestionTimer] = useState(15);
  const cooldownIntervalRef = useRef(null);
  const questionTimerRef = useRef(null);
  const initialCheckDoneRef = useRef(false);
  const handleAnswerRef = useRef(null);
  const navigate = useNavigate();
  const bellSound = useMemo(() => new Audio(bell), []);

  // Blitz time options
  const blitzTimeOptions = [
    { value: 30, label: "30 seconds", description: "Lightning fast!" },
    { value: 60, label: "1 minute", description: "Quick challenge" },
    { value: 120, label: "2 minutes", description: "Balanced pace" },
    { value: 180, label: "3 minutes", description: "More time to think" },
  ];

  // Category options
  const categoryOptions = [
    { value: "arts_and_literature", label: "Arts & Literature", icon: "🎨" },
    { value: "film_and_tv", label: "Film & TV", icon: "🎬" },
    { value: "food_and_drink", label: "Food & Drink", icon: "🍕" },
    { value: "general_knowledge", label: "General Knowledge", icon: "🧠" },
    { value: "geography", label: "Geography", icon: "🌍" },
    { value: "history", label: "History", icon: "📚" },
    { value: "music", label: "Music", icon: "🎵" },
    { value: "science", label: "Science", icon: "🔬" },
    { value: "society_and_culture", label: "Society & Culture", icon: "👥" },
    { value: "sport_and_leisure", label: "Sport & Leisure", icon: "⚽" },
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
      setCooldownTimeRemaining("");
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
      } else {
        const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeRemaining / (1000 * 60)) % 60);
        const seconds = Math.floor((timeRemaining / 1000) % 60);

        const timeString = `${hours}h ${minutes}m ${seconds}s`;
        setCooldownTimeRemaining(timeString);
      }
    }, 1000);
  };

  // Handle quiz completion
  const handleQuizCompletion = useCallback(async () => {
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

        // Calculate score - for survival mode use stored count, otherwise calculate from questions
        let correctCount;
        if (quizMode === "survival") {
          correctCount = parseInt(
            localStorage.getItem("survivalCorrectCount") || "0"
          );
        } else {
          correctCount = questions.reduce((count, question, index) => {
            return localStorage.getItem(`question${index}`) === "correct"
              ? count + 1
              : count;
          }, 0);
        }

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
          category_name: quizCategory, // Category name for category quizzes
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
  }, [questions, quizMode, quizCategory, navigate]);

  // Handle quiz timeout - mark all remaining questions as incorrect
  const handleQuizTimeout = useCallback(() => {
    // Mark all remaining questions as incorrect
    for (let i = currentQuestionIndex; i < questions.length; i++) {
      localStorage.setItem(`question${i}`, "incorrect");
      localStorage.setItem(`userAnswer${i}`, "Time's up!");
    }

    // Complete the quiz
    handleQuizCompletion();
  }, [questions, currentQuestionIndex, handleQuizCompletion]);

  // Start quiz timer for Blitz mode (total time for entire quiz)
  const startQuizTimer = useCallback(
    (timeLimit = null) => {
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
    },
    [selectedBlitzTime, handleQuizTimeout]
  );

  // Start survival mode question timer (20 seconds per question)
  const startSurvivalQuestionTimer = useCallback(() => {
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
    }

    setSurvivalQuestionTimer(15);

    questionTimerRef.current = setInterval(() => {
      setSurvivalQuestionTimer((prev) => {
        if (prev <= 1) {
          // Time's up! Auto-submit this question as incorrect
          clearInterval(questionTimerRef.current);
          questionTimerRef.current = null;
          // Use the ref to call handleAnswer
          if (handleAnswerRef.current) {
            handleAnswerRef.current(""); // Empty string indicates timeout
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Comprehensive status check on mount
  useEffect(() => {
    const checkQuizState = async () => {
      console.log("🔍 checkQuizState useEffect triggered");

      // Only run the initial check once
      if (initialCheckDoneRef.current) {
        console.log("⏭️ Initial check already done, skipping");
        return;
      }

      // Don't run if quiz is already in progress
      if (quizStatus === "in_progress") {
        console.log("⏭️ Quiz already in progress, skipping checkQuizState");
        return;
      }

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

        console.log(
          "🔍 Checking localStorage - storedQuizStatus:",
          storedQuizStatus,
          "storedQuestions:",
          !!storedQuestions
        );
        console.log("🔍 Current quiz status in state:", quizStatus);

        if (storedQuizStatus === "in_progress" && storedQuestions) {
          console.log("✅ Found in-progress quiz, restoring state...");
          const parsedQuestions = JSON.parse(storedQuestions);
          const savedQuestionIndex = parseInt(
            localStorage.getItem("currentQuestionIndex") || 0
          );
          const savedQuizMode = localStorage.getItem("quizMode") || "daily";
          const savedQuizCategory = localStorage.getItem("quizCategory");

          console.log(
            "🔄 Restoring quiz state - savedQuizMode:",
            savedQuizMode,
            "savedQuizCategory:",
            savedQuizCategory
          );

          setQuestions(parsedQuestions);
          setCurrentQuestionIndex(savedQuestionIndex);
          setQuizMode(savedQuizMode);
          setQuizCategory(savedQuizCategory);
          setQuizStatus("in_progress");
          shuffleOptionsForCurrentQuestion(parsedQuestions[savedQuestionIndex]);

          // Restart quiz timer if in Blitz mode
          if (savedQuizMode === "blitz") {
            startQuizTimer(90); // Restart with 90 seconds
          }

          // Restart survival timer if in Survival mode
          if (savedQuizMode === "survival") {
            startSurvivalQuestionTimer();
          }
        } else if (storedQuizStatus === "completed") {
          console.log("📋 Found completed quiz, navigating to results...");
          setQuizStatus("completed");
          navigate("/results");
        } else {
          console.log(
            "🔄 No in-progress quiz found, setting status to not_started"
          );
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
          const savedQuizCategory = localStorage.getItem("quizCategory");

          setQuestions(parsedQuestions);
          setCurrentQuestionIndex(savedQuestionIndex);
          setQuizMode(savedQuizMode);
          setQuizCategory(savedQuizCategory);
          setQuizStatus("in_progress");
          shuffleOptionsForCurrentQuestion(parsedQuestions[savedQuestionIndex]);

          // Restart quiz timer if in Blitz mode
          if (savedQuizMode === "blitz") {
            startQuizTimer(90); // Restart with 90 seconds
          }

          // Restart survival timer if in Survival mode
          if (savedQuizMode === "survival") {
            startSurvivalQuestionTimer();
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
          const savedQuizCategory = localStorage.getItem("quizCategory");

          setQuestions(parsedQuestions);
          setCurrentQuestionIndex(savedQuestionIndex);
          setQuizMode(savedQuizMode);
          setQuizCategory(savedQuizCategory);
          setQuizStatus("in_progress");
          shuffleOptionsForCurrentQuestion(parsedQuestions[savedQuestionIndex]);

          // Restart quiz timer if in Blitz mode
          if (savedQuizMode === "blitz") {
            startQuizTimer(90); // Restart with 90 seconds
          }

          // Restart survival timer if in Survival mode
          if (savedQuizMode === "survival") {
            startSurvivalQuestionTimer();
          }
        } else {
          // If logged in, don't check for completed status in localStorage
          setQuizStatus("not_started");
        }
      }

      // Mark initial check as done
      initialCheckDoneRef.current = true;
    };

    checkQuizState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, refreshTrigger]); // Intentionally limited dependencies to prevent infinite loop

  // Fetch a batch of questions for survival mode
  const fetchQuestionBatch = async (limit = 50) => {
    try {
      const response = await fetch(
        `https://the-trivia-api.com/api/questions?limit=${limit}`
      );
      const data = await response.json();

      let questions = Array.isArray(data) ? data : data.value || data;
      return questions || [];
    } catch (error) {
      console.error("Error fetching question batch:", error);
      return [];
    }
  };

  // Start the quiz
  const startQuiz = async (mode = "daily", category = null) => {
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

    // Store category name for category quizzes
    if (mode === "category" && category) {
      localStorage.setItem("quizCategory", category);
      console.log("🏷️ Stored category:", category);
    }

    // For survival mode, fetch 50 questions at once
    if (mode === "survival") {
      console.log("🏃 Starting survival mode with 50 questions...");

      // Initialize survival mode state
      localStorage.setItem("survivalCorrectCount", "0");

      // Fetch 50 questions at once
      const questionBatch = await fetchQuestionBatch(50);
      if (questionBatch.length === 0) {
        alert("Failed to load questions. Please try again.");
        return;
      }

      console.log(`✅ Fetched ${questionBatch.length} survival questions`);

      setQuestions(questionBatch);
      setQuizStatus("in_progress");
      setCurrentQuestionIndex(0);

      // Persist quiz state
      localStorage.setItem("triviaQuestions", JSON.stringify(questionBatch));
      localStorage.setItem("quizStatus", "in_progress");
      localStorage.setItem("currentQuestionIndex", "0");

      shuffleOptionsForCurrentQuestion(questionBatch[0]);
      startSurvivalQuestionTimer();

      console.log("🎉 Survival mode started successfully!");
      return;
    }

    // Build API URL based on mode and category for other modes
    let apiUrl = "https://the-trivia-api.com/api/questions";
    if (category) {
      // For category mode, use the API's category parameter
      apiUrl = `https://the-trivia-api.com/api/questions?categories=${category}&limit=20`;
    }

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        // Extract questions from the response - API returns {value: [...questions]}
        let questions = Array.isArray(data) ? data : data.value || data;
        let filteredData = questions;

        // For category mode, the API already filtered by category
        if (category) {
          console.log(`Category quiz for: ${category}`);
          console.log(`Questions returned: ${questions.length}`);
          console.log("Raw API response:", data);

          // Log the actual categories returned to verify
          const returnedCategories = [
            ...new Set(questions.map((q) => q.category)),
          ];
          console.log("Categories in response:", returnedCategories);

          filteredData = questions;

          // If we don't have enough questions, log a warning
          if (filteredData.length < 10) {
            console.warn(
              `Only ${filteredData.length} questions available for category: ${category}`
            );
          }
        }

        // Always take exactly 10 questions, or as many as available
        filteredData = filteredData.slice(0, 10);

        console.log(`Final question count: ${filteredData.length}`);
        console.log("Full filteredData array:", filteredData);
        console.log("First item in array:", filteredData[0]);
        console.log("Type of first item:", typeof filteredData[0]);

        // Check if we have valid questions
        if (!filteredData || filteredData.length === 0) {
          console.error("No valid questions received");
          alert(
            "No questions available for this category. Please try a different category."
          );
          return;
        }

        // Validate the first question structure
        const firstQuestion = filteredData[0];
        console.log("First question structure:", firstQuestion);

        if (
          !firstQuestion ||
          !firstQuestion.correctAnswer ||
          !firstQuestion.incorrectAnswers
        ) {
          console.error("Invalid question structure:", firstQuestion);
          alert("Invalid question format received. Please try again.");
          return;
        }

        console.log("✅ Question validation passed, setting quiz state...");

        setQuestions(filteredData);
        console.log("✅ Questions set");

        setQuizStatus("in_progress");
        console.log("✅ Quiz status set to in_progress");

        setCurrentQuestionIndex(0);
        console.log("✅ Current question index set to 0");

        // Persist quiz state
        localStorage.setItem("triviaQuestions", JSON.stringify(filteredData));
        localStorage.setItem("quizStatus", "in_progress");
        localStorage.setItem("currentQuestionIndex", "0");
        console.log("✅ Quiz state persisted to localStorage");

        console.log("🔄 Calling shuffleOptionsForCurrentQuestion...");
        shuffleOptionsForCurrentQuestion(firstQuestion);
        console.log("✅ shuffleOptionsForCurrentQuestion completed");

        // Start quiz timer if in Blitz mode
        if (mode === "blitz") {
          console.log("🔄 Starting quiz timer for Blitz mode...");
          startQuizTimer(selectedBlitzTime);
          console.log("✅ Quiz timer started");
        }

        console.log("🎉 Quiz start process completed successfully!");
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        alert("Failed to load questions. Please try again.");
      });
  };

  // Shuffle options for the current question
  const shuffleOptionsForCurrentQuestion = (question) => {
    if (!question) {
      console.error("No question provided to shuffleOptionsForCurrentQuestion");
      return;
    }

    if (!question.correctAnswer || !question.incorrectAnswers) {
      console.error(
        "Invalid question structure in shuffleOptionsForCurrentQuestion:",
        question
      );
      return;
    }

    const options = [question.correctAnswer, ...question.incorrectAnswers];
    setShuffledOptions(options.sort(() => Math.random() - 0.5));
  };

  // Handle answer selection
  const handleAnswer = useCallback(
    async (selectedAnswer) => {
      // Clear timers for all modes except blitz (which runs for entire quiz)
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

      // Handle survival mode logic
      if (quizMode === "survival") {
        if (!isCorrect) {
          // Wrong answer - trim questions to only show answered ones
          const answeredQuestions = questions.slice(
            0,
            currentQuestionIndex + 1
          );
          setQuestions(answeredQuestions);
          localStorage.setItem(
            "triviaQuestions",
            JSON.stringify(answeredQuestions)
          );
          // End the quiz immediately
          handleQuizCompletion();
          return;
        }

        // Correct answer - increment correct count
        const currentCorrectCount = parseInt(
          localStorage.getItem("survivalCorrectCount") || "0"
        );
        const newCorrectCount = currentCorrectCount + 1;
        localStorage.setItem(
          "survivalCorrectCount",
          newCorrectCount.toString()
        );

        // Check if we need more questions (when we're near the end of current batch)
        const nextIndex = currentQuestionIndex + 1;

        if (nextIndex >= questions.length - 5) {
          // We're within 5 questions of the end, fetch more questions
          console.log("🔄 Approaching end of question batch, fetching more...");
          const additionalQuestions = await fetchQuestionBatch(50);

          if (additionalQuestions.length > 0) {
            const updatedQuestions = [...questions, ...additionalQuestions];
            setQuestions(updatedQuestions);
            localStorage.setItem(
              "triviaQuestions",
              JSON.stringify(updatedQuestions)
            );
            console.log(
              `✅ Added ${additionalQuestions.length} more questions`
            );
          }
        }

        // Move to next question
        if (nextIndex < questions.length) {
          setCurrentQuestionIndex(nextIndex);
          localStorage.setItem("currentQuestionIndex", nextIndex.toString());
          shuffleOptionsForCurrentQuestion(questions[nextIndex]);
          startSurvivalQuestionTimer();
        } else {
          // This shouldn't happen with the batch loading, but just in case
          console.error("No more questions available in survival mode");
          handleQuizCompletion();
        }
        return;
      }

      // Regular quiz logic for daily, blitz, and category modes
      if (currentQuestionIndex + 1 < questions.length) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);

        // Persist current question index
        localStorage.setItem("currentQuestionIndex", nextIndex.toString());

        shuffleOptionsForCurrentQuestion(questions[nextIndex]);
      } else {
        handleQuizCompletion();
      }
    },
    [
      quizMode,
      questions,
      currentQuestionIndex,
      handleQuizCompletion,
      startSurvivalQuestionTimer,
      bellSound,
    ]
  );

  // Store handleAnswer in ref so it can be accessed from timers
  useEffect(() => {
    handleAnswerRef.current = handleAnswer;
  }, [handleAnswer]);

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

              <div className="quiz-mode-card category-mode">
                <h3>🎯 Category Mode</h3>
                <p>Test your knowledge in specific topics!</p>

                {!showCategorySelection ? (
                  <>
                    <ul>
                      <li>Choose your favorite topic</li>
                      <li>10 questions from one category</li>
                      <li>Unlimited attempts</li>
                    </ul>
                    <div className="current-category-selection">
                      <span className="category-display">
                        {selectedCategory
                          ? categoryOptions.find(
                              (c) => c.value === selectedCategory
                            )?.icon +
                            " " +
                            categoryOptions.find(
                              (c) => c.value === selectedCategory
                            )?.label
                          : "🎯 Select Category"}
                      </span>
                    </div>
                    <div className="category-buttons">
                      <button
                        className="quiz-start-button category-button secondary"
                        onClick={() => setShowCategorySelection(true)}
                      >
                        Choose Category
                      </button>
                      <button
                        className="quiz-start-button category-button primary"
                        onClick={() => startQuiz("category", selectedCategory)}
                        disabled={!selectedCategory}
                      >
                        Start Category Quiz
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="category-selection">
                    <h4>Choose Your Category</h4>
                    <div className="category-options">
                      {categoryOptions.map((option) => (
                        <button
                          key={option.value}
                          className={`category-option ${
                            selectedCategory === option.value ? "selected" : ""
                          }`}
                          onClick={() => {
                            setSelectedCategory(option.value);
                            setShowCategorySelection(false);
                          }}
                        >
                          <div className="category-icon">{option.icon}</div>
                          <div className="category-label">{option.label}</div>
                        </button>
                      ))}
                    </div>
                    <div className="category-selection-actions">
                      <button
                        className="quiz-start-button category-button secondary"
                        onClick={() => setShowCategorySelection(false)}
                      >
                        Back
                      </button>
                      <button
                        className="quiz-start-button category-button primary"
                        onClick={() => startQuiz("category", selectedCategory)}
                        disabled={!selectedCategory}
                      >
                        Start Quiz
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="quiz-mode-card survival-mode">
                <h3>🏃 Survival Mode</h3>
                <p>How long can you survive?</p>
                <ul>
                  <li>15 seconds per question</li>
                  <li>Keep going until you get one wrong</li>
                  <li>Unlimited attempts</li>
                </ul>
                <button
                  className="quiz-start-button survival-button"
                  onClick={() => startQuiz("survival")}
                >
                  Start Survival Quiz
                </button>
              </div>
            </div>
          </div>
        );

      case "in_progress":
        return (
          <div className="quiz-content">
            <h2>
              {quizMode === "blitz"
                ? "⚡ Blitz Quiz"
                : quizMode === "category"
                ? (() => {
                    // Get category name from state or localStorage as fallback
                    const currentCategory =
                      quizCategory || localStorage.getItem("quizCategory");
                    console.log(
                      "🎯 Quiz title - currentCategory:",
                      currentCategory
                    );
                    const categoryLabel = currentCategory
                      ? categoryOptions.find((c) => c.value === currentCategory)
                          ?.label
                      : "Category";
                    console.log(
                      "🎯 Quiz title - categoryLabel:",
                      categoryLabel
                    );
                    return `🎯 ${categoryLabel} Quiz`;
                  })()
                : quizMode === "survival"
                ? "🏃 Survival Quiz"
                : "Daily Trivia Quiz"}
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
            {quizMode === "survival" && (
              <div className="quiz-timer">
                <div
                  className={`timer-circle ${
                    survivalQuestionTimer <= 5 ? "warning" : ""
                  }`}
                >
                  {survivalQuestionTimer}
                </div>
                <span>seconds remaining for this question</span>
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
