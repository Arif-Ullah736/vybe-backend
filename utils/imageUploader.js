
const cloudinary = require("cloudinary").v2

const imageUploader = (buffer, folder = "brands") => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
            if (error)
                return reject(error);
            resolve(result);
        })
            .end(buffer);
    });
};

module.exports = imageUploader;