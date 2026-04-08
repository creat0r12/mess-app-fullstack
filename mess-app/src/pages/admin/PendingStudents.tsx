import { useEffect, useState } from "react";
import { getToken } from "../../utils/auth";
import "../../styles/PendingStudents.css";

/* =========================
   TYPES
========================= */
type PendingMembership = {
  membership_id: number;
  user_id: number;
  name: string;
  email?: string;
  phone?: string;
  meal_slot?: string;
  created_at?: string;
};

const API_ROOT = `${import.meta.env.VITE_API_URL}";

const PendingStudents = () => {
  const [students, setStudents] = useState<PendingMembership[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH PENDING REQUESTS
  ========================= */
  const fetchPending = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${API_ROOT}/api/admin/pending-students`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!res.ok) {
        console.error("Failed to load pending students");
        setStudents([]);
        return;
      }

      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching pending students", err);
      setStudents([]);
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
    membershipId: number,
    action: "approve" | "reject"
  ) => {
    const ok = window.confirm(
      `Are you sure you want to ${action} this student?`
    );
    if (!ok) return;

    const endpoint =
      action === "approve"
        ? "approve-student"
        : "reject-student";

    try {
      const res = await fetch(
        `${API_ROOT}/api/admin/${endpoint}/${membershipId}`,  // ✅ comma added
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!res.ok) {
        console.error("Action failed");
        return;
      }

      // Refresh list after action
      fetchPending();
    } catch (err) {
      console.error("Failed to perform action", err);
    }
  };

  // 🔹 GROUP LUNCH + DINNER REQUESTS
  const groupedStudents = Object.values(
    students.reduce((acc: any, curr) => {
      const key = `${curr.user_id}-${curr.created_at}`;

      if (!acc[key]) {
        acc[key] = {
          ...curr,
          meal_slots: [curr.meal_slot],
          membership_ids: [curr.membership_id],
        };
      } else {
        acc[key].meal_slots.push(curr.meal_slot);
        acc[key].membership_ids.push(curr.membership_id);
      }

      return acc;
    }, {})
  );


  return (
    <div className="pending-page">
      <h2 className="page-title">Pending Student Requests</h2>

      {loading && <p className="muted">Loading students…</p>}

      {!loading && students.length === 0 && (
        <p className="muted">No pending student requests</p>
      )}

      <div className="pending-grid">
        {groupedStudents.map((s: any) => (
          <div
            key={s.membership_id}
            className="student-card pending"
          >
            <div className="student-info">
              <h4>{s.name}</h4>
              <p>{s.email || "-"}</p>
              <p>{s.phone || "-"}</p>

              {s.meal_slot && (
                <p>
                  <strong>Meal:</strong> {s.meal_slots.join(" + ")}

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
                onClick={() => {
                  const ok = window.confirm("Approve this request?");
                  if (!ok) return;

                  s.membership_ids.forEach((id: number) => {
                    handleAction(id, "approve");
                  });
                }}
              >
                Approve
              </button>


              <button
                className="btn reject"
                onClick={() => {
                  const ok = window.confirm("Reject this request?");
                  if (!ok) return;

                  s.membership_ids.forEach((id: number) => {
                    handleAction(id, "reject");
                  });
                }}
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
