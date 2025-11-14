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

    // First, try to find if the image exists and belongs to the photographer
    const { data: existingImage, error: fetchError } = await this.supabase
      .from('images')
      .select('id, photographer_id')
      .eq('id', imageId)
      .eq('photographer_id', photographerId)
      .single();

    // If the image doesn't exist for this specific photographer, check if it exists for another user
    if (fetchError && (fetchError.code === 'PGRST116' || fetchError.code === '42P01')) {
      // Image doesn't exist for this photographer, let's see if it exists for another user
      const { data: otherUserImage, error: otherUserError } = await this.supabase
        .from('images')
        .select('id, photographer_id')
        .eq('id', imageId)
        .single();

      if (otherUserError && otherUserError.code !== 'PGRST116' && otherUserError.code !== '42P01') {
        // There's an actual database error, not just "not found"
        console.error('Error checking image existence across all users:', otherUserError);
        throw handleDbError(otherUserError);
      }

      if (otherUserImage && otherUserImage.photographer_id !== photographerId) {
        // Image exists but belongs to a different photographer - unauthorized
        throw new Error(`Image with ID ${imageId} belongs to a different photographer`);
      }

      if (!otherUserImage) {
        // Image doesn't exist in database at all, create it first
        console.log(`Image with ID ${imageId} not found in database, creating new record...`);

        // Create the image with minimal data and the update data
        const imagePath = updateData.path || `/image/${imageId}`;
        const newImage = await this.create({
          id: imageId,
          path: imagePath,
          photographer_id: photographerId,
          is_public: updateData.is_public || false,
          is_featured: updateData.is_featured || false,
          is_slideshow: updateData.is_slideshow || false
        });
      }
    } else if (fetchError) {
      // There's a different database error
      console.error('Error fetching image for general update:', fetchError);
      throw handleDbError(fetchError);
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

    // First, try to find if the image exists and belongs to the photographer
    const { data: existingImage, error: fetchError } = await this.supabase
      .from('images')
      .select('id, photographer_id')
      .eq('id', imageId)
      .eq('photographer_id', photographerId)
      .single();

    // If the image doesn't exist for this specific photographer, check if it exists for another user
    if (fetchError && (fetchError.code === 'PGRST116' || fetchError.code === '42P01')) {
      // Image doesn't exist for this photographer, let's see if it exists for another user
      const { data: otherUserImage, error: otherUserError } = await this.supabase
        .from('images')
        .select('id, photographer_id')
        .eq('id', imageId)
        .single();

      if (otherUserError && otherUserError.code !== 'PGRST116' && otherUserError.code !== '42P01') {
        // There's an actual database error, not just "not found"
        console.error('Error checking image existence across all users:', otherUserError);
        throw handleDbError(otherUserError);
      }

      if (otherUserImage && otherUserImage.photographer_id !== photographerId) {
        // Image exists but belongs to a different photographer - unauthorized
        throw new Error(`Image with ID ${imageId} belongs to a different photographer`);
      }

      if (!otherUserImage) {
        // Image doesn't exist in database at all, create it first
        console.log(`Image with ID ${imageId} not found in database, creating new record...`);

        // Create the image with minimal data
        const imagePath = `/image/${imageId}`;
        const newImage = await this.create({
          id: imageId,
          path: imagePath,
          photographer_id: photographerId,
          is_featured: isFeatured,  // Set the target status as initial value
          is_public: false,         // Default values
          is_slideshow: false
        });
      }
    } else if (fetchError) {
      // There's a different database error
      console.error('Error fetching image for featured status update:', fetchError);
      throw handleDbError(fetchError);
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

    // First, try to find if the image exists and belongs to the photographer
    const { data: existingImage, error: fetchError } = await this.supabase
      .from('images')
      .select('id, photographer_id')
      .eq('id', imageId)
      .eq('photographer_id', photographerId)
      .single();

    // If the image doesn't exist for this specific photographer, check if it exists for another user
    if (fetchError && (fetchError.code === 'PGRST116' || fetchError.code === '42P01')) {
      // Image doesn't exist for this photographer, let's see if it exists for another user
      const { data: otherUserImage, error: otherUserError } = await this.supabase
        .from('images')
        .select('id, photographer_id')
        .eq('id', imageId)
        .single();

      if (otherUserError && otherUserError.code !== 'PGRST116' && otherUserError.code !== '42P01') {
        // There's an actual database error, not just "not found"
        console.error('Error checking image existence across all users:', otherUserError);
        throw handleDbError(otherUserError);
      }

      if (otherUserImage && otherUserImage.photographer_id !== photographerId) {
        // Image exists but belongs to a different photographer - unauthorized
        throw new Error(`Image with ID ${imageId} belongs to a different photographer`);
      }

      if (!otherUserImage) {
        // Image doesn't exist in database at all, create it first
        console.log(`Image with ID ${imageId} not found in database, creating new record...`);

        // Create the image with minimal data
        const imagePath = `/image/${imageId}`;
        const newImage = await this.create({
          id: imageId,
          path: imagePath,
          photographer_id: photographerId,
          is_slideshow: isSlideshow,  // Set the target status as initial value
          is_public: false,           // Default values
          is_featured: false
        });
      }
    } else if (fetchError) {
      // There's a different database error
      console.error('Error fetching image for slideshow status update:', fetchError);
      throw handleDbError(fetchError);
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

    // First, try to find if the image exists and belongs to the photographer
    const { data: existingImage, error: fetchError } = await this.supabase
      .from('images')
      .select('id, photographer_id')
      .eq('id', imageId)
      .eq('photographer_id', photographerId)
      .single();

    // If the image doesn't exist for this specific photographer, check if it exists for another user
    if (fetchError && (fetchError.code === 'PGRST116' || fetchError.code === '42P01')) {
      // Image doesn't exist for this photographer, let's see if it exists for another user
      const { data: otherUserImage, error: otherUserError } = await this.supabase
        .from('images')
        .select('id, photographer_id')
        .eq('id', imageId)
        .single();

      if (otherUserError && otherUserError.code !== 'PGRST116' && otherUserError.code !== '42P01') {
        // There's an actual database error, not just "not found"
        console.error('Error checking image existence across all users:', otherUserError);
        throw handleDbError(otherUserError);
      }

      if (otherUserImage && otherUserImage.photographer_id !== photographerId) {
        // Image exists but belongs to a different photographer - unauthorized
        throw new Error(`Image with ID ${imageId} belongs to a different photographer`);
      }

      if (!otherUserImage) {
        // Image doesn't exist in database at all, create it first
        console.log(`Image with ID ${imageId} not found in database, creating new record...`);

        // Create the image with minimal data - we'll need to get more details from ImageKit if possible
        const imagePath = `/image/${imageId}`;
        const newImage = await this.createImage({
          id: imageId,
          path: imagePath,
          photographer_id: photographerId,
          is_public: isPublic,  // Set the target status as initial value
          is_featured: false,   // Default values
          is_slideshow: false
        });
      }
    } else if (fetchError) {
      // There's a different database error
      console.error('Error fetching image for public status update:', fetchError);
      throw handleDbError(fetchError);
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