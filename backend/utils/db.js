// Database utility functions for Supabase
const { handleDbError } = require('./errorHandler');

class Database {
  constructor(supabase) {
    this.supabase = supabase;
  }

  // User operations
  async createUser(userData) {
    // Validate input data
    if (!userData || !userData.username || !userData.password) {
      throw new Error('Username and password are required for user creation');
    }

    if (typeof userData.username !== 'string' || typeof userData.password !== 'string') {
      throw new Error('Username and password must be strings');
    }

    const { data, error } = await this.supabase
      .from('users')
      .insert([{
        username: userData.username,
        password: userData.password
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      console.error('Error details:', error.details, error.hint);
      throw handleDbError(error);
    }
    return data;
  }

  async findUserById(userId) {
    if (!userId) {
      throw new Error('User ID is required for finding user by ID');
    }

    const { data, error, status } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    // If no user is found, Supabase returns an error with status 406 or 404
    if (error && (status === 406 || status === 404)) {
      return null; // Return null if no user found
    }

    if (error) {
      console.error('Error finding user by ID:', error);
      throw handleDbError(error);
    }

    return data;
  }

  async findUserByUsername(username) {
    if (!username) {
      throw new Error('Username is required for finding user by username');
    }

    if (typeof username !== 'string') {
      throw new Error('Username must be a string');
    }

    const { data, error, status } = await this.supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    // If no user is found, Supabase returns an error with status 406 or 404
    if (error && (status === 406 || status === 404)) {
      return null; // Return null if no user found
    }

    if (error) {
      console.error('Error finding user:', error);
      throw handleDbError(error);
    }

    return data;
  }

  // Image operations
  async createImage(imageData) {
    // Validate input data
    if (!imageData || !imageData.id || !imageData.photographer_id) {
      throw new Error('Image ID and photographer ID are required for image creation');
    }

    const { data, error } = await this.supabase
      .from('images')
      .insert([{
        id: imageData.id,  // Use the ImageKit File ID as the primary key
        path: imageData.path || imageData.filename || '', // Use path, fallback to filename
        photographer_id: imageData.photographer_id,
        is_featured: imageData.is_featured || false,
        is_slideshow: imageData.is_slideshow || false,
        is_public: imageData.is_public || false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating image:', error);
      // If the error is due to unique constraint (image already exists), return existing
      if (error.code === '23505') {  // Unique violation
        // Try to fetch the existing image
        const { data: existingData } = await this.supabase
          .from('images')
          .select('*')
          .eq('id', imageData.id)
          .single();

        return existingData;
      }

      throw handleDbError(error);
    }
    return data;
  }

  async getAllImages() {
    const { data, error } = await this.supabase
      .from('images')
      .select('id, path, photographer_id, is_featured, is_slideshow, is_public, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all images:', error);
      throw handleDbError(error);
    }
    return data;
  }

  async getImagesByPhotographerId(photographerId) {
    if (!photographerId) {
      throw new Error('Photographer ID is required for fetching images by photographer');
    }

    const { data, error } = await this.supabase
      .from('images')
      .select('id, path, photographer_id, is_featured, is_slideshow, is_public, created_at')
      .eq('photographer_id', photographerId)
      .order('created_at', { ascending: false });

    if (error) throw handleDbError(error);
    return data;
  }

  async getImageById(imageId) {
    if (!imageId) {
      throw new Error('Image ID is required for fetching image by ID');
    }

    const { data, error } = await this.supabase
      .from('images')
      .select('id, path, photographer_id, is_featured, is_slideshow, is_public, created_at')
      .eq('id', imageId)
      .single(); // Using single() since ID should be unique

    if (error) {
      if (error.code === 'PGRST103' || error.message?.includes('multiple')) {
        // Multiple images found, which indicates data integrity issue
        console.warn(`Multiple images found with ID ${imageId}. This indicates a data integrity issue.`);
        // Get all matching records and return the first one
        const { data: allData, error: allError } = await this.supabase
          .from('images')
          .select('id, path, photographer_id, is_featured, is_slideshow, is_public, created_at')
          .eq('id', imageId);

        if (allError) throw handleDbError(allError);
        return allData?.[0] || null;
      } else if (error.code === 'PGRST116' || error.code === '42P01') {
        // Record not found
        return null;
      } else {
        throw handleDbError(error);
      }
    }

    return data;
  }

  async deleteImageById(imageId) {
    if (!imageId) {
      throw new Error('Image ID is required for deleting image');
    }

    const { data, error } = await this.supabase
      .from('images')
      .delete()
      .eq('id', imageId)
      .select('id, path, photographer_id, is_featured, is_slideshow, is_public, created_at'); // Return the deleted record

    if (error) {
      console.error('Error deleting image from DB:', error);
      throw handleDbError(error);
    }
    return data;
  }

  async getImageByIdAndPhotographer(imageId, photographerId) {
    if (!imageId || !photographerId) {
      throw new Error('Image ID and photographer ID are required for fetching image by ID and photographer');
    }

    const { data, error } = await this.supabase
      .from('images')
      .select('id, path, photographer_id, is_featured, is_slideshow, is_public, created_at')
      .eq('id', imageId)
      .eq('photographer_id', photographerId)
      .single(); // Using single() since combination should be unique

    if (error) {
      if (error.code === 'PGRST103' || error.message?.includes('multiple')) {
        // Multiple images found, which indicates data integrity issue
        console.warn(`Multiple images found with ID ${imageId} for photographer ${photographerId}. This indicates a data integrity issue.`);
        // Get all matching records and return the first one
        const { data: allData, error: allError } = await this.supabase
          .from('images')
          .select('id, path, photographer_id, is_featured, is_slideshow, is_public, created_at')
          .eq('id', imageId)
          .eq('photographer_id', photographerId);

        if (allError) throw handleDbError(allError);
        return allData?.[0] || null;
      } else if (error.code === 'PGRST116' || error.code === '42P01') {
        // Record not found
        return null;
      } else {
        throw handleDbError(error);
      }
    }

    return data;
  }

  async updateImage(imageId, updateData, photographerId) {
    if (!imageId || !updateData || !photographerId) {
      throw new Error('Image ID, update data, and photographer ID are required for updating image');
    }

    // First, verify that the image exists and belongs to the photographer
    const { data: existingImage, error: fetchError } = await this.supabase
      .from('images')
      .select('id, photographer_id')
      .eq('id', imageId)
      .eq('photographer_id', photographerId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116' || fetchError.code === '42P01') {
        // Record not found - either image doesn't exist or doesn't belong to this user
        throw new Error(`Image with ID ${imageId} not found or doesn't belong to this photographer`);
      } else {
        console.error('Error fetching image for general update:', fetchError);
        throw handleDbError(fetchError);
      }
    }

    if (!existingImage) {
      throw new Error(`Image with ID ${imageId} not found or doesn't belong to this photographer`);
    }

    // Update the image
    const { data: updateResult, error } = await this.supabase
      .from('images')
      .update(updateData)
      .eq('id', imageId)
      .eq('photographer_id', photographerId);

    if (error) {
      console.error('Error updating image:', error);
      throw handleDbError(error);
    }

    // After successful update, fetch the updated record
    const { data: fetchResult, error: fetchError2 } = await this.supabase
      .from('images')
      .select('id, path, photographer_id, is_featured, is_slideshow, is_public, created_at')
      .eq('id', imageId)
      .eq('photographer_id', photographerId)
      .single(); // Using single() since combination should be unique

    if (fetchError2) {
      console.error('Error fetching updated image after general update:', fetchError2);
      throw handleDbError(fetchError2);
    }

    return fetchResult;
  }

  async updateImageFeaturedStatus(imageId, photographerId, isFeatured) {
    if (!imageId || !photographerId || typeof isFeatured !== 'boolean') {
      throw new Error('Image ID, photographer ID, and boolean isFeatured are required for updating featured status');
    }

    // First, verify that the image exists and belongs to the photographer
    const { data: existingImage, error: fetchError } = await this.supabase
      .from('images')
      .select('id, photographer_id')
      .eq('id', imageId)
      .eq('photographer_id', photographerId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116' || fetchError.code === '42P01') {
        // Record not found - either image doesn't exist or doesn't belong to this user
        throw new Error(`Image with ID ${imageId} not found or doesn't belong to this photographer`);
      } else {
        console.error('Error fetching image for featured status update:', fetchError);
        throw handleDbError(fetchError);
      }
    }

    if (!existingImage) {
      throw new Error(`Image with ID ${imageId} not found or doesn't belong to this photographer`);
    }

    // Update the featured status
    const { data: updateResult, error } = await this.supabase
      .from('images')
      .update({ is_featured: isFeatured })
      .eq('id', imageId)
      .eq('photographer_id', photographerId);

    if (error) {
      console.error('Error updating image featured status:', error);
      throw handleDbError(error);
    }

    // After successful update, fetch the updated record
    const { data: fetchResult, error: fetchError2 } = await this.supabase
      .from('images')
      .select('id, path, photographer_id, is_featured, is_slideshow, is_public, created_at')
      .eq('id', imageId)
      .eq('photographer_id', photographerId)
      .single(); // Using single() since combination should be unique

    if (fetchError2) {
      console.error('Error fetching updated image after featured status update:', fetchError2);
      throw handleDbError(fetchError2);
    }

    return fetchResult;
  }

  async updateImageSlideshowStatus(imageId, photographerId, isSlideshow) {
    if (!imageId || !photographerId || typeof isSlideshow !== 'boolean') {
      throw new Error('Image ID, photographer ID, and boolean isSlideshow are required for updating slideshow status');
    }

    // First, verify that the image exists and belongs to the photographer
    const { data: existingImage, error: fetchError } = await this.supabase
      .from('images')
      .select('id, photographer_id')
      .eq('id', imageId)
      .eq('photographer_id', photographerId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116' || fetchError.code === '42P01') {
        // Record not found - either image doesn't exist or doesn't belong to this user
        throw new Error(`Image with ID ${imageId} not found or doesn't belong to this photographer`);
      } else {
        console.error('Error fetching image for slideshow status update:', fetchError);
        throw handleDbError(fetchError);
      }
    }

    if (!existingImage) {
      throw new Error(`Image with ID ${imageId} not found or doesn't belong to this photographer`);
    }

    // Update the slideshow status
    const { data: updateResult, error } = await this.supabase
      .from('images')
      .update({ is_slideshow: isSlideshow })
      .eq('id', imageId)
      .eq('photographer_id', photographerId);

    if (error) {
      console.error('Error updating image slideshow status:', error);
      throw handleDbError(error);
    }

    // After successful update, fetch the updated record
    const { data: fetchResult, error: fetchError2 } = await this.supabase
      .from('images')
      .select('id, path, photographer_id, is_featured, is_slideshow, is_public, created_at')
      .eq('id', imageId)
      .eq('photographer_id', photographerId)
      .single(); // Using single() since combination should be unique

    if (fetchError2) {
      console.error('Error fetching updated image after slideshow status update:', fetchError2);
      throw handleDbError(fetchError2);
    }

    return fetchResult;
  }

  async updateImagePublicStatus(imageId, photographerId, isPublic) {
    if (!imageId || !photographerId || typeof isPublic !== 'boolean') {
      throw new Error('Image ID, photographer ID, and boolean isPublic are required for updating public status');
    }

    // First, verify that the image exists and belongs to the photographer
    const { data: existingImage, error: fetchError } = await this.supabase
      .from('images')
      .select('id, photographer_id')
      .eq('id', imageId)
      .eq('photographer_id', photographerId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116' || fetchError.code === '42P01') {
        // Record not found - either image doesn't exist or doesn't belong to this user
        throw new Error(`Image with ID ${imageId} not found or doesn't belong to this photographer`);
      } else {
        console.error('Error fetching image for public status update:', fetchError);
        throw handleDbError(fetchError);
      }
    }

    if (!existingImage) {
      throw new Error(`Image with ID ${imageId} not found or doesn't belong to this photographer`);
    }

    // Update the public status
    const { data: updateResult, error } = await this.supabase
      .from('images')
      .update({ is_public: isPublic })
      .eq('id', imageId)
      .eq('photographer_id', photographerId);

    if (error) {
      console.error('Error updating image public status:', error);
      throw handleDbError(error);
    }

    // After successful update, fetch the updated record
    const { data: fetchResult, error: fetchError2 } = await this.supabase
      .from('images')
      .select('id, path, photographer_id, is_featured, is_slideshow, is_public, created_at')
      .eq('id', imageId)
      .eq('photographer_id', photographerId)
      .single(); // Using single() since combination should be unique

    if (fetchError2) {
      console.error('Error fetching updated image after public status update:', fetchError2);
      throw handleDbError(fetchError2);
    }

    return fetchResult;
  }

  async getFeaturedImages() {
    const { data, error } = await this.supabase
      .from('images')
      .select('id, path, photographer_id, is_featured, is_slideshow, is_public, created_at')
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    if (error) throw handleDbError(error);
    return data;
  }

  async getSlideshowImages() {
    const { data, error } = await this.supabase
      .from('images')
      .select('id, path, photographer_id, is_featured, is_slideshow, is_public, created_at')
      .eq('is_slideshow', true)
      .order('created_at', { ascending: false });

    if (error) throw handleDbError(error);
    return data;
  }

  async getPublicImages() {
    const { data, error } = await this.supabase
      .from('images')
      .select('id, path, photographer_id, is_featured, is_slideshow, is_public, created_at')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) throw handleDbError(error);
    return data;
  }
}

module.exports = Database;