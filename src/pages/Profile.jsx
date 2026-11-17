import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../axiosConfig.js";
import { jwtDecode } from "jwt-decode";
import { formatTime } from "../utils/helpers.js";
import LoadingSpinner from "../components/LoadingSpinner";

// One card per mode. Survival has no 10-question cap, so it shows streaks instead.
const MODE_CARDS = [
  { mode: "daily", icon: "📅", title: "Daily Quiz" },
  { mode: "blitz", icon: "⚡", title: "Blitz Mode" },
  { mode: "category", icon: "🎯", title: "Category Quiz" },
  { mode: "survival", icon: "🏃", title: "Survival Mode" },
  { mode: "challenge", icon: "🎯", title: "Challenge Quiz" },
];

const MODE_BADGES = {
  daily: "📅 Daily",
  blitz: "⚡ Blitz",
  category: "🎯 Category",
  survival: "🏃 Survival",
  challenge: "🎯 Challenge",
};

const statRows = (mode, stats = {}) =>
  mode === "survival"
    ? [
        ["Total Taken:", stats.totalQuizzes || 0],
        ["Avg Score:", `${stats.averageScore || 0} correct`],
        ["Best Streak:", `${stats.bestScore || 0} correct`],
        ["Total Correct:", stats.totalCorrect || 0],
      ]
    : [
        ["Total Taken:", stats.totalQuizzes || 0],
        ["Avg Score:", `${stats.averageScore || 0}/10`],
        ["Best Score:", `${stats.bestScore || 0}/10`],
        ["Avg Time:", formatTime(stats.averageTime || 0)],
      ];

// Serves both /profile (your own) and /user/:userId (anyone's).
export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const currentUserId = token ? jwtDecode(token).id : null;
  const profileId = userId ?? currentUserId;
  const isOwnProfile = String(profileId) === String(currentUserId);

  useEffect(() => {
    setProfile(null);
    axiosInstance
      .get(`/api/users/${profileId}/profile`)
      .then(({ data }) => {
        setProfile(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. Please try again.");
      });
  }, [profileId]);

  const sendFriendRequest = async () => {
    try {
      await axiosInstance.post("/api/friends/add", { friendId: Number(profileId) });
      alert("Friend request sent!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send friend request. Please try again.");
    }
  };

  if (error || !profile) {
    return (
      <div className="content-container">
        <div className="quiz-content">
          {error ? <div className="error-message">{error}</div> : <LoadingSpinner />}
        </div>
      </div>
    );
  }

  const title = isOwnProfile ? "Your Profile" : `${profile.username}'s Profile`;
  const friendButton = !isOwnProfile && !profile.isFriend && (
    <button onClick={sendFriendRequest} className="primary-button friend-request-btn">
      Send Friend Request
    </button>
  );

  // The server only sends a name for private profiles you aren't friends with.
  if (!isOwnProfile && !profile.isPublic && !profile.isFriend) {
    return (
      <div className="content-container">
        <div className="quiz-content">
          <h1>{title}</h1>
          <div className="profile-section">
            <p>This profile is private. Send a friend request to view more details.</p>
            {friendButton}
          </div>
        </div>
      </div>
    );
  }

  const scores = profile.recentScores || [];
  const achievements = profile.achievements || [];
  const friends = profile.friends || [];

  return (
    <div className="content-container">
      <div className="quiz-content">
        <h1>{title}</h1>

        <div className="profile-section">
          <h3>Account Information</h3>
          <div className="profile-info">
            <p className="tile">
              <strong>Username:</strong> {profile.username}
            </p>
            {isOwnProfile && (
              <p className="tile">
                <strong>Email:</strong> {profile.email}
              </p>
            )}
            <p className="tile">
              <strong>Member Since:</strong>{" "}
              {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="profile-section">
          <h3>Quiz Statistics by Mode</h3>
          <div className="mode-stats-grid">
            {MODE_CARDS.map(({ mode, icon, title: cardTitle }) => (
              <div key={mode} className={`panel mode-stat-card ${mode}-stats`}>
                <div className="mode-stat-header">
                  <span className="mode-stat-icon">{icon}</span>
                  <h4>{cardTitle}</h4>
                </div>
                <div className="mode-stat-content">
                  {statRows(mode, profile.modeStats?.[mode]).map(([label, value]) => (
                    <div key={label} className="stat-row">
                      <span className="stat-label">{label}</span>
                      <span className="stat-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="profile-section">
          <h3>Recent Scores</h3>
          <div className="recent-scores">
            {scores.length > 0 ? (
              <ul>
                {scores.map((score, index) => (
                  <li key={index} className="tile">
                    <p>
                      <strong>Date:</strong> {new Date(score.date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Score:</strong>{" "}
                      {score.quiz_mode === "survival" ? score.score : `${score.score}/10`}
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
                          {MODE_BADGES[score.quiz_mode] || MODE_BADGES.daily}
                        </span>
                      </p>
                    )}
                    {score.quiz_mode === "category" && score.category_name && (
                      <p>
                        <strong>Category:</strong> {score.category_name}
                      </p>
                    )}
                    {score.quiz_mode === "challenge" && score.opponent_username && (
                      <>
                        <p>
                          <strong>Opponent:</strong> {score.opponent_username}
                        </p>
                        {score.won_challenge !== null && (
                          <p>
                            <strong>Result:</strong> {score.won_challenge ? "🏆 Won" : "❌ Lost"}
                          </p>
                        )}
                      </>
                    )}
                    {score.time_taken && (
                      <p>
                        <strong>Duration:</strong> {formatTime(score.time_taken)}
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
                <div key={achievement.name} className="panel nested achievement-item">
                  <div className="achievement-header">
                    <div className={`achievement-icon icon-${achievement.icon}`}></div>
                    <h4>{achievement.name}</h4>
                  </div>
                  <p>{achievement.description}</p>
                  <p className="achievement-date">
                    Earned: {new Date(achievement.date_achieved).toLocaleDateString()}
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
                  className="tile friend-card"
                  onClick={() => navigate(`/user/${friend.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <h3>{friend.username}</h3>
                  <p>Joined: {new Date(friend.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <p className="tile">{isOwnProfile ? "You have no friends added yet." : "No friends yet."}</p>
            )}
          </div>
        </div>

        {friendButton && <div className="profile-section">{friendButton}</div>}
      </div>
    </div>
  );
}
