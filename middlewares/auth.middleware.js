const jwt = require("jsonwebtoken");
const User = require("../model/user.model");
require("dotenv").config();

// Auth middleware
// exports.auth = async (req,res,next) => {
//     try {
//         const token = req.body.token
//                              || req.cookies.token
//                             //  || req.header("Authorization").replace("Bearer ","")

//         //  check that token is empty or not
//         if(!token){
//             return res.status(400).json({
//                 success:false,
//                 message:"token is missing"
//             })
//         }

// // verify token , if token is valid then it return user data  and stored it in decode varaible
// try {
//         const decode =  jwt.verify(token,process.env.JWT_SECRET)
//         console.log(token)
//         req.user = decode

// } catch (error) {
//     console.log(error)
//     return res.status(401).json({
//         success:false,
//         message:"token is invalide"
//     })

// }
// next()

//     } catch (error) {
//         console.log(error)
//         res.status(401).json({
//             success:false,
//             message:"something went wrong while validating token"
//         })

//     }
// }

exports.auth = async (req, res, next) => {
  try {
    const token =
      req.body.token ||
      req.cookies.token ||
      req.header("Authorization")?.replace("Bearer ", ""); // UNCOMMENT THIS

    // Check that token is empty or not
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is missing",
      });
    }

    // Verify token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decode);
      req.user = decode;
    } catch (error) {
      console.log("Token verification error:", error.message);
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }

    next();
  } catch (error) {
    console.log("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Something went wrong while validating token",
    });
  }
};

// isStudent middleware
exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "this route is protected for student only",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "user rule cannot be varified , please try again",
    });
  }
};

// isInstructer middleware
exports.isInstructer = async (req, res, next) => {
  try {
    if (
      req.user.accountType !== "Instructer" &&
      req.user.accountType !== "Instructor"
    ) {
      return res.status(401).json({
        success: false,
        message: "this route is protected for instructer only",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "user rule cannot be varified , please try again",
    });
  }
};

// isAdmin middleware
exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "this route is protected for admin only",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "user rule cannot be varified , please try again",
    });
  }
};
