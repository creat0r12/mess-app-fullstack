import { useEffect, useState } from "react";
import { getToken } from "../../utils/auth";
import "../../styles/PendingStudents.css";

type Student = {
  id: number;
  name: string;
  email: string;
  phone: string;
  room_number?: string;
  created_at?: string;
};

const API_ROOT = "http://localhost:5000";

const PendingStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH PENDING STUDENTS
  ========================= */
  const fetchPending = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_ROOT}/api/admin/pending`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load pending students");
      }

      const data = await res.json();
      setStudents(data || []);
    } catch (err) {
      console.error(err);
      alert("Unable to fetch pending students");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     LOAD ON MOUNT
  ========================= */
  useEffect(() => {
    fetchPending();
  }, []);

  /* =========================
     APPROVE / REJECT
  ========================= */
  const handleAction = async (
    id: number,
    action: "approve" | "reject"
  ) => {
    const ok = window.confirm(
      `Are you sure you want to ${action} this student?`
    );
    if (!ok) return;

    try {
      const res = await fetch(
        `${API_ROOT}/api/admin/${action}/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Action failed");
      }

      // Refresh list
      fetchPending();
    } catch (err) {
      console.error(err);
      alert("Failed to perform action");
    }
  };

  return (
    <div className="pending-page">
      <h2 className="page-title">Pending Student Requests</h2>

      {loading && <p className="muted">Loading students…</p>}

      {!loading && students.length === 0 && (
        <p className="muted">No pending student requests</p>
      )}

      <div className="pending-grid">
        {students.map((s) => (
          <div key={s.id} className="student-card pending">
            <div className="student-info">
              <h4>{s.name}</h4>
              <p>{s.email}</p>
              <p>{s.phone}</p>

              {s.room_number && (
                <p>
                  <strong>Room:</strong> {s.room_number}
                </p>
              )}

              {s.created_at && (
                <p className="muted">
                  Requested on{" "}
                  {new Date(s.created_at).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="student-actions">
              <button
                className="btn approve"
                onClick={() => handleAction(s.id, "approve")}
              >
                Approve
              </button>

              <button
                className="btn reject"
                onClick={() => handleAction(s.id, "reject")}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingStudents;
