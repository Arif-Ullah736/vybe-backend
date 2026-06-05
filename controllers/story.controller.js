const User = require("../models/user.model");
const Story = require("../models/story.model");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.uploadStory = async (req, res) => {
  try {
    const { mediaType } = req.body;

    // 2. File check
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Story media is required",
      });
    }

    // 3. Upload to Cloudinary
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

    const existingStory = await Story.findOne({
      author: req.user.id,
    });

    if (existingStory) {
      await Story.findByIdAndDelete(existingStory._id);
    }

    // 4. Create expiry time (24 hours story)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 5. Create story
    const story = await Story.create({
      author: req.user.id,
      media: cloudinaryResult.secure_url,
      mediaType,
      expiresAt,
    });

    // 6. Save in user (optional but useful)
    await User.findByIdAndUpdate(req.user.id, {
      $push: { story: story._id },
    });

    // 7. Populate author
    await story.populate("author", "name userName profileImage");
    await story.populate("viewers", "name userName profileImage");

    return res.status(201).json({
      success: true,
      message: "Story uploaded successfully",
      data: story,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

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

exports.getStoryByUsername = async (req, res) => {
  try {
    const { userName } = req.params;

    // 1. Find user
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
