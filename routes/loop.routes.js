const express = require("express");
const router = express.Router();

const { auth } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer");

const {
  uploadLoop,
  likeLoop,
  addLoopComment,
  getAllLoops,
} = require("../controllers/loop.controller");

// Upload Loop
router.post("/upload", auth, upload.single("video"), uploadLoop);

// Like / Unlike Loop
router.get("/like/:loopId", auth, likeLoop);

// Add Comment
router.post("/comment/:loopId", auth, addLoopComment);

router.get("/getAllLoops", getAllLoops);

module.exports = router;
