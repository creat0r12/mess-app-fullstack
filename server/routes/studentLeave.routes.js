const express = require("express");
const router = express.Router();

const {
  submitLeave,
  getMyLeave,
  getMyLeaveHistory,
  confirmReturn,
} = require("../controllers/studentLeave.controller");

const { studentAuth } = require("../middlewares/auth.middleware");

/* =========================
   STUDENT LEAVE ROUTES
========================= */

// 📝 Submit leave request
router.post("/leave", studentAuth, submitLeave);

// 📊 Get latest leave (dashboard)
router.get("/leave", studentAuth, getMyLeave);

// 📜 Get full leave history
router.get("/leave/history", studentAuth, getMyLeaveHistory);

// 🔁 Confirm return
router.put("/leave/confirm-return", studentAuth, confirmReturn);

module.exports = router;