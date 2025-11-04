// Debug game image mapping issue
console.log('🎮 DEBUGGING GAME IMAGE MAPPING');
console.log('=' .repeat(60));

async function testGameImageAPI() {
  console.log('\n1️⃣ TESTING GAME IMAGE API');
  console.log('-'.repeat(40));
  
  // Test different game IDs to understand the mapping
  const testGameIds = [9, 4, 131, 1, 2, 3, 5, 10, 6, 7, 8, 11, 12, 13, 14, 15];
  
  const gamesWithImages = [];
  
  for (const gameId of testGameIds) {
    try {
      console.log(`\n📡 Testing Game ID: ${gameId}`);
      
      const response = await fetch('http://localhost:3111/api/gamesimage/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ game_id: gameId }),
      });

      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Response:`, JSON.stringify(data, null, 2));
        
        if (Array.isArray(data) && data.length > 0) {
          const validImages = data.filter(img => 
            img && 
            typeof img === 'object' && 
            img.id !== undefined && 
            img.image_url !== undefined &&
            img.image_url !== null &&
            img.image_url.trim() !== ''
          );
          
          if (validImages.length > 0) {
            console.log(`✅ Game ${gameId} has ${validImages.length} images!`);
            gamesWithImages.push({
              apiId: gameId,
              imageCount: validImages.length,
              images: validImages
            });
            
            validImages.forEach((img, index) => {
              console.log(`  Image ${index + 1}:`);
              console.log(`    ID: ${img.id}`);
              console.log(`    Game ID: ${img.game_id}`);
              console.log(`    Image URL: ${img.image_url}`);
              console.log(`    Priority: ${img.priority}`);
              console.log(`    Active: ${img.is_active}`);
            });
          } else {
            console.log(`❌ Game ${gameId} has no valid images`);
          }
        } else {
          console.log(`❌ Game ${gameId} returned empty/invalid response`);
        }
      } else {
        console.log(`❌ API error for Game ${gameId}`);
      }
    } catch (error) {
      console.log(`❌ Network error for Game ${gameId}: ${error.message}`);
    }
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return gamesWithImages;
}

async function analyzeGameMapping(gamesWithImages) {
  console.log('\n2️⃣ ANALYZING GAME ID MAPPING');
  console.log('-'.repeat(40));
  
  if (gamesWithImages.length === 0) {
    console.log('❌ No games with images found');
    return;
  }
  
  console.log(`✅ Found ${gamesWithImages.length} API IDs with game images:`);
  
  gamesWithImages.forEach(game => {
    console.log(`\n📊 API ID ${game.apiId}:`);
    game.images.forEach(img => {
      console.log(`  📷 Image for game_id: ${img.game_id}`);
      console.log(`     URL: ${img.image_url}`);
      console.log(`     Priority: ${img.priority}`);
      
      if (img.game_id === 9) {
        console.log(`  🎯 FOUND MAPPING: API ID ${game.apiId} has images for Game 9!`);
      }
    });
  });
  
  // Check if Game 9 has images accessible through any API ID
  const game9Images = [];
  gamesWithImages.forEach(game => {
    game.images.forEach(img => {
      if (img.game_id === 9) {
        game9Images.push({
          apiId: game.apiId,
          image: img
        });
      }
    });
  });
  
  if (game9Images.length > 0) {
    console.log('\n🎯 GAME 9 MAPPING DISCOVERED:');
    game9Images.forEach(mapping => {
      console.log(`✅ Game 9 images accessible via API ID ${mapping.apiId}`);
      console.log(`   Image: ${mapping.image.image_url}`);
      console.log(`   Priority: ${mapping.image.priority}`);
    });
  } else {
    console.log('\n❌ No images found for Game 9 in any API ID');
  }
}

async function testDirectGame9() {
  console.log('\n3️⃣ TESTING DIRECT GAME 9 CALL');
  console.log('-'.repeat(40));
  
  try {
    const response = await fetch('http://localhost:3111/api/gamesimage/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ game_id: 9 }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Direct Game 9 response:', JSON.stringify(data, null, 2));
      
      if (Array.isArray(data) && data.length > 0) {
        const validImages = data.filter(img => 
          img && 
          typeof img === 'object' && 
          img.id !== undefined && 
          img.image_url !== undefined
        );
        console.log(`Valid images for direct Game 9 call: ${validImages.length}`);
      } else {
        console.log('❌ Direct Game 9 call returns empty/invalid data');
      }
    }
  } catch (error) {
    console.error('❌ Direct Game 9 test failed:', error);
  }
}

async function runGameMappingAnalysis() {
  const gamesWithImages = await testGameImageAPI();
  await analyzeGameMapping(gamesWithImages);
  await testDirectGame9();
  
  console.log('\n🎯 SUMMARY');
  console.log('=' .repeat(60));
  
  if (gamesWithImages.length > 0) {
    console.log('✅ Games with images found:');
    gamesWithImages.forEach(game => {
      console.log(`  - API ID ${game.apiId}: ${game.imageCount} images`);
    });
    
    console.log('\n💡 NEXT STEPS:');
    console.log('1. Implement game image mapping system similar to events');
    console.log('2. Update babyGameService.ts to use mapping');
    console.log('3. Test game edit page with discovered mappings');
    console.log('4. Verify Game 9 edit page loads images correctly');
  } else {
    console.log('❌ No games with images found');
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('1. Create test game images using the game creation page');
    console.log('2. Or expand the search range to find games with images');
    console.log('3. Check if the external game image API is working correctly');
  }
}

runGameMappingAnalysis().catch(console.error);
