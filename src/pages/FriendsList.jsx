import { useState, useEffect } from "react";
import axiosInstance from "../../axiosConfig";
import { jwtDecode } from "jwt-decode";
import LoadingSpinner from "../components/LoadingSpinner";

export default function FriendsList() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFriends = async () => {
      const token = localStorage.getItem("token");
      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;
        setLoading(true);
        const response = await axiosInstance.get(`/api/friends/${userId}`);
        setFriends(response.data.friends);
      } catch (err) {
        console.error("Error fetching friends:", err);
        setError("Failed to load friends. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
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
              <div key={friend.id} className="friend-card">
                <h3>{friend.username}</h3>
                <p>
                  Status: <span className="offline">Unknown</span>
                </p>
                <p>Joined: {new Date(friend.createdAt).toLocaleDateString()}</p>
                <button className="message-btn">Send Message</button>
                <button className="challenge-btn">Challenge to Quiz</button>
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
