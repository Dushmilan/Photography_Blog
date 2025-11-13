// Image utility functions

// Function to get the appropriate image size based on screen size and device
export const getImageUrl = (image, size = 'medium') => {
  if (!image) return '';

  switch (size) {
    case 'thumbnail':
      return image.thumbnail_path || image.path || image.baseUrl;
    case 'small':
      return image.small_path || image.path || image.baseUrl;
    case 'medium':
      return image.medium_path || image.path || image.baseUrl;
    case 'large':
    case 'original':
      return image.path || image.baseUrl;
    default:
      return image.path || image.baseUrl;
  }
};

// Function to format file size for display
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Function to get image dimensions
export const getImageDimensions = (image) => {
  return {
    width: image.width || image.mediaMetadata?.width || 0,
    height: image.height || image.mediaMetadata?.height || 0
  };
};

// Function to calculate aspect ratio
export const getAspectRatio = (image) => {
  const { width, height } = getImageDimensions(image);
  if (width && height) {
    return width / height;
  }
  return 1; // Default to 1:1 ratio if dimensions not available
};

// Function to preload images for better performance
export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

// Function to batch preload images
export const preloadImages = async (urls, batchSize = 5) => {
  const results = [];
  
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchPromises = batch.map(url => preloadImage(url));
    
    try {
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);
    } catch (error) {
      console.warn('Error preloading images:', error);
    }
  }
  
  return results;
};

// Function to optimize image loading based on viewport
export const isImageInViewport = (element) => {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// Function to generate image placeholders while loading
export const generatePlaceholder = (width = 300, height = 200, color = '#e2e8f0') => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  // Add a subtle pattern
  ctx.fillStyle = '#cbd5e0';
  for (let y = 0; y < height; y += 20) {
    for (let x = 0; x < width; x += 20) {
      if ((x + y) % 40 === 0) {
        ctx.fillRect(x, y, 10, 10);
      }
    }
  }
  
  return canvas.toDataURL();
};