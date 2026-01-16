const express = require("express");
const router = express.Router();
const controller = require("../controllers/student.controller");
const auth = require("../middlewares/auth.middleware");

// 🧑‍🎓 STUDENT REQUEST (PUBLIC)
router.post("/request", controller.requestStudent);

// 🧧 STUDENT LOGIN (PUBLIC)
router.post("/verify", controller.verifyStudent);
router.post("/set-password", controller.setStudentPassword);
router.post("/login", controller.loginStudent);

// 👨‍💼 ADMIN ROUTES (PROTECTED)
router.get("/pending", auth, controller.getPendingStudents);
router.put("/approve/:id", auth, controller.approveStudent);
router.put("/reject/:id", auth, controller.rejectStudent);
router.get("/active", auth, controller.getActiveStudents);

router.get("/", auth, controller.getAllStudents);


module.exports = router;
