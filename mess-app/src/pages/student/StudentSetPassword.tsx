import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/authCard.css";

const StudentSetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // phone passed from login page
  const phone = location.state?.phone;

  const handleSetPassword = async () => {
    if (!password || !confirmPassword) {
      setMessage("All fields required");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        "http://localhost:5000/api/students/set-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, password, confirmPassword }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message);
        setLoading(false);
        return;
      }

      navigate("/student/login");
    } catch {
      setMessage("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Set Password</h2>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button onClick={handleSetPassword} disabled={loading}>
          {loading ? "Saving..." : "Set Password"}
        </button>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default StudentSetPassword;
