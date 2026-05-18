const Post = require("../models/post.model");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.uploadPost = async (req, res) => {
  try {
    const { caption, mediaType } = req.body;

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
    // 2. Check file exists
    // =========================
    const file = req.file;

    if (!file) {
      console.log("❌ req.file is missing:", req.body);

      return res.status(400).json({
        success: false,
        message: "Media file is required",
      });
    }

    // =========================
    // 3. Debug file (important)
    // =========================
    console.log("📁 File received:", file);

    // =========================
    // 4. Upload to Cloudinary
    // =========================
    let cloudinaryResult;

    try {
      cloudinaryResult = await uploadImageToCloudinary(file.path, "posts");
    } catch (uploadError) {
      console.log("❌ Cloudinary upload error:", uploadError);

      return res.status(500).json({
        success: false,
        message: "Failed to upload media to Cloudinary",
      });
    }

    if (!cloudinaryResult || !cloudinaryResult.secure_url) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary did not return a valid URL",
      });
    }

    // =========================
    // 5. Create Post in DB
    // =========================
    const post = await Post.create({
      author: req.user.id,
      mediaType: mediaType || "image",
      media: cloudinaryResult.secure_url,
      caption: caption || "",
    });

    // =========================
    // 6. Populate author safely
    // =========================
    await post.populate("author", "name email profileImage");

    // =========================
    // 7. Success response
    // =========================
    return res.status(201).json({
      success: true,
      message: "Post uploaded successfully",
      data: post,
    });
  } catch (error) {
    console.log("❌ UploadPost error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    // =========================
    // 1. Fetch all posts
    // =========================
    const posts = await Post.find()
      .populate("author", "name email profileImage")
      .sort({ createdAt: -1 }); // newest first

    // =========================
    // 2. Check if posts exist
    // =========================
    if (!posts || posts.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No posts found",
        data: [],
      });
    }

    // =========================
    // 3. Response
    // =========================
    return res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      data: posts,
    });
  } catch (error) {
    console.log("❌ getAllPosts error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
