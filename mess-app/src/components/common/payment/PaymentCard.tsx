import styles from "../../../styles/paymentCard.module.css";
import { useState } from "react";

type Payment = {
    id: number;
    amount: number;
    status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
    proof_url?: string | null;
    created_at: string;
    method?: string;
};

type Props = {
    payment: Payment;
    role: "student" | "admin";
    onAccept?: (id: number) => void;
    onReject?: (id: number) => void;
    onCancel?: (id: number) => void;
};

const API = `${import.meta.env.VITE_API_URL}";

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
            <div
                className={`${styles["payment-card"]} ${
                    payment.status === "PENDING" ? styles.highlight : ""
                }`}
            >
                {/* LEFT - IMAGE */}
                <div className={styles.proof}>
                    {payment.proof_url ? (
                        <img
                            src={`${API}${payment.proof_url}`}
                            onClick={() =>
                                setPreview(`${API}${payment.proof_url}`)
                            }
                            style={{ cursor: "pointer" }}
                        />
                    ) : (
                        <div className={styles["no-img"]}>No Proof</div>
                    )}
                </div>

                {/* RIGHT - DETAILS */}
                <div className={styles.details}>
                    <p className={styles.amount}>₹{payment.amount}</p>

                    <p className={styles.date}>
                        {new Date(payment.created_at).toLocaleString()}
                    </p>

                    <p className={styles.method}>
                        Method: {payment.method || "Cash / UPI"}
                    </p>

                    <span
                        className={`${styles.status} ${
                            styles[payment.status.toLowerCase()]
                        }`}
                    >
                        {payment.status === "PENDING"
                            ? "Pending Approval"
                            : payment.status === "APPROVED"
                            ? "Approved"
                            : payment.status === "REJECTED"
                            ? "Rejected"
                            : payment.status === "CANCELLED"
                            ? "Cancelled"
                            : payment.status}
                    </span>

                    <div className={styles.actions}>
                        {role === "student" &&
                            payment.status === "PENDING" && (
                                <button
                                    className={styles["cancel-btn"]}
                                    onClick={() =>
                                        onCancel?.(payment.id)
                                    }
                                >
                                    Cancel
                                </button>
                            )}

                        {role === "admin" &&
                            payment.status === "PENDING" && (
                                <>
                                    <button
                                        className={styles["accept-btn"]}
                                        onClick={() =>
                                            onAccept?.(payment.id)
                                        }
                                    >
                                        Accept
                                    </button>

                                    <button
                                        className={styles["reject-btn"]}
                                        onClick={() =>
                                            onReject?.(payment.id)
                                        }
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
                <div
                    className={styles["img-preview"]}
                    onClick={() => setPreview(null)}
                >
                    <img src={preview} />
                </div>
            )}
        </>
    );
};

export default PaymentCard;