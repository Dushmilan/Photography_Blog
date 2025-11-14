const express = require('express');
const authenticate = require('../middleware/auth');
const Image = require('../models/Image');
const ImageKit = require('imagekit');
require('dotenv').config();

const router = express.Router();

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// Get ImageKit authentication parameters for client-side uploads
router.get('/auth-parameters', authenticate, async (req, res) => {
  try {
    const authParams = imagekit.getAuthenticationParameters();
    res.json({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
      authenticationParameters: authParams
    });
  } catch (error) {
    console.error('Error getting ImageKit auth parameters:', error);
    res.status(500).json({ message: 'Error getting ImageKit auth parameters', error: error.message });
  }
});

// Get images from ImageKit with pagination
router.get('/images', authenticate, async (req, res) => {
  try {
    const pageSize = parseInt(req.query.pageSize) || 50;
    const skip = parseInt(req.query.skip) || 0;

    // Get images from ImageKit API
    const imagekitImages = await new Promise((resolve, reject) => {
      // Note: ImageKit's listFiles doesn't use 'skip', it uses 'offset'
      imagekit.listFiles({
        limit: pageSize,
        offset: skip,
        // Add any other filters you want, like search by path or tags
      }, (error, files) => {
        if (error) {
          console.error('Error from ImageKit listFiles API:', error);
          // Return empty array instead of rejecting to handle gracefully
          resolve([]);
        } else {
          resolve(files);
        }
      });
    });

    // Get metadata from database for these images
    const db = new (require('../utils/db'))(req.app.locals.supabase);
    const dbMetadata = await db.getImagesByPhotographerId(req.user.userId);

    // Merge the data so ImageKit images have their status metadata from DB
    const mergedImages = imagekitImages.map(imageKitImage => {
      const dbRecord = dbMetadata.find(dbImg => dbImg.id === imageKitImage.fileId);

      return {
        id: imageKitImage.fileId,
        path: imageKitImage.url || imageKitImage.filePath,
        filename: imageKitImage.name,
        size: imageKitImage.size,
        mimetype: imageKitImage.type,
        width: imageKitImage.width,
        height: imageKitImage.height,
        is_slideshow: dbRecord?.is_slideshow || false,
        is_public: dbRecord?.is_public || false,
        photographer_id: req.user.userId,
        created_at: imageKitImage.createdAt || new Date().toISOString(),
        ...dbRecord // Include any other metadata from DB
      };
    });

    res.json({
      images: mergedImages,
      total: imagekitImages.total || mergedImages.length
    });
  } catch (error) {
    console.error('Error fetching images from ImageKit:', error);
    res.status(500).json({ message: 'Error fetching images from ImageKit', error: error.message });
  }
});

// Get image URLs with specific transformations
router.get('/image/:imageId/transform', authenticate, async (req, res) => {
  try {
    const { imageId } = req.params;
    const { width, height, quality = 80, crop = 'maintain_ratio' } = req.query;

    // First, verify the user has access to this image
    const image = await Image.getByIdAndUser(imageId, req.user.userId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found or access denied' });
    }

    // Create transformed URLs
    const transformations = [];
    if (width) transformations.push({ width: width });
    if (height) transformations.push({ height: height });
    transformations.push({ quality: quality });
    if (crop) transformations.push({ crop: crop });

    const transformedUrl = imagekit.url({
      path: image.path, // Using the stored path
      transformation: transformations
    });

    res.json({
      originalUrl: image.path,
      transformedUrl: transformedUrl,
      transformations: transformations
    });
  } catch (error) {
    console.error('Error getting transformed image URL:', error);
    res.status(500).json({ message: 'Error getting transformed image URL', error: error.message });
  }
});

// Update image metadata
router.put('/image/:imageId', authenticate, async (req, res) => {
  try {
    const { imageId } = req.params;
    const { is_slideshow, is_public } = req.body;

    // Use ImageService to handle upsert
    const ImageService = require('../models/ImageService');
    const imageService = new ImageService(req.app.locals.supabase);

    // First try to verify the image exists in ImageKit (optional - just for validation)
    try {
      await new Promise((resolve, reject) => {
        // Validate that the ID is not empty or null before calling ImageKit
        if (!imageId) {
          console.log(`Invalid image ID provided: ${imageId}`);
          resolve(null);
          return;
        }

        imagekit.getFileDetails(imageId, (error, fileDetails) => {
          if (error) {
            console.log(`Image ${imageId} not found in ImageKit (may not be a valid ImageKit file ID), proceeding with database metadata update only`);
            resolve(null); // Resolve with null to continue regardless
          } else {
            resolve(fileDetails);
          }
        });
      });
    } catch (error) {
      console.log(`Could not verify image ${imageId} in ImageKit, proceeding with database update. Error:`, error.message || error);
    }

    // Create update data
    const updateData = {
      id: imageId,
      photographer_id: req.user.userId,
      is_slideshow: is_slideshow !== undefined ? is_slideshow : false,
      is_public: is_public !== undefined ? is_public : false
    };

    // Upsert the image metadata
    const updatedImage = await imageService.upsertImageMetadata(updateData);

    res.json({
      message: 'Image updated successfully',
      image: updatedImage
    });
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ message: 'Error updating image', error: error.message });
  }
});

// Get image details
router.get('/image/:imageId', authenticate, async (req, res) => {
  try {
    const { imageId } = req.params;

    // First try to get from database (for metadata)
    let dbImage = null;
    try {
      dbImage = await Image.getByIdAndUser(imageId, req.user.userId);
    } catch (error) {
      // If DB query fails, continue without DB metadata
      console.log('No database metadata found for image, proceeding with ImageKit data only');
    }

    // Get image details from ImageKit
    let imagekitImage = null;
    try {
      imagekitImage = await new Promise((resolve, reject) => {
        // Validate that the ID is not empty or null before calling ImageKit
        if (!imageId) {
          console.log(`Invalid image ID provided: ${imageId}`);
          resolve(null);
          return;
        }

        imagekit.getFileDetails(imageId, (error, fileDetails) => {
          if (error) {
            console.error('Image not found in ImageKit:', error);
            resolve(null); // Continue with DB data only
          } else {
            resolve(fileDetails);
          }
        });
      });
    } catch (error) {
      console.log(`Could not get image ${imageId} from ImageKit, proceeding with database data only. Error:`, error.message || error);
    }

    // If we couldn't get from ImageKit but have DB data, use that
    if (!imagekitImage && dbImage) {
      // Use the DB record with minimal defaults
      imagekitImage = {
        fileId: dbImage.id,
        url: dbImage.path,
        filePath: dbImage.path,
        name: dbImage.filename || 'Unknown',
        size: dbImage.size || 0,
        type: dbImage.mimetype || 'unknown',
        width: dbImage.width || 0,
        height: dbImage.height || 0,
        createdAt: dbImage.created_at
      };
    }

    // Combine ImageKit data with DB metadata if available
    const image = {
      id: imagekitImage?.fileId || dbImage?.id,
      path: imagekitImage?.url || imagekitImage?.filePath || dbImage?.path,
      filename: imagekitImage?.name || dbImage?.filename || 'Unknown',
      size: imagekitImage?.size || dbImage?.size || 0,
      mimetype: imagekitImage?.type || dbImage?.mimetype || 'unknown',
      width: imagekitImage?.width || dbImage?.width || 0,
      height: imagekitImage?.height || dbImage?.height || 0,
      photographer_id: req.user.userId,
      created_at: imagekitImage?.createdAt || dbImage?.created_at || new Date().toISOString(),
      // DB metadata if available, default values otherwise
      is_slideshow: dbImage?.is_slideshow || false,
      is_public: dbImage?.is_public || false,
      ...dbImage // Include any other metadata from DB
    };

    // Generate various size URLs using ImageKit
    const imageUrls = {
      original: imagekitImage.url,
      thumbnail: imagekit.url({
        path: imagekitImage.filePath,
        transformation: [{ width: 300, height: 300, crop: 'pad' }]
      }),
      small: imagekit.url({
        path: imagekitImage.filePath,
        transformation: [{ width: 600 }]
      }),
      medium: imagekit.url({
        path: imagekitImage.filePath,
        transformation: [{ width: 1200 }]
      })
    };

    res.json({
      ...image,
      urls: imageUrls
    });
  } catch (error) {
    console.error('Error getting image details:', error);
    res.status(500).json({ message: 'Error getting image details', error: error.message });
  }
});

module.exports = router;