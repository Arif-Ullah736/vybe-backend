import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";

export const sendMessage = async (req, res) => {
  try {
    const sender = req.user.id;
    const receiver = req.params.receiverId;

    const { message } = req.body;

    let image = req.file;
    if (image) {
      image = await uploadImageToCloudinary(image.path, message);
    }

    // Create message
    const newMessage = await Message.create({
      sender,
      receiver,
      message,
      image,
    });

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [sender, receiver] },
    });

    // Create conversation if it doesn't exist
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [sender, receiver],
        messages: [newMessage],
      });
    }

    // Add message to conversation
    conversation.messages.push(newMessage._id);
    await conversation.save();

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Send Message Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
