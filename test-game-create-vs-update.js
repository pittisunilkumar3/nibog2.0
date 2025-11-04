// Test game image create vs update endpoints
console.log('🔄 TESTING GAME IMAGE CREATE VS UPDATE');
console.log('=' .repeat(60));

async function testCreateEndpoint() {
  console.log('\n1️⃣ TESTING CREATE ENDPOINT');
  console.log('-'.repeat(40));
  
  const createPayload = {
    game_id: 9,
    image_url: "./upload/gamesimage/test_create_image.jpg",
    priority: 5,
    is_active: true
  };
  
  try {
    console.log('📡 Testing create endpoint with payload:', createPayload);
    
    const response = await fetch('https://ai.nibog.in/webhook/nibog/gamesimage/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createPayload),
    });

    console.log(`Create endpoint status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Create endpoint response:', JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ Create endpoint error: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('❌ Create endpoint network error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testUpdateEndpoint() {
  console.log('\n2️⃣ TESTING UPDATE ENDPOINT');
  console.log('-'.repeat(40));
  
  const updatePayload = {
    game_id: 9,
    image_url: "./upload/gamesimage/test_update_image.jpg",
    priority: 3,
    is_active: true
  };
  
  try {
    console.log('📡 Testing update endpoint with payload:', updatePayload);
    
    const response = await fetch('https://ai.nibog.in/webhook/nibog/gamesimage/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });

    console.log(`Update endpoint status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Update endpoint response:', JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ Update endpoint error: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('❌ Update endpoint network error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testInternalCreateAPI() {
  console.log('\n3️⃣ TESTING INTERNAL CREATE API');
  console.log('-'.repeat(40));
  
  const createPayload = {
    game_id: 9,
    image_url: "./upload/gamesimage/internal_test_create.jpg",
    priority: 4,
    is_active: true
  };
  
  try {
    console.log('📡 Testing internal create API:', createPayload);
    
    const response = await fetch('http://localhost:3111/api/gamesimage/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createPayload),
    });

    console.log(`Internal create API status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Internal create API response:', JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ Internal create API error: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('❌ Internal create API network error:', error.message);
    return { success: false, error: error.message };
  }
}

async function analyzeEndpointDifferences() {
  console.log('\n4️⃣ ANALYZING ENDPOINT DIFFERENCES');
  console.log('-'.repeat(40));
  
  console.log('🔍 ENDPOINT COMPARISON:');
  console.log('');
  console.log('CREATE ENDPOINT:');
  console.log('- URL: https://ai.nibog.in/webhook/nibog/gamesimage/create');
  console.log('- Purpose: Create new game image records');
  console.log('- Used when: No existing images for the game');
  console.log('');
  console.log('UPDATE ENDPOINT:');
  console.log('- URL: https://ai.nibog.in/webhook/nibog/gamesimage/update');
  console.log('- Purpose: Update existing game image records');
  console.log('- Used when: Game already has images');
  console.log('');
  console.log('🤔 POTENTIAL ISSUES:');
  console.log('1. Update endpoint might not exist or be implemented');
  console.log('2. Update endpoint might require different payload format');
  console.log('3. Update endpoint might need additional fields (like image ID)');
  console.log('4. External system might not support updates, only creates');
}

async function proposeFixStrategies() {
  console.log('\n5️⃣ PROPOSED FIX STRATEGIES');
  console.log('-'.repeat(40));
  
  console.log('💡 STRATEGY 1: Always Use Create Endpoint');
  console.log('- Delete existing image first');
  console.log('- Then create new image record');
  console.log('- Simpler but requires two API calls');
  console.log('');
  console.log('💡 STRATEGY 2: Fix Update Endpoint');
  console.log('- Investigate what the update endpoint expects');
  console.log('- Might need image ID in payload');
  console.log('- Might need different payload structure');
  console.log('');
  console.log('💡 STRATEGY 3: Conditional Logic');
  console.log('- Use create endpoint if update fails');
  console.log('- Fallback mechanism for reliability');
  console.log('- Best of both worlds');
}

async function runCreateVsUpdateTest() {
  const createResult = await testCreateEndpoint();
  const updateResult = await testUpdateEndpoint();
  const internalCreateResult = await testInternalCreateAPI();
  
  await analyzeEndpointDifferences();
  await proposeFixStrategies();
  
  console.log('\n🎯 TEST RESULTS SUMMARY');
  console.log('=' .repeat(60));
  
  console.log('📊 ENDPOINT TEST RESULTS:');
  console.log(`- External Create: ${createResult.success ? '✅ Working' : '❌ Failed'}`);
  console.log(`- External Update: ${updateResult.success ? '✅ Working' : '❌ Failed'}`);
  console.log(`- Internal Create: ${internalCreateResult.success ? '✅ Working' : '❌ Failed'}`);
  
  console.log('\n🔧 RECOMMENDED FIX:');
  
  if (createResult.success && !updateResult.success) {
    console.log('✅ CREATE WORKS, UPDATE FAILS');
    console.log('💡 SOLUTION: Modify update logic to use create endpoint');
    console.log('1. Delete existing image record first');
    console.log('2. Create new image record with updated data');
    console.log('3. This mimics an "update" operation');
  } else if (!createResult.success && !updateResult.success) {
    console.log('❌ BOTH ENDPOINTS FAIL');
    console.log('💡 SOLUTION: Check external API documentation');
    console.log('1. Verify correct endpoint URLs');
    console.log('2. Check required payload format');
    console.log('3. Ensure external system is operational');
  } else if (createResult.success && updateResult.success) {
    console.log('✅ BOTH ENDPOINTS WORK');
    console.log('💡 SOLUTION: Check internal API implementation');
    console.log('1. Verify internal update API is calling external correctly');
    console.log('2. Check for payload formatting issues');
    console.log('3. Review error handling logic');
  }
  
  console.log('\n🔧 NEXT STEPS:');
  console.log('1. Implement the recommended fix');
  console.log('2. Test the updated functionality');
  console.log('3. Verify end-to-end update flow works');
}

runCreateVsUpdateTest().catch(console.error);
