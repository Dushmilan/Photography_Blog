const express = require('express');
const authenticate = require('../middleware/auth');
const Image = require('../models/Image');

const router = express.Router();

// Get all images for authenticated user (admin view) - this gets images from DB
router.get('/my-images', authenticate, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const imageClass = new Image(supabase);

    const images = await imageClass.findByPhotographerId(req.user.userId);
    res.json(images);
  } catch (error) {
    console.error('Error fetching user images:', error);
    res.status(500).json({ message: 'Error fetching user images', error: error.message });
  }
});

// Get public images for public gallery
router.get('/public', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const imageClass = new Image(supabase);

    const publicImages = await imageClass.getPublicImages();
    res.json(publicImages);
  } catch (error) {
    console.error('Error fetching public images:', error);
    res.status(500).json({ message: 'Error fetching public images', error: error.message });
  }
});

// Update public status of an image
router.put('/:id/public', authenticate, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const imageClass = new Image(supabase);
    const { id } = req.params;
    const { isPublic } = req.body;

    // Verify the image belongs to the authenticated user
    const image = await imageClass.findByIdAndPhotographer(id, req.user.userId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found or does not belong to user' });
    }

    const updatedImage = await imageClass.updatePublicStatus(id, req.user.userId, isPublic);
    res.json({ image: updatedImage });
  } catch (error) {
    console.error('Error updating image public status:', error);
    res.status(500).json({ message: 'Error updating image public status', error: error.message });
  }
});

// Get a specific image by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const imageClass = new Image(supabase);
    const { id } = req.params;

    const image = await imageClass.findById(id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json(image);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ message: 'Error fetching image', error: error.message });
  }
});

// Create a new image in the database
router.post('/', authenticate, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const imageClass = new Image(supabase);
    const imageData = req.body;

    // Ensure the photographer_id matches the authenticated user
    if (imageData.photographer_id !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized to create image for another user' });
    }

    // Check if image already exists
    const existingImage = await imageClass.findById(imageData.id);
    if (existingImage) {
      return res.status(200).json({ message: 'Image already exists', image: existingImage });
    }

    // Create the image
    const newImage = await imageClass.create({
      id: imageData.id,
      filename: imageData.filename,
      original_name: imageData.original_name,
      path: imageData.path,
      thumbnail_path: imageData.thumbnail_path,
      small_path: imageData.small_path,
      medium_path: imageData.medium_path,
      size: imageData.size,
      mimetype: imageData.mimetype,
      width: imageData.width,
      height: imageData.height,
      photographer_id: imageData.photographer_id,
      is_featured: imageData.is_featured,
      is_slideshow: imageData.is_slideshow,
      is_public: imageData.is_public
    });

    res.status(201).json({ image: newImage });
  } catch (error) {
    console.error('Error creating image:', error);
    res.status(500).json({ message: 'Error creating image', error: error.message });
  }
});

module.exports = router;