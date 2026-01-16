import { useEffect, useState } from "react";
import "../../styles/studentDashboard.css";
import StudentPaymentPopup from "../../components/common/StudentPaymentPopup";
import PaymentInfoModal from "../../components/PaymentInfoModal";

const API = "http://localhost:5000";

const StudentDashboard = () => {
  const token = localStorage.getItem("token");

  const [student, setStudent] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);

  const [messSettings, setMessSettings] = useState<any>(null);
  const [paymentSettings, setPaymentSettings] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  // payment history 
  useEffect(() => {
    if (!token) return;

    fetch(`${API}/api/payments/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setPaymentHistory(data || []))
      .catch(() => setPaymentHistory([]));
  }, [token]);


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

  /* ================= LOAD PAYMENT SETTINGS ================= */
  useEffect(() => {
    const loadPaymentSettings = async () => {
      try {
        const res = await fetch(`${API}/api/payments/settings`);
        if (!res.ok) return; // ✅ stops 404 error
        const data = await res.json();
        setPaymentSettings(data);
      } catch {
        setPaymentSettings(null);
      }
    };

    loadPaymentSettings();
  }, []);


  /* ================= LOAD CURRENT PAYMENT ================= */
  useEffect(() => {
    if (!token) return;

    fetch(`${API}/api/payments/student`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        if (!data || Object.keys(data).length === 0) {
          setPayment(null);
        } else {
          setPayment(data);
        }
      })

      .catch(() => setPayment(null));
  }, [token]);

  if (loading) return <p>Loading...</p>;
  if (!student) return <p>Please login again</p>;

  return (
    <div className="student-dashboard">
      <h2 className="welcome">Welcome, {student.name}</h2>

      <div className="grid">
        {/* STUDENT INFO */}
        <div className="card">
          <h3>Student Information</h3>
          <p><strong>Name:</strong> {student.name}</p>
          <p><strong>Phone:</strong> {student.phone}</p>
          <p><strong>Status:</strong> {student.status}</p>
        </div>

        {/* MESS INFO */}
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
            </>
          ) : (
            <p className="muted">Mess info not available</p>
          )}
        </div>
      </div>

      {/* PAYMENT CARD */}
      <div className="card">
        <div className="payment-header">
          <h3>Current Payment</h3>

          {payment && (
            <button
              className="info-btn"
              onClick={() => setShowPaymentInfo(true)}
            >
              Payment Info
            </button>
          )}
        </div>

        {!payment && <p className="muted">No payment assigned yet</p>}

        {payment && (
          <>
            <p><strong>Due:</strong> ₹{payment.due_amount}</p>
            <p><strong>Status:</strong> {payment.status}</p>

            {payment.status === "DUE" && (
              <button
                className="pay-btn"
                onClick={() => setShowPaymentPopup(true)}
              >
                Make Payment
              </button>
            )}

            {payment.status === "PENDING" && (
              <p className="pending-msg">Waiting for admin approval</p>
            )}

            {payment.status === "PAID" && (
              <p className="paid-msg">Payment completed ✅</p>
            )}
          </>
        )}
      </div>


      {/* MENU */}
      <div className="card">
        <h3>Today's Menu</h3>
        {messSettings?.menu ? (
          <p>{messSettings.menu}</p>
        ) : (
          <p className="muted">Menu not updated</p>
        )}
      </div>

      {/* PAYMENT POPUP */}
      {showPaymentPopup && payment && (
        <StudentPaymentPopup
          payment={payment}
          paymentSettings={paymentSettings}
          onClose={() => setShowPaymentPopup(false)}
          onSuccess={(updatedPayment: any) => {
            setPayment(updatedPayment);
            setShowPaymentPopup(false);
          }}
        />
      )}

      {/* PAYMENT INFO MODAL */}
      {showPaymentInfo && payment && (
        <PaymentInfoModal
          payment={payment}
          history={paymentHistory}
          onClose={() => setShowPaymentInfo(false)}
        />
      )}


    </div>
  );


};




export default StudentDashboard;
