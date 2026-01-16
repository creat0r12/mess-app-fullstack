import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/AdminDashboard.css";
import PaymentSettingsModal from "../../components/common/PaymentSettingsModal";

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

type MessSettings = {
  mess_open: number;
  notice: string | null;
  menu: string | null;
  image_url: string | null;
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

  /* ===== PAYMENTS ===== */
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  /* ===== PAYMENT SETTINGS ===== */
  const [paymentSettings, setPaymentSettings] =
    useState<PaymentSettings | null>(null);
  const [showPaymentSettings, setShowPaymentSettings] = useState(false);

  /* ===== MESS SETTINGS ===== */
  const [messOpen, setMessOpen] = useState(true);
  const [notice, setNotice] = useState("");
  const [menu, setMenu] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
          messSettingsRes,
        ] = await Promise.all([
          axios.get(`${API}/api/admin/active-students`, { headers }),
          axios.get(`${API}/api/admin/pending-students`, { headers }),
          axios.get(`${API}/api/payments/recent`, { headers }),
          axios.get(`${API}/api/admin/payment-settings`, { headers }),
          axios.get(`${API}/api/mess-settings`, { headers }),
        ]);

        const activeList = Array.isArray(activeRes.data) ? activeRes.data : [];
        const pendingList = Array.isArray(pendingRes.data) ? pendingRes.data : [];

        const activeCount = activeList.length;
        const pendingCount = pendingList.length;

        setActive(activeCount);
        setPending(pendingCount);
        setTotal(activeCount + pendingCount);

        setActive(activeCount);
        setPending(pendingCount);
        setTotal(activeCount + pendingCount);

        setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
        setPaymentSettings(paymentSettingsRes.data || null);

        const mess: MessSettings = messSettingsRes.data;
        setMessOpen(mess.mess_open === 1);
        setNotice(mess.notice || "");
        setMenu(mess.menu || "");
        setImagePreview(
          mess.image_url ? `${API}${mess.image_url}` : null
        );
      } catch (err) {
        console.error("Dashboard load failed", err);
      }
    };

    loadDashboard();
  }, [token]);

  /* ================= FILTER PAYMENTS ================= */

  const filteredPayments = payments.filter(
    (p) =>
      p.submitted_at &&
      p.submitted_at.slice(0, 10) === filterDate
  );

  /* ================= SAVE PAYMENT SETTINGS ================= */

 const handleSavePaymentSettings = async (payload: {
  upi_enabled: number;
  cash_enabled: number;
  upi_id: string | null;
  qrFile?: File | null;

  // ✅ MISSING FIELDS
  boys_monthly_amount: number;
  girls_monthly_amount: number;
}) => {
  const form = new FormData();

  form.append("upi_enabled", String(payload.upi_enabled));
  form.append("cash_enabled", String(payload.cash_enabled));
  form.append("upi_id", payload.upi_id || "");

  // ✅ QR (already correct)
  if (payload.qrFile) {
    form.append("qr", payload.qrFile);
  }

  // ✅ ADD THESE
  form.append(
    "boys_monthly_amount",
    String(payload.boys_monthly_amount)
  );
  form.append(
    "girls_monthly_amount",
    String(payload.girls_monthly_amount)
  );

  await axios.post(`${API}/api/admin/payment-settings`, form, { headers });

  const res = await axios.get(`${API}/api/admin/payment-settings`, {
    headers,
  });

  setPaymentSettings(res.data);
  setShowPaymentSettings(false);
};


  /* ================= SAVE MESS SETTINGS ================= */

  const saveMessSettings = async () => {
    const form = new FormData();
    form.append("mess_open", messOpen ? "1" : "0");
    form.append("notice", notice);
    form.append("menu", menu);
    if (imageFile) form.append("image", imageFile);

    await axios.put(`${API}/api/mess-settings`, form, { headers });
    alert("Mess info updated successfully");
  };

  /* ================= UI ================= */

  return (
    <div className="admin-dashboard">
      <h2 className="title">Admin Dashboard</h2>

      {/* ===== TOP CARDS ===== */}
      <div className="top-cards">
        <div className="mini-card">
          <p>Total Students</p>
          <h3>{total}</h3>
        </div>

        <div className="mini-card clickable" onClick={() => navigate("/admin/active")}>
          <p>Active</p>
          <h3>{active}</h3>
        </div>

        <div className="mini-card clickable" onClick={() => navigate("/admin/pending")}>
          <p>Pending</p>
          <h3>{pending}</h3>
        </div>

        <div className="mini-card clickable" onClick={() => navigate("/admin/payments")}>
          <p>Payments</p>
          <h3>View</h3>
        </div>

        <div
          className="mini-card clickable settings-card"
          onClick={() => setShowPaymentSettings(true)}
        >
          <p>Payment Settings</p>
          <h3>Edit</h3>
        </div>
      </div>

      {/* ===== MESS INFO CARD ===== */}
      <div className="mess-card">
        <h3>Mess Information</h3>

        <div className="toggle-row">
          <span>Mess Status</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={messOpen}
              onChange={() => setMessOpen(!messOpen)}
            />
            <span className="slider" />
          </label>
        </div>

        <textarea
          placeholder="Notice for students"
          value={notice}
          onChange={(e) => setNotice(e.target.value)}
        />

        <textarea
          placeholder="Menu details"
          value={menu}
          onChange={(e) => setMenu(e.target.value)}
        />

        {imagePreview && (
          <img src={imagePreview} alt="Mess" className="mess-image" />
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            e.target.files && setImageFile(e.target.files[0])
          }
        />

        <button className="save-btn" onClick={saveMessSettings}>
          Save Mess Info
        </button>
      </div>

      {/* ===== PAYMENT HISTORY ===== */}
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
              {p.status === "PAID" && <span className="status paid">✔</span>}
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

      {/* ===== PAYMENT SETTINGS MODAL ===== */}
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
