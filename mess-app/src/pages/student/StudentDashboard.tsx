import { useEffect, useState } from "react";
import "../../styles/studentDashboard.css";
import StudentPaymentPopup from "../../components/common/StudentPaymentPopup";

const API = "http://localhost:5000";

const StudentDashboard = () => {
  const token = localStorage.getItem("token");

  const [student, setStudent] = useState<any>(null);
  const [messSettings, setMessSettings] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // 🔹 LEAVE STATES
  const [leaveDate, setLeaveDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveStatus, setLeaveStatus] = useState<string | null>(null);
  const [leaveLoading, setLeaveLoading] = useState(false);


  const [myPayments, setMyPayments] = useState<any[]>([]);


  const hasLeaveRequest =
    leaveStatus !== null &&
    leaveStatus !== undefined &&
    leaveStatus !== "RETURNED";

  /* ================= LOAD STUDENT ================= */
  useEffect(() => {
    const stored = localStorage.getItem("student");
    if (stored) {
      setStudent(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  /* ================= LOAD MESS SETTINGS ================= */
  useEffect(() => {
    fetch(`${API}/api/mess-settings`)
      .then((res) => res.json())
      .then(setMessSettings)
      .catch(() => setMessSettings(null));
  }, []);

  /* ================= LOAD LEAVE STATUS ================= */
  useEffect(() => {
    if (!token) return;

    fetch(`${API}/api/student/leave`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (!data) {
          setLeaveStatus(null);
          return;
        }

        if (data.status === "RETURNED") {
          if (!data.returned_at) {
            setLeaveStatus("RETURNED");
            return;
          }

          const returnedAt = new Date(data.returned_at);
          const now = new Date();
          const diffMs = now.getTime() - returnedAt.getTime();
          const diffDays = diffMs / (1000 * 60 * 60 * 24);

          if (diffDays >= 1) {
            setLeaveStatus(null);
          } else {
            setLeaveStatus("RETURNED");
          }

          return;
        }

        setLeaveStatus(data.status);
      })
      .catch(() => {
        setLeaveStatus(null);
      });
  }, [token]);

  /* ================= SUBMIT LEAVE ================= */
  const submitLeaveRequest = async () => {
    if (!leaveDate) {
      alert("Please select leave date");
      return;
    }

    setLeaveLoading(true);

    try {
      const res = await fetch(`${API}/api/student/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          leave_date: leaveDate,
          reason: leaveReason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to submit leave");
        return;
      }

      setLeaveStatus("PENDING");
      setLeaveDate("");
      setLeaveReason("");
      alert("Leave request submitted");
    } catch {
      alert("Server error");
    } finally {
      setLeaveLoading(false);
    }
  };


  useEffect(() => {
  if (!token) return;

  fetch(`${API}/api/payments/simple/my`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => setMyPayments(data || []));
}, [token]);

  if (loading) return <p>Loading...</p>;
  if (!student) return <p>Please login again</p>;

  return (
    <div className="student-dashboard">
      <h2 className="welcome">Welcome, {student.name}</h2>

      {/* 💳 PAYMENT BLOCK */}
      <div className="card">
  <h3>Your Payment</h3>

  <button
    className="pay-btn"
    onClick={() => setShowPaymentPopup(true)}
  >
    Make Payment
  </button>

  {myPayments.map((p: any) => (
    <div key={p.id} style={{ marginTop: "12px" }}>
      <p><strong>Amount:</strong> ₹{p.amount}</p>
      <p><strong>Status:</strong> {p.status}</p>

      <img
        src={`${API}${p.proof_url}`}
        style={{ width: "100%", borderRadius: "8px" }}
      />

      {p.status === "PENDING" && (
        <button
          className="danger-btn"
          onClick={async () => {
            await fetch(`${API}/api/payments/simple/cancel/${p.id}`, {
              method: "PUT",
              headers: { Authorization: `Bearer ${token}` },
            });

            // update UI instantly
            setMyPayments((prev) =>
              prev.map((x) =>
                x.id === p.id ? { ...x, status: "REJECTED" } : x
              )
            );
          }}
        >
          Cancel Payment
        </button>
      )}
    </div>
  ))}
</div>

      {/* 🍽️ MESS INFO + MENU */}
      <div className="card">
        <h3>Mess Information</h3>

        {messSettings ? (
          <>
            <p>
              <strong>Status:</strong>{" "}
              <span className={messSettings.mess_open ? "on" : "off"}>
                {messSettings.mess_open ? "OPEN" : "CLOSED"}
              </span>
            </p>

            {messSettings.notice && (
              <div className="notice">
                <strong>Notice</strong>
                <p>{messSettings.notice}</p>
              </div>
            )}

            <div style={{ marginTop: "10px" }}>
              <strong>Today's Menu</strong>
              <p>{messSettings.menu || "Not updated"}</p>
            </div>
          </>
        ) : (
          <p className="muted">Mess info not available</p>
        )}
      </div>

      {/* 📝 LEAVE REQUEST */}
      <div className="card">
        <h3>Leave Request</h3>

        {hasLeaveRequest && (
          <div className="status-box">
            <p>
              <strong>Status:</strong>{" "}
              <span className={`leave-status ${leaveStatus?.toLowerCase()}`}>
                {leaveStatus}
              </span>
            </p>

            {leaveStatus === "PENDING" && (
              <p className="muted">Waiting for admin approval ⏳</p>
            )}

            {leaveStatus === "APPROVED" && (
              <p className="paid-msg">Leave approved ✅</p>
            )}

            {leaveStatus === "RETURN_REQUESTED" && (
              <>
                <p className="muted">Admin asked to confirm return</p>
                <button
                  className="pay-btn"
                  onClick={async () => {
                    const res = await fetch(
                      `${API}/api/student/leave/confirm-return`,
                      {
                        method: "PUT",
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );

                    if (res.ok) {
                      setLeaveStatus("RETURNED");
                      alert("Return confirmed");
                    }
                  }}
                >
                  Confirm Return
                </button>
              </>
            )}

            {leaveStatus === "RETURNED" && (
              <p className="muted">You can apply again after 24h</p>
            )}

            {leaveStatus === "REJECTED" && (
              <p className="error-msg">Leave rejected ❌</p>
            )}
          </div>
        )}

        {!hasLeaveRequest && (
          <>
            <select
              value={leaveDate}
              onChange={(e) => setLeaveDate(e.target.value)}
            >
              <option value="">Select leave date</option>
              <option value={new Date().toISOString().slice(0, 10)}>
                Today
              </option>
              <option
                value={new Date(Date.now() + 86400000)
                  .toISOString()
                  .slice(0, 10)}
              >
                Tomorrow
              </option>
            </select>

            <textarea
              placeholder="Reason (optional)"
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
            />

            <button
              className="pay-btn"
              onClick={submitLeaveRequest}
              disabled={leaveLoading}
            >
              {leaveLoading ? "Submitting..." : "Submit Leave"}
            </button>
          </>
        )}
      </div>

      {/* 💳 PAYMENT POPUP */}
      {showPaymentPopup && (
        <StudentPaymentPopup
          mess_id={student?.mess_id || 1}
          onClose={() => setShowPaymentPopup(false)}
        />
      )}
    </div>
  );
};

export default StudentDashboard;