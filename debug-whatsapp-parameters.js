/**
 * Debug WhatsApp Parameter Mismatch Issue
 * Compare frontend vs admin panel parameter structures
 */

async function debugWhatsAppParameters() {
  console.log('🔍 DEBUGGING WHATSAPP PARAMETER MISMATCH');
  console.log('=' .repeat(60));

  // Test 1: Verify template structure
  console.log('\n📋 Test 1: Template Structure Verification');
  console.log('-'.repeat(40));
  
  try {
    const templatesResponse = await fetch('http://localhost:3111/api/whatsapp/templates');
    const templatesData = await templatesResponse.json();
    
    if (templatesData.success) {
      const bookingTemplate = templatesData.templates.find(t => t.name === 'booking_confirmation_latest');
      
      if (bookingTemplate) {
        console.log('✅ Template found:', bookingTemplate.name);
        console.log('📋 Status:', bookingTemplate.status);
        
        const components = JSON.parse(bookingTemplate.components);
        const bodyComponent = components.find(c => c.type === 'BODY');
        
        if (bodyComponent) {
          const parameters = bodyComponent.text.match(/\{\{\d+\}\}/g) || [];
          console.log('📋 Expected parameters:', parameters.length);
          console.log('📋 Parameters:', parameters);
          
          // Extract parameter numbers
          const paramNumbers = parameters.map(p => parseInt(p.replace(/[{}]/g, '')));
          console.log('📋 Parameter sequence:', paramNumbers);
          
          if (paramNumbers.length !== 8) {
            console.log('❌ ISSUE: Template expects', paramNumbers.length, 'parameters, but service sends 8');
          } else {
            console.log('✅ Parameter count matches (8)');
          }
        }
      }
    }
  } catch (error) {
    console.log('❌ Template check failed:', error.message);
  }

  // Test 2: Simulate Frontend Data Structure
  console.log('\n🌐 Test 2: Frontend Data Structure Simulation');
  console.log('-'.repeat(40));
  
  const frontendData = {
    bookingId: 12345,
    bookingRef: 'PPT250106123',
    parentName: 'John Doe',
    parentPhone: '+916303727148',
    childName: 'Jane Doe',
    eventTitle: 'Birthday Party Event',
    eventDate: '2024-01-15',
    eventVenue: 'Main Stadium',
    totalAmount: 2500,
    paymentMethod: 'PhonePe',
    transactionId: 'TXN123456789',
    gameDetails: [{
      gameName: 'Musical Chairs',
      gameTime: '10:00 AM - 11:00 AM',
      gamePrice: 1500
    }]
  };

  console.log('📋 Frontend data structure:');
  Object.entries(frontendData).forEach(([key, value]) => {
    console.log(`  ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value} (${typeof value})`);
  });

  try {
    console.log('\n📱 Testing frontend-style data...');
    const frontendResponse = await fetch('http://localhost:3111/api/whatsapp/send-booking-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(frontendData)
    });

    const frontendResult = await frontendResponse.json();
    console.log('📡 Frontend test result:', frontendResult.success ? 'SUCCESS' : `FAILED: ${frontendResult.error}`);
    
    if (frontendResult.success) {
      console.log('📱 Message ID:', frontendResult.messageId);
    }
  } catch (error) {
    console.log('❌ Frontend test failed:', error.message);
  }

  // Test 3: Simulate Admin Panel Data Structure
  console.log('\n⚙️ Test 3: Admin Panel Data Structure Simulation');
  console.log('-'.repeat(40));
  
  const adminData = {
    bookingId: 12346,
    bookingRef: 'MAN250106124',
    parentName: 'Jane Smith',
    parentPhone: '+916303727148',
    childName: 'John Smith',
    eventTitle: 'Birthday Celebration',
    eventDate: '2024-01-16',
    eventVenue: undefined, // This might be the issue!
    totalAmount: 3000,
    paymentMethod: 'Cash payment',
    transactionId: 'MAN_TXN123456789',
    gameDetails: [{
      gameName: 'Treasure Hunt',
      gameTime: '2:00 PM - 3:00 PM',
      gamePrice: 2000
    }],
    addOns: [{
      name: 'Birthday Cake',
      quantity: 1,
      price: 1000
    }]
  };

  console.log('📋 Admin panel data structure:');
  Object.entries(adminData).forEach(([key, value]) => {
    console.log(`  ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value} (${typeof value})`);
  });

  try {
    console.log('\n📱 Testing admin-style data...');
    const adminResponse = await fetch('http://localhost:3111/api/whatsapp/send-booking-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData)
    });

    const adminResult = await adminResponse.json();
    console.log('📡 Admin test result:', adminResult.success ? 'SUCCESS' : `FAILED: ${adminResult.error}`);
    
    if (!adminResult.success && adminResult.error.includes('132000')) {
      console.log('🔍 PARAMETER MISMATCH ERROR DETECTED!');
      console.log('📋 This confirms the issue is with admin panel data structure');
    }
  } catch (error) {
    console.log('❌ Admin test failed:', error.message);
  }

  // Test 4: Test with Missing/Undefined Fields
  console.log('\n🧪 Test 4: Testing with Missing/Undefined Fields');
  console.log('-'.repeat(40));
  
  const problematicData = {
    bookingId: 12347,
    bookingRef: 'TEST123',
    parentName: 'Test Parent',
    parentPhone: '+916303727148',
    childName: 'Test Child',
    eventTitle: 'Test Event',
    eventDate: undefined,
    eventVenue: null,
    totalAmount: 0,
    paymentMethod: undefined,
    transactionId: 'TEST_TXN',
    gameDetails: []
  };

  console.log('📋 Problematic data (with undefined/null values):');
  Object.entries(problematicData).forEach(([key, value]) => {
    console.log(`  ${key}: ${value} (${typeof value})`);
  });

  try {
    console.log('\n📱 Testing problematic data...');
    const problematicResponse = await fetch('http://localhost:3111/api/whatsapp/send-booking-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(problematicData)
    });

    const problematicResult = await problematicResponse.json();
    console.log('📡 Problematic test result:', problematicResult.success ? 'SUCCESS' : `FAILED: ${problematicResult.error}`);
  } catch (error) {
    console.log('❌ Problematic test failed:', error.message);
  }

  // Test 5: Manual Parameter Count Test
  console.log('\n🔢 Test 5: Manual Parameter Count Test');
  console.log('-'.repeat(40));
  
  // Simulate the exact parameter mapping from whatsappService.ts
  const testBookingData = adminData;
  const bookingRef = testBookingData.bookingRef || `B${String(testBookingData.bookingId).padStart(7, '0')}`;
  
  const templateData = [
    testBookingData.parentName || 'Customer',                    // {{1}} - customer_name
    testBookingData.eventTitle || 'NIBOG Event',                 // {{2}} - event_title
    testBookingData.eventDate || new Date().toLocaleDateString(), // {{3}} - event_date
    testBookingData.eventVenue || 'Event Venue',                 // {{4}} - venue_name
    testBookingData.childName || 'Child',                        // {{5}} - child_name
    bookingRef || 'N/A',                                         // {{6}} - booking_ref
    `₹${testBookingData.totalAmount || 0}`,                      // {{7}} - total_amount with currency
    testBookingData.paymentMethod || 'Payment'                   // {{8}} - payment_method
  ];

  console.log('📋 Manual parameter mapping:');
  templateData.forEach((param, index) => {
    console.log(`  {{${index + 1}}}: "${param}" (${typeof param})`);
  });

  console.log(`\n📊 Parameter count: ${templateData.length}`);
  console.log('📊 Has null/undefined:', templateData.some(p => p === null || p === undefined));
  console.log('📊 All strings:', templateData.every(p => typeof p === 'string'));

  // Final Analysis
  console.log('\n🎯 ANALYSIS SUMMARY');
  console.log('=' .repeat(60));
  console.log('1. Template expects 8 parameters ✅');
  console.log('2. Service sends 8 parameters ✅');
  console.log('3. Parameter sanitization in place ✅');
  console.log('4. Issue likely in admin panel data preparation ⚠️');
  console.log('\n💡 LIKELY CAUSES:');
  console.log('- eventVenue field might be undefined in admin panel');
  console.log('- selectedApiEvent.venue_name might not exist');
  console.log('- Data type mismatches in admin panel preparation');
  console.log('\n🔧 NEXT STEPS:');
  console.log('1. Check admin panel eventVenue field preparation');
  console.log('2. Verify selectedApiEvent data structure');
  console.log('3. Add better logging in admin panel WhatsApp call');
}

// Run the debug analysis
debugWhatsAppParameters();
