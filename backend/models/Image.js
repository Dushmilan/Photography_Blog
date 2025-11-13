// Image model for Supabase/PostgreSQL with ImageKit integration
const Database = require('../utils/db');

class Image {
  constructor(supabase) {
    this.db = new Database(supabase);
  }

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

  // Get image by ID and verify user ownership
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

  async updateImageName(imageId, photographerId, newName) {
    return await this.db.updateImageName(imageId, photographerId, newName);
  }

  // Get user images with pagination
  async getUserImages(userId, options = {}) {
    const { limit = 50, offset = 0, order = 'created_at DESC' } = options;
    
    // We'll need to build a custom query to support pagination
    // For now, we'll fetch all images for the user and handle pagination here
    const allImages = await this.db.getImagesByPhotographerId(userId);
    
    const paginatedImages = allImages.slice(offset, offset + limit);
    const count = allImages.length;
    
    return {
      rows: paginatedImages,
      count: count
    };
  }

  // Update image metadata
  async update(imageId, updateData) {
    const image = await this.db.getImageById(imageId);
    if (!image) {
      throw new Error('Image not found');
    }

    const updates = {};
    if (updateData.original_name !== undefined) {
      updates.original_name = updateData.original_name;
    }
    if (updateData.is_featured !== undefined) {
      updates.is_featured = updateData.is_featured;
    }
    if (updateData.is_slideshow !== undefined) {
      updates.is_slideshow = updateData.is_slideshow;
    }
    if (updateData.is_public !== undefined) {
      updates.is_public = updateData.is_public;
    }

    if (Object.keys(updates).length > 0) {
      // Use the general update method
      return await this.db.updateImage(imageId, updates, image.photographer_id);
    }

    // Return the unchanged image if no updates were made
    return image;
  }
}

module.exports = Image;