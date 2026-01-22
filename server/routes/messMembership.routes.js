const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/messMembership.controller");

// student routes
router.post("/join", auth, controller.requestJoinMess);
router.post("/leave", auth, controller.leaveMess);

module.exports = router;
