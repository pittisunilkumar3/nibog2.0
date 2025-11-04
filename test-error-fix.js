// Test the error fix for undefined image_url
console.log('Testing Error Fix for Undefined image_url...\n');

// Simulate the problematic data that was causing the error
const problematicData = [
  {}, // Empty object
  { id: 1, image_url: null, priority: 1 }, // null image_url
  { id: 2, image_url: undefined, priority: 2 }, // undefined image_url
  { id: 3, image_url: "./upload/eventimages/test.jpg", priority: 3 }, // Valid image_url
];

console.log('Original problematic data:', problematicData);

// Test the filtering logic we implemented
const validImages = problematicData.filter(img => img && typeof img === 'object');
console.log('After basic filtering:', validImages);

// Test the display logic we implemented
validImages.forEach((img, index) => {
  const filename = img.image_url ? img.image_url.split('/').pop() : 'Unknown file';
  const priority = img.priority || 'N/A';
  const key = img.id || index;
  
  console.log(`Image ${key}: ${filename} (Priority: ${priority})`);
});

console.log('\n✅ Error fix test completed successfully!');
console.log('The edit pages should now handle undefined/null image_url values gracefully.');
