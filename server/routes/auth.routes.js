const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.controller");



/* STUDENT SET PASSWORD (first-time / reset) */
router.post(
  "/student-set-password",
  controller.setStudentPassword
);


router.post("/platform-login", controller.platformLogin);

router.post("/login", controller.loginUser);


module.exports = router;


