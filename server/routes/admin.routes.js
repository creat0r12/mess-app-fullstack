const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/admin.controller");
const upload = require("../middlewares/uploadPayment");

// ✅ Pending students
router.get(
  "/pending",
  auth,
  controller.getPendingStudents
);

// ✅ Approve student
router.put(
  "/approve/:id",
  auth,
  controller.approveStudent
);

// ✅ Reject student
router.put(
  "/reject/:id",
  auth,
  controller.rejectStudent
);

// ✅ Active students
router.get(
  "/active",
  auth,
  controller.getActiveStudents
);

// ✅ Deactivate student
router.put(
  "/deactivate/:id",
  auth,
  controller.deactivateStudent
);

// ✅ Dashboard stats
router.get(
  "/dashboard-stats",
  auth,
  controller.getDashboardStats
);

// ✅ Payment settings (GET)
router.get(
  "/payment-settings",
  auth,
  controller.getPaymentSettings
);

// ✅ Payment settings (UPDATE)
router.post(
  "/payment-settings",
  auth,
  upload.single("qr"),
  controller.updatePaymentSettings
);

module.exports = router;
