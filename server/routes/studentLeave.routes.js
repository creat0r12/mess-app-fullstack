const express = require("express");
const { studentAuth } = require("../middlewares/auth.middleware");
const {
  submitLeave,
  getMyLeave,
  confirmReturn,
} = require("../controllers/studentLeave.controller");

const router = express.Router();

// Student submits leave request
router.post("/leave", studentAuth, submitLeave);

// Student views own leave status
router.get("/leave", studentAuth, getMyLeave);

// ✅ Student confirms return to mess
router.put("/leave/confirm-return", studentAuth, confirmReturn);

module.exports = router;
