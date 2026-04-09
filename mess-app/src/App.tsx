import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/common/ProtectedRoute";
import StudentProtectedRoute from "./components/common/StudentProtectedRoute";

import StudentRequest from "./components/auth/StudentRequest";
import AdminLogin from "./components/auth/AdminLogin";
import StudentLogin from "./components/auth/StudentLogin";

import PendingStudents from "./pages/admin/PendingStudents";
import ActiveStudents from "./pages/admin/ActiveStudents";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Payments from "./pages/admin/Payments";
import StudentLeaveRequests from "./pages/admin/StudentLeaveRequests";

import StudentDashboard from "./pages/student/StudentDashboard";
import StudentSetPassword from "./pages/student/StudentSetPassword";

import FindMess from "./pages/FindMess";
import CreateMess from "./pages/CreateMess";
import PlatformAdminLogin from "./pages/platform/PlatformAdminLogin";
import PlatformMessRequests from "./pages/platform/PlatformMessRequests";
import Settings from "./pages/settings/Settings";

import chef from "./assets/chef.png";
import "./App.css";
import { useState } from "react";


/* ======================
   LANDING PAGE (HERO STYLE)
====================== */

const Landing = () => {
  const [showSupport, setShowSupport] = useState(false);

  return (
    <div className="landing-bg">

      {/* HERO */}
      <div className="landing-wrapper">

        {/* LEFT CONTENT */}
        <div className="landing-card">

          <div className="dev-access">
            <Link to="/platform-admin/login">Dev</Link>
          </div>

          <h1 className="landing-title">
            Manage Mess Efficiently <br />
            <span className="highlight">
              <span className="text-switch">
                <span>Grow Your Business</span>
                <span> with Mess App</span>
              </span>
            </span>
          </h1>

          <p className="landing-desc">
            A simple, intuitive platform to streamline mess management
            and connect with students effortlessly.
          </p>

          <div className="landing-actions">
            <button
              className="btn primary"
              onClick={() => {
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Get Started
            </button>
          </div>

        </div>

        {/* RIGHT SIDE AVATAR */}
        <img
          src={chef}
          alt="chef"
          className="hero-avatar"
        />

      </div>

      {/* ======================
         FEATURES (3 CARDS)
      ====================== */}
      <div id="features" className="features-section">
        <div className="features-container">

          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Find a Mess Nearby</h3>
            <p>
              Explore available messes and choose the best fit for you.
            </p>
            <Link to="/find-mess">
              <button className="feature-btn">Discover Messes</button>
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏪</div>
            <h3>Register Your Mess</h3>
            <p>
              Set up your mess on our platform and reach more students.
            </p>
            <Link to="/create-mess">
              <button className="feature-btn green">Add Your Mess</button>
            </Link>
          </div>

          {/* ✅ UPDATED CONTACT CARD */}
          <div className="feature-card flip-card">

            <div className={`flip-inner ${showSupport ? "flipped" : ""}`}>

              {/* FRONT */}
              <div className="flip-front">
                <div className="feature-icon">📞</div>
                <h3>Contact Support</h3>
                <p>
                  Need help? Reach out to us anytime for assistance.
                </p>

                <button
                  className="feature-btn"
                  onClick={() => setShowSupport(true)}
                >
                  Get Help
                </button>
              </div>

              {/* BACK */}
              <div className="flip-back">
                <div className="feature-icon">📞</div>
                <h3>Contact Details</h3>

                <p><strong>📱</strong> 9322824378</p>
                <p><strong>📧</strong> kushalpatil12112@gmail.com</p>

                <button
                  className="feature-btn"
                  onClick={() => setShowSupport(false)}
                >
                  Back
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

/* ======================
   APP
====================== */

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Landing />} />
        <Route path="/student/request" element={<StudentRequest />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/find-mess" element={<FindMess />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/create-mess" element={<CreateMess />} />

        {/* PLATFORM */}
        <Route path="/platform-admin/login" element={<PlatformAdminLogin />} />
        <Route
          path="/platform-admin/mess-requests"
          element={<PlatformMessRequests />}
        />

        {/* ADMIN */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/pending"
          element={
            <ProtectedRoute>
              <PendingStudents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/active"
          element={
            <ProtectedRoute>
              <ActiveStudents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/student-leaves"
          element={
            <ProtectedRoute>
              <StudentLeaveRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          }
        />

        {/* STUDENT */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/set-password" element={<StudentSetPassword />} />

        <Route
          path="/student/dashboard"
          element={
            <StudentProtectedRoute>
              <StudentDashboard />
            </StudentProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;