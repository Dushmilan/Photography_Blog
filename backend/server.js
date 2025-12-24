const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const compression = require('compression');
const { globalErrorHandler } = require('./utils/errorHandler');

// Only load dotenv in non-production environments
if (process.env.NODE_ENV !== 'production' && !process.env.CF_PAGES) {
  dotenv.config();
}

const app = express();

const rateLimit = require('express-rate-limit');

// Rate limiting - Disable and skip on Cloudflare Workers as it can cause issues in serverless environments
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Middleware
if (!process.env.CF_PAGES && !process.env.CF_WORKERS) {
  app.use(limiter); // Only apply rate limiting when NOT on Cloudflare
}
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
  if (process.env.NODE_ENV !== 'production' && !process.env.CF_PAGES && !process.env.CF_WORKERS) {
    process.exit(1);
  }
}

// Make supabase available globally via app
app.locals.supabase = supabase;

// Routes
const apiRouter = express.Router();

// Health check inside router
apiRouter.get('/ping', (req, res) => res.json({
  message: 'pong',
  cloudflare: !!process.env.CF_WORKERS,
  env: process.env.NODE_ENV
}));

apiRouter.use('/auth', require('./routes/auth'));
apiRouter.use('/tokens', require('./routes/tokens'));
apiRouter.use('/images', require('./routes/images'));
apiRouter.use('/imagekit', require('./routes/imagekit'));
apiRouter.use('/contact', require('./routes/contact'));

// Mount the router under multiple prefixes to handle local development,
// Cloudflare Workers, and case-stripped paths.
app.use('/api', apiRouter);
app.use('/.netlify/functions/api', apiRouter); // Keep for Netlify compatibility
app.use('/', apiRouter); // Fallback for stripped paths in serverless environments

// Global error handling middleware (should be last)
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' && !process.env.CF_PAGES && !process.env.CF_WORKERS) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;