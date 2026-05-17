const User = require("../models/user.model");
const mediaUploader = require("../utils/imageUploader");

exports.getUser = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("user id ", userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "user fetched succesfully",
      data: user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "something went wrong while fetching user",
    });
  }
};

exports.suggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.userId;

    const users = await User.find({
      _id: { $ne: currentUserId },
    }).select("-password");

    return res.status(200).json({
      success: true,
      message: "users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "something went wrong while fetching users",
    });
  }
};

// exports.editProfile = async (req, res) => {
//   try {
//     const { name, userName, bio, profession, gender } = req.body;
//     const userId = req.user.id;

//     // taking image from user
//     const file = req.file;

//     const user = await User.findById(userId).select("-password");

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "user not found",
//       });
//     }

//     const sameUserWithUserName =
//       await User.findOne(userName).select("-password");

//     if (sameUserWithUserName && sameUserWithUserName._id !== userId) {
//       return res.status(400).json({
//         success: false,
//         message: "user name already exist",
//       });
//     }

//     //  upload image to cloudinary
//     let profileImage;
//     if (file) {
//       profileImage = await mediaUploader(req.file.path);
//     }

//     user.name = name;
//     user.bio = bio;
//     user.profession = profession;
//     user.profileImage = profileImage;
//     user.gender = gender;

//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: "profile updated successfully",
//       data: user,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: "something went wrong while updating profile",
//     });
//   }
// };

exports.editProfile = async (req, res) => {
  try {
    const { name, userName, bio, profession, gender } = req.body;

    const userId = req.user.id;

    // uploaded file from multer
    const file = req.file;

    // find current user
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // check username already exists
    if (userName) {
      const sameUserWithUserName = await User.findOne({
        userName,
      });

      if (
        sameUserWithUserName &&
        sameUserWithUserName._id.toString() !== userId
      ) {
        return res.status(400).json({
          success: false,
          message: "Username already exists",
        });
      }
    }

    // upload image to cloudinary
    let uploadedImage;

    if (file) {
      uploadedImage = await mediaUploader(file.path);

      // save cloudinary secure url
      user.profileImage = uploadedImage.secure_url;
    }

    // update user fields
    if (name) user.name = name;
    if (userName) user.userName = userName;
    if (bio) user.bio = bio;
    if (profession) user.profession = profession;
    if (gender) user.gender = gender;

    await user.save();

    // remove password before sending response
    const updatedUser = await User.findById(userId).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating profile",
      error: error.message,
    });
  }
};
exports.getProfile = async (req, res) => {
  try {
    const userName = req.params.userName;
    const profile = await User.findOne({ userName }).select("-password");
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "profile fetched successfully",
      data: profile,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "something went wrong while fetching user",
    });
  }
};
