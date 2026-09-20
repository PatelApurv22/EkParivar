const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a file buffer to Cloudinary folder ekparivar/documents
 * @param {Buffer} buffer - File buffer from Multer
 * @param {string} originalname - Original file name
 * @param {string} mimetype - File mimetype
 * @returns {Promise<{ fileUrl: string, publicId: string, fileType: string }>}
 */
const uploadToCloudinary = (buffer, originalname, mimetype) => {
  return new Promise((resolve, reject) => {
    const isPdf = mimetype === 'application/pdf' || originalname.toLowerCase().endsWith('.pdf');
    const fileType = isPdf ? 'pdf' : 'image';
    const resourceType = isPdf ? 'raw' : 'image';

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'ekparivar/documents',
        resource_type: resourceType,
        public_id: `${Date.now()}_${originalname.replace(/[^a-zA-Z0-9]/g, '_')}`
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve({
          fileUrl: result.secure_url,
          publicId: result.public_id,
          fileType
        });
      }
    );

    uploadStream.end(buffer);
  });
};

module.exports = {
  cloudinary,
  uploadToCloudinary
};
