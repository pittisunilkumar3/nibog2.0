// Test the mapping function directly
console.log('🔍 TESTING MAPPING FUNCTION DIRECTLY');
console.log('=' .repeat(60));

async function testMappingFunctionDirect() {
  console.log('\n1️⃣ TESTING MAPPING FUNCTION DIRECTLY');
  console.log('-'.repeat(40));
  
  try {
    // Import the mapping function
    const { fetchEventImagesWithMapping, findApiIdForEvent } = await import('./lib/eventImageMapping.ts');
    
    console.log('📡 Testing findApiIdForEvent(99)...');
    const apiId = await findApiIdForEvent(99);
    console.log(`🎯 findApiIdForEvent(99) returned: ${apiId}`);
    
    if (apiId) {
      console.log('✅ Mapping function found API ID!');
      
      console.log('📡 Testing fetchEventImagesWithMapping(99)...');
      const images = await fetchEventImagesWithMapping(99);
      console.log(`📊 fetchEventImagesWithMapping(99) returned: ${images.length} images`);
      
      if (images.length > 0) {
        console.log('✅ Mapping function returned images!');
        images.forEach((img, index) => {
          console.log(`   ${index + 1}. ${img.image_url} (Priority: ${img.priority}, ID: ${img.id})`);
        });
        return { success: true, apiId, images };
      } else {
        console.log('❌ Mapping function returned no images');
        return { success: false, apiId, images: [] };
      }
    } else {
      console.log('❌ Mapping function could not find API ID');
      return { success: false, apiId: null, images: [] };
    }
  } catch (error) {
    console.error('❌ Error testing mapping function:', error.message);
    console.error('Stack:', error.stack);
    return { success: false, apiId: null, images: [] };
  }
}

async function testDirectApiIdCall() {
  console.log('\n2️⃣ TESTING DIRECT API ID 6 CALL');
  console.log('-'.repeat(40));
  
  try {
    console.log('📡 Testing direct call to API ID 6...');
    
    const response = await fetch('http://localhost:3111/api/eventimages/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_id: 6 }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('📊 API ID 6 response:', JSON.stringify(data, null, 2));
      
      const event99Images = data.filter(img => 
        img && 
        typeof img === 'object' && 
        img.id !== undefined && 
        img.event_id === 99
      );
      
      console.log(`🎯 Event 99 images from API ID 6: ${event99Images.length}`);
      
      if (event99Images.length > 0) {
        console.log('✅ API ID 6 has Event 99 images!');
        event99Images.forEach((img, index) => {
          console.log(`   ${index + 1}. ${img.image_url} (Priority: ${img.priority}, ID: ${img.id})`);
        });
        return { success: true, images: event99Images };
      } else {
        console.log('❌ API ID 6 has no Event 99 images');
        return { success: false, images: [] };
      }
    } else {
      console.log('❌ API ID 6 call failed');
      return { success: false, images: [] };
    }
  } catch (error) {
    console.error('❌ API ID 6 call error:', error.message);
    return { success: false, images: [] };
  }
}

async function testExternalApiDirectly() {
  console.log('\n3️⃣ TESTING EXTERNAL API DIRECTLY');
  console.log('-'.repeat(40));
  
  try {
    console.log('📡 Testing external API with Event ID 6...');
    
    const response = await fetch('https://ai.nibog.in/webhook/nibog/geteventwithimages/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_id: 6 }),
    });

    console.log(`External API response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 External API response:', JSON.stringify(data, null, 2));
      
      const event99Images = data.filter(img => 
        img && 
        typeof img === 'object' && 
        img.id !== undefined && 
        img.event_id === 99
      );
      
      console.log(`🎯 Event 99 images from external API: ${event99Images.length}`);
      
      if (event99Images.length > 0) {
        console.log('✅ External API has Event 99 images!');
        return { success: true, images: event99Images };
      } else {
        console.log('❌ External API has no Event 99 images');
        return { success: false, images: [] };
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ External API failed: ${errorText}`);
      return { success: false, images: [] };
    }
  } catch (error) {
    console.error('❌ External API error:', error.message);
    return { success: false, images: [] };
  }
}

async function testMappingSystemStep() {
  console.log('\n4️⃣ TESTING MAPPING SYSTEM STEP BY STEP');
  console.log('-'.repeat(40));
  
  console.log('🔍 Step-by-step mapping system test:');
  
  // Step 1: Test range of API IDs
  console.log('\n📡 Step 1: Testing API IDs 1-10 for Event 99 images...');
  
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
        
        if (Array.isArray(data) && data.length > 0) {
          const event99Images = data.filter(img => 
            img && 
            typeof img === 'object' && 
            img.id !== undefined && 
            img.event_id === 99
          );
          
          if (event99Images.length > 0) {
            console.log(`✅ Found Event 99 images at external API ID ${apiId}: ${event99Images.length} images`);
            event99Images.forEach((img, index) => {
              console.log(`   ${index + 1}. ${img.image_url} (Priority: ${img.priority})`);
            });
            return { success: true, workingApiId: apiId, images: event99Images };
          }
        }
      }
    } catch (error) {
      // Continue searching
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('❌ No Event 99 images found in external API IDs 1-10');
  return { success: false, workingApiId: null, images: [] };
}

async function runMappingFunctionTest() {
  console.log('🚀 Starting mapping function direct test...');
  
  const mappingResult = await testMappingFunctionDirect();
  const directApiResult = await testDirectApiIdCall();
  const externalApiResult = await testExternalApiDirectly();
  const stepByStepResult = await testMappingSystemStep();
  
  console.log('\n🎯 MAPPING FUNCTION TEST RESULTS');
  console.log('=' .repeat(60));
  
  console.log('📊 TEST RESULTS:');
  console.log(`- Mapping function: ${mappingResult.success ? '✅ Working' : '❌ Failed'} (API ID: ${mappingResult.apiId})`);
  console.log(`- Direct API ID 6: ${directApiResult.success ? '✅ Working' : '❌ Failed'} (${directApiResult.images.length} images)`);
  console.log(`- External API: ${externalApiResult.success ? '✅ Working' : '❌ Failed'} (${externalApiResult.images.length} images)`);
  console.log(`- Step-by-step search: ${stepByStepResult.success ? '✅ Found' : '❌ Not found'} (API ID: ${stepByStepResult.workingApiId})`);
  
  console.log('\n🔧 DIAGNOSIS:');
  
  if (stepByStepResult.success) {
    console.log(`✅ EVENT 99 IMAGES EXIST AT EXTERNAL API ID ${stepByStepResult.workingApiId}`);
    
    if (!mappingResult.success) {
      console.log('❌ BUT: Mapping function is not working correctly');
      console.log('💡 The mapping function might have bugs or wrong search logic');
      console.log('🔧 Need to fix the mapping function implementation');
    }
    
    if (!directApiResult.success) {
      console.log('❌ AND: Internal API is not using the mapping correctly');
      console.log('💡 The internal API route might not be calling the mapping function properly');
    }
    
  } else {
    console.log('❌ NO EVENT 99 IMAGES FOUND IN EXTERNAL API');
    console.log('💡 Event 99 might not have images, or they might be at different API IDs');
    console.log('🔧 Create some test images first or expand search range');
  }
  
  console.log('\n🔧 SOLUTION:');
  
  if (stepByStepResult.success) {
    console.log(`✅ WORKING API ID FOUND: ${stepByStepResult.workingApiId}`);
    console.log('🔧 Fix the mapping function to correctly find this API ID');
    console.log('🔧 Ensure the internal API route uses the mapping correctly');
    console.log('🔧 Test the edit page after fixing the mapping');
    
  } else {
    console.log('⚠️ NO WORKING API ID FOUND');
    console.log('🔧 Create test images for Event 99 first');
    console.log('🔧 Use the working update API to create images');
    console.log('🔧 Then test the mapping system again');
  }
  
  console.log('\n🎪 NEXT STEPS:');
  if (stepByStepResult.success && !mappingResult.success) {
    console.log('1. 🔧 Debug and fix the mapping function');
    console.log('2. 🔧 Ensure it finds the correct API ID');
    console.log('3. 🔧 Test the internal API route');
    console.log('4. 🔧 Test the edit page functionality');
  } else if (!stepByStepResult.success) {
    console.log('1. 🔧 Create test images for Event 99');
    console.log('2. 🔧 Verify images are created correctly');
    console.log('3. 🔧 Re-run mapping tests');
  }
}

runMappingFunctionTest().catch(console.error);
