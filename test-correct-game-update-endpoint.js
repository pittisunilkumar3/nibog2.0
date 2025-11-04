// Test the correct game update endpoint (following event pattern)
console.log('🔍 TESTING CORRECT GAME UPDATE ENDPOINT');
console.log('=' .repeat(60));

async function testGameImageUpdatedEndpoint() {
  console.log('\n1️⃣ TESTING GAMESIMAGE/UPDATED ENDPOINT (LIKE EVENTS)');
  console.log('-'.repeat(40));
  
  const testPayload = {
    game_id: 9,
    image_url: "./upload/gamesimage/test_updated_endpoint.jpg",
    priority: 3,
    is_active: true
  };
  
  try {
    console.log('📡 Testing /gamesimage/updated endpoint:', testPayload);
    
    const response = await fetch('https://ai.nibog.in/webhook/nibog/gamesimage/updated', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ FOUND THE CORRECT ENDPOINT!');
      console.log('Response:', JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ /updated endpoint failed: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testEventUpdateForComparison() {
  console.log('\n2️⃣ TESTING EVENT UPDATE ENDPOINT FOR COMPARISON');
  console.log('-'.repeat(40));
  
  const eventPayload = {
    event_id: 99,
    image_url: "./upload/eventimages/test_event_update.jpg",
    priority: 4,
    is_active: true
  };
  
  try {
    console.log('📡 Testing event /eventimage/updated endpoint:', eventPayload);
    
    const response = await fetch('https://ai.nibog.in/webhook/nibog/eventimage/updated', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    });

    console.log(`Event update response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Event update works!');
      console.log('Event response:', JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ Event update failed: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('❌ Event update network error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testVariousGameEndpoints() {
  console.log('\n3️⃣ TESTING VARIOUS GAME ENDPOINT VARIATIONS');
  console.log('-'.repeat(40));
  
  const testPayload = {
    game_id: 9,
    image_url: "./upload/gamesimage/test_variations.jpg",
    priority: 2,
    is_active: true
  };
  
  const endpoints = [
    'https://ai.nibog.in/webhook/nibog/gamesimage/updated',
    'https://ai.nibog.in/webhook/nibog/gameimage/update',
    'https://ai.nibog.in/webhook/nibog/gameimage/updated',
    'https://ai.nibog.in/webhook/nibog/game-image/update',
    'https://ai.nibog.in/webhook/nibog/games/image/update'
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
      });

      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS! Found working endpoint: ${endpoint}`);
        console.log('Response:', JSON.stringify(data, null, 2));
        results.push({ endpoint, success: true, data });
      } else {
        const errorText = await response.text();
        console.log(`❌ Failed: ${errorText.substring(0, 100)}...`);
        results.push({ endpoint, success: false, error: errorText });
      }
    } catch (error) {
      console.log(`❌ Network error: ${error.message}`);
      results.push({ endpoint, success: false, error: error.message });
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return results;
}

async function getCurrentGameStateForUpdate() {
  console.log('\n4️⃣ GETTING CURRENT GAME STATE FOR PROPER UPDATE');
  console.log('-'.repeat(40));
  
  try {
    const response = await fetch('http://localhost:3111/api/gamesimage/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ game_id: 9 }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('📊 Current Game 9 images for update testing:');
      
      if (Array.isArray(data) && data.length > 0) {
        const validImages = data.filter(img => 
          img && 
          typeof img === 'object' && 
          img.id !== undefined && 
          img.image_url !== undefined
        );
        
        console.log(`Total images: ${validImages.length}`);
        
        // Show the first few images
        validImages.slice(0, 3).forEach((img, index) => {
          console.log(`  ${index + 1}. ID: ${img.id}, Priority: ${img.priority}, URL: ${img.image_url}`);
        });
        
        if (validImages.length > 3) {
          console.log(`  ... and ${validImages.length - 3} more images`);
        }
        
        return validImages;
      } else {
        console.log('❌ No images found');
        return [];
      }
    } else {
      console.log('❌ Failed to get current images');
      return [];
    }
  } catch (error) {
    console.error('❌ Error getting current state:', error.message);
    return [];
  }
}

async function runCorrectEndpointTest() {
  const currentImages = await getCurrentGameStateForUpdate();
  const gameUpdatedResult = await testGameImageUpdatedEndpoint();
  const eventUpdateResult = await testEventUpdateForComparison();
  const variationResults = await testVariousGameEndpoints();
  
  console.log('\n🎯 CORRECT ENDPOINT ANALYSIS');
  console.log('=' .repeat(60));
  
  console.log('📊 ENDPOINT TEST RESULTS:');
  console.log(`- Current images: ${currentImages.length} found`);
  console.log(`- /gamesimage/updated: ${gameUpdatedResult.success ? '✅ Works' : '❌ Failed'}`);
  console.log(`- Event /updated (comparison): ${eventUpdateResult.success ? '✅ Works' : '❌ Failed'}`);
  
  const workingEndpoints = variationResults.filter(r => r.success);
  console.log(`- Endpoint variations: ${workingEndpoints.length}/${variationResults.length} working`);
  
  if (workingEndpoints.length > 0) {
    console.log('\n✅ WORKING ENDPOINTS FOUND:');
    workingEndpoints.forEach(result => {
      console.log(`  - ${result.endpoint}`);
    });
  }
  
  console.log('\n🔧 SOLUTION STRATEGY:');
  
  if (gameUpdatedResult.success || workingEndpoints.length > 0) {
    console.log('✅ FOUND WORKING UPDATE ENDPOINT!');
    const workingEndpoint = gameUpdatedResult.success 
      ? 'https://ai.nibog.in/webhook/nibog/gamesimage/updated'
      : workingEndpoints[0].endpoint;
    
    console.log(`🎯 Use this endpoint: ${workingEndpoint}`);
    console.log('💡 This will provide proper UPDATE functionality (not INSERT)');
    console.log('🔧 Update the internal API route to use this endpoint');
    
  } else {
    console.log('❌ NO WORKING UPDATE ENDPOINTS FOUND');
    console.log('💡 Need to implement proper delete-then-create strategy');
    console.log('🔧 This will simulate UPDATE by removing old records first');
  }
  
  console.log('\n🔧 NEXT STEPS:');
  if (gameUpdatedResult.success || workingEndpoints.length > 0) {
    console.log('1. ✅ Update /api/gamesimage/update/route.ts to use working endpoint');
    console.log('2. ✅ Test the updated functionality');
    console.log('3. ✅ Verify it UPDATES existing records instead of creating new ones');
  } else {
    console.log('1. 🔧 Implement delete-then-create strategy');
    console.log('2. 🔧 First delete existing images for the game');
    console.log('3. 🔧 Then create new image with updated data');
    console.log('4. ✅ This simulates proper UPDATE behavior');
  }
}

runCorrectEndpointTest().catch(console.error);
