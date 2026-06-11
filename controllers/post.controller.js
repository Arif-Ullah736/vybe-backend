const Post = require("../models/post.model");
const User = require("../models/user.model");
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

    //  save post in user
    const user = await User.findById(req.user.id);
    user.posts.push(post._id);
    await user.save();
    // =========================
    // 6. Populate author safely
    // =========================
    await post.populate("author", "name userName email profileImage");

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
      .populate("author", "name userName email profileImage")
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

exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId).populate(
      "author",
      "name userName email profileImage",
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (!post.likes) {
      post.likes = [];
    }

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter((id) => id.toString() !== userId);

      await post.save();
      await post.populate("author", "name userName email profileImage");

      return res.status(200).json({
        success: true,
        message: "Post unliked",
        data: post,
      });
    }

    // Like
    post.likes.push(userId);

    await post.save();
    await post.populate("author", "name userName email profileImage");

    res.status(200).json({
      success: true,
      message: "Post liked",
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { message } = req.body;

    const userId = req.user.id;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = {
      author: userId,
      message: message.trim(),
    };

    post.comments.push(comment);

    await post.save();

    await post.populate("comments.author", "name userName email profileImage");

    res.status(201).json({
      success: true,
      message: "Comment added",
      comments: post.comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.savedPosts = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    // find post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "post not found",
      });
    }

    // check post already saved
    const user = await User.findById(userId);
    const alreadySaved = user.saved.includes(postId);
    if (alreadySaved) {
      user.saved = user.saved.filter((id) => id.toString() !== postId);
      await user.save();
      return res.status(200).json({
        success: true,
        message: "post unsaved",
      });
    } else {
      user.saved.push(postId);
      await user.save();
      await user.populate("saved");
      return res.status(200).json({
        success: true,
        message: "post saved",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
