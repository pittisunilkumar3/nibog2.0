/**
 * Debug script to analyze DOB data flow without requiring server
 * This simulates the exact flow from form input to pending booking creation
 */

// Simulate the formatDateForAPI function from lib/utils.ts
function formatDateForAPI(date) {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  } else if (typeof date === 'string') {
    // If it's already a string, check if it's an ISO string and convert
    return date.includes('T') ? date.split('T')[0] : date;
  } else {
    throw new Error('Invalid date format');
  }
}

// Simulate user selecting a date in the calendar
function simulateUserDateSelection(dateString) {
  console.log('🧪 Simulating user date selection...');
  console.log(`User selects date: ${dateString}`);
  
  // This is what happens when user clicks on a date in the Calendar component
  const selectedDate = new Date(dateString);
  console.log('Date object created:', selectedDate);
  console.log('Date toString:', selectedDate.toString());
  console.log('Date toISOString:', selectedDate.toISOString());
  
  return selectedDate;
}

// Simulate the handleDobChange function
function simulateHandleDobChange(date) {
  console.log('\n=== DOB CHANGE HANDLER CALLED ===');
  console.log('Previous DOB:', null); // Assuming no previous value
  console.log('New DOB:', date);
  console.log('Date type:', typeof date);
  console.log('Date string:', date?.toString());
  console.log('Date ISO:', date?.toISOString());
  
  // This would set the dob state
  const dobState = date;
  
  if (date) {
    console.log('Formatted DOB for API:', formatDateForAPI(date));
  }
  
  return dobState;
}

// Simulate booking data creation
function simulateBookingDataCreation(dobState) {
  console.log('\n=== BOOKING DATA CREATION ===');
  console.log('DOB state:', dobState);
  console.log('DOB type:', typeof dobState);
  
  if (!dobState) {
    console.error('❌ DOB state is null/undefined!');
    return null;
  }
  
  const formattedDob = formatDateForAPI(dobState);
  console.log('Formatted DOB:', formattedDob);
  
  const bookingData = {
    userId: 114,
    parentName: 'Pitti Sunil Kumar',
    email: 'pittisunilkumar3@gmail.com',
    phone: '6303727148',
    childName: 'Pitti Sunil Kumar',
    childDob: formattedDob, // This is the critical field
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
  
  console.log('=== DOB TRACKING IN REGISTRATION ===');
  console.log('Original DOB from form:', dobState);
  console.log('DOB type:', typeof dobState);
  console.log('DOB toString:', dobState?.toString());
  console.log('DOB toISOString:', dobState?.toISOString());
  console.log('Formatted DOB for booking:', bookingData.childDob);
  console.log('DOB format validation:', /^\d{4}-\d{2}-\d{2}$/.test(bookingData.childDob) ? "✅ Valid YYYY-MM-DD" : "❌ Invalid format");
  console.log('DOB matches expected format:', bookingData.childDob === "2024-07-01" ? "✅ Matches expected" : "❌ Does not match expected");
  
  return bookingData;
}

// Simulate pending booking API payload creation
function simulatePendingBookingPayload(bookingData) {
  console.log('\n=== PENDING BOOKING API PAYLOAD CREATION ===');
  
  if (!bookingData) {
    console.error('❌ No booking data provided!');
    return null;
  }
  
  console.log('Received childDob:', bookingData.childDob);
  console.log('childDob type:', typeof bookingData.childDob);
  console.log('DOB format validation:', /^\d{4}-\d{2}-\d{2}$/.test(bookingData.childDob) ? "✅ Valid YYYY-MM-DD" : "❌ Invalid format");
  
  // Simulate the pending booking payload creation
  const timestamp = Date.now();
  const transactionId = `NIBOG_${bookingData.userId}_${timestamp}`;
  
  const pendingBookingPayload = {
    transaction_id: transactionId,
    user_id: bookingData.userId,
    booking_data: JSON.stringify(bookingData),
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    status: 'pending'
  };
  
  console.log('=== VERIFYING DOB IN STRINGIFIED BOOKING DATA ===');
  const stringifiedData = JSON.stringify(bookingData);
  console.log('Stringified booking data contains childDob:', stringifiedData.includes('"childDob"'));
  console.log('Stringified childDob value:', stringifiedData.match(/"childDob":"([^"]+)"/)?.[1] || "NOT FOUND");
  
  // Double-check by parsing it back
  try {
    const parsedBack = JSON.parse(stringifiedData);
    console.log('Parsed back childDob:', parsedBack.childDob);
    console.log('DOB preserved correctly:', parsedBack.childDob === bookingData.childDob ? "✅ YES" : "❌ NO");
  } catch (parseError) {
    console.error('❌ Error parsing back stringified data:', parseError);
  }
  
  return pendingBookingPayload;
}

// Test different date scenarios
function testDateScenarios() {
  console.log('🧪 Testing Different Date Scenarios...\n');
  
  const testDates = [
    '2024-07-01', // The expected date
    '2024-07-31', // The date that appeared in the payload
    '2020-05-15', // A different test date
  ];
  
  testDates.forEach((dateString, index) => {
    console.log(`\n📅 Test ${index + 1}: ${dateString}`);
    console.log('='.repeat(50));
    
    try {
      // Step 1: User selects date
      const selectedDate = simulateUserDateSelection(dateString);
      
      // Step 2: Handle DOB change
      const dobState = simulateHandleDobChange(selectedDate);
      
      // Step 3: Create booking data
      const bookingData = simulateBookingDataCreation(dobState);
      
      // Step 4: Create pending booking payload
      const payload = simulatePendingBookingPayload(bookingData);
      
      // Summary
      console.log('\n📊 SUMMARY:');
      console.log(`Input Date: ${dateString}`);
      console.log(`Final DOB: ${bookingData?.childDob}`);
      console.log(`Success: ${bookingData?.childDob === dateString ? '✅' : '❌'}`);
      
    } catch (error) {
      console.error(`❌ Test failed for ${dateString}:`, error.message);
    }
  });
}

// Test potential issues
function testPotentialIssues() {
  console.log('\n🔍 Testing Potential Issues...\n');
  
  // Test 1: Timezone issues
  console.log('Test 1: Timezone Issues');
  console.log('-'.repeat(30));
  const date1 = new Date('2024-07-01');
  const date2 = new Date('2024-07-01T00:00:00.000Z');
  const date3 = new Date('2024-07-01T12:00:00.000Z');
  
  console.log('Date("2024-07-01"):', formatDateForAPI(date1));
  console.log('Date("2024-07-01T00:00:00.000Z"):', formatDateForAPI(date2));
  console.log('Date("2024-07-01T12:00:00.000Z"):', formatDateForAPI(date3));
  
  // Test 2: String vs Date object
  console.log('\nTest 2: String vs Date Object');
  console.log('-'.repeat(30));
  console.log('formatDateForAPI("2024-07-01"):', formatDateForAPI('2024-07-01'));
  console.log('formatDateForAPI(new Date("2024-07-01")):', formatDateForAPI(new Date('2024-07-01')));
  
  // Test 3: Calendar component behavior simulation
  console.log('\nTest 3: Calendar Component Behavior');
  console.log('-'.repeat(30));
  // The Calendar component typically passes a Date object to onSelect
  const calendarDate = new Date('2024-07-01');
  console.log('Calendar selected date:', calendarDate);
  console.log('Formatted for API:', formatDateForAPI(calendarDate));
}

// Run all tests
console.log('🚀 Starting DOB Flow Debug Analysis...\n');
testDateScenarios();
testPotentialIssues();
console.log('\n🎉 Debug analysis completed!');
