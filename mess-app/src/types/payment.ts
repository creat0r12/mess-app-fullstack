export type PaymentHistory = {
  amount: number;
status: "PAID" | "PENDING" | "DUE" | "APPLIED" | "REJECTED";
  payment_date: string | null;
  proof_url?: string | null;
};
