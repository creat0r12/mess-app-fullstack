const express = require("express");
const { studentAuth } = require("../middlewares/auth.middleware");

const {
  submitLeave,
  getMyLeave,
  getMyLeaveHistory,
  confirmReturn,
} = require("../controllers/studentLeave.controller");

const router = express.Router();

// Student submits leave request
router.post("/leave", studentAuth, submitLeave);

// Latest leave (dashboard)
router.get("/leave", studentAuth, getMyLeave);

// 🔥 Full leave history (future use)
router.get("/leave/history", studentAuth, getMyLeaveHistory);

// Student confirms return
router.put("/leave/confirm-return", studentAuth, confirmReturn);

module.exports = router;