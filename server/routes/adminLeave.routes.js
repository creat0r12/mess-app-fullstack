const express = require("express");
const controller = require("../controllers/studentLeave.controller");
const {
  getStudentLeaves,
  approveLeave,
  rejectLeave,
  requestReturn,
} = require("../controllers/adminLeave.controller");

const { adminAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

/* ================= LEAVE MANAGEMENT ================= */

router.get("/student-leaves", adminAuth, getStudentLeaves);

router.put("/student-leaves/:id/approve", adminAuth, approveLeave);

router.put("/student-leaves/:id/reject", adminAuth, rejectLeave);

router.put(
  "/student-leaves/:id/request-return",
  adminAuth,
  requestReturn
);
router.get("/student-leaves/stats", adminAuth, controller.getLeaveStats);

module.exports = router;
