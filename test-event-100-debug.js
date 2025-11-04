// Debug script to test Event ID 100 specifically
console.log('🔍 DEBUGGING EVENT ID 100');
console.log('=' .repeat(50));

async function testEvent100() {
  console.log('\n1️⃣ Testing Event ID 100 Image Fetch');
  console.log('-'.repeat(30));
  
  try {
    // Test internal API
    console.log('📡 Testing internal API...');
    const response = await fetch('http://localhost:3111/api/eventimages/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_id: 100 }),
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Error: ${errorText}`);
      return;
    }

    const data = await response.json();
    console.log('📊 Response data:', data);
    
    if (Array.isArray(data) && data.length > 0) {
      const validImages = data.filter(img => 
        img && 
        typeof img === 'object' && 
        img.id !== undefined && 
        img.image_url !== undefined &&
        img.image_url !== null &&
        img.image_url.trim() !== ''
      );
      
      console.log(`✅ Found ${validImages.length} valid images`);
      validImages.forEach((img, index) => {
        console.log(`   ${index + 1}. ID: ${img.id}, URL: ${img.image_url}, Priority: ${img.priority}, Event ID: ${img.event_id}`);
      });
      
      if (validImages.length > 0) {
        console.log('\n💡 EXPECTED BEHAVIOR:');
        console.log('- Edit page should display these images');
        console.log(`- Priority field should be set to: ${validImages[0].priority}`);
        console.log(`- Image preview should show: ${validImages[0].image_url}`);
      }
    } else {
      console.log('❌ No valid images found');
      console.log('\n💡 EXPECTED BEHAVIOR:');
      console.log('- Edit page should show "No existing images found"');
      console.log('- Priority field should default to "1"');
      console.log('- No image preview should be shown');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function testDirectExternalAPI() {
  console.log('\n2️⃣ Testing Direct External API');
  console.log('-'.repeat(30));
  
  try {
    console.log('📡 Testing external API directly...');
    const response = await fetch('https://ai.nibog.in/webhook/nibog/geteventwithimages/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_id: 100 }),
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Error: ${errorText}`);
      return;
    }

    const data = await response.json();
    console.log('📊 External API Response:', data);
    
  } catch (error) {
    console.error('❌ External API test failed:', error);
  }
}

async function testMappingSystem() {
  console.log('\n3️⃣ Testing Mapping System');
  console.log('-'.repeat(30));
  
  try {
    // Test a range of API IDs to see if any return images for event 100
    console.log('🔍 Searching for API ID that returns images for Event 100...');
    
    for (let apiId = 1; apiId <= 10; apiId++) {
      try {
        const response = await fetch('https://ai.nibog.in/webhook/nibog/geteventwithimages/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ event_id: apiId }),
        });

        if (response.ok) {
          const data = await response.json();
          
          if (Array.isArray(data) && data.length > 0 && data[0].id) {
            const imagesForEvent100 = data.filter(img => img.event_id === 100);
            
            if (imagesForEvent100.length > 0) {
              console.log(`✅ Found mapping: Event 100 → API ID ${apiId}`);
              console.log(`   Images found: ${imagesForEvent100.length}`);
              imagesForEvent100.forEach((img, index) => {
                console.log(`   ${index + 1}. ID: ${img.id}, URL: ${img.image_url}, Priority: ${img.priority}`);
              });
              return apiId;
            }
          }
        }
      } catch (error) {
        console.warn(`Error testing API ID ${apiId}:`, error.message);
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('❌ No API ID found that returns images for Event 100');
    
  } catch (error) {
    console.error('❌ Mapping system test failed:', error);
  }
}

// Run all tests
async function runAllTests() {
  await testEvent100();
  await testDirectExternalAPI();
  await testMappingSystem();
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Check the browser console on the edit page');
  console.log('2. Go to http://localhost:3111/admin/events/100/edit');
  console.log('3. Look for console logs starting with "🔍 Fetching existing images"');
  console.log('4. Verify if the mapping system is working correctly');
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  runAllTests();
}

// Export for Node.js
if (typeof module !== 'undefined') {
  module.exports = { testEvent100, testDirectExternalAPI, testMappingSystem, runAllTests };
}
