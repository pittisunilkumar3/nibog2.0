// Test event update payload issue
console.log('🔍 TESTING EVENT UPDATE PAYLOAD ISSUE');
console.log('=' .repeat(60));

async function testCurrentEventUpdatePayload() {
  console.log('\n1️⃣ TESTING CURRENT EVENT UPDATE PAYLOAD');
  console.log('-'.repeat(40));
  
  // Current payload format (what we're sending)
  const currentPayload = {
    event_id: 99,
    image_url: "./upload/eventimages/test_current_format.jpg", // Local path
    priority: 1,
    is_active: true
  };
  
  try {
    console.log('📡 Testing current payload format:', currentPayload);
    
    const response = await fetch('https://ai.nibog.in/webhook/nibog/eventimage/updated', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentPayload),
    });

    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Current payload works!');
      console.log('Response:', JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ Current payload failed: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testDocumentationPayload() {
  console.log('\n2️⃣ TESTING API DOCUMENTATION PAYLOAD');
  console.log('-'.repeat(40));
  
  // API documentation format (what should be sent)
  const docPayload = {
    event_id: 99,
    image_url: "https://example.com/images/sunil.jpg", // HTTP URL
    priority: 1,
    is_active: true
  };
  
  try {
    console.log('📡 Testing API documentation payload:', docPayload);
    
    const response = await fetch('https://ai.nibog.in/webhook/nibog/eventimage/updated', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(docPayload),
    });

    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Documentation payload works!');
      console.log('Response:', JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ Documentation payload failed: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testInternalEventUpdateAPI() {
  console.log('\n3️⃣ TESTING INTERNAL EVENT UPDATE API');
  console.log('-'.repeat(40));
  
  const internalPayload = {
    event_id: 99,
    image_url: "./upload/eventimages/internal_test.jpg",
    priority: 2,
    is_active: true
  };
  
  try {
    console.log('📡 Testing internal event update API:', internalPayload);
    
    const response = await fetch('http://localhost:3111/api/eventimages/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(internalPayload),
    });

    console.log(`Internal API response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Internal event update API works!');
      console.log('Response:', JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ Internal event update API failed: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('❌ Internal API Network Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function analyzePayloadDifferences() {
  console.log('\n4️⃣ ANALYZING PAYLOAD DIFFERENCES');
  console.log('-'.repeat(40));
  
  console.log('🔍 PAYLOAD COMPARISON:');
  console.log('');
  console.log('API DOCUMENTATION FORMAT:');
  console.log('{');
  console.log('  "event_id": 99,');
  console.log('  "image_url": "https://example.com/images/sunil.jpg",  // ← HTTP URL');
  console.log('  "priority": 1,');
  console.log('  "is_active": true');
  console.log('}');
  console.log('');
  console.log('CURRENT IMPLEMENTATION:');
  console.log('{');
  console.log('  "event_id": 99,');
  console.log('  "image_url": "./upload/eventimages/filename.jpg",  // ← Local path');
  console.log('  "priority": 1,');
  console.log('  "is_active": true');
  console.log('}');
  console.log('');
  console.log('🤔 KEY DIFFERENCES:');
  console.log('1. image_url format: HTTP URL vs Local file path');
  console.log('2. API might expect publicly accessible URLs');
  console.log('3. Local paths might not be resolvable by external system');
  console.log('4. Need to convert local paths to HTTP URLs');
}

async function testWithHttpUrl() {
  console.log('\n5️⃣ TESTING WITH HTTP URL FORMAT');
  console.log('-'.repeat(40));
  
  // Convert local path to HTTP URL format
  const httpPayload = {
    event_id: 99,
    image_url: "http://localhost:3111/upload/eventimages/test_http_format.jpg", // HTTP URL
    priority: 3,
    is_active: true
  };
  
  try {
    console.log('📡 Testing with HTTP URL format:', httpPayload);
    
    const response = await fetch('https://ai.nibog.in/webhook/nibog/eventimage/updated', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(httpPayload),
    });

    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ HTTP URL format works!');
      console.log('Response:', JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ HTTP URL format failed: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('❌ HTTP URL Network Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function runEventPayloadTest() {
  const currentResult = await testCurrentEventUpdatePayload();
  const docResult = await testDocumentationPayload();
  const internalResult = await testInternalEventUpdateAPI();
  const httpResult = await testWithHttpUrl();
  await analyzePayloadDifferences();
  
  console.log('\n🎯 EVENT UPDATE PAYLOAD ANALYSIS');
  console.log('=' .repeat(60));
  
  console.log('📊 PAYLOAD TEST RESULTS:');
  console.log(`- Current payload (local path): ${currentResult.success ? '✅ Works' : '❌ Failed'}`);
  console.log(`- Documentation payload (HTTP URL): ${docResult.success ? '✅ Works' : '❌ Failed'}`);
  console.log(`- Internal API: ${internalResult.success ? '✅ Works' : '❌ Failed'}`);
  console.log(`- HTTP URL format: ${httpResult.success ? '✅ Works' : '❌ Failed'}`);
  
  console.log('\n🔧 DIAGNOSIS:');
  
  if (docResult.success || httpResult.success) {
    console.log('✅ PAYLOAD FORMAT IS THE ISSUE!');
    console.log('💡 External API expects HTTP URLs, not local file paths');
    console.log('🎯 Need to convert local paths to HTTP URLs in the API route');
    
    const workingFormat = docResult.success ? 'Documentation format' : 'HTTP URL format';
    console.log(`🔧 Working format: ${workingFormat}`);
    
  } else if (currentResult.success) {
    console.log('✅ CURRENT PAYLOAD WORKS');
    console.log('💡 The issue might be elsewhere (not payload format)');
    console.log('🎯 Check other aspects like endpoint URL or request headers');
    
  } else {
    console.log('❌ ALL PAYLOAD FORMATS FAILED');
    console.log('💡 The issue might be with the endpoint itself');
    console.log('🎯 Check if the external endpoint is working at all');
  }
  
  console.log('\n🔧 NEXT STEPS:');
  if (docResult.success || httpResult.success) {
    console.log('1. ✅ Update /api/eventimages/update/route.ts');
    console.log('2. ✅ Convert local paths to HTTP URLs before sending');
    console.log('3. ✅ Test the updated event update functionality');
    console.log('4. ✅ Verify http://localhost:3111/admin/events/99/edit works');
  } else {
    console.log('1. 🔧 Investigate external endpoint availability');
    console.log('2. 🔧 Check if endpoint is active and registered');
    console.log('3. 🔧 Consider alternative approaches');
  }
}

runEventPayloadTest().catch(console.error);
