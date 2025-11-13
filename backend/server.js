const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const compression = require('compression');
const GooglePhotosAPI = require('./utils/googlePhotos');
const { globalErrorHandler } = require('./utils/errorHandler');

dotenv.config();

const app = express();

const rateLimit = require('express-rate-limit');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Middleware
app.use(limiter); // Apply to all requests
app.use(compression()); // Enable gzip compression
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));



// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
let supabase;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client initialized');
} else {
  console.error('Supabase URL and Key not found in environment variables');
  process.exit(1);
}

// Initialize Google Photos API
const googlePhotos = new GooglePhotosAPI();

googlePhotos.initialize()
  .then(success => {
    if (success) {
      app.locals.googlePhotos = googlePhotos;
      app.locals.googlePhotosInitialized = true;
      console.log('Google Photos API initialized and ready');
    } else {
      app.locals.googlePhotosInitialized = false;
      console.log('Google Photos API not initialized - will only use database functionality');
    }
  })
  .catch(err => {
    app.locals.googlePhotosInitialized = false;
    console.error('Failed to initialize Google Photos API:', err);
  });

// Make supabase available globally via app
app.locals.supabase = supabase;

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tokens', require('./routes/tokens')); // New route for token management
app.use('/api/images', require('./routes/images'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/google-photos', require('./routes/googlePhotos')); // New route for Google Photos

// Global error handling middleware (should be last)
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});