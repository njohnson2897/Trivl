export default function Instructions() {
  return (
    <div className="content-container">
      <div className="quiz-content instructions-page">
        <h1>How to Play Trivl</h1>

        <div className="instructions-intro">
          <p>
            Trivl offers multiple quiz modes to test your knowledge! Choose from
            daily challenges, fast-paced blitz rounds, category-specific
            quizzes, or test your endurance in survival mode.
          </p>
        </div>

        <div className="game-modes-grid">
          {/* Daily Quiz */}
          <div className="mode-card daily-card">
            <div className="mode-header">
              <span className="mode-icon">📅</span>
              <h2>Daily Quiz</h2>
            </div>
            <div className="mode-description">
              <p>
                The Wordle of trivia! Everyone gets the same 10 questions each
                day.
              </p>
              <ul className="mode-features">
                <li>10 questions per day</li>
                <li>No time limit per question</li>
                <li>Resets at midnight Central Time</li>
                <li>Once per day challenge</li>
                <li>Compete with friends on identical questions</li>
              </ul>
              <div className="mode-scoring">
                <strong>Scoring:</strong> Simple count out of 10 (e.g., 7/10)
              </div>
            </div>
          </div>

          {/* Blitz Mode */}
          <div className="mode-card blitz-card">
            <div className="mode-header">
              <span className="mode-icon">⚡</span>
              <h2>Blitz Mode</h2>
            </div>
            <div className="mode-description">
              <p>Race against the clock!</p>
              <ul className="mode-features">
                <li>10 random questions</li>
                <li>Choose your time limit: 30s, 60s, or 90s</li>
                <li>Total time for entire quiz</li>
                <li>Unlimited attempts</li>
                <li>Answer as many as you can before time runs out</li>
              </ul>
              <div className="mode-scoring">
                <strong>Scoring:</strong> Number correct out of 10
              </div>
            </div>
          </div>

          {/* Category Quiz */}
          <div className="mode-card category-card">
            <div className="mode-header">
              <span className="mode-icon">🎯</span>
              <h2>Category Quiz</h2>
            </div>
            <div className="mode-description">
              <p>Master your favorite topics!</p>
              <ul className="mode-features">
                <li>10 questions from chosen category</li>
                <li>No time limit per question</li>
                <li>Multiple categories available</li>
                <li>Unlimited attempts</li>
                <li>Perfect for practicing specific subjects</li>
              </ul>
              <div className="mode-scoring">
                <strong>Scoring:</strong> Number correct out of 10
              </div>
            </div>
          </div>

          {/* Survival Mode */}
          <div className="mode-card survival-card">
            <div className="mode-header">
              <span className="mode-icon">🏃</span>
              <h2>Survival Mode</h2>
            </div>
            <div className="mode-description">
              <p>How long can you survive?</p>
              <ul className="mode-features">
                <li>Unlimited questions</li>
                <li>15 seconds per question</li>
                <li>One mistake ends the game</li>
                <li>Unlimited attempts</li>
                <li>Questions keep coming until you get one wrong</li>
              </ul>
              <div className="mode-scoring">
                <strong>Scoring:</strong> Total number of correct answers (e.g.,
                23)
              </div>
            </div>
          </div>
        </div>

        <div className="instructions-section">
          <h2>🎮 How to Play</h2>
          <div className="gameplay-steps">
            <div className="step">
              <span className="step-number">1</span>
              <div className="step-content">
                <h3>Choose Your Mode</h3>
                <p>
                  Select from Daily, Blitz, Category, or Survival mode on the
                  quiz page
                </p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <div className="step-content">
                <h3>Read & Answer</h3>
                <p>
                  Carefully read each question and select your answer from the
                  options
                </p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <div className="step-content">
                <h3>Track Progress</h3>
                <p>
                  Your answers are saved automatically - you can close and
                  return anytime
                </p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">4</span>
              <div className="step-content">
                <h3>View Results</h3>
                <p>
                  See your score, review answers, and track your progress over
                  time
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="instructions-section">
          <h2>💡 Pro Tips</h2>
          <div className="tips-grid">
            <div className="tip-card">
              <span className="tip-icon">🔥</span>
              <h3>Build Your Streak</h3>
              <p>
                Take the Daily Quiz every day to maintain your streak and
                compete with friends
              </p>
            </div>
            <div className="tip-card">
              <span className="tip-icon">⏱️</span>
              <h3>Master Blitz Mode</h3>
              <p>
                Start with 90 seconds to get comfortable, then challenge
                yourself with shorter times
              </p>
            </div>
            <div className="tip-card">
              <span className="tip-icon">📚</span>
              <h3>Practice Categories</h3>
              <p>
                Use Category Quiz to strengthen weak areas and become a trivia
                master
              </p>
            </div>
            <div className="tip-card">
              <span className="tip-icon">🎯</span>
              <h3>Survival Strategy</h3>
              <p>
                Read quickly but carefully - you have 15 seconds, but accuracy
                is everything!
              </p>
            </div>
          </div>
        </div>

        <div className="instructions-section">
          <h2>📊 Tracking Your Progress</h2>
          <ul className="instructions-list">
            <li>
              <strong>Quiz History:</strong> View all your completed quizzes,
              filter by mode, and track improvement
            </li>
            <li>
              <strong>Profile Stats:</strong> See your total quizzes, average
              score, best score, and average duration
            </li>
            <li>
              <strong>Achievements:</strong> Unlock achievements for milestones
              and special accomplishments
            </li>
            <li>
              <strong>Leaderboard:</strong> Compare your scores with friends and
              other players
            </li>
          </ul>
        </div>

        <div className="instructions-section faq-section">
          <h2>❓ Frequently Asked Questions</h2>
          <div className="faq-item">
            <h3>What happens if I close the page during a quiz?</h3>
            <p>
              Don't worry! Your progress is automatically saved. When you
              return, you can continue from where you left off.
            </p>
          </div>
          <div className="faq-item">
            <h3>Can I retake the Daily Quiz?</h3>
            <p>
              The Daily Quiz can only be taken once per day. It resets at
              midnight Central Time for everyone.
            </p>
          </div>
          <div className="faq-item">
            <h3>Do I need an account to play?</h3>
            <p>
              No! You can play without an account, but creating one lets you
              track your progress, earn achievements, and compete on
              leaderboards.
            </p>
          </div>
          <div className="faq-item">
            <h3>What's the difference between logged in and not logged in?</h3>
            <p>
              Everyone gets the same Daily Quiz questions! Logged-in users can
              track progress across devices, while non-logged-in users' progress
              is saved locally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
