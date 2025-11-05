// Test image serving path resolution
const { join } = require('path');
const { existsSync } = require('fs');

console.log('=== PM2 Image Serving Diagnostic ===\n');

// Simulate the path
const imagePath = 'upload/gamesimage/gameimage_1757999945333_9249.png';

console.log('Current Working Directory:', process.cwd());
console.log('Node ENV:', process.env.NODE_ENV || 'development');
console.log('Image Path:', imagePath);
console.log('');

// Test different path combinations
const testPaths = [
  join(process.cwd(), imagePath),
  join(process.cwd(), '.next', 'standalone', imagePath),
  join(process.cwd(), '..', imagePath),
  join(__dirname, imagePath),
  join(__dirname, '..', imagePath),
  imagePath,
];

console.log('Testing Paths:\n');
testPaths.forEach((path, index) => {
  const exists = existsSync(path);
  console.log(`${index + 1}. ${exists ? '✅' : '❌'} ${path}`);
});

// Find upload directory
console.log('\n=== Searching for upload directory ===\n');
const uploadSearchPaths = [
  join(process.cwd(), 'upload'),
  join(process.cwd(), '..', 'upload'),
  join(__dirname, 'upload'),
  join(__dirname, '..', 'upload'),
];

uploadSearchPaths.forEach((path, index) => {
  const exists = existsSync(path);
  console.log(`${index + 1}. ${exists ? '✅' : '❌'} ${path}`);
  
  if (exists) {
    const fs = require('fs');
    const subdirs = fs.readdirSync(path);
    console.log(`   Subdirectories: ${subdirs.join(', ')}`);
  }
});
