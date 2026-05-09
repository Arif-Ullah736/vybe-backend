const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
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
