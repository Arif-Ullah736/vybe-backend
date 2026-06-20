import express from "express";
import {
  sendMessage,
  getAllMessages,
  getChatUsers,
} from "../controllers/message.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// Get all users with whom current user has chatted
router.get("/chat-users", auth, getChatUsers);

// Get all messages between current user and receiver
router.get("/getAllMessages/:receiverId", auth, getAllMessages);

// Send message to a user
router.post("/send/:receiverId", auth, upload.single("image"), sendMessage);

export default router;
