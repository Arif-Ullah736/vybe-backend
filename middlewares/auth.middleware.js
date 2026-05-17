const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
require("dotenv").config();

exports.auth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

    // Check token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded token:", decoded);

    req.user = decoded;

    next();
  } catch (error) {
    console.log("Auth middleware error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Token is invalid or expired",
    });
  }
};
