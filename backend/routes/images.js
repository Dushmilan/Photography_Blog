import express from 'express';
import rateLimit from 'express-rate-limit';
import authenticate from '../middleware/auth.js';
import Image from '../models/Image.js';
import { catchAsync, AppError } from '../utils/errorHandler.js';
import ImageKit from 'imagekit';
import dotenv from 'dotenv';
import ImageService from '../models/ImageService.js';

dotenv.config();

const router = express.Router();

// Rate limiting middleware for image endpoints
const publicImageLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // 30 requests per window
  message: 'Too many image requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // Rate limit by IP address for public endpoints
    return req.ip || req.connection.remoteAddress;
  }
});

const authImageLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 requests per window for authenticated users
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // Rate limit by user ID for authenticated endpoints
    return req.user?.userId || req.ip || req.connection.remoteAddress;
  }
});

const imageMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: 'Too many image uploads/updates, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // Rate limit by user ID for write operations
    return req.user?.userId || req.ip || req.connection.remoteAddress;
  }
});

// Get all images for authenticated user (admin view) - this gets images from DB
router.get('/my-images', authenticate, authImageLimiter, catchAsync(async (req, res) => {
  const supabase = req.app.locals.supabase;
  const imageClass = new Image(supabase);

  const images = await imageClass.findByPhotographerId(req.user.userId);
  res.json(images);
}));

// Get public images for public gallery
router.get('/public', publicImageLimiter, catchAsync(async (req, res) => {
  const supabase = req.app.locals.supabase;
  const imageClass = new Image(supabase);

  const publicImages = await imageClass.getPublicImages();
  res.json(publicImages);
}));

// Update public status of an image
router.put('/:id/public', authenticate, imageMutationLimiter, catchAsync(async (req, res) => {
  const { id } = req.params;
  const { isPublic } = req.body;

  // Validate input data
  if (typeof isPublic !== 'boolean') {
    throw new AppError('isPublic must be a boolean value', 400);
  }

  const supabase = req.app.locals.supabase;
  const imageClass = new Image(supabase);

  // Update the public status of the image
  const updatedImage = await imageClass.updatePublicStatus(id, req.user.userId, isPublic);
  res.json({ image: updatedImage });
}));


// Update slideshow status of an image
router.put('/:id/slideshow', authenticate, imageMutationLimiter, catchAsync(async (req, res) => {
  const { id } = req.params;
  const { isSlideshow } = req.body;

  // Validate input data
  if (typeof isSlideshow !== 'boolean') {
    throw new AppError('isSlideshow must be a boolean value', 400);
  }

  const supabase = req.app.locals.supabase;
  const imageClass = new Image(supabase);

  // Update the slideshow status of the image
  const updatedImage = await imageClass.updateSlideshowStatus(id, req.user.userId, isSlideshow);
  res.json({ image: updatedImage });
}));

// Reorder images
router.put('/reorder', authenticate, imageMutationLimiter, catchAsync(async (req, res) => {
  const { updates, type } = req.body;

  if (!updates || !Array.isArray(updates)) {
    throw new AppError('Updates array is required', 400);
  }
  if (!type) {
    throw new AppError('Type (gallery/slideshow) is required', 400);
  }

  const supabase = req.app.locals.supabase;
  const imageClass = new Image(supabase);

  await imageClass.updateOrder(updates, type);
  res.status(200).json({ message: 'Order updated successfully' });
}));


// Create a new image in the database
router.post('/', authenticate, imageMutationLimiter, catchAsync(async (req, res) => {
  const supabase = req.app.locals.supabase;
  const imageClass = new Image(supabase);
  const imageData = req.body;

  // Validate input data
  if (!imageData.id) {
    throw new AppError('Image ID is required', 400);
  }

  // Validate required fields
  if (!imageData.path && !imageData.url && !imageData.file_path) {
    throw new AppError('Image path is required', 400);
  }

  // Ensure the photographer_id matches the authenticated user
  if (imageData.photographer_id !== req.user.userId) {
    throw new AppError('Unauthorized to create image for another user', 403);
  }

  // Check if image already exists in database
  let existingImage = null;
  try {
    existingImage = await imageClass.findById(imageData.id);
  } catch (error) {
    // If DB query fails, continue - image might not exist in DB yet
    console.log('Image not found in database, proceeding to create');
  }

  if (existingImage) {
    return res.status(200).json({ message: 'Image already exists', image: existingImage });
  }

  // Validate environment variables for ImageKit
  if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    throw new AppError('ImageKit configuration is missing', 500);
  }

  const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
  });

  // Check if the image exists in ImageKit
  try {
    await new Promise((resolve, reject) => {
      // Validate that the ID is not empty or null before calling ImageKit
      if (!imageData.id) {
        console.log(`Invalid image ID provided: ${imageData.id}`);
        resolve(null);
        return;
      }

      imagekit.getFileDetails(imageData.id, (error, fileDetails) => {
        if (error) {
          console.error('Image not found in ImageKit:', error);
          // Log the error but don't necessarily throw - the image might not have been indexed yet
          resolve(null); // Continue without blocking
        } else {
          resolve(fileDetails);
        }
      });
    });
  } catch (error) {
    // If ImageKit check fails, log but continue - image might be new or have different ID format
    console.log(`Could not verify image ${imageData.id} in ImageKit, proceeding with database entry. Error:`, error.message || error);
  }

  // Create the image with simplified schema data
  const newImage = await imageClass.create({
    id: imageData.id,
    path: imageData.path || imageData.url || imageData.file_path || '', // Use the most likely field names
    photographer_id: imageData.photographer_id,
    is_slideshow: imageData.is_slideshow || false,
    is_public: imageData.is_public || false
  });

  res.status(201).json({ image: newImage });
}));

// Get images for Slideshow component
router.get('/slideshow', publicImageLimiter, catchAsync(async (req, res) => {
  const supabase = req.app.locals.supabase;
  const imageService = new ImageService(supabase);

  const slideshowImages = await imageService.getSlideshowImages();
  res.json(slideshowImages);
}));

// Get all images for Admin_Gallery - from ImageKit with DB metadata
router.get('/admin-gallery', authenticate, authImageLimiter, catchAsync(async (req, res) => {
  const supabase = req.app.locals.supabase;
  const imageService = new ImageService(supabase);

  // Get images from ImageKit with metadata from database
  const allImages = await imageService.getImagesWithMetadata(req.user.userId);
  res.json(allImages);
}));

// Get all images for Admin_Gallery - fetch ALL from ImageKit
router.get('/admin-gallery-all', authenticate, authImageLimiter, catchAsync(async (req, res) => {
  const supabase = req.app.locals.supabase;
  const imageService = new ImageService(supabase);

  try {
    // Validate environment variables for ImageKit
    if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
      throw new AppError('ImageKit configuration is missing', 500);
    }

    const imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });

    // Fetch ALL files from ImageKit using pagination
    const allImageKitFiles = [];
    let offset = 0;
    const limit = 1000; // Max per request

    while (true) {
      const batch = await new Promise((resolve, reject) => {
        imagekit.listFiles({
          limit: limit,
          offset: offset
        }, (error, files) => {
          if (error) {
            console.error('Error from ImageKit listFiles API:', error);
            reject(error);
          } else {
            resolve(files);
          }
        });
      });

      if (batch.length === 0) {
        break;
      }

      allImageKitFiles.push(...batch);

      // If this batch has fewer files than the limit, we've reached the end
      if (batch.length < limit) {
        break;
      }

      offset += limit;
    }

    // Get metadata from database for these images
    const dbMetadata = await imageService.findByPhotographerId(req.user.userId);

    // Merge the data so ImageKit images have their status metadata from DB
    const mergedImages = allImageKitFiles.map(imageKitImage => {
      const dbRecord = dbMetadata.find(dbImg => dbImg.id === imageKitImage.fileId);

      return {
        id: imageKitImage.fileId,
        path: imageKitImage.url || imageKitImage.filePath,
        filename: imageKitImage.name,
        size: imageKitImage.size,
        mimetype: imageKitImage.type,
        width: imageKitImage.width,
        height: imageKitImage.height,
        is_slideshow: dbRecord?.is_slideshow || false,
        is_public: dbRecord?.is_public || false,
        photographer_id: req.user.userId,
        created_at: imageKitImage.createdAt || new Date().toISOString(),
        ...dbRecord // Include any other metadata from DB
      };
    });

    res.json({
      images: mergedImages,
      total: mergedImages.length
    });

  } catch (error) {
    console.error('Error fetching all images from ImageKit:', error);
    res.status(500).json({ message: 'Error fetching all images from ImageKit', error: error.message });
  }
}));

// Get images for Gallery component
router.get('/gallery', publicImageLimiter, catchAsync(async (req, res) => {
  const supabase = req.app.locals.supabase;
  const imageService = new ImageService(supabase);

  // Fetch public images for gallery
  const galleryImages = await imageService.getPublicImages();
  res.json(galleryImages);
}));


// Get a specific image by ID
router.get('/:id', authenticate, authImageLimiter, catchAsync(async (req, res) => {
  const { id } = req.params;

  // Validate image ID
  if (!id) {
    throw new AppError('Image ID is required', 400);
  }

  const supabase = req.app.locals.supabase;
  const imageService = new ImageService(supabase);

  // First try to get from database (for metadata)
  let dbImage = null;
  try {
    dbImage = await imageService.findById(id);
  } catch (error) {
    // If DB query fails, continue without DB metadata
    console.log('No database metadata found for image, proceeding with ImageKit data only');
  }

  // Validate environment variables for ImageKit
  if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    throw new AppError('ImageKit configuration is missing', 500);
  }

  const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
  });

  // Check if the image exists in ImageKit
  let imagekitImage = null;
  try {
    imagekitImage = await new Promise((resolve, reject) => {
      // Validate that the ID is not empty or null before calling ImageKit
      if (!id) {
        console.log(`Invalid image ID provided: ${id}`);
        resolve(null);
        return;
      }

      imagekit.getFileDetails(id, (error, fileDetails) => {
        if (error) {
          console.error('Image not found in ImageKit:', error);
          resolve(null); // Continue with DB data only
        } else {
          resolve(fileDetails);
        }
      });
    });
  } catch (error) {
    console.log(`Could not get image ${id} from ImageKit, proceeding with database data only. Error:`, error.message || error);
  }

  if (!imagekitImage && !dbImage) {
    throw new AppError('Image not found', 404);
  }

  // If we couldn't get from ImageKit but have DB data, use that
  if (!imagekitImage && dbImage) {
    // Use the DB record with minimal defaults
    imagekitImage = {
      fileId: dbImage.id,
      url: dbImage.path,
      filePath: dbImage.path,
      name: dbImage.filename || 'Unknown',
      size: dbImage.size || 0,
      type: dbImage.mimetype || 'unknown',
      width: dbImage.width || 0,
      height: dbImage.height || 0,
      createdAt: dbImage.created_at
    };
  }

  // Combine ImageKit data with DB metadata if available
  const image = {
    id: imagekitImage?.fileId || dbImage?.id,
    path: imagekitImage?.url || imagekitImage?.filePath || dbImage?.path,
    filename: imagekitImage?.name || dbImage?.filename || 'Unknown',
    size: imagekitImage?.size || dbImage?.size || 0,
    mimetype: imagekitImage?.type || dbImage?.mimetype || 'unknown',
    width: imagekitImage?.width || dbImage?.width || 0,
    height: imagekitImage?.height || dbImage?.height || 0,
    photographer_id: req.user.userId,
    created_at: imagekitImage?.createdAt || dbImage?.created_at || new Date().toISOString(),
    // DB metadata if available, default values otherwise
    is_slideshow: dbImage?.is_slideshow || false,
    is_public: dbImage?.is_public || false,
    ...dbImage // Include any other metadata from DB
  };

  res.json(image);
}));

// Delete an image from database and ImageKit
router.delete('/:id', authenticate, imageMutationLimiter, catchAsync(async (req, res) => {
  const { id } = req.params;

  // Validate image ID
  if (!id) {
    throw new AppError('Image ID is required', 400);
  }

  const supabase = req.app.locals.supabase;
  const imageClass = new Image(supabase);

  // Validate environment variables for ImageKit
  if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    throw new AppError('ImageKit configuration is missing', 500);
  }

  const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
  });

  // Delete from ImageKit
  try {
    await new Promise((resolve, reject) => {
      imagekit.deleteFile(id, (error, result) => {
        if (error) {
          console.error('Error deleting from ImageKit:', error);
          // Proceed even if error matches to ensure DB cleanup
          resolve(null);
        } else {
          resolve(result);
        }
      });
    });
  } catch (error) {
    console.error('Unexpected error during ImageKit deletion:', error);
  }

  // Delete from Database
  try {
    await imageClass.deleteById(id);
  } catch (error) {
    console.error('Error deleting from database:', error);
    // If it was already deleted from DB, that's fine, but if it's a different error we might want to know.
    // However, for a delete operation, if it's gone, it's success.
  }

  res.status(200).json({ message: 'Image deleted successfully' });
}));

export default router;