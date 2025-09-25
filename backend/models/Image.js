// Image model for Supabase/PostgreSQL
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

  async getFeaturedImages() {
    return await this.db.getFeaturedImages();
  }

  async getSlideshowImages() {
    return await this.db.getSlideshowImages();
  }

  async updateImageName(imageId, photographerId, newName) {
    return await this.db.updateImageName(imageId, photographerId, newName);
  }
}

module.exports = Image;