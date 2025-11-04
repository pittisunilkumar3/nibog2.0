/**
 * Debug script to test direct Zeptra API connection
 * This will help identify why WhatsApp messages aren't being delivered
 */

const ZAPTRA_API_URL = 'https://zaptra.in/api/wpbox';
const ZAPTRA_API_TOKEN = 'ub94jy7OiCmCiggguxLZ2ETkbYkh5OtpNX3ZYISD737595b9';
const TEST_PHONE = '+916303727148';

async function testZeptraAPIConnection() {
  console.log('🔍 ZEPTRA API CONNECTION DIAGNOSTIC');
  console.log('='.repeat(50));
  console.log('API URL:', ZAPTRA_API_URL);
  console.log('Token:', ZAPTRA_API_TOKEN ? '***CONFIGURED***' : 'NOT_SET');
  console.log('Test Phone:', TEST_PHONE);
  console.log('='.repeat(50));

  // Test 1: Check API health/connectivity
  console.log('\n📡 Test 1: API Health Check');
  try {
    const healthResponse = await fetch(`${ZAPTRA_API_URL}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Health Check Status:', healthResponse.status);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ API is reachable');
      console.log('Health Response:', JSON.stringify(healthData, null, 2));
    } else {
      console.log('⚠️ API health check failed');
      const errorText = await healthResponse.text();
      console.log('Error Response:', errorText);
    }
  } catch (error) {
    console.log('❌ API health check error:', error.message);
  }

  // Test 2: Test simple text message
  console.log('\n📱 Test 2: Simple Text Message');
  try {
    const textMessage = {
      token: ZAPTRA_API_TOKEN,
      phone: TEST_PHONE,
      message: 'Test message from NIBOG admin panel - ' + new Date().toLocaleTimeString()
    };

    console.log('Sending text message...');
    console.log('Request body:', JSON.stringify(textMessage, null, 2));

    const textResponse = await fetch(`${ZAPTRA_API_URL}/sendmessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(textMessage)
    });

    console.log('Text Message Status:', textResponse.status);
    const textResult = await textResponse.json();
    console.log('Text Message Response:', JSON.stringify(textResult, null, 2));

    if (textResponse.ok && textResult.status === 'success') {
      console.log('✅ Text message sent successfully!');
      console.log('📱 Message ID:', textResult.message_id);
    } else {
      console.log('❌ Text message failed');
      console.log('Error:', textResult.message || 'Unknown error');
    }
  } catch (error) {
    console.log('❌ Text message error:', error.message);
  }

  // Test 3: Check available templates
  console.log('\n📋 Test 3: Available Templates');
  try {
    const templatesResponse = await fetch(`${ZAPTRA_API_URL}/getTemplates?token=${ZAPTRA_API_TOKEN}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Templates Status:', templatesResponse.status);
    if (templatesResponse.ok) {
      const templatesData = await templatesResponse.json();
      console.log('✅ Templates retrieved');
      console.log('Available Templates:', JSON.stringify(templatesData, null, 2));
    } else {
      console.log('❌ Templates retrieval failed');
      const errorText = await templatesResponse.text();
      console.log('Error Response:', errorText);
    }
  } catch (error) {
    console.log('❌ Templates error:', error.message);
  }

  // Test 4: Test template message (booking_confirmation_latest)
  console.log('\n🎫 Test 4: Template Message (booking_confirmation_latest)');
  try {
    const templateData = [
      'Test Parent',           // {{1}} - Parent name
      'Test Child',            // {{2}} - Child name  
      'Test Event',            // {{3}} - Event title
      '2024-01-15',           // {{4}} - Event date
      'Test Venue',           // {{5}} - Event venue
      'Test Game',            // {{6}} - Game name
      'Rs. 2500.00',          // {{7}} - Total amount
      'MAN250807969'          // {{8}} - Booking reference
    ];

    const templateMessage = {
      token: ZAPTRA_API_TOKEN,
      phone: TEST_PHONE,
      template_name: 'booking_confirmation_latest',
      template_language: 'en_US',
      template_data: templateData
    };

    console.log('Sending template message...');
    console.log('Template data:', templateData);
    console.log('Request body:', JSON.stringify(templateMessage, null, 2));

    const templateResponse = await fetch(`${ZAPTRA_API_URL}/sendtemplatemessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateMessage)
    });

    console.log('Template Message Status:', templateResponse.status);
    const templateResult = await templateResponse.json();
    console.log('Template Message Response:', JSON.stringify(templateResult, null, 2));

    if (templateResponse.ok && templateResult.status === 'success') {
      console.log('✅ Template message sent successfully!');
      console.log('📱 Message ID:', templateResult.message_id);
      console.log('📱 Check your WhatsApp for the booking confirmation template');
    } else {
      console.log('❌ Template message failed');
      console.log('Error:', templateResult.message || 'Unknown error');
      
      // Check for specific error codes
      if (templateResult.message && templateResult.message.includes('132000')) {
        console.log('🚨 Error 132000: Parameter count mismatch');
        console.log('Expected parameters: 8, Sent parameters:', templateData.length);
      }
    }
  } catch (error) {
    console.log('❌ Template message error:', error.message);
  }

  // Test 5: Test with exact NIBOG app data structure
  console.log('\n🎯 Test 5: NIBOG App Data Structure');
  try {
    const nibogData = {
      bookingId: 99999,
      bookingRef: 'MAN250807969',
      parentName: 'Test Parent',
      parentPhone: TEST_PHONE,
      childName: 'Test Child',
      eventTitle: 'Test Event',
      eventDate: '2024-01-15',
      eventVenue: 'Test Venue',
      totalAmount: 2500,
      paymentMethod: 'Cash payment',
      transactionId: 'TEST_TXN_001',
      gameDetails: [{
        gameName: 'Test Game',
        gameTime: '10:00 AM - 11:00 AM',
        gamePrice: 2500
      }],
      addOns: []
    };

    console.log('Testing with NIBOG app data structure...');
    const nibogResponse = await fetch('http://localhost:3111/api/whatsapp/send-booking-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nibogData)
    });

    console.log('NIBOG App Status:', nibogResponse.status);
    const nibogResult = await nibogResponse.json();
    console.log('NIBOG App Response:', JSON.stringify(nibogResult, null, 2));

    if (nibogResponse.ok && nibogResult.success) {
      console.log('✅ NIBOG app integration working!');
      console.log('📱 Message ID:', nibogResult.messageId);
    } else {
      console.log('❌ NIBOG app integration failed');
      console.log('Error:', nibogResult.error);
    }
  } catch (error) {
    console.log('❌ NIBOG app test error:', error.message);
  }

  console.log('\n🎯 DIAGNOSTIC COMPLETE');
  console.log('='.repeat(50));
  console.log('If all tests pass but you still don\'t receive messages:');
  console.log('1. Check your WhatsApp number is correct');
  console.log('2. Ensure WhatsApp is connected to internet');
  console.log('3. Check if messages are in spam/filtered');
  console.log('4. Verify Zeptra account status and credits');
  console.log('5. Check if your number needs to opt-in to business messages');
}

// Run the diagnostic
testZeptraAPIConnection().catch(console.error);
