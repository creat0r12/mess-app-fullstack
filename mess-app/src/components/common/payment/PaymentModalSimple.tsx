import { useState, useEffect } from "react";
import "../../../styles/paymentModalSimple.css";
import PaymentCard from "./PaymentCard";

type Payment = {
    id: number;
    membership_id: number;
    amount: number;
    status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
    proof_url?: string | null;
    created_at: string;
};

type Props = {
    role?: "student" | "admin";
    onClose: () => void;
    payment?: any; // selected payment
};

const PaymentModalSimple = ({ role = "student", onClose, payment }: Props) => {
    const API = import.meta.env.VITE_API_URL;

    /* ================= STATE ================= */
    const [amount, setAmount] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const token = localStorage.getItem("token");

    /* ================= ACTIONS ================= */

    const handleSubmit = async () => {
        if (!amount || !file) {
            alert("Enter amount & upload proof");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("amount", amount);
            formData.append("proof", file);

            const res = await fetch(
                `${API}/api/payments/simple/upload`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Payment failed");
                return;
            }

            alert("Payment submitted successfully");

            const refreshed = await fetch(
                `${API}/api/payments/simple/my`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const newData = await refreshed.json();
            setPayments(newData || []);

            setAmount("");
            setFile(null);

        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        }
    };

    const handleAccept = async (id: number) => {
        const res = await fetch(
            `${API}/api/payments/simple/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: "APPROVED" }),
            }
        );

        if (!res.ok) {
            console.error("Accept failed");
            return;
        }

        const refreshed = await fetch(
            `${API}/api/payments/simple`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        const data = await refreshed.json();

        const filtered = data.filter(
            (p: any) => p.membership_id === payment?.membership_id
        );

        setPayments(filtered || []);
    };

    const handleReject = async (id: number) => {
        const res = await fetch(
            `${API}/api/payments/simple/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: "REJECTED" }),
            }
        );

        if (!res.ok) {
            console.error("Reject failed");
            return;
        }

        const refreshed = await fetch(
            `${API}/api/payments/simple`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        const data = await refreshed.json();

        const filtered = data.filter(
            (p: any) => p.membership_id === payment?.membership_id
        );

        setPayments(filtered || []);
    };

    const handleCancel = async (id: number) => {
        await fetch(
            `${API}/api/payments/simple/cancel/${id}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const refreshed = await fetch(
            `${API}/api/payments/simple/my`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        const newData = await refreshed.json();
        setPayments(newData || []);
    };

    useEffect(() => {
        if (!token) return;

        if (role === "admin" && payment) {
            fetch(`${API}/api/payments/simple`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    const filtered = data.filter(
                        (p: any) => p.membership_id === payment?.membership_id
                    );
                    setPayments(filtered || []);
                });
        } else {
            fetch(`${API}/api/payments/simple/my`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => res.json())
                .then((data) => setPayments(Array.isArray(data) ? data : []));
        }
    }, [payment]);

    /* ================= UI ================= */
    return (
        <div className="modal-overlay">
            <div className="modal-card">
                {/* HEADER */}
                <div className="modal-header">
                    <h3>Payments</h3>
                    <button onClick={onClose}>✕</button>
                </div>

                {/* TOP SECTION (STUDENT ONLY) */}
                {role === "student" && (
                    <div className="top-section">
                        <h4>Make Payment</h4>

                        <input
                            type="number"
                            placeholder="Enter amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />

                        <input
                            type="file"
                            onChange={(e) =>
                                setFile(e.target.files ? e.target.files[0] : null)
                            }
                        />

                        <button onClick={handleSubmit}>Submit</button>
                    </div>
                )}

                {/* TRANSACTION LIST */}
                <div className="transaction-list">
                    {payments.map((p) => (
                        <PaymentCard
                            key={p.id}
                            payment={p}
                            role={role}
                            onAccept={handleAccept}
                            onReject={handleReject}
                            onCancel={handleCancel}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PaymentModalSimple;