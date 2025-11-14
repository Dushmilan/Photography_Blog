// API Configuration
const API_CONFIG = {
  // Base URLs for different environments
  development: 'http://localhost:5000/api',
  production: process.env.REACT_APP_API_URL || '/api',
  test: 'http://localhost:5000/api',
};

// Get the current environment
const getEnvironment = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  } else if (process.env.NODE_ENV === 'test') {
    return 'test';
  }
  return 'development';
};

// Get the base URL based on environment
const getBaseUrl = () => {
  return API_CONFIG[getEnvironment()] || API_CONFIG.development;
};

// API endpoints configuration
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
    UPDATE_PUBLIC: (id) => `/images/${id}/public`,
    UPDATE_FEATURED: (id) => `/images/${id}/featured`,
    UPDATE_SLIDESHOW: (id) => `/images/${id}/slideshow`,
    GALLERY: '/images/gallery',
    FEATURES: '/images/features',
    SLIDESHOW: '/images/slideshow',
    ADMIN_GALLERY: '/images/admin-gallery',
  },
  IMAGEKIT: {
    IMAGES: '/imagekit/images',
    UPLOAD: '/imagekit/upload',
    AUTH_PARAMETERS: '/imagekit/auth-parameters',
    TRANSFORM: (imageId) => `/imagekit/image/${imageId}/transform`,
    DELETE: (imageId) => `/imagekit/image/${imageId}`,
    UPDATE: (imageId) => `/imagekit/image/${imageId}`,
    GET_IMAGE: (imageId) => `/imagekit/image/${imageId}`,
  },
};

export {
  getBaseUrl,
  ENDPOINTS,
  getEnvironment,
};