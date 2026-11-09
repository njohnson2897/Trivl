import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../axiosConfig.js";
import bell from "../assets/button_click.mp3";
import { CATEGORIES, findCategory, getCategoryLabel } from "../utils/categories.js";

// The only quiz state kept in the browser: which session to resume after a refresh.
const SESSION_KEY = "quizSessionId";

const BLITZ_TIME_OPTIONS = [
  { value: 30, description: "Lightning fast!" },
  { value: 60, description: "Quick challenge" },
  { value: 120, description: "Balanced pace" },
  { value: 180, description: "More time to think" },
];

const QUIZ_TITLES = {
  daily: "Daily Trivia Quiz",
  blitz: "⚡ Blitz Quiz",
  survival: "🏃 Survival Quiz",
  challenge: "🎯 Challenge Quiz",
  zen: "🧘 Zen Practice",
};

const formatSeconds = (seconds) => (seconds < 60 ? `${seconds}s` : `${seconds / 60}m`);

const formatCountdown = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m ${totalSeconds % 60}s`;
};

export default function Quiz() {
  const [session, setSession] = useState(null); // the quiz in progress, as the server sent it
  const [secondsLeft, setSecondsLeft] = useState(null); // Blitz/Survival countdown
  const [cooldownEnds, setCooldownEnds] = useState(null); // when the next daily quiz opens
  const [now, setNow] = useState(Date.now());
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [selectedBlitzTime, setSelectedBlitzTime] = useState(60);
  const [showBlitzTimeSelection, setShowBlitzTimeSelection] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const [showFriendSelection, setShowFriendSelection] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const submittingRef = useRef(false); // ignore extra clicks while an answer is in flight
  const navigate = useNavigate();
  const location = useLocation();
  const bellSound = useMemo(() => new Audio(bell), []);

  // Every server response goes through here: keep playing, or go to results.
  const showSession = useCallback(
    (data) => {
      if (data.finished) {
        localStorage.removeItem(SESSION_KEY);
        navigate(`/results/${data.id}`);
      } else {
        localStorage.setItem(SESSION_KEY, data.id);
        setSession(data);
      }
    },
    [navigate]
  );

  const startQuiz = useCallback(
    async (options) => {
      try {
        const { data } = await axiosInstance.post("/api/quiz-sessions", options);
        showSession(data);
      } catch (error) {
        alert(error.response?.data?.error || "Failed to start the quiz. Please try again.");
      }
    },
    [showSession]
  );

  const submitAnswer = useCallback(
    async (answer) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      bellSound.currentTime = 0;
      bellSound.play().catch(() => {});

      try {
        const { data } = await axiosInstance.post(`/api/quiz-sessions/${session.id}/answer`, {
          answer,
        });
        showSession(data);
      } catch (error) {
        alert(error.response?.data?.error || "Failed to submit your answer. Please try again.");
      } finally {
        submittingRef.current = false;
      }
    },
    [session, bellSound, showSession]
  );

  // Resume a quiz in progress after a refresh.
  useEffect(() => {
    const savedId = localStorage.getItem(SESSION_KEY);
    if (!savedId) return;
    axiosInstance
      .get(`/api/quiz-sessions/${savedId}`)
      .then(({ data }) => (data.finished ? localStorage.removeItem(SESSION_KEY) : setSession(data)))
      .catch(() => localStorage.removeItem(SESSION_KEY));
  }, []);

  // Accepting a challenge (from Header or Notifications) navigates here with its id.
  const acceptedChallengeId = location.state?.challengeId;
  useEffect(() => {
    if (!acceptedChallengeId) return;
    navigate("/", { replace: true }); // so a refresh or Back doesn't start it again
    startQuiz({ mode: "challenge", challengeId: acceptedChallengeId });
  }, [acceptedChallengeId, navigate, startQuiz]);

  // Logging in or out abandons whatever quiz was on screen.
  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
      setSession(null);
      localStorage.removeItem(SESSION_KEY);
    };
    window.addEventListener("userLogin", handleAuthChange);
    window.addEventListener("userLogout", handleAuthChange);
    return () => {
      window.removeEventListener("userLogin", handleAuthChange);
      window.removeEventListener("userLogout", handleAuthChange);
    };
  }, []);

  // Daily cooldown (logged-in players only; logged-out players can replay).
  useEffect(() => {
    if (!isLoggedIn) {
      setCooldownEnds(null);
      return;
    }
    axiosInstance
      .get("/api/users/cooldown")
      .then(({ data }) => setCooldownEnds(data.canTakeQuiz ? null : Date.now() + data.timeRemaining))
      .catch(() => setCooldownEnds(null));
  }, [isLoggedIn]);

  // Tick once a second while the cooldown countdown is showing.
  useEffect(() => {
    if (!cooldownEnds) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [cooldownEnds]);

  // Blitz and Survival: count down to the server's deadline, then submit "no answer".
  // The server enforces the real limit; this is just the on-screen clock.
  useEffect(() => {
    if (session?.timeRemaining == null) {
      setSecondsLeft(null);
      return;
    }
    const deadline = Date.now() + session.timeRemaining;
    const tick = () => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) {
        clearInterval(timer);
        submitAnswer(null);
      }
    };
    const timer = setInterval(tick, 250);
    tick();
    return () => clearInterval(timer);
  }, [session, submitAnswer]);

  const fetchFriends = async () => {
    try {
      const response = await axiosInstance.get("/api/friends/list");
      setFriends(response.data.friends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      setFriends([]);
    }
  };

  const createChallenge = async (friendId) => {
    try {
      const { data } = await axiosInstance.post("/api/challenges/create", {
        challengedId: friendId,
      });
      setShowFriendSelection(false);
      startQuiz({ mode: "challenge", challengeId: data.challenge.id });
    } catch (error) {
      alert(error.response?.data?.error || "Failed to create challenge. Please try again.");
    }
  };

  // --- Playing --------------------------------------------------------------

  if (session) {
    const { mode, settings, index, question } = session;
    return (
      <div className="content-container">
        <div className="quiz-content">
          <h2>
            {mode === "category"
              ? `🎯 ${getCategoryLabel(settings.category)} Quiz`
              : QUIZ_TITLES[mode]}
          </h2>
          {secondsLeft !== null && (
            <div className="quiz-timer">
              <div
                className={`timer-circle ${
                  secondsLeft <= (mode === "blitz" ? 10 : 5) ? "warning" : ""
                }`}
              >
                {secondsLeft}
              </div>
              <span>
                {mode === "blitz"
                  ? "seconds remaining for entire quiz"
                  : "seconds remaining for this question"}
              </span>
            </div>
          )}
          <div className="question-block">
            <p>{`Question ${index + 1}: ${question.question}`}</p>
            {question.options.map((option) => (
              <button key={option} onClick={() => submitAnswer(option)}>
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Choosing a mode ------------------------------------------------------

  const cooldownLeft = cooldownEnds ? cooldownEnds - now : 0;
  const dailyOnCooldown = cooldownLeft > 0;

  return (
    <div className="content-container">
      <div className="quiz-start-container">
        <h2 className="quiz-start-title">Choose Your Quiz Mode</h2>
        <div className="quiz-mode-selection">
          <div className={`quiz-mode-card daily-mode ${dailyOnCooldown ? "cooldown" : ""}`}>
            <h3>Daily Quiz</h3>
            <p>Take your time with each question</p>
            <ul>
              <li>No time limit per question</li>
              <li>10 random questions</li>
              <li>Once per day</li>
            </ul>
            {dailyOnCooldown ? (
              <div className="cooldown-info">
                <div className="cooldown-timer">
                  <strong>Next Quiz is Available In:</strong>
                  <span className="timer-display">{formatCountdown(cooldownLeft)}</span>
                </div>
                <button className="quiz-start-button disabled" disabled>
                  Come Back Tomorrow
                </button>
              </div>
            ) : (
              <button
                className="quiz-start-button daily-button"
                onClick={() => startQuiz({ mode: "daily" })}
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
                  <span className="time-display">{formatSeconds(selectedBlitzTime)}</span>
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
                    onClick={() => startQuiz({ mode: "blitz", timeLimit: selectedBlitzTime })}
                  >
                    Start Blitz Quiz
                  </button>
                </div>
              </>
            ) : (
              <div className="time-selection">
                <h4>Choose Your Time Limit</h4>
                <div className="time-options">
                  {BLITZ_TIME_OPTIONS.map((option) => (
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
                      <div className="time-value">{formatSeconds(option.value)}</div>
                      <div className="time-description">{option.description}</div>
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
                    onClick={() => startQuiz({ mode: "blitz", timeLimit: selectedBlitzTime })}
                  >
                    Start Quiz
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="quiz-mode-card zen-mode">
            <h3>🧘 Zen Practice</h3>
            <p>Practice in a relaxed mode.</p>
            <ul>
              <li>No time limit</li>
              <li>10 random questions</li>
              <li>Scores are not saved</li>
            </ul>
            <button
              className="quiz-start-button zen-button"
              onClick={() => startQuiz({ mode: "zen" })}
            >
              Start Zen Practice
            </button>
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
                      ? `${findCategory(selectedCategory)?.icon} ${getCategoryLabel(selectedCategory)}`
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
                    onClick={() => startQuiz({ mode: "category", category: selectedCategory })}
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
                  {CATEGORIES.map((option) => (
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
                    onClick={() => startQuiz({ mode: "category", category: selectedCategory })}
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
              onClick={() => startQuiz({ mode: "survival" })}
            >
              Start Survival Quiz
            </button>
          </div>

          <div className={`quiz-mode-card challenge-mode ${!isLoggedIn ? "disabled" : ""}`}>
            <h3>🎯 Challenge Your Friends</h3>
            <p>Test your knowledge against your friends!</p>
            {!showFriendSelection || !isLoggedIn ? (
              <>
                <ul>
                  <li>Same 10 questions for both players</li>
                  <li>Winner based on score</li>
                  <li>Time tiebreaker</li>
                </ul>
                {isLoggedIn ? (
                  <button
                    className="quiz-start-button challenge-button"
                    onClick={() => {
                      fetchFriends();
                      setShowFriendSelection(true);
                    }}
                  >
                    Challenge a Friend
                  </button>
                ) : (
                  <button className="quiz-start-button disabled" disabled>
                    Log in to Challenge Friends
                  </button>
                )}
              </>
            ) : (
              <div className="friend-selection">
                <h4>Choose a Friend to Challenge</h4>
                {friends.length === 0 ? (
                  <div className="no-friends">
                    <p>You don&apos;t have any friends added yet.</p>
                    <button
                      className="quiz-start-button challenge-button secondary"
                      onClick={() => setShowFriendSelection(false)}
                    >
                      Back
                    </button>
                    <button
                      className="quiz-start-button challenge-button primary"
                      onClick={() => navigate("/friends")}
                    >
                      Add Friends
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="friends-list">
                      {friends.map((friend) => (
                        <button
                          key={friend.id}
                          className={`friend-option ${
                            selectedFriend === friend.id ? "selected" : ""
                          }`}
                          onClick={() => setSelectedFriend(friend.id)}
                        >
                          {friend.username}
                        </button>
                      ))}
                    </div>
                    <div className="friend-selection-actions">
                      <button
                        className="quiz-start-button challenge-button secondary"
                        onClick={() => {
                          setShowFriendSelection(false);
                          setSelectedFriend(null);
                        }}
                      >
                        Back
                      </button>
                      <button
                        className="quiz-start-button challenge-button primary"
                        onClick={() => selectedFriend && createChallenge(selectedFriend)}
                        disabled={!selectedFriend}
                      >
                        Start Challenge
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
