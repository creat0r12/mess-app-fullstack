import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/StudentLeaveRequests.css";

type Leave = {
  id: number;
  student_name: string;
  student_id: number;
  leave_date: string;
  reason: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "RETURN_REQUESTED";
  actual_return_date?: string;
};

type GroupedLeaves = {
  student_id: number;
  student_name: string;
  leaves: Leave[];
};

/* ================= HELPERS ================= */

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const calculateDays = (start: string, end?: string) => {
  if (!end) return null;
  const diff =
    new Date(end).getTime() - new Date(start).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const StudentLeaveRequests = () => {
  const API = `${import.meta.env.VITE_API_URL}";
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [grouped, setGrouped] = useState<GroupedLeaves[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ SEARCH STATE (correct place)
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/api/admin/student-leaves`,
        { headers }
      );
      const data = Array.isArray(res.data) ? res.data : [];

      const groupedMap: Record<number, GroupedLeaves> = {};

      data.forEach((leave: Leave) => {
        if (!groupedMap[leave.student_id]) {
          groupedMap[leave.student_id] = {
            student_id: leave.student_id,
            student_name: leave.student_name,
            leaves: [],
          };
        }
        groupedMap[leave.student_id].leaves.push(leave);
      });

      setGrouped(Object.values(groupedMap));
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
    await axios.put(`${API}/api/admin/student-leaves/${id}/approve`, {}, { headers });
    fetchLeaves();
  };

  const handleReject = async (id: number) => {
    await axios.put(`${API}/api/admin/student-leaves/${id}/reject`, {}, { headers });
    fetchLeaves();
  };

  const handleRequestReturn = async (id: number) => {
    await axios.put(`${API}/api/admin/student-leaves/${id}/request-return`, {}, { headers });
    fetchLeaves();
  };

  /* ================= FILTER ================= */

  const filteredGrouped = grouped.filter((student) => {
    const term = searchTerm.toLowerCase();

    const name = student.student_name?.toLowerCase() || "";
    const id = student.student_id?.toString() || "";

    return name.includes(term) || id.includes(term);
  });

  /* ================= UI ================= */

  return (
    <div className="student-leave-page">
      <h2>Student Leave Requests</h2>

      {/* ✅ SEARCH BAR */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && <p className="muted">Loading leave requests...</p>}

      {!loading && filteredGrouped.length === 0 && (
        <p className="muted">
          No results found for "{searchTerm}"
        </p>
      )}

      {filteredGrouped.map((student) => (
        <div key={`${student.student_id}-${student.student_name}-${student.leaves.length}`} className="leave-card">

          {/* 🔹 MAIN CARD */}
          <div
            className="leave-info"
            onClick={() =>
              setExpandedId(
                expandedId === student.student_id ? null : student.student_id
              )
            }
            style={{ cursor: "pointer" }}
          >
            <h4>{student.student_name || "Unknown Student"}</h4>
            <p>Student ID: {student.student_id}</p>
            <p>Total Requests: {student.leaves.length}</p>

            {/* 🔥 ONE BUTTON PER USER */}
            <button
              className="manage-btn"
              onClick={(e) => {
                e.stopPropagation();
                alert("Future popup for managing this student");
              }}
            >
              Manage
            </button>
          </div>

          {/* 🔽 EXPANDED HISTORY */}
          {expandedId === student.student_id && (
            <div style={{ marginTop: "10px" }}>
              {student.leaves.map((leave) => {
                const days = calculateDays(
                  leave.leave_date,
                  leave.actual_return_date
                );

                return (

                  <div
                    key={`${leave.id}-${leave.student_id}-${leave.leave_date}`}
                    className="leave-card"
                    style={{ marginBottom: "10px" }}
                  >
                    <div className="leave-info">
                      <p>Date: {formatDate(leave.leave_date)}</p>

                      <p className="reason">
                        Reason: {leave.reason || "Not specified"}
                      </p>

                      {days !== null && (
                        <p><strong>Days:</strong> {days} days</p>
                      )}

                      <p>
                        <strong>Status:</strong>{" "}
                        <span className={`leave-status ${leave.status.toLowerCase()}`}>
                          {leave.status}
                        </span>
                      </p>
                    </div>

                    {/* ACTIONS */}
                    <div className="leave-actions">
                      {leave.status === "PENDING" && (
                        <>
                          <button
                            className="approve-btn"
                            onClick={() => handleApprove(leave.id)}
                          >
                            Approve
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
                          Request Return
                        </button>
                      )}

                      {leave.status === "RETURN_REQUESTED" && (
                        <p className="muted">
                          Waiting for student confirmation ⏳
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StudentLeaveRequests;