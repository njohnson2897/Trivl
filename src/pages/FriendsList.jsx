import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosConfig";
import { jwtDecode } from "jwt-decode";
import LoadingSpinner from "../components/LoadingSpinner";

export default function FriendsList() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/friends/list`);
        setFriends(response.data.friends);
        setError(null);
      } catch (err) {
        console.error("Error fetching friends:", err);
        setError("Failed to load friends. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleFriendClick = (friendId) => {
    navigate(`/user/${friendId}`);
  };

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
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="quiz-content">
        <h1>Your Friends</h1>
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
                  Status: <span className="offline">Unknown</span>
                </p>
                <p>Joined: {new Date(friend.createdAt).toLocaleDateString()}</p>
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
            <p>You have no friends added yet. Add some to get started!</p>
          )}
        </div>
      </div>
    </div>
  );
}
