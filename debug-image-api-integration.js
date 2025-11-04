// Comprehensive debugging script for image API integration
console.log('🔍 DEBUGGING IMAGE API INTEGRATION');
console.log('=' .repeat(60));

// Test different event IDs to understand the mapping
const testEventIds = [99, 4, 131, 1, 2, 3, 5, 10];

async function testInternalAPI(eventId) {
  console.log(`\n📡 Testing Internal API for Event ID: ${eventId}`);
  console.log('-'.repeat(40));
  
  try {
    const response = await fetch(`http://localhost:3111/api/eventimages/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_id: eventId }),
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Error: ${errorText}`);
      return null;
    }

    const data = await response.json();
    console.log(`📊 Response:`, JSON.stringify(data, null, 2));
    
    // Analyze the response
    if (Array.isArray(data)) {
      const validImages = data.filter(img => 
        img && 
        typeof img === 'object' && 
        img.id !== undefined && 
        img.image_url !== undefined &&
        img.image_url !== null &&
        img.image_url.trim() !== ''
      );
      
      console.log(`✅ Valid images found: ${validImages.length}`);
      
      if (validImages.length > 0) {
        validImages.forEach((img, index) => {
          console.log(`  Image ${index + 1}:`);
          console.log(`    ID: ${img.id}`);
          console.log(`    Event ID: ${img.event_id}`);
          console.log(`    Image URL: ${img.image_url}`);
          console.log(`    Priority: ${img.priority}`);
          console.log(`    Active: ${img.is_active}`);
        });
      }
      
      return validImages;
    } else {
      console.log(`⚠️ Response is not an array: ${typeof data}`);
      return null;
    }
    
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
    return null;
  }
}

async function testExternalAPIDirect(eventId) {
  console.log(`\n🌐 Testing External API Direct for Event ID: ${eventId}`);
  console.log('-'.repeat(40));
  
  try {
    const response = await fetch('https://ai.nibog.in/webhook/nibog/geteventwithimages/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_id: eventId }),
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Error: ${errorText}`);
      return null;
    }

    const data = await response.json();
    console.log(`📊 External API Response:`, JSON.stringify(data, null, 2));
    
    return data;
    
  } catch (error) {
    console.log(`❌ External API Error: ${error.message}`);
    return null;
  }
}

async function findEventWithImages() {
  console.log('\n🔎 SEARCHING FOR EVENTS WITH IMAGES');
  console.log('=' .repeat(60));
  
  const eventsWithImages = [];
  
  for (const eventId of testEventIds) {
    console.log(`\nTesting Event ID: ${eventId}`);
    
    const images = await testInternalAPI(eventId);
    
    if (images && images.length > 0) {
      eventsWithImages.push({
        eventId,
        imageCount: images.length,
        images: images
      });
      console.log(`✅ Event ${eventId} has ${images.length} images!`);
    } else {
      console.log(`❌ Event ${eventId} has no images`);
    }
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return eventsWithImages;
}

async function testEventIdMapping() {
  console.log('\n🗺️ TESTING EVENT ID MAPPING');
  console.log('=' .repeat(60));
  
  // Test the specific case mentioned in the issue
  console.log('\n📝 Testing the example from the issue:');
  console.log('Request event_id: 4, Expected response event_id: 131');
  
  const externalResult = await testExternalAPIDirect(4);
  if (externalResult && Array.isArray(externalResult) && externalResult.length > 0) {
    const firstImage = externalResult[0];
    console.log(`✅ Confirmed mapping: Request ID 4 → Response event_id ${firstImage.event_id}`);
    
    // Now test if we can find this image using the response event_id
    console.log(`\n🔄 Testing reverse lookup with event_id ${firstImage.event_id}`);
    const reverseResult = await testInternalAPI(firstImage.event_id);
    
    if (reverseResult && reverseResult.length > 0) {
      console.log(`✅ Reverse lookup successful!`);
    } else {
      console.log(`❌ Reverse lookup failed`);
    }
  }
}

async function runComprehensiveTest() {
  console.log('\n🚀 RUNNING COMPREHENSIVE TEST');
  console.log('=' .repeat(60));
  
  // Step 1: Find events with images
  const eventsWithImages = await findEventWithImages();
  
  // Step 2: Test event ID mapping
  await testEventIdMapping();
  
  // Step 3: Summary
  console.log('\n📋 SUMMARY');
  console.log('=' .repeat(60));
  
  if (eventsWithImages.length > 0) {
    console.log(`✅ Found ${eventsWithImages.length} events with images:`);
    eventsWithImages.forEach(event => {
      console.log(`  - Event ID ${event.eventId}: ${event.imageCount} images`);
      event.images.forEach(img => {
        console.log(`    📷 ${img.image_url} (Priority: ${img.priority})`);
      });
    });
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log(`1. Test the edit page with Event ID ${eventsWithImages[0].eventId}`);
    console.log(`2. URL: http://localhost:3111/admin/events/${eventsWithImages[0].eventId}/edit`);
    console.log('3. Verify that images and priority are loaded correctly');
    
  } else {
    console.log('❌ No events with images found in the tested range');
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('1. Create test images using the event creation page');
    console.log('2. Or expand the search range to find events with images');
    console.log('3. Check if the external API is working correctly');
  }
  
  console.log('\n🔧 NEXT STEPS:');
  console.log('1. Check the browser console on the edit page for errors');
  console.log('2. Verify the fetchExistingImages function is being called');
  console.log('3. Test with an event ID that has confirmed images');
  console.log('4. Check if there are any CORS or network issues');
}

// Run the comprehensive test
runComprehensiveTest().catch(console.error);
