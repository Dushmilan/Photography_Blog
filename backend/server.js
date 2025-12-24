import { httpServerHandler } from 'cloudflare:node';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Note: Local imports in ESM MUST include the .js extension
import { globalErrorHandler } from './utils/errorHandler.js'; 
// import authRoutes from './routes/auth.js';
// import imageRoutes from './routes/images.js';

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
// Cloudflare Workers handle rate limiting/compression natively, 
// but keeping these here won't break the build.
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '25mb' }));

// Initialize Supabase using process.env (populated by secrets)
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);
app.locals.supabase = supabase;

// Routes
const apiRouter = express.Router();

apiRouter.get('/ping', (req, res) => res.json({
  message: 'pong',
  cloudflare: true,
  env: process.env.NODE_ENV
}));

// Use your routes here (Ensure the route files also use 'export default')
// apiRouter.use('/auth', authRoutes);

app.use('/api', apiRouter);
app.use('/', apiRouter);

app.use(globalErrorHandler);

// This is the magic line that connects Express to Cloudflare
export default httpServerHandler(app);