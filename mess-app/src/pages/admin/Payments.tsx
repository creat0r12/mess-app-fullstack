import { useEffect, useState } from "react";
import { getToken } from "../../utils/auth";
import "../../styles/Payments.css";
import PaymentModalSimple from "../../components/common/payment/PaymentModalSimple";

const API = "http://localhost:5000";

/* ================= TYPES ================= */

type Payment = {
  id: number;
  student_name: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  created_at: string;
};

/* ================= COMPONENT ================= */

const Payments = () => {
  const token = getToken();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Payment | null>(null);

  /* ================= LOAD SIMPLE PAYMENTS ================= */

  const fetchPayments = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API}/api/payments/simple`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!Array.isArray(data)) {
        setPayments([]);
        return;
      }

      const grouped = Object.values(
        data.reduce((acc: any, curr: any) => {
          const key = curr.student_name;

          if (
            !acc[key] ||
            new Date(curr.created_at) > new Date(acc[key].created_at)
          ) {
            acc[key] = curr;
          }

          return acc;
        }, {})
      );

      setPayments(grouped as any);
    } catch (err) {
      console.error(err);
      setPayments([]);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [token]);

  /* ================= SEARCH ================= */

  const filtered = payments.filter((p) => {
    if (!search.trim()) return true;
    return p.student_name.toLowerCase().includes(search.toLowerCase());
  });

  /* ================= UI ================= */

  return (
    <div className="payments-page">
      <h2>All Payments</h2>

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

      {/* EMPTY */}
      {filtered.length === 0 && (
        <p className="muted">No payments found</p>
      )}

      {/* LIST */}
      {filtered.map((p) => (
        <div key={p.id} className="payment-card">
          <div className="payment-header">
            <strong>{p.student_name}</strong>

            <span className={`badge ${p.status.toLowerCase()}`}>
              {p.status === "PENDING" && "Pending"}
              {p.status === "APPROVED" && "Approved"}
              {p.status === "REJECTED" && "Rejected"}
              {p.status === "CANCELLED" && "Cancelled"}
            </span>
          </div>

          <div className="payment-body">
            <p>Amount: ₹{p.amount}</p>
            <p className="muted">
              {new Date(p.created_at).toLocaleString()}
            </p>
          </div>

          <div className="payment-actions">
            <button onClick={() => setSelected(p)}>
              View Details
            </button>
          </div>
        </div>
      ))}

      {/* MODAL */}
      {selected && (
  <PaymentModalSimple
    role="admin"
    payment={selected}
    onClose={() => setSelected(null)}
  />
)}
    </div>
  );
};

export default Payments;