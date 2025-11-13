const express = require('express');
const authenticate = require('../middleware/auth');
const Image = require('../models/Image');
const { catchAsync, AppError } = require('../utils/errorHandler');

const router = express.Router();

// Get all images for authenticated user (admin view) - this gets images from DB
router.get('/my-images', authenticate, catchAsync(async (req, res) => {
  const supabase = req.app.locals.supabase;
  const imageClass = new Image(supabase);

  const images = await imageClass.findByPhotographerId(req.user.userId);
  res.json(images);
}));

// Get public images for public gallery
router.get('/public', catchAsync(async (req, res) => {
  const supabase = req.app.locals.supabase;
  const imageClass = new Image(supabase);

  const publicImages = await imageClass.getPublicImages();
  res.json(publicImages);
}));

// Update public status of an image
router.put('/:id/public', authenticate, catchAsync(async (req, res) => {
  const supabase = req.app.locals.supabase;
  const imageClass = new Image(supabase);
  const { id } = req.params;
  const { isPublic } = req.body;

  // Verify the image belongs to the authenticated user
  const image = await imageClass.findByIdAndPhotographer(id, req.user.userId);
  if (!image) {
    throw new AppError('Image not found or does not belong to user', 404);
  }

  const updatedImage = await imageClass.updatePublicStatus(id, req.user.userId, isPublic);
  res.json({ image: updatedImage });
}));

// Get a specific image by ID
router.get('/:id', authenticate, catchAsync(async (req, res) => {
  const supabase = req.app.locals.supabase;
  const imageClass = new Image(supabase);
  const { id } = req.params;

  const image = await imageClass.findById(id);
  if (!image) {
    throw new AppError('Image not found', 404);
  }

  res.json(image);
}));

// Delete an image
router.delete('/:id', authenticate, catchAsync(async (req, res) => {
  const supabase = req.app.locals.supabase;
  const imageClass = new Image(supabase);
  const { id } = req.params;

  // Verify the image belongs to the authenticated user
  const image = await imageClass.findByIdAndPhotographer(id, req.user.userId);
  if (!image) {
    throw new AppError('Image not found or does not belong to user', 404);
  }

  await imageClass.deleteById(id);
  res.json({ message: 'Image deleted successfully' });
}));

// Create a new image in the database
router.post('/', authenticate, catchAsync(async (req, res) => {
  const supabase = req.app.locals.supabase;
  const imageClass = new Image(supabase);
  const imageData = req.body;

  // Ensure the photographer_id matches the authenticated user
  if (imageData.photographer_id !== req.user.userId) {
    throw new AppError('Unauthorized to create image for another user', 403);
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
    size: imageData.size || 0,
    mimetype: imageData.mimetype,
    width: imageData.width || 0,
    height: imageData.height || 0,
    photographer_id: imageData.photographer_id,
    is_featured: imageData.is_featured,
    is_slideshow: imageData.is_slideshow,
    is_public: imageData.is_public
  });

  res.status(201).json({ image: newImage });
}));

module.exports = router;