const express = require("express");

const {
  getStudentLeaves,
  approveLeave,
  rejectLeave,
  requestReturn, // ✅ ADD
} = require("../controllers/adminLeave.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

/* ================= LEAVE MANAGEMENT ================= */

router.get("/student-leaves", authMiddleware, getStudentLeaves);
router.put("/student-leaves/:id/approve", authMiddleware, approveLeave);
router.put("/student-leaves/:id/reject", authMiddleware, rejectLeave);

// ✅ NEW ROUTE
router.put(
  "/student-leaves/:id/request-return",
  authMiddleware,
  requestReturn
);

module.exports = router;
