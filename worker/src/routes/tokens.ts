import { Hono } from 'hono';
import { generateAccessToken, verifyRefreshToken } from '../utils/jwt';
import { isValidRefreshToken, removeRefreshToken, blacklistToken } from '../utils/tokenStore';
import { catchAsync, AppError } from '../utils/errorHandler';

const router = new Hono<{ Bindings: { JWT_SECRET: string; JWT_REFRESH_SECRET: string } }>();

router.post('/refresh', catchAsync(async (c) => {
  const { refreshToken } = await c.req.json();
  if (!refreshToken) throw new AppError('Refresh token required', 400);
  const decoded: any = await verifyRefreshToken(refreshToken, c.env.JWT_REFRESH_SECRET);
  if (!isValidRefreshToken(decoded.userId, refreshToken)) throw new AppError('Invalid or revoked refresh token', 403);
  const newAccessToken = await generateAccessToken({ userId: decoded.userId, username: decoded.username }, c.env.JWT_SECRET);
  return c.json({ accessToken: newAccessToken });
}));

router.post('/logout', catchAsync(async (c) => {
  const authHeader = c.req.header('Authorization');
  const accessToken = authHeader?.split(' ')[1];
  if (accessToken) blacklistToken(accessToken);
  const { refreshToken } = await c.req.json();
  if (refreshToken && typeof refreshToken === 'string') removeRefreshToken(refreshToken);
  return c.json({ message: 'Logged out successfully' });
}));

export default router;
