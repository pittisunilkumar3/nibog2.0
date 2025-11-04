// Debug the real update issue - why update endpoint is failing
console.log('🔍 DEBUGGING REAL UPDATE ENDPOINT ISSUE');
console.log('=' .repeat(60));

async function testUpdateEndpointWithCorrectPayload() {
  console.log('\n1️⃣ TESTING UPDATE ENDPOINT WITH EXACT API DOCUMENTATION FORMAT');
  console.log('-'.repeat(40));
  
  // Use the exact payload format from the API documentation
  const correctPayload = {
    game_id: 131,
    image_url: "./upload/gameimages/gameimage_1757947801601_4538.png",
    priority: 1,
    is_active: true
  };
  
  try {
    console.log('📡 Testing with API documentation payload:', correctPayload);
    
    const response = await fetch('https://ai.nibog.in/webhook/nibog/gamesimage/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(correctPayload),
    });

    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Update endpoint works with correct payload!');
      console.log('Response:', JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ Update endpoint still fails: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testWithGame9ExistingImage() {
  console.log('\n2️⃣ TESTING UPDATE WITH EXISTING GAME 9 IMAGE');
  console.log('-'.repeat(40));
  
  // First get the existing image for Game 9
  try {
    const getResponse = await fetch('http://localhost:3111/api/gamesimage/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ game_id: 9 }),
    });

    if (getResponse.ok) {
      const existingImages = await getResponse.json();
      console.log('📊 Existing Game 9 images:', existingImages.length);
      
      if (existingImages.length > 0) {
        const firstImage = existingImages[0];
        console.log('🎯 Using first existing image for update test:', {
          id: firstImage.id,
          game_id: firstImage.game_id,
          current_priority: firstImage.priority
        });
        
        // Try to update this existing image
        const updatePayload = {
          game_id: firstImage.game_id,
          image_url: firstImage.image_url,
          priority: firstImage.priority + 1, // Increment priority to test update
          is_active: true
        };
        
        console.log('📡 Attempting update with existing image data:', updatePayload);
        
        const updateResponse = await fetch('https://ai.nibog.in/webhook/nibog/gamesimage/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatePayload),
        });

        console.log(`Update response status: ${updateResponse.status}`);
        
        if (updateResponse.ok) {
          const updateData = await updateResponse.json();
          console.log('✅ Update successful with existing image!');
          console.log('Update response:', JSON.stringify(updateData, null, 2));
          return { success: true, data: updateData };
        } else {
          const errorText = await updateResponse.text();
          console.log(`❌ Update failed with existing image: ${errorText}`);
          return { success: false, error: errorText };
        }
      } else {
        console.log('❌ No existing images found for Game 9');
        return { success: false, error: 'No existing images' };
      }
    }
  } catch (error) {
    console.error('❌ Error testing with existing image:', error.message);
    return { success: false, error: error.message };
  }
}

async function analyzePayloadDifferences() {
  console.log('\n3️⃣ ANALYZING PAYLOAD DIFFERENCES');
  console.log('-'.repeat(40));
  
  console.log('🔍 COMPARING PAYLOADS:');
  console.log('');
  console.log('API DOCUMENTATION FORMAT:');
  console.log('{');
  console.log('  "game_id": 131,');
  console.log('  "image_url": "./upload/gameimages/gameimage_1757947801601_4538.png",');
  console.log('  "priority": 1,');
  console.log('  "is_active": true');
  console.log('}');
  console.log('');
  console.log('OUR CURRENT FORMAT:');
  console.log('{');
  console.log('  "game_id": 9,');
  console.log('  "image_url": "./upload/gamesimage/test_image.jpg",');
  console.log('  "priority": 2,');
  console.log('  "is_active": true');
  console.log('}');
  console.log('');
  console.log('🤔 POTENTIAL DIFFERENCES:');
  console.log('1. Directory path: "gameimages" vs "gamesimage"');
  console.log('2. Game ID: 131 vs 9 (might need specific game)');
  console.log('3. Image filename format: might need specific format');
  console.log('4. Update might require existing image ID');
}

async function testDirectoryPathIssue() {
  console.log('\n4️⃣ TESTING DIRECTORY PATH ISSUE');
  console.log('-'.repeat(40));
  
  // Test with the correct directory path from API docs
  const correctPathPayload = {
    game_id: 9,
    image_url: "./upload/gameimages/test_correct_path.png", // Note: gameimages not gamesimage
    priority: 5,
    is_active: true
  };
  
  try {
    console.log('📡 Testing with correct directory path:', correctPathPayload);
    
    const response = await fetch('https://ai.nibog.in/webhook/nibog/gamesimage/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(correctPathPayload),
    });

    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Directory path was the issue!');
      console.log('Response:', JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ Still fails with correct path: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function runRealUpdateDebug() {
  const docPayloadResult = await testUpdateEndpointWithCorrectPayload();
  const existingImageResult = await testWithGame9ExistingImage();
  const correctPathResult = await testDirectoryPathIssue();
  await analyzePayloadDifferences();
  
  console.log('\n🎯 REAL UPDATE ISSUE ANALYSIS');
  console.log('=' .repeat(60));
  
  console.log('📊 TEST RESULTS:');
  console.log(`- API doc payload: ${docPayloadResult.success ? '✅ Works' : '❌ Fails'}`);
  console.log(`- Existing image update: ${existingImageResult.success ? '✅ Works' : '❌ Fails'}`);
  console.log(`- Correct directory path: ${correctPathResult.success ? '✅ Works' : '❌ Fails'}`);
  
  console.log('\n🔧 DIAGNOSIS:');
  
  if (docPayloadResult.success) {
    console.log('✅ UPDATE ENDPOINT WORKS WITH CORRECT PAYLOAD!');
    console.log('💡 The issue is in our payload format or data');
    console.log('🎯 Need to fix our internal API to match working format');
  } else if (correctPathResult.success) {
    console.log('✅ DIRECTORY PATH WAS THE ISSUE!');
    console.log('💡 Need to use "./upload/gameimages/" not "./upload/gamesimage/"');
    console.log('🎯 Fix the path in our upload and API calls');
  } else {
    console.log('❌ UPDATE ENDPOINT HAS FUNDAMENTAL ISSUES');
    console.log('💡 All test formats failed');
    console.log('🎯 May need to contact API provider or use alternative approach');
  }
  
  console.log('\n🔧 NEXT STEPS:');
  if (docPayloadResult.success || correctPathResult.success) {
    console.log('1. ✅ Update endpoint CAN work');
    console.log('2. 🔧 Fix our payload format to match working version');
    console.log('3. 🔧 Update internal API route');
    console.log('4. 🔧 Test with real game edit page');
    console.log('5. ✅ Implement proper UPDATE (not INSERT) functionality');
  } else {
    console.log('1. ❌ Update endpoint appears broken');
    console.log('2. 🔧 Contact API provider for support');
    console.log('3. 🔧 Or implement workaround with delete+create');
  }
}

runRealUpdateDebug().catch(console.error);
