import { useState } from "react";

const Settings = () => {
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState("medium");
  const [language, setLanguage] = useState("english");

  const handleThemeChange = (e) => setTheme(e.target.value);
  const toggleNotifications = () => setNotifications(!notifications);
  const toggleEmailNotifications = () =>
    setEmailNotifications(!emailNotifications);
  const toggleSound = () => setSoundEnabled(!soundEnabled);

  return (
    <div className="content-container">
      <div className="quiz-content">
        <h1>Settings</h1>

        {/* Account Section */}
        <div className="profile-section">
          <h3>Account Management</h3>
          <div className="button-group">
            <button className="settings-btn edit-profile">
              <span>✏️</span> Edit Profile
            </button>
            <button className="settings-btn change-password">
              <span>🔐</span> Change Password
            </button>
            <button className="settings-btn danger-btn">
              <span>🗑️</span> Delete Account
            </button>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="profile-section">
          <h3>Privacy Controls</h3>
          <div className="toggle-group">
            <label className="toggle-container">
              <input type="checkbox" className="toggle-input" />
              <span className="toggle-slider"></span>
              Public Profile
            </label>
            <label className="toggle-container">
              <input type="checkbox" className="toggle-input" />
              <span className="toggle-slider"></span>
              Share Scores with Friends
            </label>
            <label className="toggle-container">
              <input type="checkbox" className="toggle-input" />
              <span className="toggle-slider"></span>
              Show Online Status
            </label>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="profile-section">
          <h3>Notification Preferences</h3>
          <div className="toggle-group">
            <label className="toggle-container">
              <input
                type="checkbox"
                className="toggle-input"
                checked={notifications}
                onChange={toggleNotifications}
              />
              <span className="toggle-slider"></span>
              Push Notifications
            </label>
            <label className="toggle-container">
              <input
                type="checkbox"
                className="toggle-input"
                checked={emailNotifications}
                onChange={toggleEmailNotifications}
              />
              <span className="toggle-slider"></span>
              Email Notifications
            </label>
            <label className="toggle-container">
              <input
                type="checkbox"
                className="toggle-input"
                checked={soundEnabled}
                onChange={toggleSound}
              />
              <span className="toggle-slider"></span>
              Sound Effects
            </label>
          </div>
        </div>

        {/* Game Settings */}
        <div className="profile-section">
          <h3>Game Settings</h3>
          <div className="settings-grid">
            <div className="setting-item">
              <label>Default Difficulty:</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="settings-dropdown"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="setting-item">
              <label>Language:</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="settings-dropdown"
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
              </select>
            </div>
          </div>
        </div>

        {/* Theme Section */}
        <div className="profile-section">
          <h3>Appearance</h3>
          <div className="theme-select">
            <label>
              Theme:
              <select
                value={theme}
                onChange={handleThemeChange}
                className="settings-dropdown"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System Default</option>
              </select>
            </label>
          </div>
        </div>

        {/* Save Changes */}
        <div className="save-changes">
          <button className="save-btn">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
