const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.controller");

/* =========================
   AUTH ROUTES
========================= */

/* ADMIN LOGIN */
router.post(
  "/admin-login",
  controller.loginAdmin
);

/* STUDENT LOGIN */
router.post(
  "/student-login",
  controller.studentLogin
);

/* STUDENT SET PASSWORD (first-time / reset) */
router.post(
  "/student-set-password",
  controller.setStudentPassword
);

module.exports = router;
