const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  submitLeave,
  getMyLeave,
} = require("../controllers/studentLeave.controller");

const router = express.Router();

router.post("/leave", authMiddleware, submitLeave);
router.get("/leave", authMiddleware, getMyLeave);

module.exports = router;
