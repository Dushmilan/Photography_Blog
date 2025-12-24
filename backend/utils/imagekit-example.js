/**
 * Example: Basic ImageKit Upload Functionality
 * This is a template for how you might implement image upload functionality
 * when migrating from Google Photos to ImageKit
 */

const ImageKit = require('imagekit');
require('dotenv').config();

// Initialize ImageKit with your credentials
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

/**
 * Function to upload a file to ImageKit
 * @param {string|Buffer} file - The file to upload (can be file path, URL, or Buffer)
 * @param {string} fileName - Name to give the file in ImageKit
 * @param {string} folder - Folder in ImageKit where to store the file (optional)
 * @returns {Promise<Object>} Upload result
 */
async function uploadToImageKit(file, fileName, folder = '/') {
  try {
    const result = await imagekit.upload({
      file: file,           // required
      fileName: fileName,   // required
      folder: folder,       // optional
      tags: ['photography', 'blog'], // optional
      useUniqueFileName: true, // optional (default: true)
      responseFields: ['isPrivateFile', 'tags', 'customCoordinates', 'metadata'] // optional
    });

    console.log('✅ File uploaded successfully!');
    console.log('File ID:', result.fileId);
    console.log('URL:', result.url);
    console.log('File name:', result.name);
    
    return result;
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
}

/**
 * Function to get a transformed image URL
 * @param {string} imagePath - Path to the image in ImageKit
 * @param {Object} transformations - Transformation parameters
 * @returns {string} Transformed image URL
 */
function getTransformedImageUrl(imagePath, transformations = {}) {
  const url = imagekit.url({
    path: imagePath,
    transformation: [
      { width: transformations.width || 800 },
      { height: transformations.height || 600 },
      { quality: transformations.quality || 80 },
      { crop: transformations.crop || 'maintain_ratio' }
    ]
  });

  return url;
}

/**
 * Function to list files from ImageKit
 * @param {Object} options - List options
 * @returns {Promise<Array>} List of files
 */
async function listImageKitFiles(options = {}) {
  try {
    const files = await imagekit.listFiles({
      limit: options.limit || 20,
      skip: options.skip || 0,
      name: options.name, // filter by name
      path: options.path, // filter by path
      type: options.type || 'file' // 'file' or 'folder'
    });

    console.log(`📊 Found ${files.length} items`);
    return files;
  } catch (error) {
    console.error('❌ Failed to list files:', error);
    throw error;
  }
}

// Example usage (commented out to prevent execution when importing)
/*
async function example() {
  console.log('=== ImageKit Example ===');
  
  // Example 1: Upload a file
  // const uploadResult = await uploadToImageKit('./path/to/your/image.jpg', 'my-photo.jpg', '/blog-photos');
  
  // Example 2: Get transformed URL
  // const transformedUrl = getTransformedImageUrl('/blog-photos/my-photo.jpg', {
  //   width: 400,
  //   height: 300,
  //   quality: 80
  // });
  // console.log('Transformed URL:', transformedUrl);
  
  // Example 3: List files
  // const files = await listImageKitFiles({ limit: 5 });
  // console.log('Files:', files);
}

// Uncomment the line below to run the example
// example();
*/
export default {
  imagekit,
  uploadToImageKit,
  getTransformedImageUrl,
  listImageKitFiles
};