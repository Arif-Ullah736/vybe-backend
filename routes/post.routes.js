const express = require("express");
const router = express.Router();

const postController = require("../controllers/post.controller");
const { auth } = require("../middlewares/auth.middleware");

router.post("/uploadPost", auth, postController.uploadPost);

module.exports = router;
