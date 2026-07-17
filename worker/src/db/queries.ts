import { AppError } from '../utils/errorHandler';

export class Database {
  constructor(private db: D1Database) {}

  async createUser(userData: { username: string; password: string }) {
    if (!userData.username || !userData.password) {
      throw new AppError('Username and password are required', 400);
    }
    const result = await this.db
      .prepare('INSERT INTO users (username, password) VALUES (?, ?)')
      .bind(userData.username, userData.password)
      .run() as any;
    if (!result.success) {
      const errMsg = result.error?.message || '';
      if (errMsg.includes('UNIQUE constraint')) throw new AppError('User already exists', 400);
      throw new AppError('Failed to create user', 500);
    }
    return await this.findUserByUsername(userData.username);
  }

  async findUserById(userId: number | string) {
    return await this.db
      .prepare('SELECT id, username, created_at FROM users WHERE id = ?')
      .bind(userId)
      .first();
  }

  async findUserByUsername(username: string) {
    return await this.db
      .prepare('SELECT id, username, password, created_at FROM users WHERE username = ?')
      .bind(username)
      .first();
  }

  async createImage(imageData: any) {
    if (!imageData.id || !imageData.photographer_id) {
      throw new AppError('Image ID and photographer ID are required', 400);
    }
    const result = await this.db
      .prepare(`INSERT OR IGNORE INTO images (id, path, original_name, photographer_id, is_slideshow, is_public, gallery_order, slideshow_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(imageData.id, imageData.path || '', imageData.original_name || '', imageData.photographer_id,
        imageData.is_slideshow ? 1 : 0, imageData.is_public ? 1 : 0,
        imageData.gallery_order || 0, imageData.slideshow_order || 0)
      .run() as any;
    if (!result.success) throw new AppError('Failed to create image', 500);
    return await this.getImageById(imageData.id);
  }

  async getAllImages() {
    const res = await this.db
      .prepare('SELECT * FROM images ORDER BY created_at DESC')
      .all() as any;
    return (res.results || []) as any[];
  }

  async getImagesByPhotographerId(photographerId: number | string) {
    const res = await this.db
      .prepare('SELECT * FROM images WHERE photographer_id = ? ORDER BY created_at DESC')
      .bind(photographerId)
      .all() as any;
    return (res.results || []) as any[];
  }

  async getImageById(imageId: string) {
    return await this.db
      .prepare('SELECT * FROM images WHERE id = ?')
      .bind(imageId)
      .first();
  }

  async getImageByIdAndPhotographer(imageId: string, photographerId: number | string) {
    return await this.db
      .prepare('SELECT * FROM images WHERE id = ? AND photographer_id = ?')
      .bind(imageId, photographerId)
      .first();
  }

  async deleteImageById(imageId: string) {
    const result = await this.db
      .prepare('DELETE FROM images WHERE id = ?')
      .bind(imageId)
      .run() as any;
    if (!result.success) throw new AppError('Failed to delete image', 500);
    return { id: imageId, success: true };
  }

  async updateImage(imageId: string, updateData: any, photographerId: number | string) {
    const sets: string[] = [];
    const params: any[] = [];
    for (const [key, val] of Object.entries(updateData)) {
      sets.push(`${key} = ?`);
      params.push(key === 'is_slideshow' || key === 'is_public' ? (val ? 1 : 0) : val);
    }
    if (!sets.length) throw new AppError('No valid fields to update', 400);
    params.push(imageId, photographerId);
    const updateResult = await this.db
      .prepare(`UPDATE images SET ${sets.join(', ')} WHERE id = ? AND photographer_id = ?`)
      .bind(...params)
      .run() as any;
    if (!updateResult.success) throw new AppError('Failed to update image', 500);
    const updatedImage = await this.getImageByIdAndPhotographer(imageId, photographerId);
    if (!updatedImage) throw new AppError('Image not found', 404);
    return updatedImage;
  }

  async updateImageSlideshowStatus(imageId: string, photographerId: number | string, isSlideshow: boolean, imagePath?: string, originalName?: string) {
    const existing = await this.getImageByIdAndPhotographer(imageId, photographerId);
    if (existing) return await this.updateImage(imageId, { is_slideshow: isSlideshow ? 1 : 0 }, photographerId);
    const other = await this.getImageById(imageId);
    if (other && other.photographer_id !== photographerId) throw new AppError('Image belongs to a different photographer', 403);
    await this.createImage({ id: imageId, path: imagePath || `/image/${imageId}`, original_name: originalName || '', photographer_id: photographerId, is_slideshow: isSlideshow ? 1 : 0, is_public: 0 });
    return await this.updateImage(imageId, { is_slideshow: isSlideshow ? 1 : 0 }, photographerId);
  }

  async updateImagePublicStatus(imageId: string, photographerId: number | string, isPublic: boolean, imagePath?: string, originalName?: string) {
    const existing = await this.getImageByIdAndPhotographer(imageId, photographerId);
    if (existing) return await this.updateImage(imageId, { is_public: isPublic ? 1 : 0 }, photographerId);
    const other = await this.getImageById(imageId);
    if (other && other.photographer_id !== photographerId) throw new AppError('Image belongs to a different photographer', 403);
    await this.createImage({ id: imageId, path: imagePath || `/image/${imageId}`, original_name: originalName || '', photographer_id: photographerId, is_slideshow: 0, is_public: isPublic ? 1 : 0 });
    return await this.updateImage(imageId, { is_public: isPublic ? 1 : 0 }, photographerId);
  }

  async updateImageOrder(updates: any[], type: string) {
    const column = type === 'gallery' ? 'gallery_order' : 'slideshow_order';
    const results = [];
    for (const item of updates) {
      if (!item.id || item.order === undefined) throw new AppError('Each update must contain id and order', 400);
      await this.db.prepare(`UPDATE images SET ${column} = ? WHERE id = ?`).bind(item.order, item.id).run();
      results.push(item);
    }
    return results;
  }

  async getSlideshowImages() {
    const res = await this.db
      .prepare('SELECT * FROM images WHERE is_slideshow = 1 ORDER BY slideshow_order ASC, created_at DESC')
      .all() as any;
    return (res.results || []) as any[];
  }

  async getPublicImages() {
    const res = await this.db
      .prepare('SELECT * FROM images WHERE is_public = 1 ORDER BY gallery_order ASC, created_at DESC')
      .all() as any;
    return (res.results || []) as any[];
  }
}
