import { useState } from "react";
import "../../styles/StudentPaymentPopup.css";

const API = "http://localhost:5000";

interface Props {
  payment: any;
  paymentSettings: any;
  onClose: () => void;
  onSuccess: (updatedPayment: any) => void;
}

const StudentPaymentPopup = ({
  payment,
  paymentSettings,
  onClose,
  onSuccess,
}: Props) => {
  const token = localStorage.getItem("token");

  const [method, setMethod] = useState<"UPI" | "CASH">("UPI");
  const [amount, setAmount] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [msg, setMsg] = useState("");

  const submitPayment = async () => {
    if (!amount) {
      setMsg("Enter amount");
      return;
    }

    if (method === "UPI" && !proof) {
      setMsg("Payment proof required");
      return;
    }

    const formData = new FormData();
    formData.append("paid_amount", amount);
    if (proof) formData.append("proof", proof);

    try {
      const res = await fetch(
        `${API}/api/payments/submit/${payment.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();
      setMsg(data.message);

      if (res.ok) {
        onSuccess({
          ...payment,
          status: "PENDING",
          paid_amount: amount,
        });
      }
    } catch {
      setMsg("Server error");
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <h3>Make Payment</h3>

        <p><strong>Due Amount:</strong> ₹{payment.due_amount}</p>

        <div className="method">
          {paymentSettings?.upi_enabled === 1 && (
            <label>
              <input
                type="radio"
                checked={method === "UPI"}
                onChange={() => setMethod("UPI")}
              />
              UPI / QR
            </label>
          )}

          {paymentSettings?.cash_enabled === 1 && (
            <label>
              <input
                type="radio"
                checked={method === "CASH"}
                onChange={() => setMethod("CASH")}
              />
              Cash
            </label>
          )}
        </div>

        {method === "UPI" && paymentSettings?.qr_image && (
          <div className="upi-box">
            <img src={`${API}${paymentSettings.qr_image}`} />
            <p>{paymentSettings.upi_id}</p>
          </div>
        )}

        <input
          type="number"
          placeholder="Amount Paid"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {method === "UPI" && (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProof(e.target.files?.[0] || null)}
          />
        )}

        {msg && <p className="msg">{msg}</p>}

        <div className="actions">
          <button className="btn-primary" onClick={submitPayment}>
            Submit Payment
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentPaymentPopup;
