import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

const StudentProtectedRoute = ({ children }: Props) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // ❌ Not logged in or not a student
  if (!token || role !== "STUDENT") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default StudentProtectedRoute;
