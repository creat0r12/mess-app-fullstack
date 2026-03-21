import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/AdminDashboard.css";
import PaymentSettingsModal from "../../components/common/PaymentSettingsModal";
import MessSettings from "./MessSettings";
/* ================= TYPES ================= */

type Payment = {
  id: number;
  student_name: string;
  amount: number;
  status: "PAID" | "PENDING" | "DUE";
  submitted_at: string | null;
};

type PaymentSettings = {
  upi_enabled: number;
  cash_enabled: number;
  upi_id: string | null;
  qr_image: string | null;
};



/* ================= COMPONENT ================= */

const AdminDashboard = () => {
  const navigate = useNavigate();

  /* ===== CONFIG ===== */
  const API = "http://localhost:5000";
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  /* ===== COUNTS ===== */
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [pending, setPending] = useState(0);
  const [leaveCount, setLeaveCount] = useState(0);

  /* ===== PAYMENTS ===== */
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  /* ===== PAYMENT SETTINGS ===== */
  const [paymentSettings, setPaymentSettings] =
    useState<PaymentSettings | null>(null);
  const [showPaymentSettings, setShowPaymentSettings] = useState(false);



  /* ================= LOAD DASHBOARD ================= */

  useEffect(() => {
    if (!token) return;

    const loadDashboard = async () => {
      try {
        const [
          activeRes,
          pendingRes,
          paymentsRes,
          paymentSettingsRes,
          leavesRes,
        ] = await Promise.all([
          axios.get(`${API}/api/admin/active-students`, { headers }),
          axios.get(`${API}/api/admin/pending-students`, { headers }),
          axios.get(`${API}/api/payments/recent`, { headers }),
          axios.get(`${API}/api/admin/payment-settings`, { headers }),
          axios.get(`${API}/api/admin/student-leaves?status=APPROVED`, { headers }),
        ]);



        const activeList = Array.isArray(activeRes.data) ? activeRes.data : [];
        const pendingList = Array.isArray(pendingRes.data) ? pendingRes.data : [];

        const activeCount = activeList.length;
        const pendingCount = pendingList.length;

        setActive(activeCount);
        setPending(pendingCount);
        setTotal(activeCount + pendingCount);

        const leaves = Array.isArray(leavesRes.data) ? leavesRes.data : [];
        setLeaveCount(leaves.length);


        setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
        setPaymentSettings(paymentSettingsRes.data || null);

      } catch (err) {
        console.error("Dashboard load failed", err);
      }
    };

    loadDashboard();
  }, [token]);

  /* ================= FILTER PAYMENTS ================= */

  const filteredPayments = payments.filter(
    (p) => p.submitted_at && p.submitted_at.slice(0, 10) === filterDate
  );

  /* ================= SAVE PAYMENT SETTINGS ================= */

  const handleSavePaymentSettings = async (payload: {
  upi_enabled: number;
  cash_enabled: number;
  upi_id: string | null;
  qrFile?: File | null;
  boys_monthly_amount: number;
  girls_monthly_amount: number;
}) => {
  try {
    const form = new FormData();

    form.append("upi_enabled", String(payload.upi_enabled));
    form.append("cash_enabled", String(payload.cash_enabled));
    form.append("upi_id", payload.upi_id || "");

    if (payload.qrFile) {
      form.append("qr", payload.qrFile); // ✅ must be "qr"
    }

    form.append(
      "boys_monthly_amount",
      String(payload.boys_monthly_amount)
    );
    form.append(
      "girls_monthly_amount",
      String(payload.girls_monthly_amount)
    );

    await axios.post(`${API}/api/admin/payment-settings`, form, {
      headers: {
        ...headers,
        "Content-Type": "multipart/form-data", // ✅ VERY IMPORTANT
      },
    });

    const res = await axios.get(
      `${API}/api/admin/payment-settings`,
      { headers }
    );

    setPaymentSettings(res.data);
    setShowPaymentSettings(false);

    console.log("✅ Payment settings saved");
  } catch (err) {
    console.error("❌ Payment settings error:", err);
  }
};

  /* ================= SAVE MESS SETTINGS ================= */



  /* ================= UI ================= */

  return (
  <div className="admin-dashboard">
    <h2 className="title">Admin Dashboard</h2>

    {/* ✅ 1. MESS CONTROL (TOP PRIORITY) */}
    <div className="section">
      <MessSettings />
    </div>

    {/* ✅ 2. STATS */}
    <div className="top-cards">
      <div className="mini-card">
        <p>Total Students</p>
        <h3>{total}</h3>
      </div>

      <div
        className="mini-card clickable"
        onClick={() => navigate("/admin/active")}
      >
        <p>Active</p>
        <h3>{active}</h3>
      </div>

      <div
        className="mini-card clickable"
        onClick={() => navigate("/admin/pending")}
      >
        <p>Pending</p>
        <h3>{pending}</h3>
      </div>

      <div
        className="mini-card clickable"
        onClick={() => navigate("/admin/student-leaves")}
      >
        <p>Leaves</p>
        <h3>{leaveCount}</h3>
      </div>
    </div>

    {/* ✅ 3. PAYMENTS (MAIN ACTION AREA) */}
    <div className="history-box">
      <div className="history-header">
        <h3>Today’s Payments</h3>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      {filteredPayments.length === 0 && (
        <p className="muted">No payments found</p>
      )}

      {filteredPayments.map((p) => (
        <div key={p.id} className="history-row">
          <div>
            <strong>{p.student_name}</strong>
            <p>₹{p.amount}</p>
          </div>

          <div className="history-right">
            {p.status === "PAID" && (
              <span className="status paid">✔</span>
            )}
            {p.status === "PENDING" && (
              <span className="status pending">●</span>
            )}

            <button
              className="info-btn"
              onClick={() => navigate("/admin/payments")}
            >
              ℹ️
            </button>
          </div>
        </div>
      ))}
    </div>

    {/* ✅ 4. ACTION BUTTONS (NOT CARDS) */}
    <div className="action-box">
      <button
        className="primary-btn"
        onClick={() => navigate("/admin/payments")}
      >
        View All Payments
      </button>

      <button
        className="secondary-btn"
        onClick={() => setShowPaymentSettings(true)}
      >
        Payment Settings
      </button>
    </div>

    {/* ===== MODAL ===== */}
    {showPaymentSettings && (
      <PaymentSettingsModal
        settings={
          paymentSettings ?? {
            upi_enabled: 0,
            cash_enabled: 0,
            upi_id: null,
            qr_image: null,
          }
        }
        onClose={() => setShowPaymentSettings(false)}
        onSave={handleSavePaymentSettings}
      />
    )}
  </div>
);
};

export default AdminDashboard;
