const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { generateOTP } = require("../utils/helpers");
const { sendPasswordResetEmail } = require("../utils/email");
const { Op } = require("sequelize");

// Generate Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, userName } = req.body;

    // Check fields
    if (!name || !email || !password || !userName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { userName }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email or Username already exists",
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      userName,
    });

    // Generate Token
    const token = generateToken(user._id);

    // Send Token in Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "Signup successful",
      token,
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Check existing user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate Token
    const token = generateToken(user._id);

    // Send Token in Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Signin successful",
      token,
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.signout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure: false, // set true in production (https)
    });

    res.status(200).json({
      success: true,
      message: "Signout successful",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate 6-digit OTP
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp = generateOTP(4).toUpperCase().toString();

    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send OTP email
    await sendPasswordResetEmail(user, otp);
    console.log("====> otp", otp);

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your email",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// verifyOtp
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check required fields
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });

    // Check user exists
    if (!user || user.resetOtp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.isOtpVirified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;

    await user.save();

    // OTP verified successfully
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
      error: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const user = await User.findOne({
      where: {
        email,
        resetOtp: String(otp),
        otpExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user || !user.isOtpVirified) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Update password
    user.password = await bcrypt.hash(password, 10);
    user.resetOtp = null;
    user.otpExpires = null;
    user.isOtpVirified = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
