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
        is_slideshow: imageData.is_slideshow || false,
        is_public: imageData.is_public || false,
        gallery_order: imageData.gallery_order || 0,
        slideshow_order: imageData.slideshow_order || 0
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
      .select('id, path, photographer_id, is_slideshow, is_public, created_at, gallery_order, slideshow_order')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all images:', error);
      throw handleDbError(error);
    }

    // Add default values for properties that frontend might expect
    const processedData = data?.map(image => {
      if (image) {
        image.original_name = image.original_name || image.filename || extractFilenameFromPath(image.path);
        image.filename = image.filename || extractFilenameFromPath(image.path);
      }
      return image;
    }) || data;

    return processedData;
  }

  async getImagesByPhotographerId(photographerId) {
    if (!photographerId) {
      throw new Error('Photographer ID is required for fetching images by photographer');
    }

    const { data, error } = await this.supabase
      .from('images')
      .select('id, path, photographer_id, is_slideshow, is_public, created_at, gallery_order, slideshow_order')
      .eq('photographer_id', photographerId)
      .order('created_at', { ascending: false });

    if (error) throw handleDbError(error);

    // Add default values for properties that frontend might expect
    const processedData = data?.map(image => {
      if (image) {
        image.original_name = image.original_name || image.filename || extractFilenameFromPath(image.path);
        image.filename = image.filename || extractFilenameFromPath(image.path);
      }
      return image;
    }) || data;

    return processedData;
  }

  async getImageById(imageId) {
    if (!imageId) {
      throw new Error('Image ID is required for fetching image by ID');
    }

    const { data, error } = await this.supabase
      .from('images')
      .select('id, path, photographer_id, is_slideshow, is_public, created_at, gallery_order, slideshow_order')
      .eq('id', imageId)
      .single(); // Using single() since ID should be unique

    if (error) {
      if (error.code === 'PGRST103' || error.message?.includes('multiple')) {
        // Multiple images found, which indicates data integrity issue
        console.warn(`Multiple images found with ID ${imageId}. This indicates a data integrity issue.`);
        // Get all matching records and return the first one
        const { data: allData, error: allError } = await this.supabase
          .from('images')
          .select('id, path, photographer_id, is_slideshow, is_public, created_at')
          .eq('id', imageId);

        if (allError) throw handleDbError(allError);
        const result = allData?.[0] || null;

        // Add default values for properties that frontend might expect
        if (result) {
          result.original_name = result.original_name || result.filename || extractFilenameFromPath(result.path);
          result.filename = result.filename || extractFilenameFromPath(result.path);
        }

        return result;
      } else if (error.code === 'PGRST116' || error.code === '42P01') {
        // Record not found
        return null;
      } else {
        throw handleDbError(error);
      }
    }

    // Add default values for properties that frontend might expect
    if (data) {
      data.original_name = data.original_name || data.filename || extractFilenameFromPath(data.path);
      data.filename = data.filename || extractFilenameFromPath(data.path);
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
      .select('id, path, photographer_id, is_slideshow, is_public, created_at'); // Return the deleted record

    if (error) {
      console.error('Error deleting image from DB:', error);
      throw handleDbError(error);
    }

    // Add default values for properties that frontend might expect
    if (data) {
      data.original_name = data.original_name || data.filename || extractFilenameFromPath(data.path);
      data.filename = data.filename || extractFilenameFromPath(data.path);
    }

    return data;
  }

  async getImageByIdAndPhotographer(imageId, photographerId) {
    if (!imageId || !photographerId) {
      throw new Error('Image ID and photographer ID are required for fetching image by ID and photographer');
    }

    const { data, error } = await this.supabase
      .from('images')
      .select('id, path, photographer_id, is_slideshow, is_public, created_at')
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
          .select('id, path, photographer_id, is_slideshow, is_public, created_at')
          .eq('id', imageId)
          .eq('photographer_id', photographerId);

        if (allError) throw handleDbError(allError);
        const result = allData?.[0] || null;

        // Add default values for properties that frontend might expect
        if (result) {
          result.original_name = result.original_name || result.filename || extractFilenameFromPath(result.path);
          result.filename = result.filename || extractFilenameFromPath(result.path);
        }

        return result;
      } else if (error.code === 'PGRST116' || error.code === '42P01') {
        // Record not found
        return null;
      } else {
        throw handleDbError(error);
      }
    }

    // Add default values for properties that frontend might expect
    if (data) {
      data.original_name = data.original_name || data.filename || extractFilenameFromPath(data.path);
      data.filename = data.filename || extractFilenameFromPath(data.path);
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

        // Try to get the actual image details from ImageKit to get proper URL
        let imagePath = `/image/${imageId}`; // fallback path
        try {
          // Initialize ImageKit to get actual image details
          const ImageKit = require('imagekit');
          require('dotenv').config();

          const imagekit = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
          });

          // Get the actual image details from ImageKit
          const imageDetails = await new Promise((resolve, reject) => {
            imagekit.getFileDetails(imageId, (error, fileDetails) => {
              if (error) {
                console.error('Error getting image details from ImageKit:', error);
                resolve(null); // Continue with fallback
              } else {
                resolve(fileDetails);
              }
            });
          });

          if (imageDetails) {
            imagePath = imageDetails.url || imageDetails.filePath || `/image/${imageId}`;
          }
        } catch (error) {
          console.error('Error initializing ImageKit for image details:', error);
          // Continue with fallback path
        }

        // Create the image with minimal data and the update data
        const newImage = await this.createImage({
          id: imageId,
          path: imagePath,
          photographer_id: photographerId,
          is_public: updateData.is_public || false,
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
      .select('id, path, photographer_id, is_slideshow, is_public, created_at')
      .eq('id', imageId)
      .eq('photographer_id', photographerId)
      .single(); // Using single() since combination should be unique

    if (fetchError2) {
      console.error('Error fetching updated image after general update:', fetchError2);
      throw handleDbError(fetchError2);
    }

    // Add default values for properties that frontend might expect
    if (fetchResult) {
      // Add default values for expected properties that might be missing
      fetchResult.original_name = fetchResult.original_name || fetchResult.filename || extractFilenameFromPath(fetchResult.path);
      fetchResult.filename = fetchResult.filename || extractFilenameFromPath(fetchResult.path);
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

        // Try to get the actual image details from ImageKit to get proper URL
        let imagePath = `/image/${imageId}`; // fallback path
        try {
          // Initialize ImageKit to get actual image details
          const ImageKit = require('imagekit');
          require('dotenv').config();

          const imagekit = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
          });

          // Get the actual image details from ImageKit
          const imageDetails = await new Promise((resolve, reject) => {
            imagekit.getFileDetails(imageId, (error, fileDetails) => {
              if (error) {
                console.error('Error getting image details from ImageKit:', error);
                resolve(null); // Continue with fallback
              } else {
                resolve(fileDetails);
              }
            });
          });

          if (imageDetails) {
            imagePath = imageDetails.url || imageDetails.filePath || `/image/${imageId}`;
          }
        } catch (error) {
          console.error('Error initializing ImageKit for image details:', error);
          // Continue with fallback path
        }

        // Create the image with minimal data
        const newImage = await this.createImage({
          id: imageId,
          path: imagePath,
          photographer_id: photographerId,
          is_slideshow: isSlideshow,  // Set the target status as initial value
          is_public: false           // Default values
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
      .select('id, path, photographer_id, is_slideshow, is_public, created_at')
      .eq('id', imageId)
      .eq('photographer_id', photographerId)
      .single(); // Using single() since combination should be unique

    if (fetchError2) {
      console.error('Error fetching updated image after slideshow status update:', fetchError2);
      throw handleDbError(fetchError2);
    }

    // Add default values for properties that frontend might expect
    if (fetchResult) {
      // Add default values for expected properties that might be missing
      fetchResult.original_name = fetchResult.original_name || fetchResult.filename || extractFilenameFromPath(fetchResult.path);
      fetchResult.filename = fetchResult.filename || extractFilenameFromPath(fetchResult.path);
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

        // Try to get the actual image details from ImageKit to get proper URL
        let imagePath = `/image/${imageId}`; // fallback path
        try {
          // Initialize ImageKit to get actual image details
          const ImageKit = require('imagekit');
          require('dotenv').config();

          const imagekit = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
          });

          // Get the actual image details from ImageKit
          const imageDetails = await new Promise((resolve, reject) => {
            imagekit.getFileDetails(imageId, (error, fileDetails) => {
              if (error) {
                console.error('Error getting image details from ImageKit:', error);
                resolve(null); // Continue with fallback
              } else {
                resolve(fileDetails);
              }
            });
          });

          if (imageDetails) {
            imagePath = imageDetails.url || imageDetails.filePath || `/image/${imageId}`;
          }
        } catch (error) {
          console.error('Error initializing ImageKit for image details:', error);
          // Continue with fallback path
        }

        // Create the image with minimal data
        const newImage = await this.createImage({
          id: imageId,
          path: imagePath,
          photographer_id: photographerId,
          is_public: isPublic,  // Set the target status as initial value
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
      .select('id, path, photographer_id, is_slideshow, is_public, created_at')
      .eq('id', imageId)
      .eq('photographer_id', photographerId)
      .single(); // Using single() since combination should be unique

    if (fetchError2) {
      console.error('Error fetching updated image after public status update:', fetchError2);
      throw handleDbError(fetchError2);
    }

    // Add default values for properties that frontend might expect
    if (fetchResult) {
      // Add default values for expected properties that might be missing
      fetchResult.original_name = fetchResult.original_name || fetchResult.filename || extractFilenameFromPath(fetchResult.path);
      fetchResult.filename = fetchResult.filename || extractFilenameFromPath(fetchResult.path);
    }

    return fetchResult;
  }

  async updateImageOrder(updates, type) {
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      throw new Error('Updates array is required');
    }
    if (type !== 'gallery' && type !== 'slideshow') {
      throw new Error('Type must be either "gallery" or "slideshow"');
    }

    const column = type === 'gallery' ? 'gallery_order' : 'slideshow_order';

    // Process updates in sequence to ensure order (or use a stored procedure if performance is critical, but loop is fine for small sets)
    const results = [];

    // We'll process these one by one since Supabase JS client doesn't have a bulk update with different values easily
    // Note: A more efficient way would be to write a SQL function or use a CASE statement in a raw query, 
    // but for < 100 images, this is acceptable.
    for (const item of updates) {
      const { id, order } = item;

      const { data, error } = await this.supabase
        .from('images')
        .update({ [column]: order })
        .eq('id', id)
        .select();

      if (error) {
        console.error(`Error updating order for image ${id}:`, error);
      } else {
        results.push(data);
      }
    }

    return results;
  }

  async getSlideshowImages() {
    const { data, error } = await this.supabase
      .from('images')
      .select('id, path, photographer_id, is_slideshow, is_public, created_at, gallery_order, slideshow_order')
      .eq('is_slideshow', true)
      .order('slideshow_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw handleDbError(error);

    // Add default values for properties that frontend might expect
    const processedData = data?.map(image => {
      if (image) {
        image.original_name = image.original_name || image.filename || extractFilenameFromPath(image.path);
        image.filename = image.filename || extractFilenameFromPath(image.path);
      }
      return image;
    }) || data;

    return processedData;
  }

  async getPublicImages() {
    const { data, error } = await this.supabase
      .from('images')
      .select('id, path, photographer_id, is_slideshow, is_public, created_at, gallery_order, slideshow_order')
      .eq('is_public', true)
      .order('gallery_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw handleDbError(error);

    // Add default values for properties that frontend might expect
    const processedData = data?.map(image => {
      if (image) {
        image.original_name = image.original_name || image.filename || extractFilenameFromPath(image.path);
        image.filename = image.filename || extractFilenameFromPath(image.path);
      }
      return image;
    }) || data;

    return processedData;
  }
}

// Helper function to extract filename from path
function extractFilenameFromPath(path) {
  if (!path) return '';
  const parts = path.split('/');
  return parts[parts.length - 1] || '';
}

module.exports = Database;