// Test the event ID extraction fix
console.log('Testing Event ID Extraction...\n');

// Test different response formats
const testResponses = [
  { id: 123, title: "Test Event" }, // Old format
  { event_id: 130, success: 'true' }, // New format from your API
  { event_id: 456, id: 789, title: "Test Event" }, // Both formats (should prefer event_id)
];

testResponses.forEach((response, index) => {
  console.log(`Test ${index + 1}:`, response);
  
  // This is the logic from the updated code
  const eventId = response?.event_id || response?.id;
  
  if (!eventId) {
    console.log('❌ No event ID found');
  } else {
    console.log('✅ Event ID extracted:', eventId);
  }
  console.log('---');
});

console.log('\nThe fix should now handle your API response format:');
console.log('✅ {success: "true", event_id: 130} → extracts event_id: 130');
console.log('✅ {id: 123, title: "..."} → extracts id: 123 (backward compatibility)');
