import { useState } from "react";
import "../../styles/StudentPaymentPopup.css";

const API = `${import.meta.env.VITE_API_URL}";

type Props = {
  mess_id: number;
  onClose: () => void;
};

const StudentPaymentPopup = ({ mess_id, onClose }: Props) => {
  const token = localStorage.getItem("token");

  const [amount, setAmount] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submitPayment = async () => {
    if (!amount) {
      setMsg("Enter amount");
      return;
    }

    if (!proof) {
      setMsg("Upload payment proof");
      return;
    }

    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("mess_id", String(mess_id));
    formData.append("proof", proof);

    try {
      setLoading(true);

      const res = await fetch(`${API}/api/payments/simple/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      setMsg(data.message);

      if (res.ok) {
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch {
      setMsg("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <h3>Upload Payment Proof</h3>

        <input
          type="number"
          placeholder="Enter Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProof(e.target.files?.[0] || null)}
        />

        {msg && <p className="msg">{msg}</p>}

        <div className="actions">
          <button
            className="btn-primary"
            onClick={submitPayment}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Payment"}
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