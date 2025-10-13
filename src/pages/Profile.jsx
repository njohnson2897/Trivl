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

        const response = await axiosInstance.get(
          `/api/users/${userId}/profile`
        );
        const profileData = response.data;

        setUserData(profileData);
        setScores(profileData.recentScores || []);
        setFriends(profileData.friends || []);
        setAchievements(profileData.achievements || []);

        console.log("Profile Data:", profileData);
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

  // Calculate stats from the backend data
  const totalQuizzes = userData?.totalQuizzes || 0;
  const averageScore = userData?.averageScore || 0;
  const bestScore = userData?.highestScore || 0;
  const averageDuration = userData?.averageDuration || 0;

  const handleFriendClick = (friendId) => {
    navigate(`/user/${friendId}`);
  };

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
          <h3>Quiz Statistics by Mode</h3>

          <div className="mode-stats-grid">
            {/* Daily Quiz Stats */}
            <div className="mode-stat-card daily-stats">
              <div className="mode-stat-header">
                <span className="mode-stat-icon">📅</span>
                <h4>Daily Quiz</h4>
              </div>
              <div className="mode-stat-content">
                <div className="stat-row">
                  <span className="stat-label">Total Taken:</span>
                  <span className="stat-value">
                    {userData?.modeStats?.daily?.totalQuizzes || 0}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Avg Score:</span>
                  <span className="stat-value">
                    {userData?.modeStats?.daily?.averageScore || 0}/10
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Best Score:</span>
                  <span className="stat-value">
                    {userData?.modeStats?.daily?.bestScore || 0}/10
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Avg Time:</span>
                  <span className="stat-value">
                    {formatTime(userData?.modeStats?.daily?.averageTime || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Blitz Mode Stats */}
            <div className="mode-stat-card blitz-stats">
              <div className="mode-stat-header">
                <span className="mode-stat-icon">⚡</span>
                <h4>Blitz Mode</h4>
              </div>
              <div className="mode-stat-content">
                <div className="stat-row">
                  <span className="stat-label">Total Taken:</span>
                  <span className="stat-value">
                    {userData?.modeStats?.blitz?.totalQuizzes || 0}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Avg Score:</span>
                  <span className="stat-value">
                    {userData?.modeStats?.blitz?.averageScore || 0}/10
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Best Score:</span>
                  <span className="stat-value">
                    {userData?.modeStats?.blitz?.bestScore || 0}/10
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Avg Time:</span>
                  <span className="stat-value">
                    {formatTime(userData?.modeStats?.blitz?.averageTime || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Category Quiz Stats */}
            <div className="mode-stat-card category-stats">
              <div className="mode-stat-header">
                <span className="mode-stat-icon">🎯</span>
                <h4>Category Quiz</h4>
              </div>
              <div className="mode-stat-content">
                <div className="stat-row">
                  <span className="stat-label">Total Taken:</span>
                  <span className="stat-value">
                    {userData?.modeStats?.category?.totalQuizzes || 0}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Avg Score:</span>
                  <span className="stat-value">
                    {userData?.modeStats?.category?.averageScore || 0}/10
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Best Score:</span>
                  <span className="stat-value">
                    {userData?.modeStats?.category?.bestScore || 0}/10
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Avg Time:</span>
                  <span className="stat-value">
                    {formatTime(
                      userData?.modeStats?.category?.averageTime || 0
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Survival Mode Stats */}
            <div className="mode-stat-card survival-stats">
              <div className="mode-stat-header">
                <span className="mode-stat-icon">🏃</span>
                <h4>Survival Mode</h4>
              </div>
              <div className="mode-stat-content">
                <div className="stat-row">
                  <span className="stat-label">Total Taken:</span>
                  <span className="stat-value">
                    {userData?.modeStats?.survival?.totalQuizzes || 0}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Avg Score:</span>
                  <span className="stat-value">
                    {userData?.modeStats?.survival?.averageScore || 0} correct
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Best Streak:</span>
                  <span className="stat-value">
                    {userData?.modeStats?.survival?.bestScore || 0} correct
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Total Correct:</span>
                  <span className="stat-value">
                    {userData?.modeStats?.survival?.totalCorrect || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>Recent Scores</h3>
          <div className="recent-scores">
            {scores.length > 0 ? (
              <ul>
                {scores.map((score, index) => (
                  <li key={index}>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(score.date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Score:</strong>{" "}
                      {score.quiz_mode === "survival"
                        ? score.score
                        : `${score.score}/10`}
                    </p>
                    {score.difficulty && (
                      <p>
                        <strong>Difficulty:</strong> {score.difficulty}
                      </p>
                    )}
                    {score.quiz_mode && (
                      <p>
                        <strong>Mode:</strong>{" "}
                        <span className={`quiz-mode-badge ${score.quiz_mode}`}>
                          {score.quiz_mode === "blitz"
                            ? "⚡ Blitz"
                            : score.quiz_mode === "category"
                            ? "🎯 Category"
                            : score.quiz_mode === "survival"
                            ? "🏃 Survival"
                            : "📅 Daily"}
                        </span>
                      </p>
                    )}
                    {score.quiz_mode === "category" && score.category_name && (
                      <p>
                        <strong>Category:</strong> {score.category_name}
                      </p>
                    )}
                    {score.time_taken && (
                      <p>
                        <strong>Duration:</strong>{" "}
                        {formatTime(score.time_taken)}
                      </p>
                    )}
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
              achievements.map((achievement) => (
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
                <div
                  key={friend.id}
                  className="friend-card"
                  onClick={() => handleFriendClick(friend.id)}
                  style={{ cursor: "pointer" }}
                >
                  <h3>{friend.username}</h3>
                  <p>
                    Joined: {new Date(friend.createdAt).toLocaleDateString()}
                  </p>
                  <button
                    className="message-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement messaging
                    }}
                  >
                    Send Message
                  </button>
                  <button
                    className="challenge-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement challenge
                    }}
                  >
                    Challenge to Quiz
                  </button>
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
