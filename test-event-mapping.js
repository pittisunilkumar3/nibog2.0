// Test to understand the event ID mapping issue
console.log('🗺️ TESTING EVENT ID MAPPING ISSUE');
console.log('=' .repeat(50));

async function testMapping() {
  console.log('\n📊 DISCOVERED MAPPING:');
  console.log('Event ID 10 API call returns image with event_id: 99');
  console.log('This suggests Event ID 99 should get images from Event ID 10');
  
  console.log('\n🔍 HYPOTHESIS:');
  console.log('The frontend event ID (URL parameter) might not match the backend event ID');
  console.log('We need to find the correct mapping or fix the API integration');
  
  // Test if we need to search for images by checking which API calls return images for event 99
  console.log('\n🔎 SEARCHING FOR EVENT 99 IMAGES:');
  
  const testIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  
  for (const testId of testIds) {
    try {
      const response = await fetch(`http://localhost:3111/api/eventimages/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_id: testId }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          const validImages = data.filter(img => 
            img && 
            typeof img === 'object' && 
            img.id !== undefined && 
            img.image_url !== undefined
          );
          
          if (validImages.length > 0) {
            console.log(`\n✅ API ID ${testId} returns images:`);
            validImages.forEach(img => {
              console.log(`  📷 Image for event_id: ${img.event_id}`);
              console.log(`     Image URL: ${img.image_url}`);
              console.log(`     Priority: ${img.priority}`);
              
              if (img.event_id === 99) {
                console.log(`  🎯 FOUND IT! API ID ${testId} has images for Event 99!`);
              }
            });
          }
        }
      }
    } catch (error) {
      // Ignore errors for this test
    }
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

testMapping().then(() => {
  console.log('\n💡 SOLUTION APPROACH:');
  console.log('1. If we found the correct API ID for Event 99, update the mapping');
  console.log('2. Or fix the API to use consistent event IDs');
  console.log('3. Or implement a mapping function in the frontend');
}).catch(console.error);
