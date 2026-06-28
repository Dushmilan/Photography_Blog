import { createMiddleware } from 'hono/factory';
import { verifyAccessToken } from '../utils/jwt';

export const authMiddleware = createMiddleware<{ Bindings: { JWT_SECRET: string } }>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) return c.json({ message: 'Access token required' }, 401);

  try {
    const secret = c.env.JWT_SECRET;
    const decoded = await verifyAccessToken(token, secret);
    if (decoded.type === 'refresh') return c.json({ message: 'Invalid token type' }, 403);
    if (decoded.aud !== 'photography-blog-users') return c.json({ message: 'Invalid token audience' }, 403);
    if (decoded.iss !== 'photography-blog-api') return c.json({ message: 'Invalid token issuer' }, 403);
    (c as any).set('user', decoded);
    await next();
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Invalid token';
    return c.json({ message: msg }, 403);
  }
});
