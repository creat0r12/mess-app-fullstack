import { useEffect, useState } from "react";
import PaymentInfoModal from "../../components/PaymentInfoModal";
import { getToken } from "../../utils/auth";
import "../../styles/Payments.css";

import type { PaymentHistory } from "../../types/payment";

const API = "http://localhost:5000";

/* ================= TYPES ================= */

// 🔥 ADMIN NOW WORKS ON TRANSACTIONS (NOT MONTHLY PAYMENTS)
type PaymentTransaction = {
  transaction_id: number;
  membership_id: number; // 🔥 IMPORTANT
  student_name: string;
  phone?: string;

  amount: number;
  submitted_at: string;
  proof_url: string;
};


const Payments = () => {
  const token = getToken();

  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState<PaymentTransaction | null>(null);
  const [history, setHistory] = useState<PaymentHistory[]>([]);

  /* ================= LOAD PENDING TRANSACTIONS ================= */
  const fetchPayments = async () => {
    if (!token) return;

    try {
      const res = await fetch(
        `${API}/api/payments/transactions/pending`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        setPayments([]);
        return;
      }

      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch {
      setPayments([]);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [token]);

  /* ================= SEARCH ================= */
  const filtered = payments.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.student_name.toLowerCase().includes(q) ||
      (p.phone && p.phone.includes(q))
    );
  });

  /* ================= VIEW DETAILS ================= */
  const openDetails = async (p: PaymentTransaction) => {
    if (!token) return;

    try {
      const res = await fetch(
  `${API}/api/payments/history/${p.membership_id}`,
  { headers: { Authorization: `Bearer ${token}` } }
);


      const h = await res.json();
      setHistory(Array.isArray(h) ? h : []);
      setSelected(p);
    } catch {
      setHistory([]);
      setSelected(p);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="payments-page">
      <h2>Payments (Pending Approvals)</h2>

      {/* SEARCH */}
      <div className="search-filter-row">
        <input
          type="text"
          className="payment-search"
          placeholder="Search student…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* LIST */}
      {filtered.length === 0 && (
        <p className="muted">No pending payments</p>
      )}

      {filtered.map((p) => (
        <div key={p.transaction_id} className="payment-card pending">
          <div className="payment-header">
            <strong>{p.student_name}</strong>
            <span className="badge pending">PENDING</span>
          </div>

          <div className="payment-body">
            <p>Amount: ₹{p.amount}</p>
            <p className="muted">
              Submitted: {new Date(p.submitted_at).toLocaleString()}
            </p>
          </div>

          <div className="payment-actions">
            <button onClick={() => openDetails(p)}>
              View Details
            </button>
          </div>
        </div>
      ))}

      {/* DETAILS MODAL */}
      {selected && (
        <PaymentInfoModal
          payment={selected as any}
          history={history}
          onClose={() => setSelected(null)}
          isAdmin={true}
        />
      )}
    </div>
  );
};

export default Payments;
