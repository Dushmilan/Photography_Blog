const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const processImage = async (filePath, options = {}) => {
  const { width, height, quality = 80 } = options;
  
  try {
    const processedPath = filePath.replace(
      path.extname(filePath),
      `_processed${path.extname(filePath)}`
    );
    
    await sharp(filePath)
      .resize(width, height, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .jpeg({ quality })
      .toFile(processedPath);
      
    return processedPath;
  } catch (error) {
    throw new Error(`Image processing failed: ${error.message}`);
  }
};

module.exports = { processImage };