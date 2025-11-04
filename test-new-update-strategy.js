// Test the new game image update strategy
console.log('🔄 TESTING NEW GAME IMAGE UPDATE STRATEGY');
console.log('=' .repeat(60));

async function getCurrentGameState() {
  console.log('\n1️⃣ GETTING CURRENT GAME 9 STATE');
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
      console.log('✅ Current Game 9 images:', JSON.stringify(data, null, 2));
      
      if (Array.isArray(data) && data.length > 0) {
        const validImages = data.filter(img => 
          img && 
          typeof img === 'object' && 
          img.id !== undefined && 
          img.image_url !== undefined
        );
        
        console.log(`📊 Current state: ${validImages.length} images`);
        if (validImages.length > 0) {
          console.log(`   Latest image: ${validImages[validImages.length - 1].image_url}`);
          console.log(`   Latest priority: ${validImages[validImages.length - 1].priority}`);
        }
        
        return validImages;
      }
      
      return [];
    } else {
      console.log('❌ Failed to get current state');
      return [];
    }
  } catch (error) {
    console.error('❌ Error getting current state:', error.message);
    return [];
  }
}

async function testDeleteEndpoint() {
  console.log('\n2️⃣ TESTING DELETE ENDPOINT');
  console.log('-'.repeat(40));
  
  try {
    console.log('📡 Testing delete endpoint for Game 9...');
    
    const response = await fetch('http://localhost:3111/api/gamesimage/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ game_id: 9 }),
    });

    console.log(`Delete endpoint status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Delete endpoint response:', JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ Delete endpoint error: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('❌ Delete endpoint network error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testCreateAfterDelete() {
  console.log('\n3️⃣ TESTING CREATE AFTER DELETE');
  console.log('-'.repeat(40));
  
  const createPayload = {
    game_id: 9,
    image_url: "./upload/gamesimage/updated_test_image.jpg",
    priority: 7,
    is_active: true
  };
  
  try {
    console.log('📡 Creating new image after delete:', createPayload);
    
    const response = await fetch('http://localhost:3111/api/gamesimage/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createPayload),
    });

    console.log(`Create after delete status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Create after delete response:', JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ Create after delete error: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('❌ Create after delete network error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testNewUpdateStrategy() {
  console.log('\n4️⃣ TESTING NEW UPDATE STRATEGY');
  console.log('-'.repeat(40));
  
  const updatePayload = {
    game_id: 9,
    image_url: "./upload/gamesimage/strategy_test_image.jpg",
    priority: 8,
    is_active: true
  };
  
  try {
    console.log('📡 Testing new update strategy via internal API:', updatePayload);
    
    const response = await fetch('http://localhost:3111/api/gamesimage/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });

    console.log(`New update strategy status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ New update strategy response:', JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ New update strategy error: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('❌ New update strategy network error:', error.message);
    return { success: false, error: error.message };
  }
}

async function verifyFinalState() {
  console.log('\n5️⃣ VERIFYING FINAL STATE');
  console.log('-'.repeat(40));
  
  // Wait a moment for the operations to complete
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const finalImages = await getCurrentGameState();
  
  if (finalImages.length > 0) {
    console.log('✅ Final verification successful');
    console.log(`📊 Final state: ${finalImages.length} images`);
    finalImages.forEach((img, index) => {
      console.log(`   Image ${index + 1}: ${img.image_url} (Priority: ${img.priority})`);
    });
  } else {
    console.log('❌ No images found in final state');
  }
  
  return finalImages;
}

async function runNewUpdateStrategyTest() {
  console.log('🚀 Starting comprehensive update strategy test...');
  
  const initialState = await getCurrentGameState();
  const deleteResult = await testDeleteEndpoint();
  const createResult = await testCreateAfterDelete();
  const updateResult = await testNewUpdateStrategy();
  const finalState = await verifyFinalState();
  
  console.log('\n🎯 TEST RESULTS SUMMARY');
  console.log('=' .repeat(60));
  
  console.log('📊 OPERATION RESULTS:');
  console.log(`- Initial state: ${initialState.length} images`);
  console.log(`- Delete operation: ${deleteResult.success ? '✅ Success' : '❌ Failed'}`);
  console.log(`- Create after delete: ${createResult.success ? '✅ Success' : '❌ Failed'}`);
  console.log(`- New update strategy: ${updateResult.success ? '✅ Success' : '❌ Failed'}`);
  console.log(`- Final state: ${finalState.length} images`);
  
  console.log('\n🔧 STRATEGY ASSESSMENT:');
  
  if (deleteResult.success && createResult.success && updateResult.success) {
    console.log('✅ NEW UPDATE STRATEGY WORKING PERFECTLY!');
    console.log('💡 The delete-then-create approach is successful');
    console.log('🎯 Ready to implement in the edit page');
  } else if (createResult.success && !deleteResult.success) {
    console.log('⚠️ CREATE WORKS, DELETE MIGHT HAVE ISSUES');
    console.log('💡 Strategy can still work - create will replace existing');
    console.log('🎯 Consider implementing with error handling for delete');
  } else {
    console.log('❌ STRATEGY NEEDS REFINEMENT');
    console.log('💡 Check individual operation failures');
    console.log('🎯 May need alternative approach');
  }
  
  console.log('\n🔧 NEXT STEPS:');
  console.log('1. Update the internal API route to use new strategy');
  console.log('2. Test the edit page functionality');
  console.log('3. Verify end-to-end update flow');
  console.log('4. Handle edge cases and error scenarios');
}

runNewUpdateStrategyTest().catch(console.error);
