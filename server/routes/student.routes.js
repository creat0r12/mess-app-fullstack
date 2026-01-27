const express = require("express");
const router = express.Router();
const controller = require("../controllers/student.controller");
const { submitLeave, getMyLeave, confirmReturn } =
  require("../controllers/studentLeave.controller");
const { studentAuth } = require("../middlewares/auth.middleware"); // ✅ ADD THIS

// 🧑‍🎓 STUDENT REQUEST (PUBLIC)
router.post("/request", controller.requestStudent);

// 📱 VERIFY PHONE
router.post("/verify", controller.verifyStudent);

// 🔐 SET PASSWORD
router.post("/set-password", controller.setStudentPassword);

// 🔑 LOGIN
router.post("/login", controller.loginStudent);

// 🔹 Request to join a mess (PUBLIC)
router.post("/request-mess", controller.requestMessJoin);

// 🔹 CONFIRM RETURN (STUDENT)
router.put("/leave/confirm-return", studentAuth, confirmReturn);

module.exports = router;
