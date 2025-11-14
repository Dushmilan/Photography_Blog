// Image service that combines ImageKit API and database metadata
const Database = require('../utils/db');

class ImageService {
  constructor(supabase) {
    this.db = new Database(supabase);
    this.supabase = supabase;
  }

  // Get all images from ImageKit (this will be used for admin gallery)
  async getImagesFromImageKit(photographerId, pageSize = 50, skip = 0) {
    try {
      // Initialize ImageKit with the same credentials as in imagekit.js
      const ImageKit = require('imagekit');
      require('dotenv').config();

      const imagekit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
      });

      // Get images from ImageKit API
      const imagekitImages = await new Promise((resolve, reject) => {
        imagekit.listFiles({
          limit: pageSize,
          offset: skip,
        }, (error, files) => {
          if (error) {
            console.error('Error from ImageKit API:', error);
            reject(error);
          } else {
            resolve(files);
          }
        });
      });

      return imagekitImages;
    } catch (error) {
      console.error('Error fetching images from ImageKit:', error);
      return [];
    }
  }

  // Get images from ImageKit with metadata from database
  async getImagesWithMetadata(userId, pageSize = 50, skip = 0) {
    let imageKitImages = [];
    let dbImages = [];

    try {
      // First get images from ImageKit
      imageKitImages = await this.getImagesFromImageKit(userId, pageSize, skip);
      // Then get metadata from database
      dbImages = await this.findByPhotographerId(userId);
    } catch (error) {
      console.error('Error in ImageKit/database operations:', error);
      // If there are any issues, return just the database images
      return await this.findByPhotographerId(userId) || [];
    }

    // Merge the data so ImageKit images have their status metadata from DB
    const mergedImages = imageKitImages.map(imageKitImage => {
      // Match database metadata by fileId
      const dbMetadata = dbImages.find(dbImg => dbImg.id === imageKitImage.fileId);

      return {
        id: imageKitImage.fileId,
        path: imageKitImage.url || imageKitImage.filePath,
        filename: imageKitImage.name,
        size: imageKitImage.size,
        mimetype: imageKitImage.type,
        width: imageKitImage.width,
        height: imageKitImage.height,
        // Use database metadata if available, otherwise default values
        is_featured: dbMetadata?.is_featured || false,
        is_slideshow: dbMetadata?.is_slideshow || false,
        is_public: dbMetadata?.is_public || false,
        photographer_id: dbMetadata?.photographer_id || userId, // Use DB value if available
        created_at: imageKitImage.createdAt || new Date().toISOString(),
        ...dbMetadata // Spread any other metadata from DB (but avoid overwriting key fields)
      };
    });

    // Also include any DB-only images that might not be in ImageKit (for fallback)
    const dbOnlyImages = dbImages.filter(dbImg =>
      !imageKitImages.some(ikImg => ikImg.fileId === dbImg.id)
    );

    return [...mergedImages, ...dbOnlyImages];
  }

  // Create/update metadata in database for a specific image
  async upsertImageMetadata(imageData) {
    // Basic validation to ensure we have a proper ID
    if (!imageData.id) {
      throw new Error('Image ID is required for metadata operations');
    }

    // Check if image already exists in DB
    let existing = null;
    try {
      existing = await this.findById(imageData.id);
    } catch (error) {
      console.log('No existing metadata found for image, will create new record');
    }

    if (existing) {
      // Update existing - merge with existing data to preserve any fields we might miss
      const updatedData = { ...existing, ...imageData };
      return await this.update(imageData.id, updatedData);
    } else {
      // Create new
      return await this.create(imageData);
    }
  }

  // Database methods (these will just use the existing Database class methods)
  async create(imageData) {
    return await this.db.createImage(imageData);
  }

  async findAll() {
    return await this.db.getAllImages();
  }

  async findByPhotographerId(photographerId) {
    return await this.db.getImagesByPhotographerId(photographerId);
  }

  async findById(id) {
    return await this.db.getImageById(id);
  }

  async getByIdAndUser(imageId, userId) {
    return await this.db.getImageByIdAndPhotographer(imageId, userId);
  }

  async deleteById(id) {
    return await this.db.deleteImageById(id);
  }

  async findByIdAndPhotographer(id, photographerId) {
    return await this.db.getImageByIdAndPhotographer(id, photographerId);
  }

  async updateFeaturedStatus(imageId, photographerId, isFeatured) {
    return await this.db.updateImageFeaturedStatus(imageId, photographerId, isFeatured);
  }

  async updateSlideshowStatus(imageId, photographerId, isSlideshow) {
    return await this.db.updateImageSlideshowStatus(imageId, photographerId, isSlideshow);
  }

  async updatePublicStatus(imageId, photographerId, isPublic) {
    return await this.db.updateImagePublicStatus(imageId, photographerId, isPublic);
  }

  async getFeaturedImages() {
    return await this.db.getFeaturedImages();
  }

  async getSlideshowImages() {
    return await this.db.getSlideshowImages();
  }

  async getPublicImages() {
    return await this.db.getPublicImages();
  }

  // Get user images with pagination
  async getUserImages(userId, options = {}) {
    return await this.db.getImagesByPhotographerId(userId);
  }

  // Update image metadata
  async update(imageId, updateData) {
    return await this.db.updateImage(imageId, updateData, updateData.photographer_id);
  }
}

module.exports = ImageService;