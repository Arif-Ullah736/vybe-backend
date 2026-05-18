// utils/imageUploader.js

const cloudinary = require("cloudinary").v2;

exports.uploadImageToCloudinary = async (filePath, folder) => {
  try {
    const response = await cloudinary.uploader.upload(filePath, {
      folder: folder,

      // Automatically detect image or video
      resource_type: "auto",
    });

    return response;
  } catch (error) {
    console.log("Cloudinary upload error:", error);
    throw error;
  }
};
