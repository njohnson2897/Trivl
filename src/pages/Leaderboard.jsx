import React, { useState } from "react";

const users = [
  { id: 1, username: "QuizMaster99", lifetimeScore: 45000, averageScore: 87 },
  { id: 2, username: "TriviaQueen", lifetimeScore: 32000, averageScore: 92 },
  { id: 3, username: "SmartyPants", lifetimeScore: 27000, averageScore: 85 },
  { id: 4, username: "Brainiac123", lifetimeScore: 51000, averageScore: 88 },
  { id: 5, username: "QuickThinker", lifetimeScore: 38000, averageScore: 80 },
  { id: 6, username: "KnowledgeKing", lifetimeScore: 61000, averageScore: 91 },
  { id: 7, username: "FastLearner", lifetimeScore: 33000, averageScore: 84 },
  { id: 8, username: "TheTriviaKid", lifetimeScore: 15000, averageScore: 78 },
  { id: 9, username: "QuizWhiz", lifetimeScore: 42000, averageScore: 89 },
  { id: 10, username: "ThinkTank", lifetimeScore: 29000, averageScore: 86 },
];

export default function Leaderboard() {
  const [filter, setFilter] = useState("lifetimeScore");

  const sortedUsers = [...users].sort((a, b) => b[filter] - a[filter]);

  return (
    <div className="content-container">
      <div className="quiz-content">
        <h2>Leaderboard</h2>
        <div className="filter-container">
          <label htmlFor="filter">Sort By:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="lifetimeScore">Lifetime Score</option>
            <option value="averageScore">Average Score</option>
          </select>
        </div>
        <div className="leaderboard-grid">
          {sortedUsers.map((user) => (
            <div key={user.id} className="leaderboard-card">
              <h3>{user.username}</h3>
              <p>Lifetime Score: {user.lifetimeScore}</p>
              <p>Average Score: {user.averageScore}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
