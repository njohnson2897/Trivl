import { useState, useEffect } from "react";
import axiosInstance from "../../axiosConfig.js";
import { jwtDecode } from "jwt-decode";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Notifications() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingChallenges, setPendingChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await axiosInstance.get(`/api/friends/requests`);
        console.log("Friend requests:", response.data.friendRequests); // Debug log
        setPendingRequests(response.data.friendRequests);

        // Also fetch pending challenges
        const challengeResponse = await axiosInstance.get(
          `/api/challenges/pending`
        );
        console.log("Pending challenges:", challengeResponse.data.challenges);
        setPendingChallenges(challengeResponse.data.challenges || []);

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

  const handleAcceptRequest = async (requestId) => {
    try {
      console.log("Accepting request:", requestId); // Debug log
      await axiosInstance.post(`/api/friends/accept/${requestId}`);
      setPendingRequests(
        pendingRequests.filter((request) => request.id !== requestId)
      );
      alert("Friend request accepted!");
    } catch (err) {
      console.error("Error accepting friend request:", err);
      alert("Failed to accept friend request. Please try again.");
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      console.log("Declining request:", requestId); // Debug log
      await axiosInstance.post(`/api/friends/reject/${requestId}`);
      setPendingRequests(
        pendingRequests.filter((request) => request.id !== requestId)
      );
      alert("Friend request declined.");
    } catch (err) {
      console.error("Error declining friend request:", err);
      alert("Failed to decline friend request. Please try again.");
    }
  };

  const handleAcceptChallenge = async (challengeId) => {
    try {
      const response = await axiosInstance.post(
        `/api/challenges/${challengeId}/accept`
      );
      const challenge = response.data.challenge;

      // Store challenge data in localStorage and redirect to quiz
      localStorage.setItem(
        "triviaQuestions",
        JSON.stringify(response.data.questions)
      );
      localStorage.setItem("quizStatus", "in_progress");
      localStorage.setItem("currentQuestionIndex", "0");
      localStorage.setItem("quizMode", "challenge");
      localStorage.setItem("challengeId", challenge.id);

      const startTime = new Date().getTime();
      localStorage.setItem("quizStartTime", startTime);

      // Remove from pending challenges
      setPendingChallenges(
        pendingChallenges.filter((challenge) => challenge.id !== challengeId)
      );

      // Navigate to quiz page
      window.location.reload();
    } catch (err) {
      console.error("Error accepting challenge:", err);
      alert("Failed to accept challenge. Please try again.");
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
        <h1>Notifications</h1>

        {pendingRequests.length > 0 || pendingChallenges.length > 0 ? (
          <div className="notifications-list">
            {pendingRequests.map((request) => (
              <div key={`request-${request.id}`} className="notification-card">
                <h3>{request.user.username} sent you a friend request.</h3>
                <div className="notification-actions">
                  <button
                    onClick={() => handleAcceptRequest(request.id)}
                    className="accept-btn"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineRequest(request.id)}
                    className="decline-btn"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}

            {pendingChallenges.map((challenge) => (
              <div
                key={`challenge-${challenge.id}`}
                className="notification-card"
              >
                <h3>
                  🎯 {challenge.challenger.username} challenged you to a quiz!
                </h3>
                <p>Take the same 10 question quiz and see who scores higher!</p>
                <div className="notification-actions">
                  <button
                    onClick={() => handleAcceptChallenge(challenge.id)}
                    className="accept-btn"
                  >
                    Accept Challenge
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="notifications-empty-state">
            <div className="empty-state-icon">🔔</div>
            <h3>No Pending Notifications</h3>
            <p>
              Your notification center is currently empty. Here's what you can
              do:
            </p>
            <div className="notification-tips">
              <div className="tip-card">
                <h4>Find Friends</h4>
                <p>Search for other players and send them friend requests</p>
              </div>
              <div className="tip-card">
                <h4>Challenge Players</h4>
                <p>
                  Challenge your friends to quiz battles and compete for high
                  scores
                </p>
              </div>
              <div className="tip-card">
                <h4>Check Leaderboard</h4>
                <p>See how you rank against other players in the leaderboard</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
