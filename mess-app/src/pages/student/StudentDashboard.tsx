import { useEffect, useState } from "react";
import "../../styles/studentDashboard.css";
import PaymentModalSimple from "../../components/common/payment/PaymentModalSimple";

const API = import.meta.env.VITE_API_URL;

type LeaveStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "RETURN_REQUESTED"
  | "RETURNED";

const StudentDashboard = () => {
  const token = localStorage.getItem("token");

  const [student, setStudent] = useState<any>(null);
  const [messSettings, setMessSettings] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  const [leaveDate, setLeaveDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveStatus, setLeaveStatus] = useState<LeaveStatus | null>(null);
  const [leaveLoading, setLeaveLoading] = useState(false);

  const hasLeaveRequest =
    leaveStatus === "PENDING" ||
    leaveStatus === "APPROVED" ||
    leaveStatus === "RETURN_REQUESTED";

  /* ================= LOAD STUDENT ================= */
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    setStudent({});
    setLoading(false);
  }, [token]);

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

  if (loading) return <p>Loading...</p>;
  if (!student) return <p>Please login again</p>;

  return (
    <div className="student-dashboard">
      <h2 className="welcome">Welcome, {student.name}</h2>

      <div className="card">
        <h3>Your Payment</h3>
        <button
          className="pay-btn"
          onClick={() => setShowPaymentPopup(true)}
        >
          Make Payment
        </button>
      </div>

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

      <div className="card">
        <h3>Leave Request</h3>

        {leaveStatus && (
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

            {leaveStatus === "REJECTED" && (
              <p className="error-msg">
                Leave rejected ❌ — You can apply again
              </p>
            )}

            {leaveStatus === "RETURNED" && (
              <p className="muted">
                You can apply again after 24h
              </p>
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

      {showPaymentPopup && (
        <PaymentModalSimple
          role="student"
          onClose={() => setShowPaymentPopup(false)}
        />
      )}
    </div>
  );
};

export default StudentDashboard;