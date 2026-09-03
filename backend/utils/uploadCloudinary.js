const logger = require('./logger');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary (requires CLOUDINARY_URL or CLOUDINARY_API_KEY in env)
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Uploads a base64 encoded image to Cloudinary
 * @param {string} base64Image - Base64 encoded image string
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
const uploadBase64ToCloudinary = async (base64Image, folder = 'society-management') => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      // Return a mock URL or the base64 string if cloudinary is not configured
      // For development/testing purposes
      logger.warn('Cloudinary not configured. Skipping upload and returning mock URL.');
      return 'https://res.cloudinary.com/demo/image/upload/v1/mock_image.jpg';
    }

    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: folder,
      resource_type: 'image'
    });

    return uploadResponse.secure_url;
  } catch (error) {
    logger.error('Error uploading to Cloudinary:', error);
    throw new Error('Image upload failed');
  }
};

module.exports = { uploadBase64ToCloudinary };
