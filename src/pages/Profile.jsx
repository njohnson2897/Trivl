import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosConfig.js";
import { jwtDecode } from "jwt-decode";
import { formatTime } from "../utils/helpers.js";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [scores, setScores] = useState([]);
  const [friends, setFriends] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem("token");
      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;

        const [
          userResponse,
          scoresResponse,
          friendsResponse,
          achievementsResponse,
        ] = await Promise.all([
          axiosInstance.get(`/api/users/${userId}`),
          axiosInstance.get(`/api/scores/${userId}`),
          axiosInstance.get(`/api/friends/${userId}`),
          axiosInstance.get(`/api/achievements/${userId}`),
        ]);

        setUserData(userResponse.data);
        setScores(scoresResponse.data.scores || []);
        setFriends(friendsResponse.data.friends || []);
        setAchievements(achievementsResponse.data || []);

        console.log("User Data:", userResponse.data);
        console.log("Scores Data:", scoresResponse.data);
        console.log("Friends Data:", friendsResponse.data);
        console.log("Achievements Data:", achievementsResponse.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        if (error.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="content-container">
        <div className="quiz-content">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalQuizzes = scores.length;
  const averageScore =
    scores.reduce((sum, score) => sum + score.quiz_score, 0) / totalQuizzes ||
    0;
  const bestScore = Math.max(...scores.map((score) => score.quiz_score), 0);
  const averageDuration =
    scores.reduce((sum, score) => sum + (score.time_taken || 0), 0) /
      totalQuizzes || 0;

  // Get the last 5 quizzes (sorted by most recent)
  const recentScores = [...scores]
    .sort((a, b) => new Date(b.date_taken) - new Date(a.date_taken))
    .slice(0, 5);

  return (
    <div className="content-container">
      <div className="quiz-content">
        <h1>Your Profile</h1>

        <div className="profile-section">
          <h3>Account Information</h3>
          <div className="profile-info">
            <p>
              <strong>Username:</strong> {userData?.username}
            </p>
            <p>
              <strong>Email:</strong> {userData?.email}
            </p>
            <p>
              <strong>Member Since:</strong>{" "}
              {new Date(userData?.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="profile-section">
          <h3>Quiz Statistics</h3>
          <div className="quiz-stats-grid">
            <div className="stat-card">
              <strong>{totalQuizzes}</strong>
              <p>Total Quizzes</p>
            </div>
            <div className="stat-card">
              <strong>{averageScore.toFixed(1)}</strong>
              <p>Average Score</p>
            </div>
            <div className="stat-card">
              <strong>{bestScore}</strong>
              <p>Best Score</p>
            </div>
            <div className="stat-card">
              <strong>{formatTime(averageDuration)}</strong>
              <p>Avg. Duration</p>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>Recent Scores</h3>
          <div className="recent-scores">
            {recentScores.length > 0 ? (
              <ul>
                {recentScores.map((score, index) => (
                  <li key={index}>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(score.date_taken).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Score:</strong> {score.quiz_score}/10
                    </p>
                    <p>
                      <strong>Difficulty:</strong> {score.quiz_difficulty}
                    </p>
                    <p>
                      <strong>Duration:</strong> {formatTime(score.time_taken)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No recent scores available.</p>
            )}
          </div>
        </div>

        <div className="profile-section">
          <h3>Recent Achievements</h3>
          <div className="recent-achievements">
            {achievements.length > 0 ? (
              achievements
                .filter((achievement) => achievement.achieved)
                .sort(
                  (a, b) =>
                    new Date(b.date_achieved) - new Date(a.date_achieved)
                )
                .slice(0, 3)
                .map((achievement) => (
                  <div key={achievement.name} className="achievement-item">
                    <div className="achievement-header">
                      <div
                        className={`achievement-icon icon-${achievement.icon}`}
                      ></div>
                      <h4>{achievement.name}</h4>
                    </div>
                    <p>{achievement.description}</p>
                    <p className="achievement-date">
                      Earned:{" "}
                      {new Date(achievement.date_achieved).toLocaleDateString()}
                    </p>
                  </div>
                ))
            ) : (
              <p>No achievements earned yet.</p>
            )}
          </div>
        </div>

        <div className="profile-section">
          <h3>Friends</h3>
          <div className="friends-grid">
            {friends.length > 0 ? (
              friends.map((friend) => (
                <div key={friend.id} className="friend-card">
                  <h3>{friend.username}</h3>
                  <p>
                    Joined: {new Date(friend.createdAt).toLocaleDateString()}
                  </p>
                  <button className="message-btn">Send Message</button>
                  <button className="challenge-btn">Challenge to Quiz</button>
                </div>
              ))
            ) : (
              <p>You have no friends added yet.</p>
            )}
          </div>
        </div>

        <button className="edit-profile-btn">Edit Profile</button>
      </div>
    </div>
  );
}
