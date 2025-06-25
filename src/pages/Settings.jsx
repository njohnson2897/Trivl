import { useState, useEffect } from "react";
import axiosInstance from "../../axiosConfig.js";
import { useTheme } from "../contexts/ThemeContext";

const Settings = () => {
  const { theme, setThemeMode, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState("medium");
  const [language, setLanguage] = useState("english");
  const [isPublic, setIsPublic] = useState(false);
  const [shareScores, setShareScores] = useState(true);
  const [showOnline, setShowOnline] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axiosInstance.get("/api/users/settings");
        const settings = response.data;

        // Don't override theme from context
        setNotifications(settings.notifications ?? true);
        setEmailNotifications(settings.emailNotifications ?? true);
        setSoundEnabled(settings.soundEnabled ?? true);
        setDifficulty(settings.difficulty || "medium");
        setLanguage(settings.language || "english");
        setIsPublic(settings.isPublic ?? false);
        setShareScores(settings.shareScores ?? true);
        setShowOnline(settings.showOnline ?? true);
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };

    fetchSettings();
  }, []);

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    if (newTheme === "system") {
      // Remove theme from localStorage to use system preference
      localStorage.removeItem("theme");
      // Check system preference
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        setThemeMode("dark");
      } else {
        setThemeMode("light");
      }
    } else {
      setThemeMode(newTheme);
    }
  };

  const toggleNotifications = () => setNotifications(!notifications);
  const toggleEmailNotifications = () =>
    setEmailNotifications(!emailNotifications);
  const toggleSound = () => setSoundEnabled(!soundEnabled);
  const togglePublic = () => setIsPublic(!isPublic);
  const toggleShareScores = () => setShareScores(!shareScores);
  const toggleShowOnline = () => setShowOnline(!showOnline);

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      await axiosInstance.post("/api/users/settings", {
        theme,
        notifications,
        emailNotifications,
        soundEnabled,
        difficulty,
        language,
        isPublic,
        shareScores,
        showOnline,
      });
      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Determine the current theme value for the select
  const getCurrentThemeValue = () => {
    const savedTheme = localStorage.getItem("theme");
    if (!savedTheme) {
      return "system";
    }
    return savedTheme;
  };

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

        {/* Theme Section */}
        <div className="profile-section">
          <h3>Appearance</h3>
          <div className="settings-grid">
            <div className="setting-item">
              <label>Theme:</label>
              <select
                value={getCurrentThemeValue()}
                onChange={handleThemeChange}
                className="settings-dropdown"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System Default</option>
              </select>
            </div>
            <div className="setting-item">
              <label>Quick Toggle:</label>
              <button
                onClick={toggleTheme}
                className="settings-btn"
                style={{ width: "100%", marginTop: "0.5rem" }}
              >
                <span>{theme === "dark" ? "☀️" : "🌙"}</span>
                Switch to {theme === "dark" ? "Light" : "Dark"} Mode
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="profile-section">
          <h3>Privacy Controls</h3>
          <div className="toggle-group">
            <label className="toggle-container">
              <input
                type="checkbox"
                className="toggle-input"
                checked={isPublic}
                onChange={togglePublic}
              />
              <span className="toggle-slider"></span>
              Public Profile
            </label>
            <label className="toggle-container">
              <input
                type="checkbox"
                className="toggle-input"
                checked={shareScores}
                onChange={toggleShareScores}
              />
              <span className="toggle-slider"></span>
              Share Scores with Friends
            </label>
            <label className="toggle-container">
              <input
                type="checkbox"
                className="toggle-input"
                checked={showOnline}
                onChange={toggleShowOnline}
              />
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

        {/* Save Changes */}
        <div className="save-changes">
          <button
            className="save-btn"
            onClick={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
