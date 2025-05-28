import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosConfig.js";
import { jwtDecode } from "jwt-decode";

export default function UserList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const response = await axiosInstance.get(
        `/api/users/search?query=${encodeURIComponent(searchQuery)}`
      );
      setSearchResults(response.data.users);
      setError(null);
    } catch (err) {
      console.error("Error searching users:", err);
      setError("Failed to search users. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async (friendId) => {
    try {
      await axiosInstance.post("/api/friends/add", { friendId });
      alert("Friend request sent!");
    } catch (err) {
      console.error("Error sending friend request:", err);
      alert("Failed to send friend request. Please try again.");
    }
  };

  const handleProfileClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  return (
    <div className="content-container">
      <div className="quiz-content">
        <h1>Find Users</h1>

        <div className="user-search-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="user-search-input"
            />
            <button
              onClick={handleSearch}
              className="search-btn"
              disabled={isSearching}
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>

          {!searchQuery && (
            <div className="search-tips">
              <h3>Search Tips</h3>
              <ul>
                <li>Search by username to find specific users</li>
                <li>
                  You can send friend requests to connect with other players
                </li>
                <li>Challenge your friends to quiz battles</li>
                <li>Compare scores and compete on the leaderboard</li>
              </ul>
            </div>
          )}
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="user-search-results">
          {searchResults.length > 0 ? (
            searchResults.map((user) => (
              <div key={user.id} className="user-card">
                <h3
                  onClick={() => handleProfileClick(user.id)}
                  style={{
                    cursor: "pointer",
                    color: "#000",
                    textDecoration: "underline",
                  }}
                >
                  {user.username}
                </h3>
                <p>
                  Member since: {new Date(user.createdAt).toLocaleDateString()}
                </p>
                <button
                  onClick={() => handleSendFriendRequest(user.id)}
                  className="friend-request-btn"
                >
                  Send Friend Request
                </button>
              </div>
            ))
          ) : searchQuery && !isSearching ? (
            <div className="empty-state">
              <p>No users found matching "{searchQuery}"</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
