import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig.js';
import { jwtDecode } from "jwt-decode";

export default function Profile() {
  const [userData, setUserData] = useState(null); // User info state
  const [scores, setScores] = useState([]);       // Quiz scores state
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data and scores
    const fetchProfileData = async () => {
      const token = localStorage.getItem("token");
      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;
        const userResponse = await axiosInstance.get(`/api/users/${userId}`);
        const scoresResponse = await axiosInstance.get(`/api/scores/${userId}`);
        setUserData(userResponse.data);
        console.log(userResponse.data)
        setScores(scoresResponse.data);
        console.log(scoresResponse.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        // Redirect if unauthorized
        if (error.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [navigate]);

  if (loading) return <p>Loading...</p>;

  // Calculate stats
  // const totalQuizzes = scores.length;
  // const averageScore = scores.reduce((sum, score) => sum + score.quiz_score, 0) / totalQuizzes || 0;
  // const bestScore = Math.max(...scores.map(score => score.quiz_score), 0);

  return (
    <div className='content-container'>
    <div className="quiz-content profile-page">
      {/* User Information */}
      <section className="user-info">
        <h2>Your Profile</h2>
        <p><strong>Username:</strong> {userData?.username}</p>
        <p><strong>Email:</strong> {userData?.email}</p>
        <p><strong>Member Since:</strong> {new Date(userData?.createdAt).toLocaleDateString()}</p>
        <button>Edit Profile</button>
      </section>
  


      {/* Quiz Stats */}
      {/* <section className="quiz-stats">
        <h2>Quiz Stats</h2>
        <p><strong>Total Quizzes Taken:</strong> {totalQuizzes}</p>
        <p><strong>Average Score:</strong> {averageScore.toFixed(1)}</p>
        <p><strong>Best Score:</strong> {bestScore}</p>
      </section> */}

      {/* Recent Scores */}
      {/* <section className="recent-scores">
        <h3>Recent Scores</h3>
        <ul>
          {scores.slice(0, 5).map((score, index) => (
            <li key={index}>
              <p><strong>Date:</strong> {new Date(score.date_taken).toLocaleDateString()}</p>
              <p><strong>Score:</strong> {score.quiz_score}/10</p>
            </li>
          ))}
        </ul>
      </section> */}

      {/* Performance Chart ?? */}
    </div>
    </div>
  );
}
