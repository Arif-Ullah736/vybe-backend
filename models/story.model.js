const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    media: {
      type: String,
      required: true,
    },

    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },

    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // 24 hours in seconds
    },
  },
  { timestamps: true },
);
const Strory = mongoose.model("Story", storySchema);
module.exports = Strory;
