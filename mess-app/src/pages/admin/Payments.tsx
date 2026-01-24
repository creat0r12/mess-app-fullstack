import { useEffect, useState } from "react";
import PaymentInfoModal from "../../components/PaymentInfoModal";
import { getToken } from "../../utils/auth";
import "../../styles/Payments.css";

import type { PaymentHistory } from "../../types/payment";

const API = "http://localhost:5000";

/* ================= TYPES ================= */

type PaymentStatus = "ALL" | "DUE" | "PENDING" | "PAID" | "ACTIVE";

type Payment = {
  id: number;
  student_id: number;
  student_name: string;
  phone?: string;

  amount: number;
  due_amount: number;
  paid_amount?: number;

  payment_month: string;
  payment_year: number;

  status: "DUE" | "PENDING" | "PAID";
};



const Payments = () => {
  const token = getToken();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState<PaymentStatus>("ALL");
  const [search, setSearch] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Payment | null>(null);
  const [history, setHistory] = useState<PaymentHistory[]>([]);

  /* ================= STATUS LOGIC ================= */
  const getUIStatus = (p: Payment): PaymentStatus => {
    if (p.status === "PENDING") return "PENDING";
    if (p.due_amount === 0) return "PAID";
    if (p.paid_amount && p.paid_amount > 0) return "ACTIVE";
    return "DUE";
  };

  /* ================= LOAD PAYMENTS ================= */
  const fetchPayments = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API}/api/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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

  /* ================= FILTER + SEARCH ================= */
  const filtered = payments
    .filter((p) => (filter === "ALL" ? true : getUIStatus(p) === filter))
    .filter((p) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.student_name.toLowerCase().includes(q) ||
        (p.phone && p.phone.includes(q))
      );
    });

  /* ================= VIEW DETAILS ================= */
  const openDetails = async (p: Payment) => {
    if (!token) return;

    try {
      const res = await fetch(
        `${API}/api/payments/history/${p.student_id}`,
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

  return (
    <div className="payments-page">
      <h2>Payments</h2>

      {/* SEARCH + FILTER ROW */}
      <div className="search-filter-row">
        <input
          type="text"
          className="payment-search"
          placeholder="Search student…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          className="filter-btn-toggle"
          onClick={() => setShowFilters((s) => !s)}
        >
          Filters ▾
        </button>
      </div>

      {/* FILTER DROPDOWN */}
      {showFilters && (
        <div className="filter-dropdown">
          {["ALL", "ACTIVE", "PENDING", "PAID", "DUE"].map((f) => (
            <button
              key={f}
              className={`filter-item ${filter === f ? "active" : ""}`}
              onClick={() => {
                setFilter(f as PaymentStatus);
                setShowFilters(false);
              }}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* LIST */}
      {filtered.map((p) => {
        const ui = getUIStatus(p);

        return (
          <div key={p.id} className={`payment-card ${ui.toLowerCase()}`}>
            <div className="payment-header">
              <strong>{p.student_name}</strong>
              <span className={`badge ${ui.toLowerCase()}`}>{ui}</span>
            </div>

            <div className="payment-body">
              <p>
                {p.payment_month} {p.payment_year}
              </p>
              <p>Paid: ₹{p.paid_amount || 0} / ₹{p.amount}</p>
              <p className="due">Due: ₹{p.due_amount}</p>
            </div>

            <div className="payment-actions">
              <button onClick={() => openDetails(p)}>
                View Details
              </button>
            </div>
          </div>
        );
      })}

      {selected && (
        <PaymentInfoModal
          payment={selected}
          history={history}
          onClose={() => setSelected(null)}
          isAdmin={true}
        />
      )}
    </div>
  );
};

export default Payments;
