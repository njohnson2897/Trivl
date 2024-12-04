// Example list of achievements with "achieved" status
const achievementsList = [
  { id: 1, name: "Trivia Rookie", achieved: true },
  { id: 2, name: "Streak Starter", achieved: true },
  { id: 3, name: "High Scorer", achieved: false },
  { id: 4, name: "Quick Thinker", achieved: false },
  { id: 5, name: "Trivia Champ", achieved: true },
  { id: 6, name: "Perfect Round", achieved: false },
  { id: 7, name: "Night Owl", achieved: true },
  { id: 8, name: "Early Bird", achieved: false },
  { id: 9, name: "Mastermind", achieved: false },
  { id: 10, name: "Unstoppable", achieved: false },
  { id: 11, name: "Explorer", achieved: true },
  { id: 12, name: "Lucky Guess", achieved: false },
  { id: 13, name: "Speed Demon", achieved: false },
  { id: 14, name: "Completionist", achieved: false },
  { id: 15, name: "Comeback King", achieved: true },
];

export default function Achievements() {
  return (
    <div className="content-container">
      <div className="quiz-content">
        <h1 className='mb-4'>Your Achievements</h1>
        <div className="achievements-grid">
          {achievementsList.map((achievement) => (
            <div
              key={achievement.id}
              className={`achievement-card ${
                achievement.achieved ? "achieved" : "not-achieved"
              }`}
            >
              <div className="star-icon"></div>
              <p>{achievement.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
