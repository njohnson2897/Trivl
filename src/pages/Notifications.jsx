import { useState, useEffect } from "react";
import axiosInstance from "../../axiosConfig.js";
import { jwtDecode } from "jwt-decode";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Notifications() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      const token = localStorage.getItem("token");
      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;

        const response = await axiosInstance.get(
          `/api/friends/pending/${userId}`
        );
        setPendingRequests(response.data.requests);
        setError(null);
      } catch (err) {
        console.error("Error fetching pending requests:", err);
        setError("Failed to load pending requests. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, []);

  const handleAcceptRequest = async (friendId) => {
    try {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;

      await axiosInstance.post("/api/friends/accept", { userId, friendId });
      setPendingRequests(
        pendingRequests.filter((request) => request.id !== friendId)
      );
      alert("Friend request accepted!");
    } catch (err) {
      console.error("Error accepting friend request:", err);
      alert("Failed to accept friend request. Please try again.");
    }
  };

  const handleDeclineRequest = async (friendId) => {
    try {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;

      await axiosInstance.post("/api/friends/decline", { userId, friendId });
      setPendingRequests(
        pendingRequests.filter((request) => request.id !== friendId)
      );
      alert("Friend request declined.");
    } catch (err) {
      console.error("Error declining friend request:", err);
      alert("Failed to decline friend request. Please try again.");
    }
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
        <h2>Notifications</h2>
        <div className="notifications-list">
          {pendingRequests.length > 0 ? (
            pendingRequests.map((request) => (
              <div key={request.id} className="notification-card">
                <h3>{request.user.username} sent you a friend request.</h3>
                <button onClick={() => handleAcceptRequest(request.user.id)}>
                  Accept
                </button>
                <button onClick={() => handleDeclineRequest(request.user.id)}>
                  Decline
                </button>
              </div>
            ))
          ) : (
            <p>No pending notifications.</p>
          )}
        </div>
      </div>
    </div>
  );
}
