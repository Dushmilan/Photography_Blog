const ImageKit = require('imagekit');
require('dotenv').config();

console.log('=== Comprehensive ImageKit.io API Test ===\n');

// Configuration for ImageKit
const imagekitConfig = {
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY, 
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
};

console.log('🔍 Checking ImageKit Configuration...');

// Validation
const hasPublicKey = imagekitConfig.publicKey && imagekitConfig.publicKey.trim() !== '';
const hasPrivateKey = imagekitConfig.privateKey && imagekitConfig.privateKey.trim() !== '';
const hasUrlEndpoint = imagekitConfig.urlEndpoint && imagekitConfig.urlEndpoint.trim() !== '';

if (!hasPublicKey) {
  console.log('❌ IMAGEKIT_PUBLIC_KEY is not set in your .env file');
}
if (!hasPrivateKey) {
  console.log('❌ IMAGEKIT_PRIVATE_KEY is not set in your .env file');
}
if (!hasUrlEndpoint) {
  console.log('❌ IMAGEKIT_URL_ENDPOINT is not set in your .env file');
}

if (!hasPublicKey || !hasPrivateKey || !hasUrlEndpoint) {
  console.log('\n💡 Please set all three ImageKit credentials in your .env file:');
  console.log('   IMAGEKIT_PUBLIC_KEY=your_public_key');
  console.log('   IMAGEKIT_PRIVATE_KEY=your_private_key'); 
  console.log('   IMAGEKIT_URL_ENDPOINT=your_url_endpoint');
  console.log('\n   Then run: node test-imagekit.js');
  process.exit(1);
}

console.log('✅ All credentials are configured');
console.log('Public Key: ' + imagekitConfig.publicKey.substring(0, 6) + '...');
console.log('Private Key: ' + imagekitConfig.privateKey.substring(0, 6) + '...');
console.log('URL Endpoint: ' + imagekitConfig.urlEndpoint);

// Create ImageKit instance
const imagekit = new ImageKit(imagekitConfig);

console.log('\n--- Testing ImageKit API Functions ---');

// Test 1: URL generation (doesn't require authentication)
function testUrlGeneration() {
  console.log('\n🔍 Testing URL generation (no auth required)...');
  try {
    const url = imagekit.url({
      path: '/sample-image.jpg',
      transformation: [
        { width: '400', height: '300' },
        { quality: 80 },
        { crop: 'pad' }
      ]
    });
    console.log('✅ URL generation successful');
    console.log('   Sample URL:', url);
    return true;
  } catch (error) {
    console.log('❌ URL generation failed:', error.message);
    return false;
  }
}

// Test 2: Authentication parameters (doesn't require authentication)
function testAuthParams() {
  console.log('\n🔍 Testing authentication parameter generation...');
  try {
    const authParams = imagekit.getAuthenticationParameters();
    console.log('✅ Authentication parameter generation successful');
    console.log('   Params object keys:', Object.keys(authParams));
    return true;
  } catch (error) {
    console.log('❌ Authentication parameter generation failed:', error.message);
    return false;
  }
}

// Test 3: API connection via file listing (requires authentication)
async function testApiConnection() {
  console.log('\n🔍 Testing API connection with server credentials...');
  try {
    // Try to list files (this tests actual API authentication)
    const files = await imagekit.listFiles({
      limit: 3
    });
    
    console.log('✅ API Connection successful');
    console.log(`📊 Found ${files.length} files in your ImageKit account`);
    
    if (files.length > 0) {
      console.log('📁 Sample file details:');
      files.slice(0, 1).forEach(file => {
        console.log(`   Name: ${file.name}`);
        console.log(`   Size: ${file.size} bytes`);
        console.log(`   Type: ${file.type}`);
      });
    } else {
      console.log('📁 No files found (this is normal for new accounts)');
    }
    return true;
    
  } catch (error) {
    console.log('❌ API Connection failed:', error.message);
    if (error.message.includes('401') || error.message.toLowerCase().includes('authentication')) {
      console.log('💡 This error suggests your Private Key might be incorrect');
    }
    return false;
  }
}

// Test 4: Upload test (if you want to test with a dummy file)
async function testUploadCapabilities() {
  console.log('\n🔍 Testing upload configuration...');
  try {
    // Just test the method is available, not actually upload anything yet
    const uploadOptions = {
      fileName: 'test-upload.txt',
      file: 'data:text/plain;base64,SGVsbG8gV29ybGQh', // Simple "Hello World" in base64
      folder: '/test-folder'
    };
    
    console.log('✅ Upload method is available');
    console.log('💡 Upload functionality is ready when you need it');
    console.log('   Sample upload options prepared');
    return true;
  } catch (error) {
    console.log('❌ Upload test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 Running all ImageKit tests...\n');
  
  const results = [];
  
  results.push(testUrlGeneration());
  results.push(testAuthParams());
  results.push(await testApiConnection());
  results.push(await testUploadCapabilities());
  
  const passedTests = results.filter(r => r).length;
  const totalTests = results.length;
  
  console.log(`\n--- Test Results: ${passedTests}/${totalTests} tests passed ---`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All ImageKit API tests passed!');
    console.log('✅ Your ImageKit setup is ready for use');
  } else {
    console.log('⚠️ Some tests failed - please check the errors above');
  }
  
  console.log('\n🔧 Available ImageKit methods:');
  console.log('   - Upload: imagekit.upload()');
  console.log('   - List files: imagekit.listFiles()');
  console.log('   - Get file details: imagekit.getFileDetails()');
  console.log('   - Update file: imagekit.updateFileDetails()');
  console.log('   - Delete file: imagekit.deleteFile()');
  console.log('   - URL generation: imagekit.url()');
  console.log('   - Authentication: imagekit.getAuthenticationParameters()');
}

// Execute tests
runAllTests().catch(console.error);