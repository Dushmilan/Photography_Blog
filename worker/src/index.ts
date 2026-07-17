import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authMiddleware } from './middleware/auth';
import authRoutes from './routes/auth';
import tokenRoutes from './routes/tokens';
import { publicImageRoutes, protectedImageRoutes } from './routes/images';
import imagekitRoutes from './routes/imagekit';

export type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  IMAGEKIT_PUBLIC_KEY: string;
  IMAGEKIT_PRIVATE_KEY: string;
  IMAGEKIT_URL_ENDPOINT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('/*', cors({
  origin: ['https://cookedbylens.pages.dev', 'https://cookedbylens.com.lk', 'http://localhost:3000'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

const api = new Hono<{ Bindings: Bindings }>();

api.get('/ping', (c) => c.json({ message: 'pong', status: 'live', env: 'production', timestamp: new Date().toISOString() }));
api.get('/', (c) => c.json({ message: 'Photography Blog API', version: '1.0.0', endpoints: ['/ping', '/auth', '/tokens', '/images', '/imagekit'] }));

api.route('/auth', authRoutes);
api.route('/tokens', tokenRoutes);

api.route('/images', publicImageRoutes);

api.use('/images/*', authMiddleware);
api.use('/imagekit/*', authMiddleware);
api.route('/images', protectedImageRoutes);
api.route('/imagekit', imagekitRoutes);

app.route('/api', api);

app.get('/', (c) => c.redirect('/api'));

export default { fetch: app.fetch };
