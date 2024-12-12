import { useState } from "react";

const Settings = () => {
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(true);

  const handleThemeChange = (e) => setTheme(e.target.value);
  const toggleNotifications = () => setNotifications(!notifications);

  return (
    <div className='content-container'>
      <div className="enhanced-settings-container">
        <h1 className="settings-title">Account Settings</h1>

        {/* Account Section */}
        <section className="settings-section">
          <h2 className="section-header">Profile Management</h2>
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
        </section>

        {/* Privacy Section */}
        <section className="settings-section">
          <h2 className="section-header">Privacy Controls</h2>
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
          </div>
        </section>

        {/* Notifications Section */}
        <section className="settings-section">
          <h2 className="section-header">Notification Preferences</h2>
          <label className="toggle-container">
            <input
              type="checkbox"
              className="toggle-input"
              checked={notifications}
              onChange={toggleNotifications}
            />
            <span className="toggle-slider"></span>
            Enable Email Notifications
          </label>
        </section>

        {/* Theme Section */}
        <section className="settings-section">
          <h2 className="section-header">Appearance</h2>
          <div className="theme-select">
            <label>
              Theme:
              <select 
                value={theme} 
                onChange={handleThemeChange} 
                className="theme-dropdown"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
          </div>
        </section>

        {/* Save Changes */}
        <div className="save-changes">
          <button className="save-btn">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;