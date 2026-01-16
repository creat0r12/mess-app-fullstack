const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/admin.controller");

// ✅ Pending students
router.get(
  "/pending-students",
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
  "/active-students",
  auth,
  controller.getActiveStudents
);

// ✅ Deactivate student
router.put(
  "/deactivate/:id",
  auth,
  controller.deactivateStudent
);

router.get("/dashboard-stats", auth, controller.getDashboardStats);


router.get("/payment-settings", auth, controller.getPaymentSettings);
const upload = require("../middlewares/uploadPayment");

router.post(
  "/payment-settings",
  auth,
  upload.single("qr"),
  controller.updatePaymentSettings
);




module.exports = router;
