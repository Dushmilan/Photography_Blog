// Image model for Supabase/PostgreSQL with ImageKit integration
const Database = require('../utils/db');
const { AppError } = require('../utils/errorHandler');

class Image {
  constructor(supabase) {
    this.db = new Database(supabase);
  }

  async create(imageData) {
    if (!imageData) {
      throw new AppError('Image data is required for creating an image', 400);
    }

    return await this.db.createImage(imageData);
  }

  async findAll() {
    return await this.db.getAllImages();
  }

  async findByPhotographerId(photographerId) {
    if (!photographerId) {
      throw new AppError('Photographer ID is required for finding images by photographer', 400);
    }

    return await this.db.getImagesByPhotographerId(photographerId);
  }

  async findById(id) {
    if (!id) {
      throw new AppError('Image ID is required for finding image by ID', 400);
    }

    return await this.db.getImageById(id);
  }

  // Get image by ID and verify user ownership
  async getByIdAndUser(imageId, userId) {
    if (!imageId || !userId) {
      throw new AppError('Image ID and user ID are required for finding image by ID and user', 400);
    }

    return await this.db.getImageByIdAndPhotographer(imageId, userId);
  }

  async deleteById(id) {
    if (!id) {
      throw new AppError('Image ID is required for deleting image', 400);
    }

    return await this.db.deleteImageById(id);
  }

  async findByIdAndPhotographer(id, photographerId) {
    if (!id || !photographerId) {
      throw new AppError('Image ID and photographer ID are required for finding image by ID and photographer', 400);
    }

    return await this.db.getImageByIdAndPhotographer(id, photographerId);
  }


  async updateSlideshowStatus(imageId, photographerId, isSlideshow) {
    if (!imageId || !photographerId || typeof isSlideshow !== 'boolean') {
      throw new AppError('Image ID, photographer ID, and boolean isSlideshow are required for updating slideshow status', 400);
    }

    try {
      return await this.db.updateImageSlideshowStatus(imageId, photographerId, isSlideshow);
    } catch (error) {
      if (error.message && error.message.includes('not found or doesn\'t belong to this photographer')) {
        throw new AppError('Image not found or unauthorized to update', 404);
      } else if (error.message && error.message.includes('does not exist in the database')) {
        throw new AppError(error.message, 404);
      }
      throw error;
    }
  }

  async updatePublicStatus(imageId, photographerId, isPublic) {
    if (!imageId || !photographerId || typeof isPublic !== 'boolean') {
      throw new AppError('Image ID, photographer ID, and boolean isPublic are required for updating public status', 400);
    }

    try {
      return await this.db.updateImagePublicStatus(imageId, photographerId, isPublic);
    } catch (error) {
      if (error.message && error.message.includes('not found or doesn\'t belong to this photographer')) {
        throw new AppError('Image not found or unauthorized to update', 404);
      } else if (error.message && error.message.includes('does not exist in the database')) {
        throw new AppError(error.message, 404);
      }
      throw error;
    }
  }

  async getSlideshowImages() {
    return await this.db.getSlideshowImages();
  }

  async getPublicImages() {
    return await this.db.getPublicImages();
  }


  // Get user images with pagination
  async getUserImages(userId, options = {}) {
    if (!userId) {
      throw new AppError('User ID is required for getting user images', 400);
    }

    const { limit = 50, offset = 0, order = 'created_at DESC' } = options;

    // Validate pagination parameters
    if (limit <= 0 || limit > 100) {
      throw new AppError('Limit must be between 1 and 100', 400);
    }
    if (offset < 0) {
      throw new AppError('Offset must be a non-negative number', 400);
    }

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
    if (!imageId) {
      throw new AppError('Image ID is required for updating image', 400);
    }

    if (!updateData) {
      throw new AppError('Update data is required for updating image', 400);
    }

    const image = await this.db.getImageById(imageId);
    if (!image) {
      throw new AppError('Image not found', 404);
    }

    const updates = {};
    if (updateData.path !== undefined) {
      updates.path = updateData.path;
    }
    if (updateData.is_slideshow !== undefined) {
      updates.is_slideshow = updateData.is_slideshow;
    }
    if (updateData.is_public !== undefined) {
      updates.is_public = updateData.is_public;
    }

    if (Object.keys(updates).length > 0) {
      // Use the general update method
      try {
        return await this.db.updateImage(imageId, updates, image.photographer_id);
      } catch (error) {
        if (error.message && error.message.includes('not found or doesn\'t belong to this photographer')) {
          throw new AppError('Image not found or unauthorized to update', 404);
        }
        throw error;
      }
    }

    // Return the unchanged image if no updates were made
    return image;
  }

  async updateOrder(updates, type) {
    if (!updates || !Array.isArray(updates)) {
      throw new AppError('Updates must be an array', 400);
    }
    if (type !== 'gallery' && type !== 'slideshow') {
      throw new AppError('Type must be "gallery" or "slideshow"', 400);
    }

    return await this.db.updateImageOrder(updates, type);
  }
}

export default Image;