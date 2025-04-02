export default function Instructions() {
  return (
    <div className="content-container">
      <div className="instructions-container">
        <h1>How to Play Trivl</h1>
        
        <div className="instructions-section">
          <h2>Game Overview</h2>
          <p>
            Trivl is a daily trivia challenge where you answer 10 questions each day.
            Test your knowledge, compete with friends, and track your progress!
          </p>
        </div>

        <div className="instructions-section">
          <h2>Gameplay</h2>
          <ul className="instructions-list">
            <li>Each quiz consists of 10 random questions</li>
            <li>You have unlimited time to answer each question</li>
            <li>Select your answer by clicking on it</li>
            <li>You'll see your results immediately after completing the quiz</li>
          </ul>
        </div>

        <div className="instructions-section">
          <h2>Scoring System</h2>
          <table className="scoring-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Correct Answer</td>
                <td>+10 points</td>
              </tr>
              <tr>
                <td>Incorrect Answer</td>
                <td>0 points</td>
              </tr>
              <tr>
                <td>Perfect Score (10/10)</td>
                <td>Bonus 20 points</td>
              </tr>
              <tr>
                <td>Fast Completion (Less than 3 min)</td>
                <td>Bonus 10 points</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="instructions-section">
          <h2>Tips</h2>
          <ul className="instructions-list">
            <li>Read questions carefully before answering</li>
            <li>Play daily to maintain your streak</li>
            <li>Check the leaderboard to see how you compare</li>
            <li>Challenge friends to beat your scores</li>
          </ul>
        </div>
      </div>
    </div>
  );
}