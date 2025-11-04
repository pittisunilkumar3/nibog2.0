/**
 * Test script to verify WhatsApp integration fix
 * Tests the new booking_confirmation_nibog template with correct components format
 */

// Check if fetch is available (for Node.js environments)
if (typeof fetch === 'undefined') {
  try {
    const { default: fetch } = await import('node-fetch');
    global.fetch = fetch;
  } catch (e) {
    console.error('❌ fetch is not available. Please install node-fetch or run in a browser environment.');
    process.exit(1);
  }
}

const ZAPTRA_API_URL = 'https://zaptra.in/api/wpbox';
const ZAPTRA_API_TOKEN = 'ub94jy7OiCmCiggguxLZ2ETkbYkh5OtpNX3ZYISD737595b9';
const TEST_PHONE = '+919346015886';

async function testWhatsAppFix() {
  console.log('🧪 TESTING WHATSAPP INTEGRATION FIX');
  console.log('='.repeat(50));
  console.log('📱 Testing new booking_confirmation_nibog template');
  console.log('📱 Using correct components format');
  console.log('='.repeat(50));

  // Test data matching the expected 8 parameters
  const testData = [
    'Test Parent Name',               // {{1}} - customer_name
    'Birthday Party Celebration',     // {{2}} - event_title  
    '2024-01-15',                    // {{3}} - event_date
    'NIBOG Party Hall, Bangalore',   // {{4}} - venue_name
    'Test Child Name',               // {{5}} - child_name
    'B0012345',                      // {{6}} - booking_ref
    '2500',                          // {{7}} - total_amount
    'PhonePe'                        // {{8}} - payment_method
  ];

  // Test 1: Direct Zaptra API call with correct format
  console.log('\n🔬 Test 1: Direct Zaptra API Call');
  console.log('-'.repeat(30));
  
  const directApiPayload = {
    token: ZAPTRA_API_TOKEN,
    phone: TEST_PHONE,
    template_name: 'booking_confirmation_nibog',
    template_language: 'en_US',
    components: [
      {
        type: "body",
        parameters: testData.map(text => ({
          type: "text",
          text: text
        }))
      }
    ]
  };

  try {
    console.log('📤 Sending direct API request...');
    console.log('📋 Payload:', JSON.stringify(directApiPayload, null, 2));
    
    const directResponse = await fetch(`${ZAPTRA_API_URL}/sendtemplatemessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(directApiPayload),
    });

    const directResult = await directResponse.json();
    
    console.log('📡 Status:', directResponse.status);
    console.log('📡 Response:', JSON.stringify(directResult, null, 2));
    
    if (directResponse.ok && directResult.status === 'success') {
      console.log('✅ Direct API call - SUCCESS!');
      console.log('📨 Message ID:', directResult.message_id);
      console.log('📱 Check your WhatsApp for the message');
    } else {
      console.log('❌ Direct API call - FAILED:', directResult.message || 'Unknown error');
    }
    
  } catch (error) {
    console.log('🚨 Direct API test failed:', error.message);
  }

  // Test 2: Test via local API endpoint
  console.log('\n🔬 Test 2: Local API Endpoint Test');
  console.log('-'.repeat(30));
  
  const localApiPayload = {
    bookingId: 999999,
    bookingRef: 'TEST001',
    parentName: 'Test Parent Name',
    parentPhone: TEST_PHONE,
    childName: 'Test Child Name',
    eventTitle: 'Birthday Party Celebration',
    eventDate: '2024-01-15',
    eventVenue: 'NIBOG Party Hall, Bangalore',
    totalAmount: 2500,
    paymentMethod: 'PhonePe',
    transactionId: 'TEST_TXN_001',
    gameDetails: [{
      gameName: 'Test Game',
      gameTime: '10:00 AM',
      gamePrice: 2500
    }]
  };

  try {
    console.log('📤 Sending local API request...');
    console.log('📋 Payload:', JSON.stringify(localApiPayload, null, 2));
    
    const localResponse = await fetch('http://localhost:3111/api/whatsapp/send-booking-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(localApiPayload),
    });

    const localResult = await localResponse.json();
    
    console.log('📡 Status:', localResponse.status);
    console.log('📡 Response:', JSON.stringify(localResult, null, 2));
    
    if (localResponse.ok && localResult.success) {
      console.log('✅ Local API call - SUCCESS!');
      console.log('📨 Message ID:', localResult.messageId);
      console.log('📱 Check your WhatsApp for the message');
    } else {
      console.log('❌ Local API call - FAILED:', localResult.error || 'Unknown error');
    }
    
  } catch (error) {
    console.log('🚨 Local API test failed:', error.message);
  }

  console.log('\n🎯 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log('✅ Fixed template name: booking_confirmation_nibog');
  console.log('✅ Fixed API format: components instead of template_data');
  console.log('✅ Fixed parameter structure: type/text objects');
  console.log('✅ Maintained 8 parameters as expected');
  console.log('📱 If both tests succeed, WhatsApp integration is fixed!');
}

// Run the test
testWhatsAppFix().catch(console.error);
