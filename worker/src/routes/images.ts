import { Hono } from 'hono';
import { Database } from '../db/queries';
import { catchAsync, AppError } from '../utils/errorHandler';

const router = new Hono<{ Bindings: { DB: D1Database; IMAGEKIT_PUBLIC_KEY: string; IMAGEKIT_PRIVATE_KEY: string; IMAGEKIT_URL_ENDPOINT: string } }>();

const getIkAuth = (c: any) => ({
  publicKey: c.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: c.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: c.env.IMAGEKIT_URL_ENDPOINT,
});

async function ikRequest(path: string, c: any): Promise<any> {
  const { privateKey } = getIkAuth(c);
  const res = await fetch(`https://api.imagekit.io/v5${path}`, {
    headers: { Authorization: `Basic ${btoa(privateKey + ':')}` }
  });
  if (!res.ok) return null;
  return res.json();
}

// GET /images/public
router.get('/public', catchAsync(async (c) => {
  const db = new Database(c.env.DB);
  const images = await db.getPublicImages();
  return c.json(images);
}));

// GET /images/gallery (alias for public)
router.get('/gallery', catchAsync(async (c) => {
  const db = new Database(c.env.DB);
  const images = await db.getPublicImages();
  return c.json(images);
}));

// GET /images/slideshow
router.get('/slideshow', catchAsync(async (c) => {
  const db = new Database(c.env.DB);
  const images = await db.getSlideshowImages();
  return c.json(images);
}));

// GET /images/my-images (authenticated user's images from DB)
router.get('/my-images', catchAsync(async (c) => {
  const userId = (c.get('user') as any).userId;
  const db = new Database(c.env.DB);
  const images = await db.getImagesByPhotographerId(userId);
  return c.json(images);
}));

// GET /images/admin-gallery (ImageKit + DB merge)
router.get('/admin-gallery', catchAsync(async (c) => {
  const userId = (c.get('user') as any).userId;
  const db = new Database(c.env.DB);
  const ikFiles: any[] = (await ikRequest('/files?limit=1000', c)) || [];
  const dbImages: any[] = await db.getImagesByPhotographerId(userId);
  const merged = ikFiles.map((ik: any) => {
    const dbMatch = dbImages.find((d: any) => d.id === ik.fileId);
    return { id: ik.fileId, path: ik.url || ik.filePath, filename: ik.name, size: ik.size, mimetype: ik.type, width: ik.width, height: ik.height, is_slideshow: dbMatch?.is_slideshow || 0, is_public: dbMatch?.is_public || 0, photographer_id: userId };
  });
  return c.json({ images: merged, total: merged.length });
}));

// POST /images (create image record in DB)
router.post('/', catchAsync(async (c) => {
  const userId = (c.get('user') as any).userId;
  const body: any = await c.req.json();
  if (!body.id) throw new AppError('Image ID is required', 400);
  if (body.photographer_id !== userId) throw new AppError('Unauthorized', 403);
  const db = new Database(c.env.DB);
  const existing = await db.getImageById(body.id);
  if (existing) return c.json({ message: 'Image already exists', image: existing });
  const image = await db.createImage({ id: body.id, path: body.path || body.url || '', photographer_id: userId, is_slideshow: body.is_slideshow || 0, is_public: body.is_public || 0 });
  return c.json({ image }, 201);
}));

// PUT /images/reorder
router.put('/reorder', catchAsync(async (c) => {
  const { updates, type } = await c.req.json() as any;
  if (!updates || !type) throw new AppError('Updates and type required', 400);
  const db = new Database(c.env.DB);
  await db.updateImageOrder(updates, type);
  return c.json({ message: 'Order updated successfully' });
}));

// PUT /images/:id/public
router.put('/:id/public', catchAsync(async (c) => {
  const id = c.req.param('id');
  const userId = (c.get('user') as any).userId;
  const { isPublic } = await c.req.json() as any;
  if (typeof isPublic !== 'boolean') throw new AppError('isPublic must be boolean', 400);
  const db = new Database(c.env.DB);
  const image = await db.updateImagePublicStatus(id, userId, isPublic);
  return c.json({ image });
}));

// PUT /images/:id/slideshow
router.put('/:id/slideshow', catchAsync(async (c) => {
  const id = c.req.param('id');
  const userId = (c.get('user') as any).userId;
  const { isSlideshow } = await c.req.json() as any;
  if (typeof isSlideshow !== 'boolean') throw new AppError('isSlideshow must be boolean', 400);
  const db = new Database(c.env.DB);
  const image = await db.updateImageSlideshowStatus(id, userId, isSlideshow);
  return c.json({ image });
}));

// GET /images/:id (single image with ImageKit metadata)
router.get('/:id', catchAsync(async (c) => {
  const id = c.req.param('id');
  const db = new Database(c.env.DB);
  const dbImage: any = await db.getImageById(id);
  const ikData: any = await ikRequest(`/files/${id}/details`, c);
  if (!dbImage && !ikData) throw new AppError('Image not found', 404);
  return c.json({
    id: ikData?.fileId || dbImage?.id,
    path: ikData?.url || dbImage?.path,
    filename: ikData?.name || '',
    size: ikData?.size || 0,
    mimetype: ikData?.type || '',
    width: ikData?.width || 0,
    height: ikData?.height || 0,
    is_slideshow: dbImage?.is_slideshow || 0,
    is_public: dbImage?.is_public || 0,
  });
}));

// DELETE /images/:id
router.delete('/:id', catchAsync(async (c) => {
  const id = c.req.param('id');
  const { privateKey } = getIkAuth(c);
  await fetch(`https://api.imagekit.io/v5/files/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Basic ${btoa(privateKey + ':')}` }
  }).catch(() => {});
  const db = new Database(c.env.DB);
  await db.deleteImageById(id);
  return c.json({ message: 'Image deleted successfully' });
}));

export default router;
