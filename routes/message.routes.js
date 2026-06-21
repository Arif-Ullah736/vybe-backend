const express = require("express");
const {
  sendMessage,
  getAllMessages,
  getChatUsers,
} = require("../controllers/message.controller.js");
const { auth } = require("../middlewares/auth.middleware.js");
const upload = require("../middlewares/multer.js");

const router = express.Router();

// Get all users with whom current user has chatted
router.get("/chat-users", auth, getChatUsers);

// Get all messages between current user and receiver
router.get("/getAllMessages/:receiverId", auth, getAllMessages);

// Send message to a user
router.post("/send/:receiverId", auth, upload.single("image"), sendMessage);

module.exports = router;
