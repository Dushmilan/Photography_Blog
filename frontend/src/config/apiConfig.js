// API Configuration
const API_CONFIG = {
  development: 'http://localhost:8787/api',
  production: process.env.REACT_APP_API_URL || 'https://photography-blog-api.your-subdomain.workers.dev/api',
  test: 'http://localhost:8787/api',
};

const getEnvironment = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  } else if (process.env.NODE_ENV === 'test') {
    return 'test';
  }
  return 'development';
};

const getBaseUrl = () => {
  return API_CONFIG[getEnvironment()] || API_CONFIG.development;
};

const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    REFRESH: '/tokens/refresh',
  },
  IMAGES: {
    PUBLIC: '/images/public',
    MY_IMAGES: '/images/my-images',
    CREATE: '/images',
    REORDER: '/images/reorder',
    UPDATE_PUBLIC: (id) => `/images/${id}/public`,
    UPDATE_SLIDESHOW: (id) => `/images/${id}/slideshow`,
    GALLERY: '/images/gallery',
    SLIDESHOW: '/images/slideshow',
    ADMIN_GALLERY: '/images/admin-gallery',
    GET: (id) => `/images/${id}`,
    DELETE: (id) => `/images/${id}`,
  },
  IMAGEKIT: {
    IMAGES: '/imagekit/images',
    AUTH_PARAMETERS: '/imagekit/auth-parameters',
    TRANSFORM: (imageId) => `/imagekit/image/${imageId}/transform`,
    UPDATE: (imageId) => `/imagekit/image/${imageId}`,
    GET_IMAGE: (imageId) => `/imagekit/image/${imageId}`,
  },
};

export {
  getBaseUrl,
  ENDPOINTS,
  getEnvironment,
};