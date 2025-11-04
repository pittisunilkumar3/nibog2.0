// Create a simple test image file for testing
const fs = require('fs');
const path = require('path');

// Create upload directory if it doesn't exist
const uploadDir = path.join(__dirname, 'upload', 'eventimages');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Create a simple 1x1 pixel PNG image (base64 encoded)
const pngData = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg==',
  'base64'
);

// Save the test image
const testImagePath = path.join(uploadDir, 'test_image_100.png');
fs.writeFileSync(testImagePath, pngData);

console.log('✅ Test image created at:', testImagePath);
console.log('📁 File size:', fs.statSync(testImagePath).size, 'bytes');
console.log('🎯 You can now test image upload functionality');
