/**
 * Complete DOB flow test - tests the actual API endpoints
 * This verifies that the DOB "2024-07-01" flows correctly through the system
 */

const BASE_URL = 'http://localhost:3000';

// Test data matching the user's scenario
const testBookingData = {
  userId: 114,
  parentName: 'Pitti Sunil Kumar',
  email: 'pittisunilkumar3@gmail.com',
  phone: '6303727148',
  childName: 'Pitti Sunil Kumar',
  childDob: '2024-07-01', // This is the specific DOB the user selected
  schoolName: 'dfghjk',
  gender: 'male',
  eventId: 109,
  gameId: [9],
  gamePrice: [1],
  totalAmount: 1,
  paymentMethod: 'PhonePe',
  termsAccepted: true,
  eventTitle: 'test',
  eventDate: 'August 31st, 2025',
  eventVenue: 'S3 Sports Arena',
  eventCity: 'Vizag',
  slotId: [339],
  addOns: []
};

async function testCompleteDOBFlow() {
  console.log('🧪 Testing Complete DOB Flow...');
  console.log('📋 Expected DOB: 2024-07-01');
  console.log('📋 Test booking data:', JSON.stringify(testBookingData, null, 2));
  
  let transactionId = null;
  
  try {
    // Step 1: Test pending booking creation
    console.log('\n📦 Step 1: Testing pending booking creation...');
    
    const createResponse = await fetch(`${BASE_URL}/api/pending-bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testBookingData),
    });

    console.log('Create response status:', createResponse.status);
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Failed to create pending booking: ${createResponse.status} - ${errorText}`);
    }

    const createResult = await createResponse.json();
    transactionId = createResult.transactionId;
    
    console.log('✅ Pending booking created successfully');
    console.log('📋 Transaction ID:', transactionId);
    console.log('⏰ Expires at:', createResult.expiresAt);

    // Step 2: Test pending booking retrieval
    console.log('\n🔍 Step 2: Testing pending booking retrieval...');
    
    const retrieveResponse = await fetch(`${BASE_URL}/api/pending-bookings/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction_id: transactionId
      }),
    });

    console.log('Retrieve response status:', retrieveResponse.status);

    if (!retrieveResponse.ok) {
      const errorText = await retrieveResponse.text();
      throw new Error(`Failed to retrieve pending booking: ${retrieveResponse.status} - ${errorText}`);
    }

    const retrieveResult = await retrieveResponse.json();
    console.log('✅ Retrieved pending booking data');
    
    // Step 3: Verify DOB integrity
    console.log('\n🔍 Step 3: Verifying DOB integrity...');
    
    const retrievedDob = retrieveResult.childDob;
    const expectedDob = '2024-07-01';
    
    console.log('Expected DOB:', expectedDob);
    console.log('Retrieved DOB:', retrievedDob);
    console.log('DOB type:', typeof retrievedDob);
    
    if (retrievedDob === expectedDob) {
      console.log('✅ DOB verification PASSED: Retrieved DOB matches expected');
    } else {
      console.log('❌ DOB verification FAILED: Retrieved DOB does not match expected');
      console.log('   Expected:', expectedDob);
      console.log('   Retrieved:', retrievedDob);
    }

    // Step 4: Verify complete booking data
    console.log('\n📋 Step 4: Verifying complete booking data...');
    
    const bookingData = retrieveResult;
    console.log('Complete retrieved data:');
    console.log(JSON.stringify(bookingData, null, 2));
    
    // Check all key fields
    const checks = [
      { field: 'childDob', expected: '2024-07-01', actual: bookingData.childDob },
      { field: 'childName', expected: 'Pitti Sunil Kumar', actual: bookingData.childName },
      { field: 'parentName', expected: 'Pitti Sunil Kumar', actual: bookingData.parentName },
      { field: 'email', expected: 'pittisunilkumar3@gmail.com', actual: bookingData.email },
      { field: 'phone', expected: '6303727148', actual: bookingData.phone },
      { field: 'eventId', expected: 109, actual: bookingData.eventId },
      { field: 'userId', expected: 114, actual: bookingData.userId }
    ];
    
    let allChecksPass = true;
    checks.forEach(check => {
      const passed = check.actual === check.expected;
      console.log(`${check.field}: ${passed ? '✅' : '❌'} Expected: ${check.expected}, Actual: ${check.actual}`);
      if (!passed) allChecksPass = false;
    });
    
    if (allChecksPass) {
      console.log('✅ All data integrity checks PASSED');
    } else {
      console.log('❌ Some data integrity checks FAILED');
    }

    // Step 5: Test payment callback simulation
    console.log('\n💳 Step 5: Payment callback simulation...');
    console.log('📋 The payment callback would now retrieve this pending booking');
    console.log('📋 And create the final booking with DOB:', retrievedDob);
    
    if (retrievedDob === '2024-07-01') {
      console.log('✅ Payment callback would use the correct DOB!');
    } else {
      console.log('❌ Payment callback would use incorrect DOB!');
    }

    console.log('\n🎉 Complete DOB flow test finished!');
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`DOB Input: ${testBookingData.childDob}`);
    console.log(`DOB Retrieved: ${retrievedDob}`);
    console.log(`DOB Preserved: ${retrievedDob === testBookingData.childDob ? '✅ YES' : '❌ NO'}`);
    console.log(`Transaction ID: ${transactionId}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    // Cleanup
    if (transactionId) {
      console.log('\n🧹 Cleaning up pending booking...');
      try {
        const deleteResponse = await fetch(`${BASE_URL}/api/pending-bookings/delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transaction_id: transactionId
          }),
        });

        if (deleteResponse.ok) {
          console.log('✅ Pending booking cleaned up successfully');
        } else {
          console.log('⚠️  Failed to clean up pending booking (this is okay for testing)');
        }
      } catch (cleanupError) {
        console.log('⚠️  Cleanup error (this is okay for testing):', cleanupError.message);
      }
    }
  }
}

// Run the test
console.log('🚀 Starting Complete DOB Flow Test...');
testCompleteDOBFlow();
