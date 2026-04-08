import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/authCard.css";

const StudentLogin = () => {
  const [identifier, setIdentifier] = useState(""); // phone or email
  const [password, setPassword] = useState("");
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* =========================
     STEP 1: VERIFY USER
  ========================= */
  const handleVerify = async () => {
    if (!identifier) {
      setMessage("Please enter phone or email");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Verification failed");
        setLoading(false);
        return;
      }

      // ✅ First-time login → set password
      if (data.firstLogin) {
        setLoading(false);
        navigate("/student/set-password", {
          state: { phone: data.phone },
        });
        return;
      }

      // ✅ Existing user → show password input
      setVerified(true);
      setMessage("✔ User found. Enter password");
    } catch (err) {
      setMessage("Server error");
    }

    setLoading(false);
  };

  /* =========================
     STEP 2: LOGIN USER
  ========================= */
  const handleLogin = async () => {
    if (!password) {
      setMessage("Please enter password");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login failed");
        setLoading(false);
        return;
      }

      /* =========================
         SAVE AUTH
      ========================= */
      localStorage.clear();

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      /* =========================
         ROLE-BASED REDIRECT
      ========================= */
      if (data.role === "MESS_ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/student/dashboard", { replace: true });
      }
    } catch (err) {
      setMessage("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Login</h2>

        {/* IDENTIFIER INPUT */}
        <input
          placeholder="Phone or Email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          disabled={verified}
        />

        {/* VERIFY BUTTON */}
        {!verified && (
          <button onClick={handleVerify} disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </button>
        )}

        {/* PASSWORD INPUT */}
        {verified && (
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