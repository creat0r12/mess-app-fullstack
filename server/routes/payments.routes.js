const express = require("express");
const router = express.Router();
const controller = require("../controllers/payments.controller");
const { adminAuth, studentAuth } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/uploadPayment");

/* =========================
   STUDENT: SUBMIT PAYMENT
========================= */
router.post(
  "/submit/:paymentId",
  studentAuth,
  upload.single("proof"),
  controller.submitPayment
);

/* =========================
   GET PAYMENTS (ADMIN)
========================= */
router.get("/", adminAuth, controller.getPendingTransactions);

/* =========================
   PAYMENT ACTIONS (ADMIN)
========================= */
router.put(
  "/transactions/accept/:transactionId",
  adminAuth,
  controller.acceptTransaction
);

router.put(
  "/transactions/reject/:transactionId",
  adminAuth,
  controller.rejectTransaction
);

/* =========================
   DASHBOARD STATS (ADMIN)
========================= */
router.get("/recent", adminAuth, controller.getRecentPayments);
router.get("/total", adminAuth, controller.getTotalCollection);

/* =========================
   STUDENT: PAYMENT HISTORY
========================= */
router.get("/history", studentAuth, controller.getMyPaymentHistory);

/* =========================
   PAYMENT HISTORY (ADMIN)
========================= */
router.get(
  "/history/:studentId",
  adminAuth,
  controller.getStudentPaymentHistory
);

/* =========================
   STUDENT: CURRENT PAYMENT
========================= */
router.get(
  "/student",
  studentAuth,
  controller.getStudentCurrentPayment
);

/* =========================
   STUDENT: PAYMENT SETTINGS (QR / UPI)
========================= */
router.get(
  "/settings",
  studentAuth,
  controller.getPaymentSettings
);

router.put(
  "/cancel",
  studentAuth,
  controller.cancelPendingPayment
);

router.get(
  "/transactions/pending",
  adminAuth,
  controller.getPendingTransactions
);


router.get("/all", adminAuth, controller.getAllPayments);

module.exports = router;
