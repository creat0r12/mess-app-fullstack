const express = require("express");
const router = express.Router();
const controller = require("../controllers/payments.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const uploadPayment = require("../middlewares/uploadPayment");

/* =========================
   STUDENT: SUBMIT PAYMENT
========================= */
router.post(
  "/submit/:paymentId",
  authMiddleware,
  uploadPayment.single("proof"),
  controller.submitPayment
);

/* =========================
   GET PAYMENTS (ADMIN)
========================= */
router.get("/", authMiddleware, controller.getPayments);

/* =========================
   PAYMENT ACTIONS (ADMIN)
========================= */
router.put("/accept/:paymentId", authMiddleware, controller.acceptPayment);
router.put("/reject/:paymentId", authMiddleware, controller.rejectPayment);

/* =========================
   DASHBOARD STATS (ADMIN)
========================= */
router.get("/recent", authMiddleware, controller.getRecentPayments);
router.get("/total", authMiddleware, controller.getTotalCollection);

/* =========================
   PAYMENT HISTORY (ADMIN)
========================= */
router.get(
  "/history/:studentId",
  authMiddleware,
  controller.getStudentPaymentHistory
);

/* =========================
   STUDENT: CURRENT PAYMENT
========================= */
router.get(
  "/student",
  authMiddleware,
  controller.getStudentCurrentPayment
);

/* =========================
   STUDENT: PAYMENT SETTINGS (QR / UPI)
========================= */
router.get(
  "/settings",
  controller.getPaymentSettings
);

module.exports = router;
