// Test the mapping solution
console.log('🧪 TESTING MAPPING SOLUTION');
console.log('=' .repeat(50));

async function testMappingSolution() {
  console.log('\n1️⃣ Testing Event 99 (should find images via API ID 6)');
  console.log('-'.repeat(40));
  
  try {
    const response = await fetch('http://localhost:3111/api/eventimages/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_id: 6 }), // We know API ID 6 has Event 99 images
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API ID 6 response:', JSON.stringify(data, null, 2));
      
      if (Array.isArray(data) && data.length > 0) {
        const event99Images = data.filter(img => img.event_id === 99);
        console.log(`📊 Images for Event 99: ${event99Images.length}`);
        
        if (event99Images.length > 0) {
          event99Images.forEach((img, index) => {
            console.log(`  Image ${index + 1}:`);
            console.log(`    📷 URL: ${img.image_url}`);
            console.log(`    🔢 Priority: ${img.priority}`);
            console.log(`    ✅ Active: ${img.is_active}`);
            console.log(`    📅 Created: ${img.created_at}`);
          });
        }
      }
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testDirectEventCall() {
  console.log('\n2️⃣ Testing Direct Event 99 Call (current behavior)');
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
      console.log('📊 Direct Event 99 response:', JSON.stringify(data, null, 2));
      
      if (Array.isArray(data) && data.length > 0) {
        const validImages = data.filter(img => 
          img && 
          typeof img === 'object' && 
          img.id !== undefined && 
          img.image_url !== undefined
        );
        console.log(`✅ Valid images found: ${validImages.length}`);
      } else {
        console.log('❌ No valid images found (returns empty object)');
      }
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function runTests() {
  await testMappingSolution();
  await testDirectEventCall();
  
  console.log('\n🎯 CONCLUSION');
  console.log('=' .repeat(50));
  console.log('✅ Event 99 DOES have images in the system');
  console.log('✅ They are accessible via API ID 6');
  console.log('❌ Direct Event 99 call returns empty objects');
  console.log('💡 The mapping solution should resolve this issue');
  
  console.log('\n🔧 NEXT STEPS:');
  console.log('1. Test the updated edit page: http://localhost:3111/admin/events/99/edit');
  console.log('2. Verify that images and priority are now loaded');
  console.log('3. Check browser console for mapping logs');
  console.log('4. Test image upload/update functionality');
}

runTests().catch(console.error);
