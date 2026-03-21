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

import "./styles/basicPages.css";



/* ======================
   BASIC PAGES
====================== */

const Home = () => (
  <div className="container">
    <h2>Home Page</h2>
  </div>
);

const Landing = () => {
  return (
    <div className="page">
      <div className="card">

        <div className="top-actions">
          <Link to="/student/login">
            <button className="btn">Login</button>
          </Link>

          <Link to="/platform-admin/login">
            <button className="btn btn-muted">Dev Login</button>
          </Link>
        </div>

        <h1>Mess Portal</h1>

        <p>
          A secure platform to find and manage mess services.
          Students can discover verified day and night messes,
          while mess owners manage operations, payments, and notices easily.
        </p>

        <div className="action-buttons">
          <Link to="/find-mess">
            <button className="btn">Find Mess</button>
          </Link>

          <Link to="/create-mess">
            <button className="btn btn-primary">Create Mess</button>
          </Link>
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
        <Route path="/home" element={<Home />} />
        <Route path="/student/request" element={<StudentRequest />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/find-mess" element={<FindMess />} />
        <Route path="/settings" element={<Settings />} />
        {/* CREATE MESS */}
        <Route path="/create-mess" element={<CreateMess />} />

        {/* PLATFORM ADMIN (DEVELOPER) */}
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
