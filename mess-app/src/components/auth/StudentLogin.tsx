import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/authCard.css";

const StudentLogin = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [verified, setVerified] = useState(false);
  const [passwordSet, setPasswordSet] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* =========================
     VERIFY PHONE NUMBER
  ========================= */
  const handleVerify = async () => {
    if (!phone) {
      setMessage("Please enter phone number");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/students/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Verification failed");
        setLoading(false);
        return;
      }

      setVerified(true);
      setPasswordSet(data.passwordSet);

      // New student → set password
      if (!data.passwordSet) {
        setLoading(false);
        navigate("/student/set-password", { state: { phone } });
        return;
      }

      setMessage("✔ Number verified");
    } catch (err) {
      setMessage("Server error");
    }

    setLoading(false);
  };

  /* =========================
     LOGIN STUDENT
  ========================= */
  const handleLogin = async () => {
    if (!password) {
      setMessage("Please enter password");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/students/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login failed");
        setLoading(false);
        return;
      }

      /* =========================
         ✅ CORRECT AUTH STORAGE
      ========================= */

      // clear any old admin/student session
      localStorage.clear();

      // store correct auth data
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", "STUDENT");
      localStorage.setItem("student", JSON.stringify(data.student));

      navigate("/student/dashboard", { replace: true });
    } catch (err) {
      setMessage("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Student Login</h2>

        {/* PHONE INPUT */}
        <input
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={verified}
        />

        {/* VERIFY BUTTON */}
        {!verified && (
          <button onClick={handleVerify} disabled={loading}>
            {loading ? "Verifying..." : "Verify Number"}
          </button>
        )}

        {/* PASSWORD + LOGIN */}
        {verified && passwordSet && (
          <>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleLogin} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </>
        )}

        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default StudentLogin;
