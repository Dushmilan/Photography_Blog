import { SignJWT, jwtVerify } from 'jose';

export const generateAccessToken = async (payload: any, jwtSecret: string): Promise<string> => {
  const secret = new TextEncoder().encode(jwtSecret);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('photography-blog-api')
    .setAudience('photography-blog-users')
    .setExpirationTime('15m')
    .sign(secret);
};

export const generateRefreshToken = async (payload: any, refreshSecret: string): Promise<string> => {
  const secret = new TextEncoder().encode(refreshSecret);
  return await new SignJWT({ ...payload, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('photography-blog-api')
    .setAudience('photography-blog-users')
    .setExpirationTime('7d')
    .sign(secret);
};

export const verifyAccessToken = async (token: string, jwtSecret: string): Promise<any> => {
  try {
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'photography-blog-api',
      audience: 'photography-blog-users'
    });
    return payload;
  } catch (error: any) {
    if (error.message?.includes('expired')) throw new Error('Access token expired');
    throw new Error('Invalid token');
  }
};

export const verifyRefreshToken = async (token: string, refreshSecret: string): Promise<any> => {
  try {
    const secret = new TextEncoder().encode(refreshSecret);
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'photography-blog-api',
      audience: 'photography-blog-users'
    });
    return payload;
  } catch (error: any) {
    if (error.message?.includes('expired')) throw new Error('Refresh token expired');
    throw new Error('Invalid refresh token');
  }
};
