import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/common/ProtectedRoute";

import StudentRequest from "./components/auth/StudentRequest";
import AdminLogin from "./components/auth/AdminLogin";

import PendingStudents from "./pages/admin/PendingStudents";
import ActiveStudents from "./pages/admin/ActiveStudents";
import AdminDashboard from "./pages/admin/AdminDashboard";

import Payments from "./pages/admin/Payments";

import StudentLogin from "./components/auth/StudentLogin";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProtectedRoute from "./components/common/StudentProtectedRoute";

import StudentSetPassword from "./pages/student/StudentSetPassword";

import StudentLeaveRequests from "./pages/admin/StudentLeaveRequests";

/* ======================
   BASIC PAGES
====================== */

const Home = () => (
  <div className="container">
    <h2>Home Page</h2>
  </div>
);

const Landing = () => (
  <div className="container">
    <h2></h2>
  </div>
);

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

        {/* ADMIN (PROTECTED) */}
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

        {/* ✅ NEW: STUDENT LEAVE REQUESTS */}
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

        {/* ======================
           STUDENT
        ====================== */}

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
