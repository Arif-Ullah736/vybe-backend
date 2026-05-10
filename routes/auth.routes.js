const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.post("/signout", authController.signout);

// Send OTP
router.post("/send-otp", authController.sendOtp);

// Verify OTP
router.post("/verify-otp", authController.verifyOtp);

// Reset Password
router.post("/reset-password", authController.resetPassword);

module.exports = router;
