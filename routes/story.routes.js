const express = require("express");
const router = express.Router();

const { auth } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer");

const {
  uploadStory,
  viewStory,
  getStoryByUsername,
  getStories,
} = require("../controllers/story.controller");

// =========================
// Upload Story
// =========================
router.post("/upload", auth, upload.single("media"), uploadStory);

// =========================
// View Story
// =========================
router.get("/view/:storyId", auth, viewStory);

// =========================
// Get Story by Username
// =========================
router.get("/getStory/:userName", auth, getStoryByUsername);

// =========================
// Get Stories
// =========================
router.get("/getStories", auth, getStories);

module.exports = router;
