const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const mediaUploader = async (filePath, folder = "uploads") => {
  try {
    // upload image/video to cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto", // auto detect image or video
    });

    // delete file from multer uploads folder
    fs.unlinkSync(filePath);

    return result;
  } catch (error) {
    // if upload fails then also delete file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    throw error;
  }
};

module.exports = mediaUploader;
