import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/authCard.css";
import "../../styles/AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState(""); // email / phone / username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/admin-login",
        {
          identifier, // ✅ email OR phone OR username
          password,
        }
      );

      /**
       * EXPECTED BACKEND RESPONSE:
       * {
       *   token: "...",
       *   role: "MESS_ADMIN",
       *   mess_id: 12
       * }
       */

      // ✅ SAVE AUTH DATA
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role); // VERY IMPORTANT
      localStorage.setItem("mess_id", res.data.mess_id); // admin's mess

      // ✅ REDIRECT BASED ON ROLE
      if (res.data.role === "MESS_ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        setError("Unauthorized role");
      }

    } catch (err: any) {
      setError(
        err.response?.data?.message || "Admin login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Mess Admin Login</h2>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Email / Phone / Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
