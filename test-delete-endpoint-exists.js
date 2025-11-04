// Test if delete endpoint exists and works
console.log('🗑️ TESTING DELETE ENDPOINT AVAILABILITY');
console.log('=' .repeat(60));

async function testGameDeleteEndpoint() {
  console.log('\n1️⃣ TESTING GAME DELETE ENDPOINT');
  console.log('-'.repeat(40));
  
  const deletePayload = {
    game_id: 9
  };
  
  try {
    console.log('📡 Testing delete endpoint:', deletePayload);
    
    const response = await fetch('https://ai.nibog.in/webhook/nibog/gamesimage/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deletePayload),
    });

    console.log(`Delete response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Delete endpoint works!');
      console.log('Delete response:', JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ Delete endpoint failed: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('❌ Delete network error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testEventDeleteForComparison() {
  console.log('\n2️⃣ TESTING EVENT DELETE FOR COMPARISON');
  console.log('-'.repeat(40));
  
  const deletePayload = {
    event_id: 99
  };
  
  try {
    console.log('📡 Testing event delete endpoint:', deletePayload);
    
    const response = await fetch('https://ai.nibog.in/webhook/nibog/eventimage/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deletePayload),
    });

    console.log(`Event delete response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Event delete works!');
      console.log('Event delete response:', JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ Event delete failed: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('❌ Event delete network error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testDeleteThenCreateFlow() {
  console.log('\n3️⃣ TESTING COMPLETE DELETE-THEN-CREATE FLOW');
  console.log('-'.repeat(40));
  
  // Step 1: Get current state
  console.log('📊 Step 1: Getting current game state...');
  let currentImages = [];
  try {
    const getResponse = await fetch('http://localhost:3111/api/gamesimage/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ game_id: 9 }),
    });

    if (getResponse.ok) {
      const data = await getResponse.json();
      currentImages = data.filter(img => img && img.id);
      console.log(`✅ Found ${currentImages.length} existing images`);
      if (currentImages.length > 0) {
        console.log(`   Latest: ${currentImages[currentImages.length - 1].image_url} (Priority: ${currentImages[currentImages.length - 1].priority})`);
      }
    }
  } catch (error) {
    console.log('❌ Failed to get current state:', error.message);
  }
  
  // Step 2: Try to delete
  console.log('\n🗑️ Step 2: Attempting to delete existing images...');
  const deleteResult = await testGameDeleteEndpoint();
  
  // Step 3: Create new image
  console.log('\n➕ Step 3: Creating new image...');
  const createPayload = {
    game_id: 9,
    image_url: "./upload/gamesimage/delete_then_create_test.jpg",
    priority: 8,
    is_active: true
  };
  
  try {
    console.log('📡 Creating new image:', createPayload);
    
    const createResponse = await fetch('https://ai.nibog.in/webhook/nibog/gamesimage/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createPayload),
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Create successful after delete attempt');
      console.log('New image:', JSON.stringify(createData, null, 2));
    } else {
      const errorText = await createResponse.text();
      console.log(`❌ Create failed: ${errorText}`);
    }
  } catch (error) {
    console.log(`❌ Create error: ${error.message}`);
  }
  
  // Step 4: Verify final state
  console.log('\n📊 Step 4: Verifying final state...');
  try {
    const finalResponse = await fetch('http://localhost:3111/api/gamesimage/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ game_id: 9 }),
    });

    if (finalResponse.ok) {
      const finalData = await finalResponse.json();
      const finalImages = finalData.filter(img => img && img.id);
      console.log(`✅ Final state: ${finalImages.length} images`);
      
      if (finalImages.length > 0) {
        console.log('   Recent images:');
        finalImages.slice(-3).forEach((img, index) => {
          console.log(`     ${finalImages.length - 3 + index + 1}. ${img.image_url} (Priority: ${img.priority}, ID: ${img.id})`);
        });
      }
      
      // Check if delete worked
      if (deleteResult.success && finalImages.length < currentImages.length) {
        console.log('✅ DELETE WORKED - Image count decreased');
      } else if (deleteResult.success && finalImages.length === currentImages.length + 1) {
        console.log('⚠️ DELETE MIGHT NOT WORK - Image count increased (only create worked)');
      } else {
        console.log('❓ DELETE STATUS UNCLEAR - Need to analyze results');
      }
    }
  } catch (error) {
    console.log('❌ Failed to verify final state:', error.message);
  }
  
  return { deleteResult, currentCount: currentImages.length };
}

async function runDeleteEndpointTest() {
  const gameDeleteResult = await testGameDeleteEndpoint();
  const eventDeleteResult = await testEventDeleteForComparison();
  const flowResult = await testDeleteThenCreateFlow();
  
  console.log('\n🎯 DELETE ENDPOINT ANALYSIS');
  console.log('=' .repeat(60));
  
  console.log('📊 DELETE TEST RESULTS:');
  console.log(`- Game delete endpoint: ${gameDeleteResult.success ? '✅ Works' : '❌ Failed'}`);
  console.log(`- Event delete endpoint: ${eventDeleteResult.success ? '✅ Works' : '❌ Failed'}`);
  console.log(`- Delete-then-create flow: ${flowResult.deleteResult.success ? '✅ Delete worked' : '❌ Delete failed'}`);
  
  console.log('\n🔧 IMPLEMENTATION STRATEGY:');
  
  if (gameDeleteResult.success) {
    console.log('✅ PERFECT! DELETE ENDPOINT WORKS');
    console.log('💡 Can implement proper UPDATE with delete-then-create');
    console.log('🎯 This will give true UPDATE behavior (not INSERT)');
    
    console.log('\n🔧 IMPLEMENTATION PLAN:');
    console.log('1. ✅ Update /api/gamesimage/update/route.ts');
    console.log('2. ✅ First call delete endpoint to remove existing images');
    console.log('3. ✅ Then call create endpoint to add new image');
    console.log('4. ✅ This simulates proper UPDATE behavior');
    console.log('5. ✅ User sees their image updated, not duplicated');
    
  } else {
    console.log('❌ DELETE ENDPOINT NOT AVAILABLE');
    console.log('💡 Cannot implement true UPDATE behavior');
    console.log('🎯 Will have to use INSERT approach (creates new records)');
    
    console.log('\n⚠️ LIMITATION:');
    console.log('- Each "update" will create a new image record');
    console.log('- Old images will remain in the system');
    console.log('- Frontend should show the latest image by priority/date');
    console.log('- This is not ideal but functional');
  }
  
  console.log('\n🔧 NEXT STEPS:');
  if (gameDeleteResult.success) {
    console.log('1. ✅ Implement delete-then-create in update API');
    console.log('2. ✅ Test the proper UPDATE functionality');
    console.log('3. ✅ Verify old images are removed and new ones added');
  } else {
    console.log('1. ⚠️ Document the INSERT limitation');
    console.log('2. ⚠️ Ensure frontend handles multiple images correctly');
    console.log('3. ⚠️ Consider periodic cleanup of old images');
  }
}

runDeleteEndpointTest().catch(console.error);
