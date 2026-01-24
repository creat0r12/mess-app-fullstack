export type PaymentHistory = {
  payment_month: string;
  payment_year: number;
  amount: number;
  status: "PAID" | "PENDING" | "DUE";
  payment_date: string | null;
  proof_url?: string | null;
};
