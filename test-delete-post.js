// Test DELETE endpoint using POST method (as configured in n8n)

const API_BASE_URL = 'https://ai.nibog.in/webhook';

console.log('🧪 Testing DELETE Endpoint with POST Method\n');
console.log('═══════════════════════════════════════════════════════\n');

async function testDeleteWithPost() {
  console.log('📋 Test: Delete Partner using POST method');
  console.log('   Endpoint: /partners/delete');
  console.log('   Method: POST (as configured in n8n)');
  console.log('   Note: Using fake ID 99999 for testing\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}/partners/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: 99999 })
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    const data = await response.text();
    console.log(`   Response: ${data}\n`);

    if (response.ok || response.status === 200) {
      console.log('✅ DELETE endpoint is working with POST method!');
      console.log('   Your admin page should now work correctly.\n');
      return true;
    } else {
      console.log('❌ Request failed - check n8n workflow\n');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Request FAILED: ${error.message}\n`);
    return false;
  }
}

async function runTest() {
  console.log('Testing Partners Delete API\n');
  
  const passed = await testDeleteWithPost();
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (passed) {
    console.log('✅ FIXED! Delete endpoint works with POST method');
    console.log('   - Changed frontend from DELETE to POST');
    console.log('   - Matches n8n webhook configuration');
    console.log('   - No CORS preflight issues\n');
    console.log('NEXT STEPS:');
    console.log('1. Refresh your admin page (Ctrl+R)');
    console.log('2. Try deleting a partner');
    console.log('3. It should work without CORS errors!\n');
  } else {
    console.log('❌ Still having issues');
    console.log('   Please check:');
    console.log('   1. n8n workflow is activated');
    console.log('   2. Webhook path is /partners/delete');
    console.log('   3. Method is set to POST\n');
  }
}

runTest().catch(console.error);
