export default function Instructions() {
  return (
    <div className="content-container">
      <div className="quiz-content">
        <h2>How to Play</h2>
        <div className="instructions-section">
          <h3>Getting Started</h3>
          <p>
            Welcome to our game! Here's how to dive in:
          </p>
          <ul>
            <li>Sign up or log in to access all features.</li>
            <li>Explore quizzes via the home page or categories.</li>
            <li>Choose a quiz, read the description, and hit "Start" to begin.</li>
          </ul>
        </div>

        <div className="instructions-section">
          <h3>Gameplay Basics</h3>
          <p>
            During each quiz, you’ll be presented with questions and multiple-choice answers. 
            Here’s how it works:
          </p>
          <ul>
            <li>Read each question carefully.</li>
            <li>Select the answer you think is correct.</li>
            <li>You will automatically be moved to the next question</li>
            <li>Finish all questions to see your score and review correct answers.</li>
          </ul>
        </div>

        <div className="instructions-section">
          <h3>Scoring System</h3>
          <p>
            Earn points based on your performance:
          </p>
          <ul>
            <li><strong>Correct Answer:</strong> +10 points.</li>
            <li><strong>Incorrect Answer:</strong> 0 points.</li>
            <li>Check the leaderboard to see how you rank against others!</li>
          </ul>
        </div>

        <div className="instructions-section">
          <h3>Achievements</h3>
          <p>
            Unlock achievements by completing quizzes and reaching milestones:
          </p>
          <ul>
            <li>Complete 10 quizzes to unlock the "Quiz Master" badge.</li>
            <li>Score 1000 total points for the "High Scorer" badge.</li>
            <li>Play every category to unlock the "Trivia Explorer" badge.</li>
          </ul>
          <p>Check the Achievements page to see all possible awards!</p>
        </div>

        <div className="instructions-section">
          <h3>Tips for Success</h3>
          <ul>
            <li>Use the leaderboard to track top-performing players for motivation.</li>
            <li>Revisit completed quizzes to improve your knowledge.</li>
            <li>Start with easier categories and work your way up to the harder ones.</li>
          </ul>
        </div>

        <div className="instructions-section">
          <h3>Need Help?</h3>
          <p>
            Visit the <a href="/help">Help/Support</a> page for assistance or contact our support team for more detailed inquiries.
          </p>
        </div>
      </div>
    </div>
  );
}
