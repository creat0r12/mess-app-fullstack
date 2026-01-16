const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const upload = require("../middlewares/uploadMessImage");
const controller = require("../controllers/messSettings.controller");

/* READ — anyone logged in (student/admin) */
router.get("/", controller.getMessSettings);


/* UPDATE — admin only */
router.put(
  "/",
  auth,
  upload.single("image"),
  controller.updateMessSettings
);

module.exports = router;
