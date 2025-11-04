// Test Event 99 mapping system
console.log('🗺️ TESTING EVENT 99 MAPPING SYSTEM');
console.log('=' .repeat(60));

async function testDirectEventCall() {
  console.log('\n1️⃣ TESTING DIRECT EVENT 99 CALL');
  console.log('-'.repeat(40));
  
  try {
    const response = await fetch('http://localhost:3111/api/eventimages/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_id: 99 }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('📊 Direct Event 99 response:', JSON.stringify(data, null, 2));
      
      const validImages = data.filter(img => 
        img && 
        typeof img === 'object' && 
        img.id !== undefined && 
        img.image_url !== undefined
      );
      
      console.log(`📊 Valid images from direct call: ${validImages.length}`);
      return { success: true, images: validImages, raw: data };
    } else {
      console.log('❌ Direct call failed');
      return { success: false, images: [], raw: [] };
    }
  } catch (error) {
    console.error('❌ Direct call error:', error.message);
    return { success: false, images: [], raw: [] };
  }
}

async function searchForEvent99Images() {
  console.log('\n2️⃣ SEARCHING FOR EVENT 99 IMAGES ACROSS API IDS');
  console.log('-'.repeat(40));
  
  console.log('🔍 Searching API IDs 1-20 for Event 99 images...');
  
  const results = [];
  
  for (let apiId = 1; apiId <= 20; apiId++) {
    try {
      const response = await fetch('http://localhost:3111/api/eventimages/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_id: apiId }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          const validImages = data.filter(img => 
            img && 
            typeof img === 'object' && 
            img.id !== undefined && 
            img.image_url !== undefined &&
            img.event_id === 99  // Looking for images that belong to Event 99
          );
          
          if (validImages.length > 0) {
            console.log(`✅ Found Event 99 images at API ID ${apiId}:`, validImages.length, 'images');
            validImages.forEach((img, index) => {
              console.log(`   ${index + 1}. ${img.image_url} (Priority: ${img.priority}, ID: ${img.id})`);
            });
            results.push({ apiId, images: validImages });
          }
        }
      }
    } catch (error) {
      // Ignore errors and continue searching
    }
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

async function testEventServiceDirectly() {
  console.log('\n3️⃣ TESTING EVENT SERVICE FETCHEVENTIMAGES');
  console.log('-'.repeat(40));
  
  try {
    console.log('📡 Calling fetchEventImages(99) through internal API...');
    
    // This should use the mapping system
    const response = await fetch('http://localhost:3111/api/eventimages/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_id: 99 }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('📊 fetchEventImages response:', JSON.stringify(data, null, 2));
      
      const validImages = data.filter(img => 
        img && 
        typeof img === 'object' && 
        img.id !== undefined && 
        img.image_url !== undefined
      );
      
      console.log(`📊 Valid images from service: ${validImages.length}`);
      
      if (validImages.length > 0) {
        console.log('✅ Event service is returning valid images');
        return { success: true, images: validImages };
      } else {
        console.log('❌ Event service is not returning valid images');
        return { success: false, images: [] };
      }
    } else {
      console.log('❌ Event service call failed');
      return { success: false, images: [] };
    }
  } catch (error) {
    console.error('❌ Event service error:', error.message);
    return { success: false, images: [] };
  }
}

async function testExternalApiDirectly() {
  console.log('\n4️⃣ TESTING EXTERNAL API DIRECTLY');
  console.log('-'.repeat(40));
  
  // Test a few API IDs directly on the external API
  const testIds = [6, 7, 8, 9, 10];
  
  for (const apiId of testIds) {
    try {
      console.log(`📡 Testing external API with ID ${apiId}...`);
      
      const response = await fetch(`https://ai.nibog.in/webhook/nibog/eventimage/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_id: apiId }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`📊 External API ID ${apiId} response:`, data.length, 'items');
        
        if (Array.isArray(data) && data.length > 0) {
          const event99Images = data.filter(img => img && img.event_id === 99);
          if (event99Images.length > 0) {
            console.log(`✅ Found Event 99 images at external API ID ${apiId}:`, event99Images.length);
            event99Images.forEach((img, index) => {
              console.log(`   ${index + 1}. ${img.image_url} (Priority: ${img.priority})`);
            });
            return { success: true, apiId, images: event99Images };
          }
        }
      } else {
        console.log(`❌ External API ID ${apiId} failed:`, response.status);
      }
    } catch (error) {
      console.log(`❌ External API ID ${apiId} error:`, error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return { success: false, apiId: null, images: [] };
}

async function runEvent99MappingTest() {
  console.log('🚀 Starting Event 99 mapping test...');
  
  const directResult = await testDirectEventCall();
  const searchResults = await searchForEvent99Images();
  const serviceResult = await testEventServiceDirectly();
  const externalResult = await testExternalApiDirectly();
  
  console.log('\n🎯 EVENT 99 MAPPING TEST RESULTS');
  console.log('=' .repeat(60));
  
  console.log('📊 TEST RESULTS:');
  console.log(`- Direct Event 99 call: ${directResult.images.length} valid images`);
  console.log(`- Search across API IDs: ${searchResults.length} API IDs with Event 99 images`);
  console.log(`- Event service call: ${serviceResult.images.length} valid images`);
  console.log(`- External API search: ${externalResult.success ? `Found at API ID ${externalResult.apiId}` : 'Not found'}`);
  
  console.log('\n🔧 DIAGNOSIS:');
  
  if (searchResults.length > 0) {
    console.log('✅ EVENT 99 IMAGES EXIST IN THE SYSTEM!');
    console.log(`🎯 Found at API ID(s): ${searchResults.map(r => r.apiId).join(', ')}`);
    
    const totalImages = searchResults.reduce((sum, r) => sum + r.images.length, 0);
    console.log(`📊 Total Event 99 images found: ${totalImages}`);
    
    if (directResult.images.length === 0) {
      console.log('❌ BUT: Direct Event 99 call returns empty/invalid data');
      console.log('💡 This confirms the mapping issue exists');
      console.log('🔧 The mapping system should redirect Event 99 calls to working API ID');
    }
    
    if (serviceResult.images.length === 0) {
      console.log('❌ AND: Event service is not using mapping correctly');
      console.log('💡 The mapping system is not working in the service layer');
      console.log('🔧 Need to fix the mapping implementation');
    }
    
  } else {
    console.log('❌ NO EVENT 99 IMAGES FOUND');
    console.log('💡 Event 99 might not have any images in the system');
    console.log('🔧 Create some test images first');
  }
  
  console.log('\n🔧 SOLUTION:');
  
  if (searchResults.length > 0 && directResult.images.length === 0) {
    const workingApiId = searchResults[0].apiId;
    console.log(`✅ MAPPING SOLUTION NEEDED`);
    console.log(`🎯 Event 99 should map to API ID ${workingApiId}`);
    console.log(`🔧 Update the mapping system to redirect Event 99 → API ID ${workingApiId}`);
    
    console.log('\n🔧 IMPLEMENTATION STEPS:');
    console.log('1. ✅ Verify mapping system is active in event service');
    console.log('2. ✅ Ensure mapping cache includes Event 99 → API ID mapping');
    console.log('3. ✅ Test the edit page after mapping fix');
    console.log('4. ✅ Verify existing images load correctly');
    
  } else if (searchResults.length === 0) {
    console.log(`⚠️ NO IMAGES TO MAP`);
    console.log(`🔧 Create test images for Event 99 first`);
    console.log(`💡 Use the working update API to create some images`);
    
  } else {
    console.log(`✅ MAPPING MIGHT BE WORKING`);
    console.log(`🔧 Check why the edit page is not showing images`);
  }
  
  console.log('\n🎪 NEXT STEPS:');
  console.log('1. Open: http://localhost:3111/admin/events/99/edit');
  console.log('2. Check browser console for mapping system logs');
  console.log('3. Verify if images load after mapping fix');
  console.log('4. Test update functionality end-to-end');
}

runEvent99MappingTest().catch(console.error);
