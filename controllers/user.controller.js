const User = require("../models/user.model");
const upload = require("../utils/imageUploader");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.getUser = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    console.log("user id ", userId);

    const user = await User.findById(userId).populate("posts").populate("loop");
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

exports.editProfile = async (req, res) => {
  try {
    const { name, userName, bio, profession, gender } = req.body;

    // user id from auth middleware
    const userId = req.user._id || req.user.id;

    // uploaded file from multer
    const file = req.file;

    console.log("Edit profile - req.body:", req.body);
    console.log("Edit profile - req.file:", file);

    // find current user
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // check username already exists
    if (userName && userName.trim()) {
      const existingUser = await User.findOne({
        userName: userName.trim(),
      });

      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        return res.status(400).json({
          success: false,
          message: "Username already exists",
        });
      }
    }

    // upload image to cloudinary
    if (file) {
      const uploadedImage = await uploadImageToCloudinary(
        file.path,
        "vybe_profiles",
      );

      user.profileImage = uploadedImage.secure_url;
    }

    // update fields
    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (userName && userName.trim()) {
      user.userName = userName.trim();
    }

    if (bio && bio.trim()) {
      user.bio = bio.trim();
    }

    if (profession && profession.trim()) {
      user.profession = profession.trim();
    }

    if (gender && gender.trim()) {
      user.gender = gender.trim();
    }

    await user.save();

    const updatedUser = await User.findById(userId).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log("Edit profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating profile",
      error: error.message,
    });
  }
};

exports.follow = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const targetUserId = req.params.targetUserId;

    //  check current user is exist
    if (!targetUserId) {
      return res.status(404).json({
        success: false,
        message: "target user  is not found",
      });
    }

    //  check target user is exist
    if (currentUserId === targetUserId) {
      return res.status(404).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    // find current and target user
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    // check current user already follow target user then unfollow it
    const isFollowing = currentUser.following.includes(targetUserId);
    if (isFollowing) {
      // remove target user from the currrent user following list
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUserId,
      );

      // remove current  user from the target user follwers  list
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUserId,
      );
      await currentUser.save();
      await targetUser.save();

      return res.status(200).json({
        success: true,
        following: false,
        message: "traget user unfollowed successfully",
      });
    } else {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);

      await currentUser.save();
      await targetUser.save();

      return res.status(200).json({
        success: true,
        following: true,
        message: "user followed successfully",
      });
    }

    //
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "somethimg went wrong ...",
    });
  }
};
