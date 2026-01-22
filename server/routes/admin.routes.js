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

// ✅ Create Mess Request (PUBLIC)
router.post(
  "/create-mess-request",
  controller.createMessRequest
);


router.post("/platform-admin/login", controller.platformAdminLogin);
router.get("/platform-admin/mess-requests", auth, controller.getMessRequests);

// ✅ Approve mess request (PLATFORM ADMIN)
router.put(
  "/platform-admin/mess-approve/:id",
  auth,
  controller.approveMessRequest
);

// ✅ Reject mess request (PLATFORM ADMIN)
router.put(
  "/platform-admin/mess-reject/:id",
  auth,
  controller.rejectMessRequest
);


// ✅ PUBLIC: Get active messes
router.get(
  "/public/active-messes",
  controller.getActiveMesses
);

module.exports = router;
