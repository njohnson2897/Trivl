export default function Instructions() {
  return (
    <div className="content-container">
      <div className="instructions-container">
        <h1>How to Play</h1>

        <section className="getting-started">
          <h2>Getting Started</h2>
          <ul>
            <li>Sign up or log in to access all features.</li>
            <li>Explore quizzes via the home page or categories.</li>
            <li>Choose a quiz, read the description, and hit "Start" to begin.</li>
          </ul>
        </section>

        <section className="gameplay-basics">
          <h2>Gameplay Basics</h2>
          <ul>
            <li>Read each question carefully.</li>
            <li>Select the answer you think is correct.</li>
            <li>You will automatically be moved to the next question.</li>
            <li>Finish all questions to see your score and review correct answers.</li>
          </ul>
        </section>

        <section className="scoring-system">
          <h2>Scoring System</h2>
          <ul>
            <li><strong>Correct Answer:</strong> +10 points.</li>
            <li><strong>Incorrect Answer:</strong> 0 points.</li>
            <li>Check the leaderboard to see how you rank against others!</li>
          </ul>
        </section>

        <section className="achievements">
          <h2>Achievements</h2>
          <ul>
            <li>Complete 10 quizzes to unlock the "Quiz Master" badge.</li>
            <li>Score 1000 total points for the "High Scorer" badge.</li>
            <li>Play every category to unlock the "Trivia Explorer" badge.</li>
          </ul>
          <p>Check the Achievements page to see all possible awards!</p>
        </section>

        <section className="tips-for-success">
          <h2>Tips for Success</h2>
          <ul>
            <li>Use the leaderboard to track top-performing players for motivation.</li>
            <li>Revisit completed quizzes to improve your knowledge.</li>
            <li>Start with easier categories and work your way up to the harder ones.</li>
          </ul>
        </section>

        <section className="need-help">
          <h2>Need Help?</h2>
          <p>
            Visit the <a href="/help">Help/Support</a> page for assistance or contact our support team for more detailed inquiries.
          </p>
        </section>
      </div>
    </div>
  );
}