import { useState, useEffect } from "react";
import "../../styles/settings.css";

const Settings = () => {
  const [dark, setDark] = useState(false);

  /* ===== LOAD SAVED THEME ===== */
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      setDark(true);
      document.body.classList.add("dark");
    }
  }, []);

  /* ===== APPLY DARK MODE ===== */
  useEffect(() => {
    if (dark) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <div className="settings-page">

      <h2 className="settings-title">Settings</h2>

      {/* ===== PROFILE ===== */}
      <div className="settings-card">
        <h3>Profile</h3>

        <div className="profile-box">
          <img
            src="https://via.placeholder.com/80"
            alt="profile"
            className="profile-img"
          />

          <div>
            <p><strong>Name:</strong> Admin</p>
            <p><strong>Email:</strong> admin@mail.com</p>
            <p><strong>Joined:</strong> Jan 2026</p>
          </div>
        </div>
      </div>

      {/* ===== THEME ===== */}
      <div className="settings-card">
        <h3>Theme</h3>

        <div className="row">
          <p>Dark Mode</p>

          <label className="switch">
            <input
              type="checkbox"
              checked={dark}
              onChange={() => setDark(!dark)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

    </div>
  );
};

export default Settings;