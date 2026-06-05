const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    userName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    profileImage: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
    },

    profession: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],

    saved: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],

    loop: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Loop",
      },
    ],

    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
    },

    resetOtp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },

    isOtpVirified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
module.exports = User;
