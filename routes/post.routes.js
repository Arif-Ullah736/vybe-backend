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

module.exports = router;
