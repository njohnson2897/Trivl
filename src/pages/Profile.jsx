import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig.js';
import { jwtDecode } from "jwt-decode";

export default function Profile() {
  const [userData, setUserData] = useState(null); // User info state
  const [scores, setScores] = useState([]);       // Quiz scores state
  const [friends, setFriends] = useState([]);     // User's friends state
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data, scores, and friends
    const fetchProfileData = async () => {
      const token = localStorage.getItem("token");
      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;
    
        const [userResponse, scoresResponse, friendsResponse] = await Promise.all([
          axiosInstance.get(`/api/users/${userId}`),
          axiosInstance.get(`/api/scores/${userId}`),
          axiosInstance.get(`/api/friends/${userId}`),
        ]);
    
        setUserData(userResponse.data);
        setScores(scoresResponse.data.scores || []); // Use the 'scores' property, fallback to an empty array
        setFriends(friendsResponse.data); // Assuming this is already correctly structured
    
        console.log("User Data:", userResponse.data);
        console.log("Scores Data:", scoresResponse.data); // Log full response to confirm structure
        console.log("Friends Data:", friendsResponse.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        if (error.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    

    fetchProfileData();
  }, [navigate]);

  if (loading) return <p>Loading...</p>;

  // Calculate stats
  const totalQuizzes = scores.length;
  const averageScore = scores.reduce((sum, score) => sum + score.quiz_score, 0) / totalQuizzes || 0;
  const bestScore = Math.max(...scores.map(score => score.quiz_score), 0);
  const averageDuration = 
    scores.reduce((sum, score) => sum + (score.quiz_duration || 0), 0) / totalQuizzes || 0;

  // Get the last 5 quizzes (sorted by most recent)
  const recentScores = [...scores].sort((a, b) => new Date(b.date_taken) - new Date(a.date_taken)).slice(0, 5);

  return (
    <div className="content-container">
      <div className="quiz-content profile-page">
        {/* User Information */}
        <section className="user-info">
          <h1>Your Profile</h1>
          <p><strong>Username:</strong> {userData?.username}</p>
          <p><strong>Email:</strong> {userData?.email}</p>
          <p><strong>Member Since:</strong> {new Date(userData?.createdAt).toLocaleDateString()}</p>
        </section>

        {/* Quiz Stats */}
        <section className="quiz-stats">
          <h3>Quiz Stats</h3>
          <p><strong>Total Quizzes Taken:</strong> {totalQuizzes}</p>
          <p><strong>Average Score:</strong> {averageScore.toFixed(1)}</p>
          <p><strong>Best Score:</strong> {bestScore}</p>
          <p><strong>Average Quiz Duration:</strong> {averageDuration.toFixed(2)} minutes</p>
        </section>

        {/* Recent Scores */}
        <section className="recent-scores">
          <h3>Recent Scores</h3>
          {recentScores.length > 0 ? (
            <ul>
              {recentScores.map((score, index) => (
                <li key={index}>
                  <p><strong>Date:</strong> {new Date(score.date_taken).toLocaleDateString()}</p>
                  <p><strong>Score:</strong> {score.quiz_score}/10</p>
                  <p><strong>Difficulty:</strong> {score.difficulty}</p>
                  <p><strong>Duration:</strong> {score.quiz_duration} minutes</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent scores available.</p>
          )}
        </section>

        {/* Friends List */}
        <section className="friends-list">
          <h3>Friends</h3>
          {friends.length > 0 ? (
            <ul>
              {friends.map((friend, index) => (
                <li key={index}>
                  <p><strong>Username:</strong> {friend.username}</p>
                  <p><strong>Email:</strong> {friend.email}</p>
                  <p><strong>Member Since:</strong> {new Date(friend.createdAt).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>You have no friends added yet.</p>
          )}
        </section>
        <button>Edit Profile</button>
      </div>
    </div>
  );
}
