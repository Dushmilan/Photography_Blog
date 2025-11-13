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

    // Get images from database that belong to the authenticated user
    const images = await Image.getUserImages(req.user.userId, {
      limit: pageSize,
      offset: skip,
      order: 'created_at DESC'
    });

    res.json({
      images: images.rows || images,
      total: images.count || (images.rows ? images.rows.length : images.length)
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ message: 'Error fetching images', error: error.message });
  }
});

// Upload image to ImageKit and save metadata to database
router.post('/upload', authenticate, async (req, res) => {
  try {
    const { file, fileName, folder = '/blog-photos', tags = ['photography', 'blog'] } = req.body;

    if (!file || !fileName) {
      return res.status(400).json({ message: 'File and fileName are required' });
    }

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: file,           // can be URL, base64 string, or file path
      fileName: fileName,
      folder: folder,
      tags: tags,
      useUniqueFileName: true,
      responseFields: ['isPrivateFile', 'tags', 'customCoordinates', 'metadata']
    });

    // Save image metadata to database
    const imageMetadata = {
      id: uploadResponse.fileId,           // ImageKit file ID
      filename: uploadResponse.name,
      original_name: fileName,
      path: uploadResponse.url,            // Full URL
      thumbnail_path: imagekit.url({
        path: uploadResponse.filePath,
        transformation: [{ width: '300', height: '300', crop: 'pad' }]
      }),
      small_path: imagekit.url({
        path: uploadResponse.filePath,
        transformation: [{ width: '600' }]
      }),
      medium_path: imagekit.url({
        path: uploadResponse.filePath,
        transformation: [{ width: '1200' }]
      }),
      size: uploadResponse.size,
      mimetype: uploadResponse.mimeType,
      width: uploadResponse.width || 0,
      height: uploadResponse.height || 0,
      photographer_id: req.user.userId,
      is_featured: false,
      is_slideshow: false,
      is_public: false,
      created_at: new Date().toISOString()
    };

    const savedImage = await Image.create(imageMetadata);
    
    res.status(201).json({
      message: 'Image uploaded successfully',
      image: savedImage,
      uploadResponse
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
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

// Delete image from ImageKit and database
router.delete('/image/:imageId', authenticate, async (req, res) => {
  try {
    const { imageId } = req.params;

    // First, verify the user has access to this image
    const image = await Image.getByIdAndUser(imageId, req.user.userId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found or access denied' });
    }

    // Delete from ImageKit
    await imagekit.deleteFile(imageId);

    // Delete from database
    await Image.deleteById(imageId);

    res.json({
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Error deleting image', error: error.message });
  }
});

// Update image metadata
router.put('/image/:imageId', authenticate, async (req, res) => {
  try {
    const { imageId } = req.params;
    const { is_featured, is_slideshow, is_public, original_name } = req.body;

    // Verify user ownership
    const image = await Image.getByIdAndUser(imageId, req.user.userId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found or access denied' });
    }

    const updateData = {};
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    if (is_slideshow !== undefined) updateData.is_slideshow = is_slideshow;
    if (is_public !== undefined) updateData.is_public = is_public;
    if (original_name) updateData.original_name = original_name;

    const updatedImage = await Image.update(imageId, updateData);

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

    // Get from database
    const image = await Image.getByIdAndUser(imageId, req.user.userId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found or access denied' });
    }

    // Generate various size URLs using ImageKit
    const imageUrls = {
      original: image.path,
      thumbnail: image.thumbnail_path || imagekit.url({
        path: `/${image.filename}`,
        transformation: [{ width: '300', height: '300', crop: 'pad' }]
      }),
      small: image.small_path || imagekit.url({
        path: `/${image.filename}`,
        transformation: [{ width: '600' }]
      }),
      medium: image.medium_path || imagekit.url({
        path: `/${image.filename}`,
        transformation: [{ width: '1200' }]
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