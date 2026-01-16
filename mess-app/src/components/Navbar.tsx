import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "../styles/navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState<string | null>(null);
  const [showAccount, setShowAccount] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  /* =========================
     SYNC ROLE FROM STORAGE
  ========================= */
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, [location.pathname]);

  /* =========================
     CLOSE MENU ON OUTSIDE CLICK
  ========================= */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAccount(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
    navigate("/", { replace: true });
  };

  return (
    <nav className="navbar">
      <div
        className="navbar-title"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      >
        Mess App
      </div>

      <div className="navbar-actions">
        {/* ================= NOT LOGGED IN ================= */}
        {!role && (
          <>
            <Link to="/student/request" className="navbar-btn">
              Student Request
            </Link>

            <Link to="/admin/login" className="navbar-btn primary">
              Admin Login
            </Link>
          </>
        )}

        {/* ================= LOGGED IN (ADMIN / STUDENT) ================= */}
        {role && (
          <div className="account-menu" ref={menuRef}>
            <button
              className="account-avatar"
              onClick={() => setShowAccount((s) => !s)}
            >
              👤
            </button>

            {showAccount && (
              <div className="account-dropdown">
                <div className="account-role">
                  {role === "ADMIN" ? "Admin Account" : "Student Account"}
                </div>

                {role === "ADMIN" && (
                  <>
                    <Link to="/admin/dashboard">Dashboard</Link>
                    <Link to="/admin/pending">Pending Requests</Link>
                    <Link to="/admin/active">Active Students</Link>
                  </>
                )}

                {role === "STUDENT" && (
                  <Link to="/student/dashboard">My Dashboard</Link>
                )}

                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
