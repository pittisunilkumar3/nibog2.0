// Test script for event image fetching
console.log('🧪 Testing Event Image Fetch');
console.log('=' .repeat(50));

// Test the API call that should work
async function testEventImageFetch() {
  console.log('\n1️⃣ Testing Event Image Fetch API');
  console.log('-'.repeat(30));

  const testPayload = {
    event_id: 99  // Using the event ID from the URL
  };

  console.log('📤 Test Payload:');
  console.log(JSON.stringify(testPayload, null, 2));

  try {
    console.log('\n📍 Making request to: /api/eventimages/get');
    
    // Simulate the API call that the frontend makes
    const response = await fetch('http://localhost:3111/api/eventimages/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    console.log(`\n📊 Response Status: ${response.status}`);
    console.log(`📊 Response Status Text: ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }

    const data = await response.json();
    console.log('\n✅ API Response:');
    console.log(JSON.stringify(data, null, 2));

    // Analyze the response
    if (Array.isArray(data)) {
      console.log(`\n📋 Analysis: Found ${data.length} images`);
      data.forEach((img, index) => {
        console.log(`  Image ${index + 1}:`);
        console.log(`    - ID: ${img.id}`);
        console.log(`    - Event ID: ${img.event_id}`);
        console.log(`    - Image URL: ${img.image_url}`);
        console.log(`    - Priority: ${img.priority}`);
        console.log(`    - Active: ${img.is_active}`);
        console.log(`    - Created: ${img.created_at}`);
        console.log(`    - Updated: ${img.updated_at}`);
      });
    } else {
      console.log('\n📋 Analysis: Response is not an array');
      console.log('Response type:', typeof data);
      console.log('Response keys:', Object.keys(data));
    }

  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

// Test with different event IDs
async function testMultipleEvents() {
  console.log('\n\n2️⃣ Testing Multiple Event IDs');
  console.log('-'.repeat(30));

  const eventIds = [99, 4, 131]; // Different event IDs to test

  for (const eventId of eventIds) {
    console.log(`\n🔍 Testing Event ID: ${eventId}`);
    
    try {
      const response = await fetch('http://localhost:3111/api/eventimages/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_id: eventId }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`  ✅ Event ${eventId}: Found ${Array.isArray(data) ? data.length : 'unknown'} images`);
        
        if (Array.isArray(data) && data.length > 0) {
          const firstImage = data[0];
          console.log(`    📷 First image: ${firstImage.image_url} (Priority: ${firstImage.priority})`);
        }
      } else {
        console.log(`  ❌ Event ${eventId}: API error ${response.status}`);
      }
    } catch (error) {
      console.log(`  ❌ Event ${eventId}: Network error - ${error.message}`);
    }
  }
}

// Test the external API directly (this might fail due to CORS)
async function testExternalAPI() {
  console.log('\n\n3️⃣ Testing External API Direct Call');
  console.log('-'.repeat(30));

  const testPayload = {
    event_id: 4  // Using the event ID from the example
  };

  console.log('📤 External API Payload:');
  console.log(JSON.stringify(testPayload, null, 2));

  try {
    console.log('\n📍 Making request to: https://ai.nibog.in/webhook/nibog/geteventwithimages/get');
    
    const response = await fetch('https://ai.nibog.in/webhook/nibog/geteventwithimages/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    console.log(`\n📊 External API Response Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ External API Response:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('\n❌ External API Error:', errorText);
    }

  } catch (error) {
    console.log('\n❌ External API Network Error:', error.message);
    console.log('This is expected if running from Node.js due to CORS restrictions');
  }
}

// Run all tests
async function runAllTests() {
  await testEventImageFetch();
  await testMultipleEvents();
  await testExternalAPI();
  
  console.log('\n\n🎯 DEBUGGING SUMMARY');
  console.log('=' .repeat(50));
  console.log('1. Check if the internal API (/api/eventimages/get) is working');
  console.log('2. Verify the external API is returning data for the event ID');
  console.log('3. Check browser console for any JavaScript errors');
  console.log('4. Verify the event ID 99 has images in the external system');
  console.log('\n💡 If no images are found, try creating an image first in the event edit page');
}

// Only run if this is being executed directly
if (typeof window === 'undefined') {
  runAllTests().catch(console.error);
} else {
  console.log('This script should be run with Node.js, not in the browser');
}
