import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import LoadingSpinner from "../components/LoadingSpinner";

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to view achievements");
          setLoading(false);
          return;
        }

        const decoded = jwtDecode(token);
        const response = await axios.get(
          `http://localhost:5000/api/achievements/${decoded.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setAchievements(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch achievements");
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <div className="content-container">
        <div className="quiz-content">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-container">
        <div className="quiz-content">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="quiz-content">
        <h1>Achievements</h1>

        <div className="achievements-grid">
          {achievements.map((achievement) => (
            <div
              key={achievement.name}
              className={`achievement-card ${
                !achievement.achieved ? "not-achieved" : ""
              }`}
            >
              <div
                className={`achievement-icon icon-${achievement.icon}`}
              ></div>
              <div className="achievement-info">
                <h3>{achievement.name}</h3>
                <p>{achievement.description}</p>
                {achievement.date_achieved && (
                  <p className="achievement-date">
                    Achieved on:{" "}
                    {new Date(achievement.date_achieved).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {achievements.length === 0 && (
          <div className="empty-state">
            <p>No achievements yet. Keep playing to earn achievements!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;
