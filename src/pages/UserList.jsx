import { useState } from 'react';
import axiosInstance from '../../axiosConfig.js';
import { jwtDecode } from 'jwt-decode';

export default function UserList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    try {
      const response = await axiosInstance.get(`/api/users/search?query=${searchQuery}`);
      setSearchResults(response.data.users);
      setError(null);
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Failed to search users. Please try again.');
      setSearchResults([]);
    }
  };

  const handleSendFriendRequest = async (friendId) => {
    try {
      const token = localStorage.getItem('token');
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;

      await axiosInstance.post('/api/friends/add', { userId, friendId });
      alert('Friend request sent!');
    } catch (err) {
      console.error('Error sending friend request:', err);
      alert('Failed to send friend request. Please try again.');
    }
  };

  return (
    <div className="content-container">
      <div className="user-list-container quiz-content">
        <h2>Search Users</h2>
        <div className="user-search-bar">
          <input
            type="text"
            placeholder="Search by username"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="user-search-results">
          {searchResults.map((user) => (
            <div key={user.id} className="user-card">
              <h3>{user.username}</h3>
              <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
              <button 
                onClick={() => handleSendFriendRequest(user.id)}
                className="friend-request-btn"
              >
                Send Friend Request
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}