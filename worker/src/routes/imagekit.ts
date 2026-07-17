import { Hono } from 'hono';
import { catchAsync, AppError } from '../utils/errorHandler';

const router = new Hono<{ Bindings: { DB: D1Database; IMAGEKIT_PUBLIC_KEY: string; IMAGEKIT_PRIVATE_KEY: string; IMAGEKIT_URL_ENDPOINT: string } }>();

function ikAuth(c: any) {
  return { publicKey: c.env.IMAGEKIT_PUBLIC_KEY, privateKey: c.env.IMAGEKIT_PRIVATE_KEY, urlEndpoint: c.env.IMAGEKIT_URL_ENDPOINT };
}

async function ikRequest(path: string, c: any): Promise<any> {
  const { privateKey } = ikAuth(c);
  const res = await fetch(`https://api.imagekit.io/v5${path}`, {
    headers: { Authorization: `Basic ${btoa(privateKey + ':')}` }
  });
  if (!res.ok) return null;
  return res.json();
}

async function ikRequestV1(path: string, c: any): Promise<any> {
  const { privateKey } = ikAuth(c);
  const res = await fetch(`https://api.imagekit.io/v1${path}`, {
    headers: { Authorization: `Basic ${btoa(privateKey + ':')}` }
  });
  if (!res.ok) return null;
  return res.json();
}

// GET /imagekit/auth-parameters
router.get('/auth-parameters', catchAsync(async (c) => {
  const { publicKey, urlEndpoint, privateKey } = ikAuth(c);
  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 3600;
  const signature = await crypto.subtle.importKey('raw', new TextEncoder().encode(privateKey), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', signature, new TextEncoder().encode(token + expire));
  const sigHex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  return c.json({ publicKey, urlEndpoint, authenticationParameters: { token, expire, signature: sigHex } });
}));

// GET /imagekit/images (paginated)
router.get('/images', catchAsync(async (c) => {
  const pageSize = parseInt(c.req.query('pageSize') || '50');
  const skip = parseInt(c.req.query('skip') || '0');
  const userId = (c.get('user') as any).userId;
  const ikFiles: any[] = (await ikRequestV1(`/files?limit=${pageSize}&offset=${skip}`, c)) || [];
  const { results: dbResults } = await c.env.DB.prepare('SELECT * FROM images WHERE photographer_id = ?').bind(userId).all() as any;
  const merged = ikFiles.map((ik: any) => {
    const dbMatch = (dbResults || []).find((d: any) => d.id === ik.fileId);
    return { id: ik.fileId, path: ik.url || ik.filePath, filename: ik.name, size: ik.size, mimetype: ik.type, width: ik.width, height: ik.height, is_slideshow: dbMatch?.is_slideshow || 0, is_public: dbMatch?.is_public || 0 };
  });
  return c.json({ images: merged, total: merged.length });
}));

// GET /imagekit/image/:imageId
router.get('/image/:imageId', catchAsync(async (c) => {
  const imageId = c.req.param('imageId');
  const userId = (c.get('user') as any).userId;
  const dbImage: any = await c.env.DB.prepare('SELECT * FROM images WHERE id = ? AND photographer_id = ?').bind(imageId, userId).first();
  const ikData: any = await ikRequestV1(`/files/${imageId}/details`, c);
  if (!dbImage && !ikData) throw new AppError('Image not found', 404);
  const { publicKey, urlEndpoint } = ikAuth(c);
  const image = {
    id: ikData?.fileId || dbImage?.id, path: ikData?.url || dbImage?.path, filename: ikData?.name || '',
    size: ikData?.size || 0, mimetype: ikData?.type || '', width: ikData?.width || 0, height: ikData?.height || 0,
    is_slideshow: dbImage?.is_slideshow || 0, is_public: dbImage?.is_public || 0,
  };
  const filePath = (ikData?.filePath || dbImage?.path || '').replace(urlEndpoint, '');
  return c.json({
    ...image,
    urls: {
      original: ikData?.url, small: `${urlEndpoint}/tr:w-600/${filePath}`,
      medium: `${urlEndpoint}/tr:w-1200/${filePath}`, thumbnail: `${urlEndpoint}/tr:w-300,h-300/${filePath}`
    }
  });
}));

// PUT /imagekit/image/:imageId
router.put('/image/:imageId', catchAsync(async (c) => {
  const imageId = c.req.param('imageId');
  const userId = (c.get('user') as any).userId;
  const { is_slideshow, is_public } = await c.req.json() as any;
  const ikData = await ikRequestV1(`/files/${imageId}/details`, c);
  const imagePath = ikData?.url || `/image/${imageId}`;
  const imageName = ikData?.name || '';
  await c.env.DB.prepare(`INSERT OR IGNORE INTO images (id, path, original_name, photographer_id, is_slideshow, is_public)
    VALUES (?, ?, ?, ?, ?, ?)`).bind(imageId, imagePath, imageName, userId, is_slideshow ? 1 : 0, is_public ? 1 : 0).run();
  const updates: string[] = [];
  const params: any[] = [];
  if (is_slideshow !== undefined) { updates.push('is_slideshow = ?'); params.push(is_slideshow ? 1 : 0); }
  if (is_public !== undefined) { updates.push('is_public = ?'); params.push(is_public ? 1 : 0); }
  if (updates.length) {
    params.push(imageId, userId);
    await c.env.DB.prepare(`UPDATE images SET ${updates.join(', ')} WHERE id = ? AND photographer_id = ?`).bind(...params).run();
  }
  const updated: any = await c.env.DB.prepare('SELECT * FROM images WHERE id = ?').bind(imageId).first();
  return c.json({ message: 'Image updated successfully', image: updated });
}));

// GET /imagekit/image/:imageId/transform
router.get('/image/:imageId/transform', catchAsync(async (c) => {
  const imageId = c.req.param('imageId');
  const { width, height, quality = '80', crop = 'maintain_ratio' } = c.req.query();
  const dbImage: any = await c.env.DB.prepare('SELECT * FROM images WHERE id = ?').bind(imageId).first();
  if (!dbImage) throw new AppError('Image not found', 404);
  const { urlEndpoint } = ikAuth(c);
  let transforms = '';
  if (width) transforms += `w-${width},`;
  if (height) transforms += `h-${height},`;
  transforms += `q-${quality},c-${crop}`;
  return c.json({ originalUrl: dbImage.path, transformedUrl: `${urlEndpoint}/tr:${transforms}/${dbImage.path.replace(urlEndpoint, '')}` });
}));

export default router;
