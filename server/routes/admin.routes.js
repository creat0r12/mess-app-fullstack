const express = require("express");
const router = express.Router();
const { adminAuth } = require("../middlewares/auth.middleware");
const controller = require("../controllers/admin.controller");
const upload = require("../middlewares/uploadPayment");

/* =========================
   STUDENTS (ADMIN)
========================= */

router.get("/pending-students", adminAuth, controller.getPendingStudents);

router.put("/approve-student/:id", adminAuth, controller.approveStudent);

router.put("/reject-student/:id", adminAuth, controller.rejectStudent);

router.get("/active-students", adminAuth, controller.getActiveStudents);

router.put("/deactivate-student/:id", adminAuth, controller.deactivateStudent);

/* =========================
   DASHBOARD
========================= */

router.get("/dashboard-stats", adminAuth, controller.getDashboardStats);

/* =========================
   PAYMENT SETTINGS
========================= */

router.get("/payment-settings", adminAuth, controller.getPaymentSettings);

router.post(
  "/payment-settings",
  adminAuth,
  upload.single("qr"),
  controller.updatePaymentSettings
);

/* =========================
   MESS REQUESTS
========================= */

// PUBLIC
router.post("/create-mess-request", controller.createMessRequest);

router.get("/public/active-messes", controller.getActiveMesses);

/* =========================
   PLATFORM ADMIN
========================= */

router.post("/platform-admin/login", controller.platformAdminLogin);

router.get(
  "/platform-admin/mess-requests",
  adminAuth,
  controller.getMessRequests
);

router.put(
  "/platform-admin/mess-approve/:id",
  adminAuth,
  controller.approveMessRequest
);

router.put(
  "/platform-admin/mess-reject/:id",
  adminAuth,
  controller.rejectMessRequest
);

module.exports = router;
