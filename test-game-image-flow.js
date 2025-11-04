const fs = require('fs');
const path = require('path');

// Test the game image upload and webhook flow
async function testGameImageFlow() {
  console.log('Testing Game Image Upload and Webhook Flow...\n');

  try {
    // Test 1: Upload a game image file
    console.log('1. Testing game image upload...');
    
    // Create a simple test image file (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0xC2, 0x5D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    const formData = new FormData();
    const blob = new Blob([testImageBuffer], { type: 'image/png' });
    formData.append('file', blob, 'test-game-image.png');

    const uploadResponse = await fetch('http://localhost:3111/api/gamesimage/upload', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log('✓ Game image upload successful:', uploadResult);

    // Test 2: Send to webhook
    console.log('\n2. Testing game image webhook call...');
    
    const webhookPayload = {
      game_id: 456,
      image_url: uploadResult.path,
      priority: 1,
      is_active: true
    };

    const webhookResponse = await fetch('http://localhost:3111/api/gamesimage/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.log('⚠ Game image webhook failed (expected if external API is not available):', webhookResponse.status, errorText);
    } else {
      const webhookResult = await webhookResponse.json();
      console.log('✓ Game image webhook call successful:', webhookResult);
    }

    console.log('\n✅ Game image test completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Go to http://localhost:3111/admin/games/new');
    console.log('2. Fill out the game form');
    console.log('3. Select an image file');
    console.log('4. Set the priority (1-10)');
    console.log('5. Create the game');
    console.log('6. The image will be uploaded and sent to the webhook after successful game creation');

  } catch (error) {
    console.error('❌ Game image test failed:', error.message);
  }
}

// Run the test
testGameImageFlow();
