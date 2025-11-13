// Database utility functions for Supabase
class Database {
  constructor(supabase) {
    this.supabase = supabase;
  }

  // User operations
  async createUser(userData) {
    // For debugging, let's log the data being inserted
    console.log('Creating user with data:', userData);
    
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
      throw new Error(error.message);
    }
    console.log('User created successfully:', data);
    return data;
  }

  async findUserById(userId) {
    console.log('Finding user by ID:', userId);
    const { data, error, status } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    // If no user is found, Supabase returns an error with status 406 or 404
    if (error && (status === 406 || status === 404)) {
      console.log('User not found by ID:', userId);
      return null; // Return null if no user found
    }
    
    if (error) {
      console.error('Error finding user by ID:', error);
      throw new Error(error.message);
    }
    
    console.log('Found user by ID:', data);
    return data;
  }

  async findUserByUsername(username) {
    console.log('Finding user by username:', username);
    const { data, error, status } = await this.supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    // If no user is found, Supabase returns an error with status 406 or 404
    if (error && (status === 406 || status === 404)) {
      console.log('User not found:', username);
      return null; // Return null if no user found
    }
    
    if (error) {
      console.error('Error finding user:', error);
      throw new Error(error.message);
    }
    
    console.log('Found user:', data);
    return data;
  }

  // Image operations
  async createImage(imageData) {
    const { data, error } = await this.supabase
      .from('images')
      .insert([{
        id: imageData.id,  // Use the Google Photos ID as the primary key
        filename: imageData.filename,
        original_name: imageData.original_name,
        path: imageData.path,
        thumbnail_path: imageData.thumbnail_path || imageData.path,  // Use provided thumbnail_path or fallback to path
        small_path: imageData.small_path || imageData.path,      // Use provided small_path or fallback to path
        medium_path: imageData.medium_path || imageData.path,     // Use provided medium_path or fallback to path
        size: imageData.size,
        mimetype: imageData.mimetype,
        width: imageData.width,
        height: imageData.height,
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
        console.log('Image already exists in DB:', imageData.id);
        // Try to fetch the existing image
        const { data: existingData } = await this.supabase
          .from('images')
          .select('*')
          .eq('id', imageData.id)
          .single();
          
        return existingData;
      }
      
      // If the error is due to not-null constraint, we might need to alter the table
      if (error.code === '23502') {
        console.error('Hint: You may need to run this SQL in Supabase to allow NULL values:');
        console.error('ALTER TABLE images ALTER COLUMN thumbnail_path DROP NOT NULL;');
        console.error('ALTER TABLE images ALTER COLUMN small_path DROP NOT NULL;');
        console.error('ALTER TABLE images ALTER COLUMN medium_path DROP NOT NULL;');
      }
      throw new Error(error.message);
    }
    return data;
  }

  async getAllImages() {
    console.log('Fetching all images from database');
    const { data, error } = await this.supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all images:', error);
      throw new Error(error.message);
    }
    console.log('Successfully fetched', data.length, 'images');
    return data;
  }

  async getImagesByPhotographerId(photographerId) {
    const { data, error } = await this.supabase
      .from('images')
      .select('*')
      .eq('photographer_id', photographerId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async getImageById(imageId) {
    const { data, error } = await this.supabase
      .from('images')
      .select('*')
      .eq('id', imageId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteImageById(imageId) {
    console.log('Deleting image with ID:', imageId);
    const { data, error } = await this.supabase
      .from('images')
      .delete()
      .eq('id', imageId);

    if (error) {
      console.error('Error deleting image from DB:', error);
      throw new Error(error.message);
    }
    console.log('Successfully deleted image with ID:', imageId);
    return data;
  }

  async getImageByIdAndPhotographer(imageId, photographerId) {
    const { data, error } = await this.supabase
      .from('images')
      .select('*')
      .eq('id', imageId)
      .eq('photographer_id', photographerId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateImageFeaturedStatus(imageId, photographerId, isFeatured) {
    const { data, error } = await this.supabase
      .from('images')
      .update({ is_featured: isFeatured })
      .eq('id', imageId)
      .eq('photographer_id', photographerId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateImageSlideshowStatus(imageId, photographerId, isSlideshow) {
    const { data, error } = await this.supabase
      .from('images')
      .update({ is_slideshow: isSlideshow })
      .eq('id', imageId)
      .eq('photographer_id', photographerId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateImagePublicStatus(imageId, photographerId, isPublic) {
    const { data, error } = await this.supabase
      .from('images')
      .update({ is_public: isPublic })
      .eq('id', imageId)
      .eq('photographer_id', photographerId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getFeaturedImages() {
    const { data, error } = await this.supabase
      .from('images')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async getSlideshowImages() {
    const { data, error } = await this.supabase
      .from('images')
      .select('*')
      .eq('is_slideshow', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async getPublicImages() {
    const { data, error } = await this.supabase
      .from('images')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async updateImageName(imageId, photographerId, newName) {
    const { data, error } = await this.supabase
      .from('images')
      .update({ original_name: newName })
      .eq('id', imageId)
      .eq('photographer_id', photographerId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}

module.exports = Database;