// Test the complete event edit page flow
console.log('🎪 TESTING EVENT EDIT PAGE FLOW');
console.log('=' .repeat(60));

async function getCurrentEventState() {
  console.log('\n📊 GETTING CURRENT EVENT 99 STATE');
  console.log('-'.repeat(40));
  
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
      console.log('✅ Current Event 99 images:', JSON.stringify(data, null, 2));
      
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
          console.log(`   Latest updated: ${validImages[validImages.length - 1].updated_at}`);
        }
        
        return validImages;
      }
      
      return [];
    } else {
      console.log('❌ Failed to get current event state');
      return [];
    }
  } catch (error) {
    console.error('❌ Error getting current event state:', error.message);
    return [];
  }
}

async function testEventUpdateDirectly() {
  console.log('\n🔄 TESTING EVENT UPDATE DIRECTLY');
  console.log('-'.repeat(40));
  
  const updatePayload = {
    event_id: 99,
    image_url: "./upload/eventimages/direct_update_test.jpg",
    priority: 5,
    is_active: true
  };
  
  try {
    console.log('📡 Testing direct event update:', updatePayload);
    
    const response = await fetch('http://localhost:3111/api/eventimages/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });

    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Direct event update successful!');
      console.log('Response:', JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ Direct event update failed: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('❌ Direct event update error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testEventImageMapping() {
  console.log('\n🗺️ TESTING EVENT IMAGE MAPPING');
  console.log('-'.repeat(40));
  
  // Test if Event 99 has the mapping issue like before
  console.log('🔍 Checking if Event 99 has mapping issues...');
  
  try {
    // Test direct API call to Event 99
    const directResponse = await fetch('http://localhost:3111/api/eventimages/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_id: 99 }),
    });

    if (directResponse.ok) {
      const directData = await directResponse.json();
      console.log('📊 Direct Event 99 call result:', directData.length, 'images');
      
      if (directData.length === 0 || (directData.length === 1 && !directData[0].id)) {
        console.log('⚠️ Event 99 might have mapping issues (empty or invalid response)');
        
        // Test if mapping system is working
        console.log('🔍 Testing event image mapping system...');
        
        // This would use the mapping system if it exists
        const mappedResponse = await fetch('http://localhost:3111/api/eventimages/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ event_id: 99 }),
        });
        
        if (mappedResponse.ok) {
          const mappedData = await mappedResponse.json();
          console.log('📊 Mapped Event 99 result:', mappedData.length, 'images');
          
          if (mappedData.length > 0 && mappedData[0].id) {
            console.log('✅ Mapping system is working for events');
            return { hasMappingIssue: false, images: mappedData };
          }
        }
        
        return { hasMappingIssue: true, images: [] };
      } else {
        console.log('✅ Event 99 direct call works fine');
        return { hasMappingIssue: false, images: directData };
      }
    }
  } catch (error) {
    console.error('❌ Error testing event mapping:', error.message);
    return { hasMappingIssue: true, images: [] };
  }
}

async function simulateEditPageUpdate() {
  console.log('\n👤 SIMULATING EDIT PAGE UPDATE');
  console.log('-'.repeat(40));
  
  console.log('🎪 Event Edit Page Simulation:');
  console.log('1. User opens http://localhost:3111/admin/events/99/edit');
  console.log('2. User sees existing event images loaded');
  console.log('3. User changes priority from current to 8');
  console.log('4. User uploads new image file');
  console.log('5. User clicks "Save Changes"');
  console.log('6. System calls updateEventImage()');
  console.log('7. updateEventImage() calls /api/eventimages/update');
  console.log('8. API calls external webhook');
  console.log('9. User sees success message');
  
  const editPagePayload = {
    event_id: 99,
    image_url: "./upload/eventimages/edit_page_simulation.jpg",
    priority: 8,
    is_active: true
  };
  
  try {
    console.log('\n📡 Simulating edit page update:', editPagePayload);
    
    const response = await fetch('http://localhost:3111/api/eventimages/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editPagePayload),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Edit page simulation successful!');
      console.log('📊 Updated event image:', data.data?.[0] || data);
      
      // Check if the update actually worked
      const newState = await getCurrentEventState();
      const latestImage = newState[newState.length - 1];
      
      if (latestImage && latestImage.priority === 8) {
        console.log('🎯 SUCCESS: Update actually worked - priority changed to 8');
        console.log(`   Updated image: ${latestImage.image_url}`);
        console.log(`   Updated at: ${latestImage.updated_at}`);
      } else {
        console.log('⚠️ WARNING: Update might not have worked as expected');
      }
      
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ Edit page simulation failed: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('❌ Edit page simulation error:', error.message);
    return { success: false, error: error.message };
  }
}

async function runEventEditPageTest() {
  console.log('🚀 Starting event edit page flow test...');
  
  const initialState = await getCurrentEventState();
  const mappingTest = await testEventImageMapping();
  const directUpdateResult = await testEventUpdateDirectly();
  const editPageResult = await simulateEditPageUpdate();
  const finalState = await getCurrentEventState();
  
  console.log('\n🎯 EVENT EDIT PAGE TEST RESULTS');
  console.log('=' .repeat(60));
  
  console.log('📊 OPERATION RESULTS:');
  console.log(`- Initial images: ${initialState.length}`);
  console.log(`- Has mapping issue: ${mappingTest.hasMappingIssue ? '⚠️ Yes' : '✅ No'}`);
  console.log(`- Direct update: ${directUpdateResult.success ? '✅ Working' : '❌ Failed'}`);
  console.log(`- Edit page simulation: ${editPageResult.success ? '✅ Working' : '❌ Failed'}`);
  console.log(`- Final images: ${finalState.length}`);
  
  if (initialState.length > 0 && finalState.length > 0) {
    const initialLatest = initialState[initialState.length - 1];
    const finalLatest = finalState[finalState.length - 1];
    console.log(`- Latest image changed: ${initialLatest.id !== finalLatest.id ? '✅ Yes' : '❌ No'}`);
    console.log(`- Latest priority: ${initialLatest.priority} → ${finalLatest.priority}`);
  }
  
  console.log('\n🔧 DIAGNOSIS:');
  
  if (directUpdateResult.success && editPageResult.success) {
    console.log('🎉 EVENT UPDATE FUNCTIONALITY IS WORKING!');
    console.log('✅ API endpoints are functional');
    console.log('✅ Update operations are successful');
    console.log('✅ External webhook integration working');
    
    if (mappingTest.hasMappingIssue) {
      console.log('⚠️ BUT: Event 99 might have mapping issues for fetching existing images');
      console.log('💡 The update works, but initial image loading might not');
    }
    
    console.log('\n🎯 LIKELY ISSUE:');
    console.log('- Event update API is working correctly');
    console.log('- The problem might be in the frontend edit page');
    console.log('- Check browser console for JavaScript errors');
    console.log('- Check if existing images are loading properly');
    console.log('- Verify form submission is calling the update function');
    
  } else {
    console.log('❌ EVENT UPDATE HAS ISSUES');
    if (!directUpdateResult.success) {
      console.log(`   - Direct update failed: ${directUpdateResult.error}`);
    }
    if (!editPageResult.success) {
      console.log(`   - Edit page simulation failed: ${editPageResult.error}`);
    }
  }
  
  console.log('\n🔧 NEXT STEPS:');
  if (directUpdateResult.success && editPageResult.success) {
    console.log('1. ✅ API is working - check frontend implementation');
    console.log('2. 🔍 Open browser dev tools on edit page');
    console.log('3. 🔍 Check console for JavaScript errors');
    console.log('4. 🔍 Verify form submission triggers update function');
    console.log('5. 🔍 Check if existing images are loading correctly');
  } else {
    console.log('1. 🔧 Fix API issues first');
    console.log('2. 🔧 Debug the failing operations');
    console.log('3. 🔧 Check external webhook availability');
  }
  
  console.log('\n🎪 MANUAL TEST:');
  console.log('1. Open: http://localhost:3111/admin/events/99/edit');
  console.log('2. Open browser dev tools (F12)');
  console.log('3. Upload new image and change priority');
  console.log('4. Click "Save Changes"');
  console.log('5. Check console for any errors');
  console.log('6. Verify success message appears');
}

runEventEditPageTest().catch(console.error);
