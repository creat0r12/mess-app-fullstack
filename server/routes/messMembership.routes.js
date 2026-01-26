const express = require("express");
const router = express.Router();

const { studentAuth } = require("../middlewares/auth.middleware");
const controller = require("../controllers/messMembership.controller");

/* =========================
   STUDENT MESS MEMBERSHIP
========================= */

// Student requests to join a mess
router.post(
  "/join",
  studentAuth,
  controller.requestJoinMess
);

// Student leaves a mess
router.post(
  "/leave",
  studentAuth,
  controller.leaveMess
);

module.exports = router;
