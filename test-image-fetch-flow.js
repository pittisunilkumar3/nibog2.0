const fs = require('fs');
const path = require('path');

// Test the image fetching functionality for both events and games
async function testImageFetchFlow() {
  console.log('Testing Image Fetch Functionality...\n');

  try {
    // Test 1: Fetch event images
    console.log('1. Testing event image fetch...');
    
    const eventImagePayload = {
      event_id: 99 // Using the event ID from the user's example
    };

    const eventImageResponse = await fetch('http://localhost:3111/api/eventimages/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventImagePayload),
    });

    console.log(`Event images fetch response status: ${eventImageResponse.status}`);

    if (!eventImageResponse.ok) {
      const errorText = await eventImageResponse.text();
      console.log('⚠ Event images fetch failed (expected if no images exist):', eventImageResponse.status, errorText);
    } else {
      const eventImageResult = await eventImageResponse.json();
      console.log('✓ Event images fetch successful:', eventImageResult);
    }

    // Test 2: Fetch game images
    console.log('\n2. Testing game image fetch...');
    
    const gameImagePayload = {
      game_id: 25 // Using the game ID from the user's example
    };

    const gameImageResponse = await fetch('http://localhost:3111/api/gamesimage/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gameImagePayload),
    });

    console.log(`Game images fetch response status: ${gameImageResponse.status}`);

    if (!gameImageResponse.ok) {
      const errorText = await gameImageResponse.text();
      console.log('⚠ Game images fetch failed (expected if no images exist):', gameImageResponse.status, errorText);
    } else {
      const gameImageResult = await gameImageResponse.json();
      console.log('✓ Game images fetch successful:', gameImageResult);
    }

    console.log('\n✅ Image fetch test completed!');
    console.log('\nNext steps:');
    console.log('1. Go to http://localhost:3111/admin/events/99/edit to test event image fetching');
    console.log('2. Go to http://localhost:3111/admin/games/25/edit to test game image fetching');
    console.log('3. Both pages should now load existing images and allow uploading new ones');
    console.log('4. When you upload a new image and update the event/game, it will be sent to the webhook');

  } catch (error) {
    console.error('❌ Image fetch test failed:', error.message);
  }
}

// Run the test
testImageFetchFlow();
