const { google } = require('googleapis');

console.log('Available APIs in google object:');
const apiKeys = Object.keys(google);
console.log('Total APIs:', apiKeys.length);
console.log('APIs containing "photo":', apiKeys.filter(key => key.toLowerCase().includes('photo')));
console.log('APIs containing "library":', apiKeys.filter(key => key.toLowerCase().includes('library')));

// Check specifically for photoslibrary
if (google.photoslibrary) {
  console.log('✅ google.photoslibrary is available');
} else {
  console.log('❌ google.photoslibrary is NOT available');
}

// Show first 20 APIs as a sample
console.log('\nFirst 20 APIs in google object:', apiKeys.slice(0, 20));