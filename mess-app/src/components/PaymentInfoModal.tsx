import { useState } from "react";
import "../styles/paymentInfoModal.css";

const API = "http://localhost:5000";

/* ================= TYPES ================= */

type Payment = {
  id: number;
  student_name: string;
  phone?: string;
  gender?: string;

  amount: number;
  paid_amount?: number;
  due_amount: number;

  payment_month: string;
  payment_year: number;

  status?: "DUE" | "PENDING" | "PAID" | null;
  submitted_at?: string | null;
  proof_url?: string | null;
};

type PaymentHistory = {
  id?: number;
  payment_month: string;
  payment_year: number;
  amount: number;
  status: "PAID";
  payment_date: string | null;
  proof_url?: string | null;
};

type Props = {
  payment: Payment;
  history: PaymentHistory[];
  onClose: () => void;
  isAdmin?: boolean;
};

const PaymentInfoModal = ({
  payment,
  history,
  onClose,
  isAdmin = false,
}: Props) => {
  const token = localStorage.getItem("token");

  /* ================= STATE ================= */
  const [expandedKey, setExpandedKey] = useState<string>("current");
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  /* ================= FILTER HISTORY =================
     History = ONLY completed & approved months
  ==================================================== */
  const validHistory = history.filter(
    (h) => h.status === "PAID" && h.proof_url
  );

  /* ================= STATUS LOGIC (FINAL) ================= */
  const getUIStatus = (): "DUE" | "PENDING" | "ACTIVE" | "PAID" => {
    // 🟤 Pending overrides everything
    if (payment.status === "PENDING") return "PENDING";

    const paid = payment.paid_amount || 0;
    const total = payment.amount;

    // 🔴 Nothing paid
    if (paid === 0) return "DUE";

    // 🟣 Partial payment
    if (paid > 0 && paid < total) return "ACTIVE";

    // 🟢 Fully paid
    if (paid >= total) return "PAID";

    return "DUE";
  };

  const uiStatus = getUIStatus();

  /* ================= SUMMARY SOURCE ================= */
  const selectedSummary =
    expandedKey === "current"
      ? {
          total: payment.amount,
          paid: payment.paid_amount || 0,
          due: payment.due_amount,
          status: uiStatus,
        }
      : (() => {
          const index = Number(expandedKey.split("-")[1]);
          const h = validHistory[index];
          return {
            total: h.amount,
            paid: h.amount,
            due: 0,
            status: "PAID" as const,
          };
        })();

  /* ================= ACTIONS (ADMIN ONLY) ================= */
  const handleAccept = async () => {
    if (!window.confirm("Accept this payment?")) return;

    await fetch(`${API}/api/payments/accept/${payment.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    onClose();
  };

  const handleReject = async () => {
    if (!window.confirm("Reject this payment?")) return;

    await fetch(`${API}/api/payments/reject/${payment.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    onClose();
  };

  /* ================= UI ================= */
  return (
    <div className="modal-overlay">
      <div className="modal-card scroll">
        {/* HEADER */}
        <div className="modal-header">
          <h3>Payment Details</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* STATUS */}
        <div className={`status-bar ${selectedSummary.status.toLowerCase()}`}>
          {selectedSummary.status}
        </div>

        {/* STUDENT + CYCLE */}
        <div className="row-cards">
          <div className="card">
            <h4>Student</h4>
            <p><b>Name:</b> {payment.student_name}</p>
            <p><b>Phone:</b> {payment.phone || "—"}</p>
            <p><b>Gender:</b> {payment.gender || "—"}</p>
          </div>

          <div className="card">
            <h4>Payment Cycle</h4>
            <p>{payment.payment_month} {payment.payment_year}</p>
            <span className="current">Current</span>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="summary-card">
          <p><b>Total:</b> ₹{selectedSummary.total}</p>
          <p><b>Paid:</b> ₹{selectedSummary.paid}</p>
          <p className="due">
            <b>{selectedSummary.due === 0 ? "Due:" : "Remaining:"}</b> ₹{selectedSummary.due}
          </p>
        </div>

        {/* TRANSACTIONS */}
        <h4 className="section-title">Transactions</h4>

        {/* CURRENT PAYMENT */}
        <div
          className={`txn ${expandedKey === "current" ? "big expanded" : "small"}`}
          onClick={() => setExpandedKey("current")}
        >
          <div className="txn-main">
            <p className="txn-title">Current Month</p>
            <p>₹{payment.paid_amount || 0}</p>
            <p className="muted">{payment.submitted_at || "—"}</p>
            <span className={`badge ${uiStatus.toLowerCase()}`}>{uiStatus}</span>
            <p className="method">Method: Cash / QR-UPI</p>
          </div>

          {expandedKey === "current" && payment.proof_url && (
            <img
              src={`${API}${payment.proof_url}`}
              className="proof-thumb"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImg(`${API}${payment.proof_url}`);
              }}
            />
          )}
        </div>

        {/* PREVIOUS PAYMENTS (PAID ONLY) */}
        {validHistory.map((h, i) => {
          const key = `h-${i}`;
          const expanded = expandedKey === key;

          return (
            <div
              key={key}
              className={`txn ${expanded ? "big expanded" : "small"}`}
              onClick={() => setExpandedKey(key)}
            >
              <div className="txn-main">
                <p className="txn-title">{h.payment_month} {h.payment_year}</p>
                <p>₹{h.amount}</p>
                <p className="muted">{h.payment_date}</p>
                <span className="badge paid">PAID</span>
                <p className="method">Method: Cash / QR-UPI</p>
              </div>

              {expanded && h.proof_url && (
                <img
                  src={`${API}${h.proof_url}`}
                  className="proof-thumb"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewImg(`${API}${h.proof_url}`);
                  }}
                />
              )}
            </div>
          );
        })}

        {/* ADMIN ACTIONS */}
        {isAdmin && uiStatus === "PENDING" && (
          <div className="modal-actions">
            <button className="accept-btn" onClick={handleAccept}>Accept</button>
            <button className="reject-btn" onClick={handleReject}>Reject</button>
          </div>
        )}
      </div>

      {/* IMAGE PREVIEW */}
      {previewImg && (
        <div className="img-viewer" onClick={() => setPreviewImg(null)}>
          <img src={previewImg} />
        </div>
      )}
    </div>
  );
};

export default PaymentInfoModal;
