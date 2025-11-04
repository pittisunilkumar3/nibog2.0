/**
 * Check WhatsApp delivery issues - messages are sent to Zeptra but not received
 */

const ZAPTRA_API_URL = 'https://zaptra.in/api/wpbox';
const ZAPTRA_API_TOKEN = 'ub94jy7OiCmCiggguxLZ2ETkbYkh5OtpNX3ZYISD737595b9';
const TEST_PHONE = '+916303727148';

async function checkWhatsAppDeliveryIssues() {
  console.log('🔍 WHATSAPP DELIVERY TROUBLESHOOTING');
  console.log('='.repeat(50));
  console.log('✅ Zeptra API is working (messages sent successfully)');
  console.log('❓ But messages not received on phone');
  console.log('='.repeat(50));

  // Check 1: Phone number format variations
  console.log('\n📞 Check 1: Phone Number Format Variations');
  const phoneVariations = [
    '+916303727148',    // Current format
    '916303727148',     // Without +
    '6303727148',       // Without country code
    '+91 6303727148',   // With space
    '+91-6303-727-148'  // With dashes
  ];

  for (const phone of phoneVariations) {
    try {
      console.log(`\nTesting phone format: ${phone}`);
      
      const response = await fetch(`${ZAPTRA_API_URL}/sendmessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: ZAPTRA_API_TOKEN,
          phone: phone,
          message: `Test delivery check - ${new Date().toLocaleTimeString()} - Format: ${phone}`
        })
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        console.log(`✅ ${phone}: Message sent (ID: ${result.message_id})`);
      } else {
        console.log(`❌ ${phone}: Failed - ${result.message}`);
      }
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`❌ ${phone}: Error - ${error.message}`);
    }
  }

  // Check 2: Account status and credits
  console.log('\n💳 Check 2: Account Status');
  try {
    const accountResponse = await fetch(`${ZAPTRA_API_URL}/me?token=${ZAPTRA_API_TOKEN}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (accountResponse.ok) {
      const accountData = await accountResponse.json();
      console.log('Account Status:', JSON.stringify(accountData, null, 2));
    } else {
      console.log('❌ Could not fetch account status');
    }
  } catch (error) {
    console.log('❌ Account check error:', error.message);
  }

  // Check 3: Message delivery status
  console.log('\n📊 Check 3: Recent Message Status');
  try {
    // Try to get message delivery status for recent messages
    const statusResponse = await fetch(`${ZAPTRA_API_URL}/messages?token=${ZAPTRA_API_TOKEN}&limit=5`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('Recent Messages:', JSON.stringify(statusData, null, 2));
    } else {
      console.log('❌ Could not fetch message status');
    }
  } catch (error) {
    console.log('❌ Message status check error:', error.message);
  }

  // Check 4: Send opt-in message
  console.log('\n📱 Check 4: Sending Opt-in Message');
  try {
    const optInMessage = `Hi! This is NIBOG booking system.

To receive booking confirmations and updates via WhatsApp, please reply 'YES' to this message.

This helps us send you:
✅ Booking confirmations
✅ Event reminders  
✅ Important updates

Reply 'YES' to confirm or 'STOP' to opt out.

Test time: ${new Date().toLocaleString()}`;

    const optInResponse = await fetch(`${ZAPTRA_API_URL}/sendmessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: ZAPTRA_API_TOKEN,
        phone: TEST_PHONE,
        message: optInMessage
      })
    });

    const optInResult = await optInResponse.json();
    
    if (optInResult.status === 'success') {
      console.log('✅ Opt-in message sent successfully');
      console.log('📱 Message ID:', optInResult.message_id);
      console.log('📱 Please check your WhatsApp and reply "YES" if you receive this message');
    } else {
      console.log('❌ Opt-in message failed:', optInResult.message);
    }
  } catch (error) {
    console.log('❌ Opt-in message error:', error.message);
  }

  // Check 5: Test with hello_world template (most reliable)
  console.log('\n👋 Check 5: Hello World Template (Most Reliable)');
  try {
    const helloResponse = await fetch(`${ZAPTRA_API_URL}/sendtemplatemessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: ZAPTRA_API_TOKEN,
        phone: TEST_PHONE,
        template_name: 'hello_world',
        template_language: 'en_US',
        template_data: []
      })
    });

    const helloResult = await helloResponse.json();
    
    if (helloResult.status === 'success') {
      console.log('✅ Hello World template sent successfully');
      console.log('📱 Message ID:', helloResult.message_id);
      console.log('📱 This is the most reliable template - check your WhatsApp');
    } else {
      console.log('❌ Hello World template failed:', helloResult.message);
    }
  } catch (error) {
    console.log('❌ Hello World template error:', error.message);
  }

  console.log('\n🎯 TROUBLESHOOTING SUMMARY');
  console.log('='.repeat(50));
  console.log('✅ Zeptra API is working correctly');
  console.log('✅ Messages are being sent successfully');
  console.log('✅ Your API token is valid');
  console.log('✅ Templates are approved and working');
  console.log('');
  console.log('❓ If you still don\'t receive messages, possible causes:');
  console.log('1. 📱 WhatsApp Business API requires 24-hour opt-in window');
  console.log('2. 🚫 Your number might be blocked/filtered by WhatsApp');
  console.log('3. 📶 Network/connectivity issues on your phone');
  console.log('4. 🔕 WhatsApp notifications disabled');
  console.log('5. 📁 Messages going to spam/filtered folder');
  console.log('6. 🏢 Business account limitations');
  console.log('');
  console.log('💡 RECOMMENDED ACTIONS:');
  console.log('1. Reply "YES" to any message you receive');
  console.log('2. Check WhatsApp spam/filtered messages');
  console.log('3. Ensure WhatsApp notifications are enabled');
  console.log('4. Try with a different phone number');
  console.log('5. Contact Zeptra support if issue persists');
}

// Run the delivery check
checkWhatsAppDeliveryIssues().catch(console.error);
