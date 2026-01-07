import 'dotenv/config';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Local imports
import { globalErrorHandler } from './utils/errorHandler.js';
import authRoutes from './routes/auth.js';
import tokenRoutes from './routes/tokens.js';
import imageRoutes from './routes/images.js';
import imagekitRoutes from './routes/imagekit.js';
import contactRoutes from './routes/contact.js';

const app = express();
const PORT = process.env.PORT || 10000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(limiter);

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);
app.locals.supabase = supabase;

// Routes
const apiRouter = express.Router();

apiRouter.get('/ping', (req, res) => res.json({
  message: 'pong',
  status: 'live',
  env: process.env.NODE_ENV
}));

apiRouter.use('/auth', authRoutes);
apiRouter.use('/tokens', tokenRoutes);
apiRouter.use('/images', imageRoutes);
apiRouter.use('/imagekit', imagekitRoutes);
apiRouter.use('/contact', contactRoutes);

app.use('/api', apiRouter);
app.use('/', apiRouter);

// Error Handler
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;