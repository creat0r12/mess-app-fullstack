import { useState } from "react";
import "../styles/paymentInfoModal.css";
import type { PaymentHistory } from "../types/payment";

const API = "http://localhost:5000";

/* ================= TYPES ================= */

type Payment = {
  transaction_id: number;
  membership_id: number;

  student_name: string;
  phone?: string;
  gender?: string;

  amount: number;
  submitted_at?: string | null;
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

  /* ================= NEW DERIVED DATA ================= */

  // latest pending transaction (if any)
  const pendingTxn = history.find((h) => h.status === "PENDING");

  // approved / paid transactions only
  const paidHistory = history.filter((h) => h.status === "APPLIED");


  /* ================= STATUS LOGIC ================= */
  const getUIStatus = (): "DUE" | "PENDING" | "ACTIVE" | "PAID" => {
    if (pendingTxn) return "PENDING";

    const total = payment.amount;

    const paid = history
      .filter((h) => h.status === "APPLIED")
      .reduce((sum, h) => sum + h.amount, 0);

    if (paid === 0) return "DUE";
    if (paid > 0 && paid < total) return "ACTIVE";
    if (paid >= total) return "PAID";

    return "DUE";
  };


  const uiStatus = getUIStatus();

  /* ================= SUMMARY ================= */
  const total = payment.amount;

  const paid = history
    .filter((h) => h.status === "APPLIED")
    .reduce((sum, h) => sum + h.amount, 0);

  const remaining = Math.max(total - paid, 0);

  const selectedSummary =
    expandedKey === "current"
      ? {
        total,
        paid,
        due: remaining,
        status: uiStatus,
      }

      : (() => {
        const index = Number(expandedKey.split("-")[1]);
        const h = paidHistory[index];
        return {
          total: h.amount,
          paid: h.amount,
          due: 0,
          status: "PAID" as const,
        };
      })();

  /* ================= ACTIONS ================= */

  const handleAccept = async () => {
    if (!token) return alert("Unauthorized");
    if (!window.confirm("Accept this payment?")) return;

    await fetch(
      `${API}/api/payments/transactions/accept/${payment.transaction_id}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    onClose();
  };

  const handleReject = async () => {
    if (!token) return alert("Unauthorized");
    if (!window.confirm("Reject this payment?")) return;

    await fetch(
      `${API}/api/payments/transactions/reject/${payment.transaction_id}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    onClose();
  };
  /* ================= UI ================= */
  return (
    <div className="modal-overlay">
      <div className="modal-card scroll">
        {/* HEADER */}
        <div className="modal-header">
          <h3>Payment Details</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* STATUS */}
        <div className={`status-bar ${selectedSummary.status.toLowerCase()}`}>
          {selectedSummary.status}
        </div>

        {/* STUDENT + CYCLE */}
        <div className="row-cards">
          <div className="card">
            <h4>Student</h4>
            <p>
              <b>Name:</b> {payment.student_name}
            </p>
            <p>
              <b>Phone:</b> {payment.phone || "—"}
            </p>
            <p>
              <b>Gender:</b> {payment.gender || "—"}
            </p>
          </div>

          <div className="card">
            <h4>Payment Cycle</h4>
            <p>Current Payment Cycle</p>

            <span className="current">Current</span>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="summary-card">
          <p>
            <b>Total:</b> ₹{selectedSummary.total}
          </p>
          <p>
            <b>Paid:</b> ₹{selectedSummary.paid}
          </p>
          <p className="due">
            <b>{selectedSummary.due === 0 ? "Due:" : "Remaining:"}</b> ₹
            {selectedSummary.due}
          </p>
        </div>

        {/* TRANSACTIONS */}
        <h4 className="section-title">Transactions</h4>

        {/* CURRENT */}
        <div
          className={`txn ${expandedKey === "current" ? "big expanded" : "small"}`}
          onClick={() => setExpandedKey("current")}
        >
          <div className="txn-main">
            <p className="txn-title">Current Month</p>

            <p>
              ₹{pendingTxn ? pendingTxn.amount : remaining}

            </p>

            <p className="muted">
              {pendingTxn
                ? "Waiting for admin approval"
                : payment.submitted_at || "—"}
            </p>

            <span className={`badge ${uiStatus.toLowerCase()}`}>
              {uiStatus}
            </span>

            <p className="method">Method: Cash / QR-UPI</p>
          </div>

          {expandedKey === "current" &&
            (pendingTxn?.proof_url || payment.proof_url) && (
              <img
                src={`${API}${pendingTxn?.proof_url || payment.proof_url}`}
                className="proof-thumb"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImg(
                    `${API}${pendingTxn?.proof_url || payment.proof_url}`
                  );
                }}
              />
            )}
        </div>

        {/* HISTORY (PAID ONLY) */}
        {paidHistory.map((h, i) => {
          const key = `h-${i}`;
          const expanded = expandedKey === key;

          return (
            <div
              key={key}
              className={`txn ${expanded ? "big expanded" : "small"}`}
              onClick={() => setExpandedKey(key)}
            >
              <div className="txn-main">
                <p className="txn-title">Previous Payment</p>
                <p>₹{h.amount}</p>
                <p className="muted">{h.payment_date || "—"}</p>
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
        {isAdmin && payment.transaction_id && (
          <div className="modal-actions">
            <button className="accept-btn" onClick={handleAccept}>
              Accept
            </button>

            <button className="reject-btn" onClick={handleReject}>
              Reject
            </button>
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
