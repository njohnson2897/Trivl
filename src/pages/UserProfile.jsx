import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosConfig.js";
import { jwtDecode } from "jwt-decode";

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const decodedToken = jwtDecode(token);
        const currentUserId = decodedToken.id;

        // Check if this is the user's own profile
        setIsOwnProfile(userId === currentUserId);

        // Fetch the profile data
        const response = await axiosInstance.get(
          `/api/users/${userId}/profile`
        );
        const profileData = response.data;

        setProfile(profileData);
        setIsPublic(profileData.isPublic);
        setIsFriend(profileData.isFriend);

        setError(null);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleSendFriendRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const currentUserId = decodedToken.id;

      await axiosInstance.post("/api/friends/add", {
        userId: currentUserId,
        friendId: userId,
      });

      alert("Friend request sent!");
    } catch (err) {
      console.error("Error sending friend request:", err);
      alert("Failed to send friend request. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="content-container">
        <div className="quiz-content">
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-container">
        <div className="quiz-content">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  // If profile is private and user is not a friend, show limited view
  if (!isPublic && !isFriend && !isOwnProfile) {
    return (
      <div className="content-container">
        <div className="quiz-content">
          <h1>{profile.username}'s Profile</h1>
          <div className="profile-section">
            <p>
              This profile is private. Send a friend request to view more
              details.
            </p>
            <button
              onClick={handleSendFriendRequest}
              className="friend-request-btn"
            >
              Send Friend Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="quiz-content">
        <h1>{profile.username}'s Profile</h1>

        {/* Basic Info Section */}
        <div className="profile-section">
          <h3>Basic Information</h3>
          <div className="profile-info">
            <p>
              <strong>Member since:</strong>{" "}
              {new Date(profile.createdAt).toLocaleDateString()}
            </p>
            {isOwnProfile && (
              <p>
                <strong>Email:</strong> {profile.email}
              </p>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="profile-section">
          <h3>Quiz Statistics</h3>
          <div className="quiz-stats-grid">
            <div className="stat-card">
              <strong>{profile.totalQuizzes || 0}</strong>
              <p>Quizzes Taken</p>
            </div>
            <div className="stat-card">
              <strong>{profile.averageScore || 0}%</strong>
              <p>Average Score</p>
            </div>
            <div className="stat-card">
              <strong>{profile.highestScore || 0}%</strong>
              <p>Highest Score</p>
            </div>
            <div className="stat-card">
              <strong>{profile.achievements?.length || 0}</strong>
              <p>Achievements</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="profile-section">
          <h3>Recent Activity</h3>
          <div className="recent-scores">
            {profile.recentScores?.length > 0 ? (
              <ul>
                {profile.recentScores.map((score, index) => (
                  <li key={index}>
                    <p>
                      Score: {score.score}% -{" "}
                      {new Date(score.date).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No recent activity</p>
            )}
          </div>
        </div>

        {/* Friend Actions */}
        {!isOwnProfile && !isFriend && (
          <div className="profile-section">
            <button
              onClick={handleSendFriendRequest}
              className="friend-request-btn"
            >
              Send Friend Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
