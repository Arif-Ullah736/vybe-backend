const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const { auth } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer");

router.get("/getUser", auth, userController.getUser);
router.get("/suggestedUsers", auth, userController.suggestedUsers);
router.post(
  "/editProfile",
  auth,
  upload.single("profileImage"),
  userController.editProfile,
);
router.get("/getProfile/:userName", auth, userController.getProfile);

module.exports = router;
