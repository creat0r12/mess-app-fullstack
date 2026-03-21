import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/StudentLeaveRequests.css";

type Leave = {
  id: number;
  student_name: string;
  room_number: string | null;
  leave_date: string;
  reason: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "RETURN_REQUESTED";
};

const StudentLeaveRequests = () => {
  const API = "http://localhost:5000";
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
  setLoading(true); // ✅ ADD THIS LINE

  try {
    const res = await axios.get(
      `${API}/api/admin/student-leaves`,
      { headers }
    );
    setLeaves(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error("Failed to load leaves", err);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    if (token) fetchLeaves();
  }, [token]);

  /* ================= ACTIONS ================= */

  const handleApprove = async (id: number) => {
    try {
      await axios.put(`${API}/api/admin/student-leaves/${id}/approve`, {}, { headers });
      fetchLeaves();
    } catch (err) {
      console.error("Approve failed", err);
    }
  };

  const handleReject = async (id: number) => {
  try {
    await axios.put(`${API}/api/admin/student-leaves/${id}/reject`, {}, { headers });
    fetchLeaves();
  } catch (err) {
    console.error("Reject failed", err);
  }
};

  const handleRequestReturn = async (id: number) => {
  try {
    await axios.put(`${API}/api/admin/student-leaves/${id}/request-return`, {}, { headers });
    fetchLeaves();
  } catch (err) {
    console.error("Return request failed", err);
  }
};

  return (
    <div className="student-leave-page">
      <h2>Student Leave Requests</h2>

      {loading && <p className="muted">Loading leave requests...</p>}

      {!loading && leaves.length === 0 && (
        <p className="muted">No leave records found</p>
      )}

      {leaves.map((leave) => (
        <div key={leave.id} className="leave-card">
          <div className="leave-info">
            <h4>{leave.student_name}</h4>
            <p>Room: {leave.room_number || "N/A"}</p>
            <p>Date: {leave.leave_date}</p>
            <p className="reason">
              Reason: {leave.reason || "Not specified"}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span className={`leave-status ${leave.status.toLowerCase()}`}>
                {leave.status === "PENDING" && "Pending"}
                {leave.status === "APPROVED" && "Approved"}
                {leave.status === "REJECTED" && "Rejected"}
                {leave.status === "RETURN_REQUESTED" && "Return Requested"}
              </span>
            </p>
          </div>

          {/* ===== ACTIONS ===== */}
          <div className="leave-actions">
            {leave.status === "PENDING" && (
              <>
                <button
                  className="approve-btn"
                  onClick={() => handleApprove(leave.id)}
                >
                  Approve Leave
                </button>
                <button
                  className="reject-btn"
                  onClick={() => handleReject(leave.id)}
                >
                  Reject
                </button>
              </>
            )}

            {leave.status === "APPROVED" && (
              <button
                className="present-btn"
                onClick={() => handleRequestReturn(leave.id)}
              >
                Request Present on Mess
              </button>
            )}

            {leave.status === "RETURN_REQUESTED" && (
              <p className="muted">
                Waiting for student confirmation ⏳
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentLeaveRequests;
