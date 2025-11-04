/**
 * Test script to verify the formatDateForAPI function works correctly
 */

// Simulate the formatDateForAPI function
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

console.log('🧪 Testing formatDateForAPI function...');

// Test cases
const testCases = [
  {
    name: 'Date object',
    input: new Date('2020-05-15T00:00:00.000Z'),
    expected: '2020-05-15'
  },
  {
    name: 'ISO string',
    input: '2020-05-15T10:30:00.000Z',
    expected: '2020-05-15'
  },
  {
    name: 'YYYY-MM-DD string',
    input: '2020-05-15',
    expected: '2020-05-15'
  },
  {
    name: 'Date from form input',
    input: new Date('2020-05-15'),
    expected: '2020-05-15'
  }
];

let allPassed = true;

testCases.forEach((testCase, index) => {
  try {
    const result = formatDateForAPI(testCase.input);
    const passed = result === testCase.expected;
    
    console.log(`Test ${index + 1} (${testCase.name}):`);
    console.log(`  Input: ${testCase.input} (${typeof testCase.input})`);
    console.log(`  Expected: ${testCase.expected}`);
    console.log(`  Result: ${result}`);
    console.log(`  Status: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (!passed) {
      allPassed = false;
    }
    
    console.log('');
  } catch (error) {
    console.log(`Test ${index + 1} (${testCase.name}): ❌ ERROR - ${error.message}`);
    allPassed = false;
  }
});

console.log(`Overall result: ${allPassed ? '✅ All tests passed' : '❌ Some tests failed'}`);

// Test the specific scenario from the registration form
console.log('\n🔍 Testing registration form scenario...');

// Simulate what happens in the registration form
const userSelectedDate = new Date('2020-05-15'); // User selects this date
console.log('User selected date:', userSelectedDate);

const formattedForBooking = formatDateForAPI(userSelectedDate);
console.log('Formatted for booking:', formattedForBooking);

// Simulate the bookingData object
const bookingData = {
  userId: 123,
  parentName: 'Test Parent',
  childName: 'Test Child',
  childDob: formattedForBooking, // This is what gets stored
  // ... other fields
};

console.log('BookingData childDob:', bookingData.childDob);

// Simulate JSON.stringify (what happens in pending booking creation)
const stringified = JSON.stringify(bookingData);
console.log('Stringified contains childDob:', stringified.includes('"childDob"'));

// Extract the DOB from stringified data
const dobMatch = stringified.match(/"childDob":"([^"]+)"/);
console.log('Extracted DOB from stringified:', dobMatch ? dobMatch[1] : 'NOT FOUND');

// Simulate parsing back (what happens in pending booking retrieval)
const parsedBack = JSON.parse(stringified);
console.log('Parsed back childDob:', parsedBack.childDob);

// Final verification
const dobPreserved = parsedBack.childDob === formattedForBooking;
console.log(`DOB preserved through stringify/parse: ${dobPreserved ? '✅ YES' : '❌ NO'}`);

console.log('\n🎉 Date formatting test completed!');
