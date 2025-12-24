import { Buffer } from 'node:buffer';
globalThis.Buffer = Buffer;

import { httpServerHandler } from 'cloudflare:node';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import compression from 'compression';

// Local imports
import errorHandler from '../utils/errorHandler.js';
const { globalErrorHandler } = errorHandler;

import authRoutes from '../routes/auth.js';
import tokenRoutes from '../routes/tokens.js';
import imageRoutes from '../routes/images.js';
import imagekitRoutes from '../routes/imagekit.js';
import contactRoutes from '../routes/contact.js';

const app = express();

// --- CRITICAL CHANGES START ---
app.use(cors());
app.use(compression());

/** * WE REMOVED: app.use(express.json()) 
 * Because it loads 'iconv-lite' which crashes the worker.
 * Instead, we use this custom middleware to parse JSON:
 */
app.use(async (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    try {
      // If there is a body, we parse it manually using the Worker's native engine
      if (req.headers['content-type']?.includes('application/json')) {
        let data = '';
        req.on('data', chunk => { data += chunk; });
        req.on('end', () => {
          try {
            req.body = data ? JSON.parse(data) : {};
            next();
          } catch (e) {
            req.body = {};
            next();
          }
        });
        return;
      }
    } catch (err) {
      console.error('Body parsing failed');
    }
  }
  next();
});
// --- CRITICAL CHANGES END ---

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);
app.locals.supabase = supabase;

const apiRouter = express.Router();
apiRouter.get('/ping', (req, res) => res.json({ message: 'pong', status: 'live' }));

apiRouter.use('/auth', authRoutes);
apiRouter.use('/tokens', tokenRoutes);
apiRouter.use('/images', imageRoutes);
apiRouter.use('/imagekit', imagekitRoutes);
apiRouter.use('/contact', contactRoutes);

app.use('/api', apiRouter);
app.use('/', apiRouter);
app.use(globalErrorHandler);

export default httpServerHandler(app);