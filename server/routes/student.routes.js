const express = require("express");
const router = express.Router();
const controller = require("../controllers/student.controller");

// 🧑‍🎓 STUDENT REQUEST (PUBLIC)
router.post("/request", controller.requestStudent);

// 📱 VERIFY PHONE
router.post("/verify", controller.verifyStudent);

// 🔐 SET PASSWORD
router.post("/set-password", controller.setStudentPassword);

// 🔑 LOGIN
router.post("/login", controller.loginStudent);

module.exports = router;
