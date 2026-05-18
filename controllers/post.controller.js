const Post = require("../models/post.model");

exports.uploadPost = async (req, res) => {
  try {
    const { caption, mediaType } = req.body;

    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "Media file is required" });
    }

    const cloudinaryResult = await imageUploadToCloudinary(file.path);

    const post = await Post.create({
      author: req.user._id,
      mediaType: mediaType,
      media: cloudinaryResult.secure_url,
      caption: caption || "",
    });

    await post.populate("author", "name email profileImage");

    res.status(201).json({
      success: true,
      message: "Post uploaded successfully",
      data: post,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
