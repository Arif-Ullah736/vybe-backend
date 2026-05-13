const User = require("../models/user.model");

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
    const users = await User.find({}).select("-password");

    return res.status(200).json({
      success: true,
      message: "users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "something went wrong while  fetching users",
    });
  }
};
