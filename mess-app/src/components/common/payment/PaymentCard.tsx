import "../../../styles/paymentCard.css";
import { useState } from "react";

type Payment = {
    id: number;
    amount: number;
    status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
    proof_url?: string | null;
    created_at: string;
    method?: string;   // ✅ ADD THIS
};
type Props = {
    payment: Payment;
    role: "student" | "admin";
    onAccept?: (id: number) => void;
    onReject?: (id: number) => void;
    onCancel?: (id: number) => void;
};

const API = "http://localhost:5000";



const PaymentCard = ({
    payment,
    role,
    onAccept,
    onReject,
    onCancel,
}: Props) => {
    const [preview, setPreview] = useState<string | null>(null);

    return (
        <>
            <div className={`payment-card ${payment.status === "PENDING" ? "highlight" : ""}`}>
                {/* LEFT - IMAGE */}
                <div className="proof">
                    {payment.proof_url ? (
                        <img
                            src={`${API}${payment.proof_url}`}
                            onClick={() => setPreview(`${API}${payment.proof_url}`)}
                            style={{ cursor: "pointer" }}
                        />
                    ) : (
                        <div className="no-img">No Proof</div>
                    )}
                </div>

                {/* RIGHT - DETAILS */}
                <div className="details">
                    <p className="amount">₹{payment.amount}</p>

                    <p className="date">
                        {new Date(payment.created_at).toLocaleString()}
                    </p>

                    <p className="method">
                        Method: {payment.method || "Cash / UPI"}
                    </p>

                    <span className={`status ${payment.status?.toLowerCase()}`}>
                        {payment.status === "PENDING" ? "Pending Approval" :
                            payment.status === "APPROVED" ? "Approved" :
                                payment.status === "REJECTED" ? "Rejected" :
                                    payment.status === "CANCELLED" ? "Cancelled" :
                                        payment.status}
                    </span>

                    <div className="actions">
                        {role === "student" && payment.status === "PENDING" && (
                            <button
                                className="cancel-btn"
                                onClick={() => onCancel?.(payment.id)}
                            >
                                Cancel
                            </button>
                        )}

                        {role === "admin" && payment.status === "PENDING" && (
                            <>
                                <button
                                    className="accept-btn"
                                    onClick={() => onAccept?.(payment.id)}
                                >
                                    Accept
                                </button>

                                <button
                                    className="reject-btn"
                                    onClick={() => onReject?.(payment.id)}
                                >
                                    Reject
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* IMAGE PREVIEW */}
            {preview && (
                <div className="img-preview" onClick={() => setPreview(null)}>
                    <img src={preview} />
                </div>
            )}
        </>
    );
};

export default PaymentCard;