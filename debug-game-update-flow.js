// Debug the game image update flow
console.log('🔧 DEBUGGING GAME IMAGE UPDATE FLOW');
console.log('=' .repeat(60));

async function testGameUpdateAPI() {
  console.log('\n1️⃣ TESTING GAME IMAGE UPDATE API');
  console.log('-'.repeat(40));
  
  // Test the update API with Game 9 data
  const testPayload = {
    game_id: 9,
    image_url: "./upload/gamesimage/test_update_image.jpg",
    priority: 2,
    is_active: true
  };
  
  try {
    console.log('📡 Testing update API with payload:', testPayload);
    
    const response = await fetch('http://localhost:3111/api/gamesimage/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Update API Response:', JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ Update API Error: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testCurrentGameState() {
  console.log('\n2️⃣ TESTING CURRENT GAME 9 STATE');
  console.log('-'.repeat(40));
  
  try {
    console.log('📡 Fetching current Game 9 images...');
    
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
        
        if (validImages.length > 0) {
          console.log('\n📊 CURRENT STATE ANALYSIS:');
          validImages.forEach((img, index) => {
            console.log(`  Image ${index + 1}:`);
            console.log(`    ID: ${img.id}`);
            console.log(`    Game ID: ${img.game_id}`);
            console.log(`    Image URL: ${img.image_url}`);
            console.log(`    Priority: ${img.priority}`);
            console.log(`    Active: ${img.is_active}`);
            console.log(`    Updated: ${img.updated_at}`);
          });
          
          return validImages;
        }
      }
      
      console.log('❌ No valid images found');
      return [];
    } else {
      const errorText = await response.text();
      console.log(`❌ Get API Error: ${errorText}`);
      return [];
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    return [];
  }
}

async function analyzeUpdateFlow() {
  console.log('\n3️⃣ ANALYZING UPDATE FLOW');
  console.log('-'.repeat(40));
  
  console.log('🔍 EXPECTED UPDATE FLOW:');
  console.log('1. User clicks "Save Changes" on edit page');
  console.log('2. handleSubmit() is called');
  console.log('3. updateBabyGame() updates game data');
  console.log('4. If gameImageFile exists:');
  console.log('   a. uploadGameImage() uploads new file');
  console.log('   b. If existingImages.length > 0:');
  console.log('      - Delete old image files');
  console.log('      - Call updateGameImage()');
  console.log('   c. Else: Call sendGameImageToWebhook()');
  console.log('5. updateGameImage() calls /api/gamesimage/update');
  console.log('6. API calls external webhook');
  console.log('7. External webhook updates the image record');
  
  console.log('\n🔍 POTENTIAL ISSUES:');
  console.log('❓ Is gameImageFile being set when user selects image?');
  console.log('❓ Is existingImages.length > 0 condition working?');
  console.log('❓ Is updateGameImage() being called with correct parameters?');
  console.log('❓ Is the external webhook responding correctly?');
  console.log('❓ Are there any JavaScript errors in browser console?');
}

async function testExternalWebhookDirect() {
  console.log('\n4️⃣ TESTING EXTERNAL WEBHOOK DIRECTLY');
  console.log('-'.repeat(40));
  
  const testPayload = {
    game_id: 9,
    image_url: "./upload/gamesimage/direct_test_image.jpg",
    priority: 3,
    is_active: true
  };
  
  try {
    console.log('📡 Testing external webhook directly:', testPayload);
    
    const response = await fetch('https://ai.nibog.in/webhook/nibog/gamesimage/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    console.log(`External webhook status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ External webhook response:', JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ External webhook error: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('❌ External webhook network error:', error.message);
    return { success: false, error: error.message };
  }
}

async function runUpdateFlowDebug() {
  const currentImages = await testCurrentGameState();
  const updateResult = await testGameUpdateAPI();
  const externalResult = await testExternalWebhookDirect();
  await analyzeUpdateFlow();
  
  console.log('\n🎯 DEBUGGING SUMMARY');
  console.log('=' .repeat(60));
  
  console.log('📊 CURRENT STATE:');
  console.log(`- Game 9 has ${currentImages.length} existing images`);
  if (currentImages.length > 0) {
    console.log(`- Current priority: ${currentImages[0].priority}`);
    console.log(`- Current image: ${currentImages[0].image_url}`);
  }
  
  console.log('\n📊 API TESTS:');
  console.log(`- Internal update API: ${updateResult.success ? '✅ Working' : '❌ Failed'}`);
  console.log(`- External webhook: ${externalResult.success ? '✅ Working' : '❌ Failed'}`);
  
  console.log('\n🔧 NEXT STEPS:');
  if (!updateResult.success) {
    console.log('1. ❌ Fix internal update API issues');
    console.log(`   Error: ${updateResult.error}`);
  }
  
  if (!externalResult.success) {
    console.log('2. ❌ Fix external webhook issues');
    console.log(`   Error: ${externalResult.error}`);
  }
  
  if (updateResult.success && externalResult.success) {
    console.log('1. ✅ APIs are working - check frontend logic');
    console.log('2. 🔍 Debug browser console on edit page');
    console.log('3. 🔍 Check if handleSubmit is calling updateGameImage');
    console.log('4. 🔍 Verify gameImageFile state management');
  }
  
  console.log('\n💡 MANUAL TESTING:');
  console.log('1. Open: http://localhost:3111/admin/games/9/edit');
  console.log('2. Upload a new image or change priority');
  console.log('3. Click "Save Changes"');
  console.log('4. Check browser console for errors');
  console.log('5. Check network tab for API calls');
  console.log('6. Verify if updateGameImage() is called');
}

runUpdateFlowDebug().catch(console.error);
