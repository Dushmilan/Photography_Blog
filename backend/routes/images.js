const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const authenticate = require('../middleware/auth');
const Image = require('../models/Image');

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    // Create uploads folder if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'img-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Upload images
router.post('/upload', authenticate, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const uploadedImages = [];
    const supabase = req.app.locals.supabase;
    const imageClass = new Image(supabase);

    for (const file of req.files) {
      // Get original image dimensions
      const metadata = await sharp(file.path).metadata();

      // Prepare image data for database - using relative paths for hosting
      const imageData = {
        filename: file.filename,
        original_name: file.originalname,
        path: `/uploads/${file.filename}`, // Store relative path for frontend access
        size: file.size,
        mimetype: file.mimetype,
        width: metadata.width,
        height: metadata.height,
        photographer_id: req.user.userId
      };

      // Save image info to database
      const image = await imageClass.create(imageData);
      uploadedImages.push(image);
    }

    res.status(201).json({
      message: 'Images uploaded successfully',
      images: uploadedImages
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all images (public access)
router.get('/', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const imageClass = new Image(supabase);
    
    const images = await imageClass.findAll();
    console.log('Fetched images:', images);
    res.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get slideshow images (public access)
router.get('/slideshow', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const imageClass = new Image(supabase);
    
    const images = await imageClass.getSlideshowImages();
    res.json(images);
  } catch (error) {
    console.error('Error fetching slideshow images:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get featured images (public access)
router.get('/featured', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const imageClass = new Image(supabase);
    
    const images = await imageClass.getFeaturedImages();
    res.json(images);
  } catch (error) {
    console.error('Error fetching featured images:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get images for authenticated user only
router.get('/my-images', authenticate, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const imageClass = new Image(supabase);
    
    const images = await imageClass.findByPhotographerId(req.user.userId);
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete an image
router.delete('/:id', authenticate, async (req, res) => {
  try {
    console.log('Attempting to delete image with ID:', req.params.id);
    console.log('Authenticated user ID:', req.user.userId);
    
    const supabase = req.app.locals.supabase;
    const imageClass = new Image(supabase);

    // Check if image belongs to the authenticated user
    const image = await imageClass.findByIdAndPhotographer(req.params.id, req.user.userId);

    if (!image) {
      console.log('Image not found or does not belong to user');
      return res.status(404).json({ message: 'Image not found' });
    }

    console.log('Found image to delete:', image);
    
    // Convert relative path to absolute path for file deletion
    const absolutePath = path.join(__dirname, '../', image.path);
    console.log('Deleting file at path:', absolutePath);
    
    // Delete the image file from disk
    await fs.unlink(absolutePath).catch((err) => {
      console.error('Error deleting file:', err);
    }); // Original file

    // Delete from database
    console.log('Deleting from database with ID:', req.params.id);
    await imageClass.deleteById(req.params.id);

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update featured status
router.put('/:id/featured', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;
    
    const supabase = req.app.locals.supabase;
    const imageClass = new Image(supabase);

    // Check if image belongs to the authenticated user
    const image = await imageClass.findByIdAndPhotographer(id, req.user.userId);

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Update featured status
    const updatedImage = await imageClass.updateFeaturedStatus(id, req.user.userId, isFeatured);
    
    res.json({ 
      message: `Image ${isFeatured ? 'added to' : 'removed from'} featured`, 
      image: updatedImage 
    });
  } catch (error) {
    console.error('Error updating featured status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update slideshow status
router.put('/:id/slideshow', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { isSlideshow } = req.body;
    
    const supabase = req.app.locals.supabase;
    const imageClass = new Image(supabase);

    // Check if image belongs to the authenticated user
    const image = await imageClass.findByIdAndPhotographer(id, req.user.userId);

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Update slideshow status
    const updatedImage = await imageClass.updateSlideshowStatus(id, req.user.userId, isSlideshow);
    
    res.json({ 
      message: `Image ${isSlideshow ? 'added to' : 'removed from'} slideshow`, 
      image: updatedImage 
    });
  } catch (error) {
    console.error('Error updating slideshow status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update image name
router.put('/:id/rename', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;
    
    if (!newName || newName.trim() === '') {
      return res.status(400).json({ message: 'New name is required' });
    }
    
    const supabase = req.app.locals.supabase;
    const imageClass = new Image(supabase);

    // Check if image belongs to the authenticated user
    const image = await imageClass.findByIdAndPhotographer(id, req.user.userId);

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Update image name
    const updatedImage = await imageClass.updateImageName(id, req.user.userId, newName.trim());
    
    res.json({ 
      message: 'Image name updated successfully', 
      image: updatedImage 
    });
  } catch (error) {
    console.error('Error updating image name:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;