const User = require("../models/user.model");
const Story = require("../models/story.model");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.uploadStory = async (req, res) => {
  try {
    const { mediaType } = req.body;

    // File check
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Story media is required",
      });
    }

    // Upload to Cloudinary
    let cloudinaryResult;

    try {
      cloudinaryResult = await uploadImageToCloudinary(file.path, "stories");
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary upload failed",
      });
    }

    if (!cloudinaryResult?.secure_url) {
      return res.status(500).json({
        success: false,
        message: "Invalid Cloudinary response",
      });
    }

    // Check existing story
    const existingStory = await Story.findOne({
      author: req.user.id,
    });

    // Delete old story if exists
    if (existingStory) {
      await Story.findByIdAndDelete(existingStory._id);
    }

    // Story expires after 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create new story
    const story = await Story.create({
      author: req.user.id,
      media: cloudinaryResult.secure_url,
      mediaType,
      expiresAt,
    });

    // Save single story reference in user
    await User.findByIdAndUpdate(
      req.user.id,
      {
        story: story._id,
      },
      { new: true },
    );

    // Populate fields
    await story.populate("author", "name userName profileImage");
    await story.populate("viewers", "name userName profileImage");

    return res.status(201).json({
      success: true,
      message: "Story uploaded successfully",
      data: story,
    });
  } catch (error) {
    console.error("❌ UploadStory error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.getStoryByUsername = async (req, res) => {
  try {
    const { userName } = req.params;

    // 1. Find user by user name
    const user = await User.findOne({ userName });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2. Find user's story (latest active story)
    const story = await Story.findOne({
      author: user._id,
    })
      .populate("author")
      .populate("viewers");

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: story,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// view story
exports.viewStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    // 1. Find story
    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    // 2. Check if user already viewed
    const alreadyViewed = story.viewers.includes(userId);

    if (!alreadyViewed) {
      story.viewers.push(userId);
      await story.save();
    }

    // 3. Populate for response
    await story.populate("author", "name userName profileImage");

    await story.populate("viewers", "name userName profileImage");

    return res.status(200).json({
      success: true,
      message: alreadyViewed
        ? "Story already viewed"
        : "Story viewed successfully",
      data: story,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
