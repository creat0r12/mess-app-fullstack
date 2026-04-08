const express = require("express");

const studentController = require("../controllers/studentLeave.controller");

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

/* ================= STATS ================= */

router.get(
  "/student-leaves/stats",
  adminAuth,
  studentController.getLeaveStats
);

module.exports = router;