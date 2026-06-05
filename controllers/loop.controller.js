const Loop = require("../models/loop.model");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.uploadLoop = async (req, res) => {
  try {
    const { caption } = req.body;

    // =========================
    // 1. Check user auth
    // =========================
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    // =========================
    // 2. Check video exists
    // =========================
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Loop video is required",
      });
    }

    // =========================
    // 3. Upload video to Cloudinary
    // =========================
    let cloudinaryResult;

    try {
      cloudinaryResult = await uploadImageToCloudinary(file.path, "loops");
    } catch (uploadError) {
      console.log("❌ Cloudinary upload error:", uploadError);

      return res.status(500).json({
        success: false,
        message: "Failed to upload loop video",
      });
    }

    if (!cloudinaryResult || !cloudinaryResult.secure_url) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary did not return a valid URL",
      });
    }

    // =========================
    // 4. Create Loop
    // =========================
    const loop = await Loop.create({
      author: req.user.id,
      video: cloudinaryResult.secure_url,
      caption: caption || "",
    });

    // =========================
    // 5. Save loop in user
    // =========================
    const user = await User.findById(req.user.id);

    if (!user.loops) {
      user.loops = [];
    }

    user.loops.push(loop._id);
    await user.save();

    // =========================
    // 6. Populate author
    // =========================
    await loop.populate("author", "name email profileImage");

    // =========================
    // 7. Success response
    // =========================
    return res.status(201).json({
      success: true,
      message: "Loop uploaded successfully",
      data: loop,
    });
  } catch (error) {
    console.log("❌ UploadLoop error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.likeLoop = async (req, res) => {
  try {
    const { loopId } = req.params;
    const userId = req.user.id;

    const loop = await Loop.findById(loopId);

    if (!loop) {
      return res.status(404).json({
        success: false,
        message: "Loop not found",
      });
    }

    const alreadyLiked = loop.likes.includes(userId);

    if (alreadyLiked) {
      // Unlike
      loop.likes = loop.likes.filter((id) => id.toString() !== userId);

      await loop.save();

      return res.status(200).json({
        success: true,
        message: "Loop unliked",
        likesCount: loop.likes.length,
      });
    }

    // Like
    loop.likes.push(userId);

    await loop.save();
    await loop.populate("author", "name email profileImage");

    return res.status(200).json({
      success: true,
      message: "Loop liked",
      likesCount: loop.likes.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
