const Post = require("../models/post.model");

exports.uploadPost = async (req, res) => {
  try {
    const userID = req.user._id;
    // 1. Check file was uploaded
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "Media file is required" });
    }

    // 2. Determine mediaType from mimetype
    const isVideo = file.mimetype.startsWith("video/");
    const mediaType = isVideo ? "video" : "image";

    // 3. Build media URL/path
    const mediaPath = `uploads/${file.filename}`;

    // 4. Create the post
    const post = await Post.create({
      author: userID, // comes from your auth middleware
      mediaType,
      media: mediaPath,
      caption: req.body.caption || "",
    });

    // 5. Populate author details before sending response
    await post.populate("author", "name email profileImage");

    res.status(201).json({
      success: true,
      message: "Post uploaded successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
