const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/admin.controller");
const upload = require("../middlewares/uploadPayment");

/* =========================
   STUDENTS (ADMIN)
========================= */

// ✅ Pending students
router.get(
  "/pending-students",
  auth,
  controller.getPendingStudents
);

// ✅ Approve student
router.put(
  "/approve-student/:id",
  auth,
  controller.approveStudent
);

// ✅ Reject student
router.put(
  "/reject-student/:id",
  auth,
  controller.rejectStudent
);

// ✅ Active students
router.get(
  "/active-students",
  auth,
  controller.getActiveStudents
);

// ✅ Deactivate student
router.put(
  "/deactivate-student/:id",
  auth,
  controller.deactivateStudent
);

/* =========================
   DASHBOARD
========================= */

// ✅ Dashboard stats
router.get(
  "/dashboard-stats",
  auth,
  controller.getDashboardStats
);

/* =========================
   PAYMENT SETTINGS
========================= */

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

/* =========================
   MESS REQUESTS
========================= */

// ✅ Create Mess Request (PUBLIC)
router.post(
  "/create-mess-request",
  controller.createMessRequest
);

// ✅ PUBLIC: Get active messes
router.get(
  "/public/active-messes",
  controller.getActiveMesses
);

/* =========================
   PLATFORM ADMIN
========================= */

router.post(
  "/platform-admin/login",
  controller.platformAdminLogin
);

// ✅ Get all mess requests
router.get(
  "/platform-admin/mess-requests",
  auth,
  controller.getMessRequests
);

// ✅ Approve mess request
router.put(
  "/platform-admin/mess-approve/:id",
  auth,
  controller.approveMessRequest
);

// ✅ Reject mess request
router.put(
  "/platform-admin/mess-reject/:id",
  auth,
  controller.rejectMessRequest
);

module.exports = router;
