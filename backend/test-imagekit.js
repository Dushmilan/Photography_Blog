const ImageKit = require('imagekit');
require('dotenv').config();

console.log('Testing Imagekit.io APIs...\n');

// Configuration for ImageKit
const imagekitConfig = {
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'your_public_key_here',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'your_private_key_here', 
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://your_imagekit_id.imagekit.io/your_endpoint/'
};

console.log('ImageKit Configuration:');
console.log('- Public Key:', imagekitConfig.publicKey ? 'Set' : 'NOT SET (using placeholder)');
console.log('- Private Key:', imagekitConfig.privateKey ? 'Set' : 'NOT SET (using placeholder)');
console.log('- URL Endpoint:', imagekitConfig.urlEndpoint);

// Create ImageKit instance
const imagekit = new ImageKit(imagekitConfig);

console.log('\n--- Testing ImageKit Connection ---');

// Test 1: Check if credentials are properly configured
if (imagekitConfig.publicKey === 'your_public_key_here' || 
    imagekitConfig.privateKey === 'your_private_key_here' || 
    imagekitConfig.urlEndpoint === 'https://your_imagekit_id.imagekit.io/your_endpoint/') {
  console.log('❌ Configuration Error: Please set proper ImageKit credentials in your .env file');
  console.log('\nAdd these to your .env file:');
  console.log('IMAGEKIT_PUBLIC_KEY=your_actual_public_key');
  console.log('IMAGEKIT_PRIVATE_KEY=your_actual_private_key');
  console.log('IMAGEKIT_URL_ENDPOINT=https://your_imagekit_id.imagekit.io/your_endpoint/');
  process.exit(1);
}

// Test 2: Try to authenticate by listing files (this tests the API connection)
async function testImageKitAPI() {
  try {
    console.log('\n🔍 Testing API connection by listing files...');
    
    // Attempt to list files (should return empty if no files exist, but proves connection)
    const files = await imagekit.listFiles({
      limit: 5 // Only get first 5 files to avoid large responses
    });
    
    console.log('✅ API Connection Successful!');
    console.log(`📊 Found ${files.length} files in your ImageKit account`);
    console.log('✅ ImageKit APIs are working properly');
    
    // Test 3: Show available methods
    console.log('\n--- Available ImageKit Methods ---');
    console.log('Upload methods: upload(), bulkUpload()');
    console.log('File management: listFiles(), getFileDetails(), updateFileDetails(), deleteFile()');
    console.log('URL generation: getUrl()');
    console.log('Authentication: getAuthenticationParameters()');
    
    // Test 4: Try URL generation (doesn't require authentication)
    const url = imagekit.url({
      path: '/default-image.jpg',
      transformation: [
        { width: '400', height: '300' },
        { quality: 80 }
      ]
    });
    console.log('\n🔍 Testing URL generation...');
    console.log('✅ Sample transformed URL generated:', url);
    
    console.log('\n🎉 All ImageKit API tests passed!');
    
  } catch (error) {
    console.log('❌ API Connection Failed!');
    console.log('Error details:', error.message);
    
    if (error.message.includes('401') || error.message.includes('authentication')) {
      console.log('\n💡 This usually means your ImageKit credentials are incorrect.');
      console.log('Please verify your PUBLIC_KEY, PRIVATE_KEY, and URL_ENDPOINT are correct.');
    }
  }
}

// Run the test
testImageKitAPI();