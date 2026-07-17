import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import { Database } from '../db/queries';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { storeRefreshToken } from '../utils/tokenStore';
import { authMiddleware } from '../middleware/auth';
import { catchAsync, AppError } from '../utils/errorHandler';

const router = new Hono<{ Bindings: { DB: D1Database; JWT_SECRET: string; JWT_REFRESH_SECRET: string } }>();

router.post('/register', catchAsync(async (c) => {
  const { username, password } = await c.req.json();
  if (!username || !password) throw new AppError('Username and password are required', 400);
  const db = new Database(c.env.DB);
  const existing = await db.findUserByUsername(username);
  if (existing) throw new AppError('User already exists', 400);
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  await db.createUser({ username, password: hashedPassword });
  return c.json({ message: 'User created successfully' }, 201);
}));

router.post('/login', catchAsync(async (c) => {
  const { username, password } = await c.req.json();
  if (!username || !password) throw new AppError('Username and password are required', 400);
  const db = new Database(c.env.DB);
  const user = await db.findUserByUsername(username);
  if (!user) throw new AppError('Invalid credentials', 400);
  const isMatch = await bcrypt.compare(password, (user as any).password);
  if (!isMatch) throw new AppError('Invalid credentials', 400);
  const id = (user as any).id;
  const accessToken = await generateAccessToken({ userId: id, username }, c.env.JWT_SECRET);
  const refreshToken = await generateRefreshToken({ userId: id, username }, c.env.JWT_REFRESH_SECRET);
  storeRefreshToken(id, refreshToken);
  return c.json({ accessToken, refreshToken, user: { id, username } });
}));

router.get('/me', authMiddleware, catchAsync(async (c) => {
  const userId = (c.get('user') as any).userId;
  const db = new Database(c.env.DB);
  const user: any = await db.findUserById(userId);
  if (!user) throw new AppError('User not found', 404);
  const { password, ...rest } = user;
  return c.json(rest);
}));

export default router;
