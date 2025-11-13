const express = require('express');
const authenticate = require('../middleware/auth');
const Image = require('../models/Image');

const router = express.Router();

// Get photos from Google Photos
router.get('/photos', authenticate, async (req, res) => {
  try {
    const googlePhotos = req.app.locals.googlePhotos;
    const googlePhotosInitialized = req.app.locals.googlePhotosInitialized;

    if (!googlePhotos || !googlePhotosInitialized) {
      return res.status(500).json({
        message: 'Google Photos API not initialized. Please configure credentials.'
      });
    }

    // Get optional parameters
    const pageSize = parseInt(req.query.pageSize) || 50;
    const pageToken = req.query.pageToken || null;

    // Fetch photos from Google Photos
    const photosData = await googlePhotos.listPhotos(pageSize, pageToken);

    // Format the photos data to match our database schema
    const formattedPhotos = photosData.mediaItems?.map(photo => ({
      id: photo.id,
      filename: photo.filename,
      original_name: photo.filename,
      path: photo.baseUrl, // Using baseUrl as the main image path
      thumbnail_path: photo.baseUrl + '=w300-h300', // Create thumbnail URL
      small_path: photo.baseUrl + '=w600', // Create small size URL
      medium_path: photo.baseUrl + '=w1200', // Create medium size URL
      size: photo.mediaMetadata?.photo?.imageFileSize || 0,
      mimetype: photo.mimeType || 'image/jpeg',
      width: photo.mediaMetadata?.width || 0,
      height: photo.mediaMetadata?.height || 0,
      photographer_id: req.user.userId, // Associate with authenticated user
      is_featured: false, // Default value - will be updated based on user preferences
      is_slideshow: false, // Default value - will be updated based on user preferences
      is_public: false, // Default value - will be updated based on user preferences
      created_at: photo.mediaMetadata?.creationTime || new Date().toISOString()
    })) || [];

    res.json({
      photos: formattedPhotos,
      nextPageToken: photosData.nextPageToken || null
    });
  } catch (error) {
    console.error('Error fetching photos from Google Photos:', error);
    res.status(500).json({ message: 'Error fetching photos from Google Photos', error: error.message });
  }
});

// Get albums from Google Photos
router.get('/albums', authenticate, async (req, res) => {
  try {
    const googlePhotos = req.app.locals.googlePhotos;
    const googlePhotosInitialized = req.app.locals.googlePhotosInitialized;

    if (!googlePhotos || !googlePhotosInitialized) {
      return res.status(500).json({
        message: 'Google Photos API not initialized. Please configure credentials.'
      });
    }

    const albumsData = await googlePhotos.getAlbums();

    res.json(albumsData);
  } catch (error) {
    console.error('Error fetching albums from Google Photos:', error);
    res.status(500).json({ message: 'Error fetching albums from Google Photos', error: error.message });
  }
});

// Get photos from a specific album
router.get('/albums/:albumId/photos', authenticate, async (req, res) => {
  try {
    const googlePhotos = req.app.locals.googlePhotos;
    const googlePhotosInitialized = req.app.locals.googlePhotosInitialized;

    if (!googlePhotos || !googlePhotosInitialized) {
      return res.status(500).json({
        message: 'Google Photos API not initialized. Please configure credentials.'
      });
    }

    const { albumId } = req.params;
    const pageSize = parseInt(req.query.pageSize) || 50;
    const pageToken = req.query.pageToken || null;

    const photosData = await googlePhotos.listPhotosFromAlbum(albumId, pageSize, pageToken);

    // Format the photos data to match our database schema
    const formattedPhotos = photosData.mediaItems?.map(photo => ({
      id: photo.id,
      filename: photo.filename,
      original_name: photo.filename,
      path: photo.baseUrl, // Using baseUrl as the main image path
      thumbnail_path: photo.baseUrl + '=w300-h300', // Create thumbnail URL
      small_path: photo.baseUrl + '=w600', // Create small size URL
      medium_path: photo.baseUrl + '=w1200', // Create medium size URL
      size: photo.mediaMetadata?.photo?.imageFileSize || 0,
      mimetype: photo.mimeType || 'image/jpeg',
      width: photo.mediaMetadata?.width || 0,
      height: photo.mediaMetadata?.height || 0,
      photographer_id: req.user.userId, // Associate with authenticated user
      is_featured: false, // Default value - will be updated based on user preferences
      is_slideshow: false, // Default value - will be updated based on user preferences
      is_public: false, // Default value - will be updated based on user preferences
      created_at: photo.mediaMetadata?.creationTime || new Date().toISOString()
    })) || [];

    res.json({
      photos: formattedPhotos,
      nextPageToken: photosData.nextPageToken || null
    });
  } catch (error) {
    console.error('Error fetching photos from Google Photos album:', error);
    res.status(500).json({ message: 'Error fetching photos from Google Photos album', error: error.message });
  }
});

// OAuth2 endpoints
router.get('/auth', (req, res) => {
  try {
    const googlePhotos = req.app.locals.googlePhotos;
    const googlePhotosInitialized = req.app.locals.googlePhotosInitialized;

    if (!googlePhotos || !googlePhotosInitialized) {
      return res.status(500).json({
        message: 'Google Photos API not initialized. Please configure credentials.'
      });
    }

    // Generate the OAuth2 URL for Google Photos access
    const authUrl = googlePhotos.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating Google Photos auth URL:', error);
    res.status(500).json({ message: 'Error generating Google Photos auth URL', error: error.message });
  }
});

// Old callback route for backwards compatibility
router.get('/auth/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ message: 'Authorization code not provided' });
    }

    const googlePhotos = req.app.locals.googlePhotos;
    const googlePhotosInitialized = req.app.locals.googlePhotosInitialized;

    if (!googlePhotos || !googlePhotosInitialized) {
      return res.status(500).json({
        message: 'Google Photos API not initialized. Please configure credentials.'
      });
    }

    // Exchange the authorization code for tokens
    const tokens = await googlePhotos.getTokenFromCode(code);

    // In a production app, you would save the refresh token to your database
    // For now, we'll just return a success message
    res.json({ 
      message: 'Successfully authenticated with Google Photos',
      // Include tokens in response (in production, save them server-side)
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date
      }
    });
  } catch (error) {
    console.error('Error during Google Photos OAuth callback:', error);
    res.status(500).json({ message: 'Error during Google Photos OAuth callback', error: error.message });
  }
});

// New callback route to match the client secret redirect URI
router.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ message: 'Authorization code not provided' });
    }

    const googlePhotos = req.app.locals.googlePhotos;
    const googlePhotosInitialized = req.app.locals.googlePhotosInitialized;

    if (!googlePhotos || !googlePhotosInitialized) {
      return res.status(500).json({
        message: 'Google Photos API not initialized. Please configure credentials.'
      });
    }

    // Exchange the authorization code for tokens
    const tokens = await googlePhotos.getTokenFromCode(code);

    // In a production app, you would save the refresh token to your database
    // For now, we'll just return a success message
    res.json({ 
      message: 'Successfully authenticated with Google Photos',
      // Include tokens in response (in production, save them server-side)
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date
      }
    });
  } catch (error) {
    console.error('Error during Google Photos OAuth callback:', error);
    res.status(500).json({ message: 'Error during Google Photos OAuth callback', error: error.message });
  }
});

module.exports = router;