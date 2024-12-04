import { useState } from "react";

const Settings = () => {
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(true);

  const handleThemeChange = (e) => setTheme(e.target.value);
  const toggleNotifications = () => setNotifications(!notifications);

  return (
    <div className='content-container'>
    <div className="quiz-content">
      <h1>Settings</h1>

      {/* Account Section */}
      <section>
        <h2>Account Settings</h2>
        <button>Edit Profile</button>
        <button>Change Password</button>
        <button className="danger">Delete Account</button>
      </section>

      {/* Privacy Section */}
      <section>
        <h2>Privacy Settings</h2>
        <label>
          <input type="checkbox" /> Public Profile
        </label>
        <label>
          <input type="checkbox" /> Share Scores with Friends
        </label>
      </section>

      {/* Notifications Section */}
      <section>
        <h2>Notifications</h2>
        <label>
          <input
            type="checkbox"
            checked={notifications}
            onChange={toggleNotifications}
          />{" "}
          Enable Email Notifications
        </label>
      </section>

      {/* Theme Section */}
      <section>
        <h2>Appearance</h2>
        <label>
          Theme:
          <select value={theme} onChange={handleThemeChange}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </section>
    </div>
    </div>
  );
};

export default Settings;
