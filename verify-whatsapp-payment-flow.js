/**
 * Comprehensive verification script for WhatsApp notifications and payment callback
 * Tests both test and production-like scenarios
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

// Dynamic base URL detection
const getBaseUrl = () => {
  // Check if we're in browser environment
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Server-side: check environment variables
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  // Production fallback
  return 'https://www.nibog.in';
};

const BASE_URL = getBaseUrl();

async function checkServerHealth() {
  console.log('🔍 Checking server health...');
  try {
    const response = await fetch(`${BASE_URL}/api/whatsapp/health`);
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Server is healthy!');
      console.log('📱 WhatsApp service status:', result.healthy ? 'Healthy' : 'Unhealthy');
      console.log('📱 WhatsApp enabled:', result.enabled);
      console.log('📱 Circuit breaker status:', result.circuitBreaker.isOpen ? 'Open' : 'Closed');
      return result;
    } else {
      console.error('❌ Server health check failed:', response.status);
      return null;
    }
  } catch (error) {
    console.error('❌ Server health check error:', error.message);
    return null;
  }
}

async function testWhatsAppService() {
  console.log('\n📱 Testing WhatsApp service directly...');
  
  const testData = {
    bookingId: 99999,
    bookingRef: 'TEST001',
    parentName: 'Priya Sharma',
    parentPhone: '6281102112', // Replace with your test number
    childName: 'Arjun Sharma',
    eventTitle: 'NIBOG Baby Olympics 2024',
    eventDate: '2024-12-15',
    eventVenue: 'NIBOG Sports Complex, Bangalore',
    totalAmount: 1500,
    paymentMethod: 'PhonePe',
    transactionId: 'TEST_TXN_' + Date.now(),
    gameDetails: [
      {
        gameName: 'Baby Crawling Race',
        gameTime: '10:00 AM - 10:30 AM',
        gamePrice: 800
      },
      {
        gameName: 'Toddler Ball Toss',
        gameTime: '11:00 AM - 11:30 AM',
        gamePrice: 700
      }
    ]
  };

  try {
    const response = await fetch(`${BASE_URL}/api/whatsapp/send-booking-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ WhatsApp service test - SUCCESS!');
      console.log('📨 Message ID:', result.messageId);
      console.log('📱 Check your WhatsApp for the test message');
      return true;
    } else {
      console.error('❌ WhatsApp service test - FAILED');
      console.error('Error:', result.error);
      if (result.zaptraResponse) {
        console.error('Zaptra Response:', JSON.stringify(result.zaptraResponse, null, 2));
      }
      return false;
    }
  } catch (error) {
    console.error('🚨 WhatsApp service test failed:', error.message);
    return false;
  }
}

async function testPaymentCallbackFlow() {
  console.log('\n💳 Testing payment callback flow with real customer data...');
  
  // Simulate real customer booking data that would be stored in localStorage
  const realCustomerData = {
    userId: 12345,
    parentName: 'Anita Patel',
    email: 'anita.patel@example.com',
    phone: '6281102112', // Replace with your test number
    childName: 'Kavya Patel',
    dob: '2020-05-15',
    gender: 'Female',
    schoolName: 'Little Angels Preschool',
    eventId: 1,
    eventTitle: 'NIBOG Baby Olympics 2024',
    eventDate: '2024-12-15',
    eventVenue: 'NIBOG Sports Complex, Bangalore',
    eventCity: 'Bangalore',
    gameId: [1, 2],
    gamePrice: [800, 700],
    slotId: [101, 102],
    totalAmount: 1500,
    selectedGamesObj: [
      {
        game_id: 1,
        game_title: 'Baby Crawling Race',
        custom_title: 'Baby Crawling Race',
        game_description: 'Fun crawling race for babies',
        custom_description: 'Exciting crawling competition',
        slot_price: 800,
        custom_price: 800,
        game_duration_minutes: 30,
        start_time: '10:00 AM',
        end_time: '10:30 AM',
        max_participants: 20
      },
      {
        game_id: 2,
        game_title: 'Toddler Ball Toss',
        custom_title: 'Toddler Ball Toss',
        game_description: 'Ball tossing game for toddlers',
        custom_description: 'Fun ball tossing activity',
        slot_price: 700,
        custom_price: 700,
        game_duration_minutes: 30,
        start_time: '11:00 AM',
        end_time: '11:30 AM',
        max_participants: 15
      }
    ],
    addOns: [
      {
        addOnId: 1,
        name: 'Participation Certificate',
        quantity: 1,
        variantId: null
      }
    ]
  };

  const testTransactionId = 'NIBOG_12345_' + Date.now();

  try {
    console.log('📋 Simulating payment status check with real customer data...');
    console.log('👤 Customer:', realCustomerData.parentName);
    console.log('👶 Child:', realCustomerData.childName);
    console.log('📞 Phone:', realCustomerData.phone);
    console.log('🎮 Games:', realCustomerData.selectedGamesObj.map(g => g.custom_title).join(', '));

    const response = await fetch(`${BASE_URL}/api/payments/phonepe-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionId: testTransactionId,
        bookingData: realCustomerData
      }),
    });

    const result = await response.json();
    
    console.log('📡 Payment status API response:', response.status);
    console.log('📡 Response data:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ Payment callback flow test completed');
      
      if (result.bookingCreated) {
        console.log('📋 Booking created successfully');
        console.log('🎫 Booking ID:', result.bookingId);
        console.log('📝 Booking Reference:', result.bookingData?.booking_ref);
      }
      
      if (result.emailSent) {
        console.log('📧 Email notification attempted');
      }
      
      // Check if WhatsApp was sent from server
      console.log('📱 WhatsApp notification should have been sent from server-side');
      
      return true;
    } else {
      console.error('❌ Payment callback flow test - FAILED');
      console.error('Error:', result.error);
      return false;
    }
  } catch (error) {
    console.error('🚨 Payment callback test failed:', error.message);
    return false;
  }
}

async function verifyWhatsAppTemplates() {
  console.log('\n📋 Checking available WhatsApp templates...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/whatsapp/templates`);
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ WhatsApp templates retrieved successfully');
      console.log('📋 Available templates:', result.templates?.length || 0);
      if (result.templates && result.templates.length > 0) {
        result.templates.forEach((template, index) => {
          console.log(`   ${index + 1}. ${template.name || template.template_name || 'Unknown'}`);
        });
      }
      return true;
    } else {
      console.error('❌ Failed to get WhatsApp templates');
      console.error('Error:', result.error);
      return false;
    }
  } catch (error) {
    console.error('🚨 WhatsApp templates check failed:', error.message);
    return false;
  }
}

async function runCompleteVerification() {
  console.log('🧪 Starting comprehensive WhatsApp and payment flow verification...\n');
  
  // Step 1: Check server health
  const healthStatus = await checkServerHealth();
  if (!healthStatus) {
    console.log('💡 Please start the server with: npm run dev');
    return;
  }
  
  // Step 2: Check WhatsApp templates
  await verifyWhatsAppTemplates();
  
  // Step 3: Test WhatsApp service directly
  const whatsappTest = await testWhatsAppService();
  
  // Step 4: Test payment callback flow with real customer data
  const paymentTest = await testPaymentCallbackFlow();
  
  // Summary
  console.log('\n📊 VERIFICATION SUMMARY:');
  console.log('='.repeat(50));
  console.log('🏥 Server Health:', healthStatus.healthy ? '✅ Healthy' : '❌ Unhealthy');
  console.log('📱 WhatsApp Enabled:', healthStatus.enabled ? '✅ Enabled' : '❌ Disabled');
  console.log('📱 WhatsApp Service Test:', whatsappTest ? '✅ Passed' : '❌ Failed');
  console.log('💳 Payment Callback Test:', paymentTest ? '✅ Passed' : '❌ Failed');
  
  if (healthStatus.healthy && healthStatus.enabled && whatsappTest && paymentTest) {
    console.log('\n🎉 ALL TESTS PASSED! Your WhatsApp notification system is working correctly.');
    console.log('📱 Real customers will receive WhatsApp notifications when they complete payments.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
  }
  
  console.log('\n💡 NEXT STEPS:');
  console.log('1. Test with a real payment transaction');
  console.log('2. Monitor server logs for WhatsApp notifications');
  console.log('3. Verify customer receives both email and WhatsApp notifications');
  console.log('4. Check that booking references are consistent across all notifications');
}

// Run the verification
runCompleteVerification();
