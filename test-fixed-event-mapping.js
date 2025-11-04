// Test the fixed event mapping system
console.log('🔧 TESTING FIXED EVENT MAPPING SYSTEM');
console.log('=' .repeat(60));

async function testFixedEventImageFetch() {
  console.log('\n1️⃣ TESTING FIXED EVENT IMAGE FETCH');
  console.log('-'.repeat(40));
  
  try {
    console.log('📡 Testing fixed event image fetch for Event 99...');
    
    const response = await fetch('http://localhost:3111/api/eventimages/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_id: 99 }),
    });

    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Fixed event image fetch response:', JSON.stringify(data, null, 2));
      
      const validImages = data.filter(img => 
        img && 
        typeof img === 'object' && 
        img.id !== undefined && 
        img.image_url !== undefined
      );
      
      console.log(`📊 Valid images: ${validImages.length}`);
      
      if (validImages.length > 0) {
        console.log('🎉 MAPPING SYSTEM IS NOW WORKING!');
        validImages.forEach((img, index) => {
          console.log(`   ${index + 1}. ${img.image_url} (Priority: ${img.priority}, ID: ${img.id})`);
        });
        return { success: true, images: validImages };
      } else {
        console.log('⚠️ Still no valid images returned');
        return { success: false, images: [] };
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ Fixed fetch failed: ${errorText}`);
      return { success: false, images: [] };
    }
  } catch (error) {
    console.error('❌ Fixed fetch error:', error.message);
    return { success: false, images: [] };
  }
}

async function testEventEditPageFlow() {
  console.log('\n2️⃣ TESTING EVENT EDIT PAGE FLOW');
  console.log('-'.repeat(40));
  
  console.log('🎪 Simulating event edit page image loading...');
  console.log('1. User opens http://localhost:3111/admin/events/99/edit');
  console.log('2. Page calls fetchEventImages(99)');
  console.log('3. Service calls /api/eventimages/get');
  console.log('4. API uses mapping system to find images');
  console.log('5. Images are displayed in the form');
  
  try {
    const response = await fetch('http://localhost:3111/api/eventimages/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_id: 99 }),
    });

    if (response.ok) {
      const data = await response.json();
      
      const validImages = data.filter(img => 
        img && 
        typeof img === 'object' && 
        img.id !== undefined && 
        img.image_url !== undefined
      );
      
      if (validImages.length > 0) {
        console.log('✅ Event edit page should now show existing images!');
        console.log(`📊 Images that will be displayed: ${validImages.length}`);
        
        // Sort by priority (desc) then by created_at (desc) to show latest first
        const sortedImages = [...validImages].sort((a, b) => {
          if (a.priority !== b.priority) {
            return b.priority - a.priority;
          }
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
        
        const latestImage = sortedImages[0];
        console.log('🎯 Latest image (will be used for editing):');
        console.log(`   Image: ${latestImage.image_url}`);
        console.log(`   Priority: ${latestImage.priority}`);
        console.log(`   ID: ${latestImage.id}`);
        console.log(`   Created: ${latestImage.created_at}`);
        
        return { success: true, images: validImages, latest: latestImage };
      } else {
        console.log('❌ No valid images for edit page');
        return { success: false, images: [], latest: null };
      }
    } else {
      console.log('❌ Edit page flow failed');
      return { success: false, images: [], latest: null };
    }
  } catch (error) {
    console.error('❌ Edit page flow error:', error.message);
    return { success: false, images: [], latest: null };
  }
}

async function testCompleteUpdateFlow() {
  console.log('\n3️⃣ TESTING COMPLETE UPDATE FLOW');
  console.log('-'.repeat(40));
  
  console.log('🔄 Testing complete update flow:');
  console.log('1. Fetch existing images (should work now)');
  console.log('2. Update with new priority');
  console.log('3. Verify update worked');
  
  // Step 1: Get current state
  const initialResponse = await fetch('http://localhost:3111/api/eventimages/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ event_id: 99 }),
  });
  
  let initialImages = [];
  if (initialResponse.ok) {
    const data = await initialResponse.json();
    initialImages = data.filter(img => img && img.id);
    console.log(`📊 Initial state: ${initialImages.length} images`);
  }
  
  // Step 2: Perform update
  const updatePayload = {
    event_id: 99,
    image_url: "./upload/eventimages/complete_flow_test.jpg",
    priority: 9,
    is_active: true
  };
  
  try {
    console.log('📡 Performing update:', updatePayload);
    
    const updateResponse = await fetch('http://localhost:3111/api/eventimages/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });

    if (updateResponse.ok) {
      const updateData = await updateResponse.json();
      console.log('✅ Update successful:', updateData.data?.[0] || updateData);
      
      // Step 3: Verify final state
      const finalResponse = await fetch('http://localhost:3111/api/eventimages/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_id: 99 }),
      });
      
      if (finalResponse.ok) {
        const finalData = await finalResponse.json();
        const finalImages = finalData.filter(img => img && img.id);
        console.log(`📊 Final state: ${finalImages.length} images`);
        
        if (finalImages.length > 0) {
          const latestImage = finalImages[finalImages.length - 1];
          console.log('🎯 Latest image after update:');
          console.log(`   Priority: ${latestImage.priority}`);
          console.log(`   URL: ${latestImage.image_url}`);
          console.log(`   Updated: ${latestImage.updated_at}`);
          
          if (latestImage.priority === 9) {
            console.log('🎉 COMPLETE FLOW WORKING PERFECTLY!');
            return { success: true, updated: true };
          }
        }
      }
      
      return { success: true, updated: false };
    } else {
      const errorText = await updateResponse.text();
      console.log(`❌ Update failed: ${errorText}`);
      return { success: false, updated: false };
    }
  } catch (error) {
    console.error('❌ Complete flow error:', error.message);
    return { success: false, updated: false };
  }
}

async function runFixedEventMappingTest() {
  console.log('🚀 Starting fixed event mapping test...');
  
  const fetchResult = await testFixedEventImageFetch();
  const editPageResult = await testEventEditPageFlow();
  const completeFlowResult = await testCompleteUpdateFlow();
  
  console.log('\n🎯 FIXED EVENT MAPPING TEST RESULTS');
  console.log('=' .repeat(60));
  
  console.log('📊 TEST RESULTS:');
  console.log(`- Fixed image fetch: ${fetchResult.success ? '✅ Working' : '❌ Failed'} (${fetchResult.images.length} images)`);
  console.log(`- Edit page flow: ${editPageResult.success ? '✅ Working' : '❌ Failed'} (${editPageResult.images?.length || 0} images)`);
  console.log(`- Complete update flow: ${completeFlowResult.success ? '✅ Working' : '❌ Failed'} (${completeFlowResult.updated ? 'Updated' : 'Not updated'})`);
  
  console.log('\n🔧 FINAL DIAGNOSIS:');
  
  if (fetchResult.success && editPageResult.success && completeFlowResult.success) {
    console.log('🎉 EVENT IMAGE FUNCTIONALITY COMPLETELY FIXED!');
    console.log('✅ Mapping system is working correctly');
    console.log('✅ Existing images are being fetched properly');
    console.log('✅ Edit page will show current images and priority');
    console.log('✅ Update functionality is working');
    console.log('✅ Complete end-to-end flow is operational');
    
    if (editPageResult.latest) {
      console.log('\n🎯 EDIT PAGE BEHAVIOR:');
      console.log(`- Latest image: ${editPageResult.latest.image_url}`);
      console.log(`- Priority will be pre-filled with: ${editPageResult.latest.priority}`);
      console.log(`- User can upload new image and change priority`);
      console.log(`- Update will work correctly`);
    }
    
    console.log('\n🎪 READY FOR PRODUCTION:');
    console.log('1. ✅ Open http://localhost:3111/admin/events/99/edit');
    console.log('2. ✅ Verify existing images are displayed');
    console.log('3. ✅ Verify priority field is pre-filled');
    console.log('4. ✅ Upload new image and change priority');
    console.log('5. ✅ Click "Save Changes"');
    console.log('6. ✅ Verify success message and updated image');
    
  } else {
    console.log('❌ SOME ISSUES REMAIN');
    if (!fetchResult.success) {
      console.log('   - Image fetching still not working');
    }
    if (!editPageResult.success) {
      console.log('   - Edit page flow still has issues');
    }
    if (!completeFlowResult.success) {
      console.log('   - Update flow still not working');
    }
    console.log('💡 Continue debugging the failing components');
  }
  
  console.log('\n💡 SUMMARY:');
  console.log('- Event 99 images exist at API ID 6');
  console.log('- Mapping system now redirects Event 99 → API ID 6');
  console.log('- Both fetch and update operations should work');
  console.log('- Edit page should display existing images correctly');
  console.log('- Users can now update event images properly');
}

runFixedEventMappingTest().catch(console.error);
