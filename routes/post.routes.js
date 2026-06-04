const express = require("express");
const router = express.Router();

const postController = require("../controllers/post.controller");
const { auth } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer");

router.post(
  "/uploadPost",
  auth,
  upload.single("uploadMedia"),
  postController.uploadPost,
);
router.get("/getAllPosts", postController.getAllPosts);

// Like / Unlike Post
router.post("/like/:postId", auth, postController.likePost);

// Add Comment
router.post("/comment/:postId", auth, postController.addComment);

// Save / Unsave Post
router.post("/save/:postId", auth, postController.savedPosts);

module.exports = router;
