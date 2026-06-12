// routes/user.routes.js

const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const { auth } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer");

router.post(
  "/editProfile",
  auth,
  upload.single("profileImage"),
  userController.editProfile,
);

router.get("/getUser", auth, userController.getUser);
router.get("/suggestedUsers", auth, userController.suggestedUsers);
router.get("/getProfile/:userName", auth, userController.getProfile);
router.get("/follow/:targetUserId", auth, userController.follow);

module.exports = router;
