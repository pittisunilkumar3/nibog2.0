/**
 * WhatsApp Message Delivery Status Checker
 * This tool helps check the delivery status of sent messages via Zaptra API
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

const ZAPTRA_API_URL = 'https://demo.zaptra.in/api/wpbox';
const ZAPTRA_API_TOKEN = 'QqfIcXJtovwgUSGMtX1a3PY0XbXQCETeqFMlfjYi5c0aa036';

async function checkMessageDeliveryStatus(messageIds) {
  console.log('📊 Checking WhatsApp Message Delivery Status');
  console.log('===========================================\n');
  
  // Recent message IDs from our tests
  const testMessageIds = messageIds || [505, 506, 507, 508, 509];
  
  for (const messageId of testMessageIds) {
    console.log(`🔍 Checking Message ID: ${messageId}`);
    console.log('─'.repeat(40));
    
    try {
      // Try to get message status from Zaptra
      // Note: This endpoint might not exist - we'll try different approaches
      
      // Approach 1: Try getting message details
      const statusResponse = await fetch(`${ZAPTRA_API_URL}/getMessageStatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: ZAPTRA_API_TOKEN,
          message_id: messageId
        })
      });
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log('✅ Status Response:', JSON.stringify(statusData, null, 2));
      } else {
        console.log(`❌ Status check failed: ${statusResponse.status}`);
        
        // Approach 2: Try getting recent messages
        const recentResponse = await fetch(`${ZAPTRA_API_URL}/getMessages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: ZAPTRA_API_TOKEN,
            limit: 50
          })
        });
        
        if (recentResponse.ok) {
          const recentData = await recentResponse.json();
          console.log('📱 Recent messages response:', JSON.stringify(recentData, null, 2));
          
          // Look for our message ID in the recent messages
          if (recentData.messages && Array.isArray(recentData.messages)) {
            const ourMessage = recentData.messages.find(msg => msg.id === messageId || msg.message_id === messageId);
            if (ourMessage) {
              console.log(`✅ Found message ${messageId}:`, JSON.stringify(ourMessage, null, 2));
            } else {
              console.log(`❌ Message ${messageId} not found in recent messages`);
            }
          }
        } else {
          console.log(`❌ Recent messages check failed: ${recentResponse.status}`);
        }
      }
      
    } catch (error) {
      console.log(`🚨 Error checking message ${messageId}: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Try to get account info and recent activity
  console.log('📊 Checking Account Information');
  console.log('─'.repeat(40));
  
  try {
    const accountResponse = await fetch(`${ZAPTRA_API_URL}/me`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: ZAPTRA_API_TOKEN
      })
    });
    
    if (accountResponse.ok) {
      const accountData = await accountResponse.json();
      console.log('✅ Account Info:', JSON.stringify(accountData, null, 2));
    } else {
      console.log(`❌ Account info check failed: ${accountResponse.status}`);
    }
  } catch (error) {
    console.log(`🚨 Error checking account: ${error.message}`);
  }
  
  console.log('\n📋 DELIVERY STATUS SUMMARY');
  console.log('==========================');
  console.log('To check delivery status manually:');
  console.log('1. 🌐 Login to Zaptra Dashboard: https://demo.zaptra.in');
  console.log('2. 📊 Go to Messages/Reports section');
  console.log('3. 🔍 Look for message IDs:', testMessageIds.join(', '));
  console.log('4. 📱 Check delivery status for each message');
  console.log('');
  console.log('📱 WhatsApp Delivery Statuses:');
  console.log('   - ✅ SENT: Message sent to WhatsApp servers');
  console.log('   - 📤 DELIVERED: Message delivered to recipient device');
  console.log('   - 👁️ READ: Message read by recipient');
  console.log('   - ❌ FAILED: Message delivery failed');
  console.log('   - ⏳ PENDING: Message still being processed');
  console.log('');
  console.log('🔍 Common reasons for delivery issues:');
  console.log('   - Recipient doesn\'t have WhatsApp');
  console.log('   - Recipient blocked business messages');
  console.log('   - Phone number is inactive');
  console.log('   - WhatsApp opt-in required');
  console.log('   - Network issues on recipient side');
}

async function testDeliveryToKnownNumber() {
  console.log('\n🧪 Testing delivery to a known working number...');
  console.log('================================================');
  
  // Send a test message to verify the system is working
  const testData = {
    bookingId: 99999,
    bookingRef: 'DELIVERY_TEST',
    parentName: 'Delivery Test',
    parentPhone: '9346015886', // Known working number
    childName: 'Test Child',
    eventTitle: 'Delivery Test Event',
    eventDate: new Date().toLocaleDateString(),
    eventVenue: 'Test Venue',
    totalAmount: 100,
    paymentMethod: 'Test',
    transactionId: 'DELIVERY_TEST_001',
    gameDetails: [{
      gameName: 'Test Game',
      gameTime: '10:00 AM',
      gamePrice: 100
    }]
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/whatsapp/send-booking-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Test message sent successfully!`);
      console.log(`📨 Message ID: ${result.messageId}`);
      console.log('📱 Check WhatsApp on 9346015886 for delivery confirmation');
      
      // Wait 2 minutes then check status
      console.log('⏰ Waiting 2 minutes before checking delivery status...');
      setTimeout(() => {
        checkMessageDeliveryStatus([result.messageId]);
      }, 2 * 60 * 1000);
      
    } else {
      console.log(`❌ Test message failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`🚨 Test failed: ${error.message}`);
  }
}

// Run the delivery status checker
const messageIds = process.argv.slice(2).map(id => parseInt(id)).filter(id => !isNaN(id));

if (messageIds.length > 0) {
  console.log(`🔍 Checking specific message IDs: ${messageIds.join(', ')}`);
  checkMessageDeliveryStatus(messageIds);
} else {
  console.log('🔍 Checking recent test message IDs...');
  checkMessageDeliveryStatus();
  
  // Also test with a known working number
  testDeliveryToKnownNumber();
}
