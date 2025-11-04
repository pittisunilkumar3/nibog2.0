/**
 * WhatsApp Delivery Diagnostic Tool
 * This tool helps identify why WhatsApp messages aren't being delivered to certain numbers
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

async function testMultipleNumbers() {
  console.log('🔍 WhatsApp Delivery Diagnostic Tool');
  console.log('=====================================\n');
  
  // Test with multiple numbers to identify patterns
  const testNumbers = [
    '6303727148', // Current test number
    '9346015886', // Previous working number
    '9999999999', // Invalid test number
    '1234567890', // Another test number
  ];
  
  for (const phoneNumber of testNumbers) {
    console.log(`\n📱 Testing phone number: ${phoneNumber}`);
    console.log('─'.repeat(50));
    
    try {
      // Test the booking confirmation API
      const testData = {
        bookingId: Math.floor(Math.random() * 100000),
        bookingRef: `TEST${Date.now()}`,
        parentName: 'Diagnostic Test',
        parentPhone: phoneNumber,
        childName: 'Test Child',
        eventTitle: 'Diagnostic Test Event',
        eventDate: new Date().toLocaleDateString(),
        eventVenue: 'Test Venue',
        totalAmount: 100,
        paymentMethod: 'Test',
        transactionId: `DIAG_${Date.now()}`,
        gameDetails: [{
          gameName: 'Test Game',
          gameTime: '10:00 AM',
          gamePrice: 100
        }]
      };
      
      const response = await fetch('http://localhost:3000/api/whatsapp/send-booking-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const result = await response.json();
      
      console.log(`📊 Status: ${response.status}`);
      console.log(`✅ Success: ${result.success}`);
      
      if (result.success) {
        console.log(`📨 Message ID: ${result.messageId}`);
        console.log('🎯 API reports message sent successfully');
        
        // Analyze the response for delivery insights
        if (result.zaptraResponse) {
          console.log('🔍 Zaptra Response Details:');
          console.log(`   - Status: ${result.zaptraResponse.status}`);
          console.log(`   - Message: ${result.zaptraResponse.message || 'No message'}`);
          console.log(`   - Message ID: ${result.zaptraResponse.message_id}`);
        }
        
        // Phone number analysis
        analyzePhoneNumber(phoneNumber);
        
      } else {
        console.log(`❌ Error: ${result.error}`);
        
        if (result.zaptraResponse) {
          console.log('🔍 Zaptra Error Details:');
          console.log(JSON.stringify(result.zaptraResponse, null, 2));
        }
        
        // Analyze the error
        analyzeError(result.error, phoneNumber);
      }
      
    } catch (error) {
      console.log(`🚨 Network/API Error: ${error.message}`);
    }
    
    // Wait between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n📋 DIAGNOSTIC SUMMARY');
  console.log('=====================');
  console.log('Common reasons why WhatsApp messages may not be delivered:');
  console.log('');
  console.log('1. 📱 PHONE NUMBER ISSUES:');
  console.log('   - Number doesn\'t have WhatsApp installed');
  console.log('   - Number is not active/reachable');
  console.log('   - Wrong country code or format');
  console.log('');
  console.log('2. 🚫 WHATSAPP BUSINESS RESTRICTIONS:');
  console.log('   - User hasn\'t opted in to receive business messages');
  console.log('   - User has blocked business messages');
  console.log('   - User has blocked your business number');
  console.log('');
  console.log('3. ⏰ DELIVERY DELAYS:');
  console.log('   - WhatsApp can take 1-5 minutes to deliver');
  console.log('   - Network issues on recipient\'s end');
  console.log('   - WhatsApp server delays');
  console.log('');
  console.log('4. 🔧 TECHNICAL ISSUES:');
  console.log('   - Zaptra API rate limits');
  console.log('   - Invalid message template');
  console.log('   - API token issues');
  console.log('');
  console.log('💡 RECOMMENDATIONS:');
  console.log('   - Test with known working WhatsApp numbers first');
  console.log('   - Ask users to send a message to your business number first');
  console.log('   - Use WhatsApp opt-in flows for better delivery');
  console.log('   - Monitor Zaptra dashboard for delivery reports');
}

function analyzePhoneNumber(phoneNumber) {
  console.log('🔍 Phone Number Analysis:');
  
  // Remove non-numeric characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  console.log(`   - Original: ${phoneNumber}`);
  console.log(`   - Cleaned: ${cleanNumber}`);
  console.log(`   - Length: ${cleanNumber.length} digits`);
  
  // Check format
  if (cleanNumber.length === 10) {
    console.log(`   - Format: Indian mobile (will be formatted as +91${cleanNumber})`);
    console.log(`   - Final format: +91${cleanNumber}`);
  } else if (cleanNumber.length === 12 && cleanNumber.startsWith('91')) {
    console.log(`   - Format: Indian mobile with country code (+${cleanNumber})`);
  } else {
    console.log(`   - ⚠️  Format: Unusual length - may cause delivery issues`);
  }
  
  // Check if it's a valid Indian mobile number pattern
  if (cleanNumber.length === 10) {
    const firstDigit = cleanNumber[0];
    if (['6', '7', '8', '9'].includes(firstDigit)) {
      console.log(`   - ✅ Valid Indian mobile pattern (starts with ${firstDigit})`);
    } else {
      console.log(`   - ⚠️  Unusual Indian mobile pattern (starts with ${firstDigit})`);
    }
  }
}

function analyzeError(error, phoneNumber) {
  console.log('🔍 Error Analysis:');
  
  if (error.includes('Invalid phone number')) {
    console.log('   - ❌ Phone number format rejected');
    console.log('   - 💡 Check if number follows +91XXXXXXXXXX format');
  }
  
  if (error.includes('API token')) {
    console.log('   - ❌ Zaptra API authentication issue');
    console.log('   - 💡 Check ZAPTRA_API_TOKEN in environment variables');
  }
  
  if (error.includes('rate limit') || error.includes('quota')) {
    console.log('   - ❌ API rate limit exceeded');
    console.log('   - 💡 Wait before sending more messages');
  }
  
  if (error.includes('template')) {
    console.log('   - ❌ WhatsApp template issue');
    console.log('   - 💡 Check if template is approved in Zaptra dashboard');
  }
}

// Run the diagnostic
testMultipleNumbers().catch(console.error);
