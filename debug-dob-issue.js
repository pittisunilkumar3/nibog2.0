/**
 * Debug script to identify the DOB issue in the registration form
 */

console.log("=== DEBUGGING DOB ISSUE ===");

// Test the formatDateForAPI function
function formatDateForAPI(date) {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  } else if (typeof date === 'string') {
    return date.includes('T') ? date.split('T')[0] : date;
  } else {
    throw new Error('Invalid date format');
  }
}

// Test scenarios that might occur in the form
console.log("\n1. Testing various DOB scenarios:");

// Scenario 1: User selects date from calendar
const userSelectedDate = new Date('2015-01-01');
console.log("User selected date:", userSelectedDate);
console.log("Formatted:", formatDateForAPI(userSelectedDate));

// Scenario 2: Date from session storage (might be string)
const sessionStorageDate = '2015-01-01';
console.log("Session storage date:", sessionStorageDate);
console.log("Formatted:", formatDateForAPI(sessionStorageDate));

// Scenario 3: Date with time component
const dateWithTime = new Date('2015-01-01T10:30:00.000Z');
console.log("Date with time:", dateWithTime);
console.log("Formatted:", formatDateForAPI(dateWithTime));

// Test the exact payload structure
console.log("\n2. Testing payload structure:");

const testPayload = {
  "user_id": 114,
  "parent": {
    "parent_name": "Pitti Sunil Kumar",
    "email": "pittisunilkumar3@gmail.com",
    "additional_phone": "6303727148"
  },
  "child": {
    "full_name": "Pitti Sunil Kumar",
    "date_of_birth": formatDateForAPI(userSelectedDate),
    "school_name": "hgfds",
    "gender": "Male"
  },
  "booking": {
    "event_id": 109,
    "booking_date": "2025-08-14",
    "total_amount": 1,
    "payment_method": "PhonePe",
    "payment_status": "Paid",
    "terms_accepted": true,
    "transaction_id": "OMO2508141555013643309314",
    "merchant_transaction_id": "NIBOG_114_1755167101252",
    "booking_ref": "PPT250814314",
    "status": "Confirmed"
  },
  "booking_games": [
    {
      "slot_id": 339,
      "game_id": 9,
      "game_price": 1
    }
  ]
};

console.log("Generated payload:");
console.log(JSON.stringify(testPayload, null, 2));

// Validate the DOB in the payload
const dobInPayload = testPayload.child.date_of_birth;
const isValidDOB = /^\d{4}-\d{2}-\d{2}$/.test(dobInPayload);
console.log(`\nDOB in payload: ${dobInPayload}`);
console.log(`DOB format valid: ${isValidDOB ? '✅' : '❌'}`);

// Test potential issues
console.log("\n3. Testing potential issues:");

// Issue 1: Undefined DOB
try {
  const undefinedResult = formatDateForAPI(undefined);
  console.log("Undefined DOB result:", undefinedResult);
} catch (error) {
  console.log("Undefined DOB error:", error.message);
}

// Issue 2: Null DOB
try {
  const nullResult = formatDateForAPI(null);
  console.log("Null DOB result:", nullResult);
} catch (error) {
  console.log("Null DOB error:", error.message);
}

// Issue 3: Empty string DOB
try {
  const emptyResult = formatDateForAPI('');
  console.log("Empty string DOB result:", emptyResult);
} catch (error) {
  console.log("Empty string DOB error:", error.message);
}

// Issue 4: Invalid date
try {
  const invalidResult = formatDateForAPI('invalid-date');
  console.log("Invalid date result:", invalidResult);
} catch (error) {
  console.log("Invalid date error:", error.message);
}

console.log("\n4. Recommendations:");
console.log("- Check browser console for errors when selecting DOB");
console.log("- Verify the DOB state is properly set in React component");
console.log("- Check if there are validation errors preventing form submission");
console.log("- Ensure the calendar component is properly calling handleDobChange");
console.log("- Verify the DOB is not being overwritten in session storage restoration");

// Test the exact flow from your payload
console.log("\n5. Testing your exact payload:");
const yourPayload = {
  "user_id": 114,
  "parent": {
    "parent_name": "Pitti Sunil Kumar",
    "email": "pittisunilkumar3@gmail.com",
    "additional_phone": "6303727148"
  },
  "child": {
    "full_name": "Pitti Sunil Kumar",
    "date_of_birth": "2015-01-01",
    "school_name": "hgfds",
    "gender": "Male"
  },
  "booking": {
    "event_id": 109,
    "booking_date": "2025-08-14",
    "total_amount": 1,
    "payment_method": "PhonePe",
    "payment_status": "Paid",
    "terms_accepted": true,
    "transaction_id": "OMO2508141555013643309314",
    "merchant_transaction_id": "NIBOG_114_1755167101252",
    "booking_ref": "PPT250814314",
    "status": "Confirmed"
  },
  "booking_games": [
    {
      "slot_id": 339,
      "game_id": 9,
      "game_price": 1
    }
  ]
};

console.log("Your payload DOB:", yourPayload.child.date_of_birth);
console.log("Your payload DOB type:", typeof yourPayload.child.date_of_birth);
console.log("Your payload DOB format valid:", /^\d{4}-\d{2}-\d{2}$/.test(yourPayload.child.date_of_birth) ? '✅' : '❌');

// The issue might be that the form is not properly capturing the DOB
// Let's simulate what might be happening
console.log("\n6. Simulating potential form issues:");

// Scenario: DOB state is undefined when form is submitted
let dobState = undefined;
console.log("DOB state:", dobState);
console.log("DOB state type:", typeof dobState);

if (dobState) {
  console.log("DOB would be formatted:", formatDateForAPI(dobState));
} else {
  console.log("❌ DOB is undefined - this would cause the issue!");
}

// Scenario: DOB state is properly set
dobState = new Date('2015-01-01');
console.log("Properly set DOB state:", dobState);
console.log("Properly set DOB formatted:", formatDateForAPI(dobState));

console.log("\n=== CONCLUSION ===");
console.log("The DOB formatting functions work correctly.");
console.log("The issue is likely that the DOB state is not being set properly in the React component.");
console.log("Check the browser console when selecting a date to see if handleDobChange is being called.");
console.log("Also check if there are any validation errors preventing the form from proceeding.");
