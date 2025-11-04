/**
 * Test with the correct Zaptra API format
 * Based on the actual Zaptra APIController implementation
 */

async function testCorrectFormat() {
  console.log('🧪 Testing correct Zaptra API format...');
  
  const ZAPTRA_API_URL = 'https://zaptra.in/api/wpbox';
  const ZAPTRA_API_TOKEN = 'ub94jy7OiCmCiggguxLZ2ETkbYkh5OtpNX3ZYISD737595b9';
  const TEST_PHONE = '+919346015886';
  
  // Test data
  const testData = [
    'Test Parent',                    // {{1}} - customer_name
    'Birthday Party Celebration',     // {{2}} - event_title  
    '2024-01-15',                    // {{3}} - event_date
    'NIBOG Party Hall, Bangalore',   // {{4}} - venue_name
    'Test Child',                    // {{5}} - child_name
    'B0012345',                      // {{6}} - booking_ref
    '2500',                          // {{7}} - total_amount (no ₹ symbol)
    'PhonePe'                        // {{8}} - payment_method
  ];

  // Correct format based on Zaptra APIController implementation
  const correctFormat = {
    token: ZAPTRA_API_TOKEN,
    phone: TEST_PHONE,
    template_name: 'booking_confirmation_nibog',
    template_language: 'en_US',
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: testData[0] },  // {{1}}
          { type: "text", text: testData[1] },  // {{2}}
          { type: "text", text: testData[2] },  // {{3}}
          { type: "text", text: testData[3] },  // {{4}}
          { type: "text", text: testData[4] },  // {{5}}
          { type: "text", text: testData[5] },  // {{6}}
          { type: "text", text: testData[6] },  // {{7}}
          { type: "text", text: testData[7] }   // {{8}}
        ]
      }
    ]
  };

  try {
    console.log('🔄 Testing correct Zaptra format...');
    console.log('📤 Request body:', JSON.stringify(correctFormat, null, 2));
    
    const response = await fetch(`${ZAPTRA_API_URL}/sendtemplatemessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(correctFormat),
    });

    const result = await response.json();
    
    console.log('📡 Status:', response.status);
    console.log('📡 Response:', JSON.stringify(result, null, 2));
    
    if (response.ok && result.status === 'success') {
      console.log('✅ Correct Zaptra format - SUCCESS!');
      console.log('📨 Message ID:', result.message_id);
      console.log('📱 Check your WhatsApp for the message');
      console.log('🎯 This should work without parameter mismatch errors!');
    } else {
      console.log('❌ Correct Zaptra format - FAILED:', result.message || 'Unknown error');
    }
    
  } catch (error) {
    console.log('🚨 Test failed:', error.message);
  }
}

// Run the test
testCorrectFormat();
