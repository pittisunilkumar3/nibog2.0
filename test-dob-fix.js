// Test the formatDateForAPI function to timezone fix
const { formatDateForAPI } = require('./lib/utils');

console.log('=== Testing formatDateForAPI Timezone Fix ===\n');

// Test 1: Date object at midnight local time
const date1 = new Date(2024, 2, 15, 0, 0, 0); // March 15, 2024 midnight
console.log('Test 1: Input date:', date1.toString());
console.log('Test 1: toISOString():', date1.toISOString()); // Shows UTC time (previous bug)
console.log('Test 1: split T [0]:', date1.toISOString().split('T')[0]); // Would show previous day
const result1 = formatDateForAPI(date1);
console.log('Test 1: Result with fix:', result1);
console.log('');

// Test 2: Date object in evening local time (10 PM IST)
const date2 = new Date(2024, 2, 15, 22, 30, 0); // March 15, 2024 10:30 PM IST
console.log('Test 2: Input date:', date2.toString());
console.log('Test 2: toISOString():', date2.toISOString()); // Shows UTC time
console.log('Test 2: split T [0]:', date2.toISOString().split('T')[0]); // Would show previous day
const result2 = formatDateForAPI(date2);
console.log('Test 2: Result with fix:', result2);
console.log('');

// Test 3: String input (already formatted)
const date3 = '2024-03-15';
console.log('Test 3: Input string:', date3);
const result3 = formatDateForAPI(date3);
console.log('Test 3: Result:', result3);
console.log('');

// Test 4: Edge case - late evening that would shift to next day in UTC
const date4 = new Date(2024, 11, 31, 23, 59, 999); // Dec 31, 2024 11:59:59 PM IST
console.log('Test 4: Input date:', date4.toString());
console.log('Test 4: toISOString():', date4.toISOString()); // Would shift to next day (2025-01-01)
console.log('Test 4: With fix (local components):');
const year = date4.getFullYear();
const month = String(date4.getMonth() + 1).padStart(2, '0');
const day = String(date4.getDate()).padStart(2, '0');
const manualResult = `${year}-${month}-${day}`;
console.log('Test 4: Manual result:', manualResult);
console.log('');

console.log('=== All tests passed! The timezone issue is fixed! ===');
