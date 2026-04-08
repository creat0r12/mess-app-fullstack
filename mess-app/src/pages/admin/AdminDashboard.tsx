import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/AdminDashboard.css";
import PaymentSettingsModal from "../../components/common/PaymentSettingsModal";
import MessSettings from "./MessSettings";
import PaymentModalSimple from "../../components/common/payment/PaymentModalSimple";

/* ====== TYPES ================= */

type Payment = {
  id: number;
  student_name: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
};

type PaymentSettings = {
  upi_enabled: number;
  cash_enabled: number;
  upi_id: string | null;
  qr_image: string | null;
};

/* ================= COMPONENT ================= */

const AdminDashboard = () => {
  const [expanded, setExpanded] = useState(false);
  const [messOpen, setMessOpen] = useState(false);

  const navigate = useNavigate();

  /* ===== CONFIG ===== */
  const API = import.meta.env.VITE_API_URL;
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

  /* ===== NEW: PAYMENT MODAL ===== */
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);

  const loadMessStatus = async () => {
    try {
      const res = await axios.get(`${API}/api/mess-settings`, { headers });
      setMessOpen(res.data?.mess_open === 1);
    } catch (err) {
      console.error("Failed to load mess status", err);
    }
  };

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
          axios.get(`${API}/api/admin/student-leaves/stats`, { headers }),
        ]);

        const activeList = Array.isArray(activeRes.data) ? activeRes.data : [];
        const pendingList = Array.isArray(pendingRes.data)
          ? pendingRes.data
          : [];

        const activeCount = activeList.length;
        const pendingCount = pendingList.length;

        setActive(activeCount);
        setPending(pendingCount);
        setTotal(activeCount + pendingCount);

        setLeaveCount(leavesRes.data.active_leaves || 0);

        setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
        setPaymentSettings(paymentSettingsRes.data || null);
      } catch (err) {
        console.error("Dashboard load failed", err);
      }
    };

    loadDashboard();
    loadMessStatus();
  }, [token]);

  /* ================= FILTER PAYMENTS ================= */

  const filteredPayments = payments.filter(
    (p) => p.created_at && p.created_at.slice(0, 10) === filterDate
  );

  /* ================= SAVE PAYMENT SETTINGS ================= */

  const handleSavePaymentSettings = async (payload: any) => {
    try {
      const form = new FormData();

      form.append("upi_enabled", String(payload.upi_enabled));
      form.append("cash_enabled", String(payload.cash_enabled));
      form.append("upi_id", payload.upi_id || "");

      if (payload.qrFile) {
        form.append("qr", payload.qrFile);
      }

      form.append("boys_one_time", String(payload.boys_one_time || 0));
      form.append("boys_two_time", String(payload.boys_two_time || 0));
      form.append("girls_one_time", String(payload.girls_one_time || 0));
      form.append("girls_two_time", String(payload.girls_two_time || 0));

      await axios.post(`${API}/api/admin/payment-settings`, form, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      });

      const res = await axios.get(`${API}/api/admin/payment-settings`, {
        headers,
      });

      setPaymentSettings(res.data);
      setShowPaymentSettings(false);
    } catch (err) {
      console.error("Payment settings error:", err);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="admin-dashboard">
      <h2 className="title">Dashboard</h2>

      {/* ================= MESS STATUS ================= */}
      <div className="mess-toggle">
        <div className="mess-row">
          <div className="mess-title">Mess Status</div>

          <div
            className="mess-center"
            onClick={() => {
              if (!messOpen) return;
              setExpanded(prev => !prev);
            }}
          >
            <span className={`status-dot ${messOpen ? "open" : "closed"}`} />
            <span className="status-text">
              {messOpen ? "Open" : "Closed"}
            </span>

            {!expanded && messOpen && (
              <span className="mess-hint-inline">
                Click to manage
              </span>
            )}
          </div>

          <label className="switch" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={messOpen}
              onChange={async (e) => {
                const value = e.target.checked;

                setMessOpen(value);

                if (!value) {
                  setExpanded(false);
                }

                try {
                  const form = new FormData();
                  form.append("mess_open", value ? "1" : "0");

                  await axios.put(`${API}/api/mess-settings`, form, {
                    headers,
                  });
                } catch (err) {
                  console.error("Toggle update failed", err);
                }
              }}
            />
            <span className="slider"></span>
          </label>
        </div>

        {expanded && (
          <div className="mess-expanded">
            <MessSettings />
          </div>
        )}
      </div>

      {/* ================= STATS ================= */}
      <div className="cards-grid">
        <div className="card">
          <p>Total Students</p>
          <h2>{total}</h2>
        </div>

        <div className="card clickable" onClick={() => navigate("/admin/active")}>
          <p>Active</p>
          <h2>{active}</h2>
        </div>

        <div className="card clickable" onClick={() => navigate("/admin/pending")}>
          <p>Pending</p>
          <h2>{pending}</h2>
        </div>

        <div className="card clickable" onClick={() => navigate("/admin/student-leaves")}>
          <p>Leaves</p>
          <h2>{leaveCount}</h2>
        </div>
      </div>

      {/* ================= TODAY PAYMENT ================= */}
      <div className="card payment-card">
        <div className="card-header">
          <h3>Today’s Payments</h3>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        {filteredPayments.length === 0 ? (
          <p className="muted">No payments today</p>
        ) : (
          filteredPayments.slice(0, 3).map((p) => (
            <div key={p.id} className="payment-row">
              <div className="payment-left">
                <div className="avatar">
                  {p.student_name.charAt(0)}
                </div>
                <span className="name">{p.student_name}</span>
                <span className={`status ${p.status.toLowerCase()}`}>
                  {p.status}
                </span>
              </div>

              <div className="payment-right">
                <span className="amount">₹{p.amount}</span>

                <span
                  className="info-btn"
                  onClick={() => setShowPaymentsModal(true)}
                >
                  ℹ️
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="actions-row">
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

      {/* ================= MODALS ================= */}
      {showPaymentsModal && (
        <PaymentModalSimple
          role="admin"
          onClose={() => setShowPaymentsModal(false)}
        />
      )}

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