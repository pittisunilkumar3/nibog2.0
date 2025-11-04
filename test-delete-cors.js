// Test DELETE endpoint CORS configuration
// Run this script to verify CORS is working correctly

const API_BASE_URL = 'https://ai.nibog.in/webhook';

console.log('🧪 Testing DELETE Endpoint CORS Configuration\n');

// Test 1: OPTIONS Preflight Request
async function testOptionsRequest() {
  console.log('📋 Test 1: OPTIONS Preflight Request');
  console.log('   Endpoint: /partners/delete');
  
  try {
    const response = await fetch(`${API_BASE_URL}/partners/delete`, {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'DELETE',
        'Access-Control-Request-Headers': 'Content-Type',
        'Origin': 'http://localhost:3111'
      }
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    // Check CORS headers
    const headers = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
    };

    console.log('   CORS Headers:');
    console.log(`     Allow-Origin: ${headers['Access-Control-Allow-Origin'] || '❌ MISSING'}`);
    console.log(`     Allow-Methods: ${headers['Access-Control-Allow-Methods'] || '❌ MISSING'}`);
    console.log(`     Allow-Headers: ${headers['Access-Control-Allow-Headers'] || '❌ MISSING'}`);

    if (headers['Access-Control-Allow-Origin'] && 
        headers['Access-Control-Allow-Methods']?.includes('DELETE')) {
      console.log('   ✅ OPTIONS request PASSED - CORS configured correctly\n');
      return true;
    } else {
      console.log('   ❌ OPTIONS request FAILED - CORS headers missing\n');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ OPTIONS request FAILED: ${error.message}\n`);
    return false;
  }
}

// Test 2: Actual DELETE Request (with fake ID)
async function testDeleteRequest() {
  console.log('📋 Test 2: DELETE Request');
  console.log('   Endpoint: /partners/delete');
  console.log('   Note: Using fake ID 99999 for testing\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}/partners/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3111'
      },
      body: JSON.stringify({ id: 99999 })
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    const corsHeader = response.headers.get('Access-Control-Allow-Origin');
    console.log(`   CORS Header: ${corsHeader || '❌ MISSING'}`);

    const data = await response.text();
    console.log(`   Response: ${data.substring(0, 200)}`);

    if (corsHeader) {
      console.log('   ✅ DELETE request PASSED - CORS header present\n');
      return true;
    } else {
      console.log('   ❌ DELETE request FAILED - CORS header missing\n');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ DELETE request FAILED: ${error.message}\n`);
    return false;
  }
}

// Test 3: Check all partner endpoints for CORS
async function testAllEndpoints() {
  console.log('📋 Test 3: All Partner Endpoints CORS Check\n');
  
  const endpoints = [
    { method: 'GET', path: '/partners' },
    { method: 'POST', path: '/partners/create' },
    { method: 'POST', path: '/partners/update' },
    { method: 'DELETE', path: '/partners/delete' }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint.path}`, {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': endpoint.method,
          'Origin': 'http://localhost:3111'
        }
      });

      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      const status = corsHeader ? '✅' : '❌';
      
      console.log(`   ${status} ${endpoint.method.padEnd(6)} ${endpoint.path.padEnd(20)} CORS: ${corsHeader || 'MISSING'}`);
    } catch (error) {
      console.log(`   ❌ ${endpoint.method.padEnd(6)} ${endpoint.path.padEnd(20)} ERROR: ${error.message}`);
    }
  }
  console.log('');
}

// Run all tests
async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  PARTNERS DELETE ENDPOINT - CORS TEST');
  console.log('═══════════════════════════════════════════════════════\n');

  const optionsPass = await testOptionsRequest();
  const deletePass = await testDeleteRequest();
  await testAllEndpoints();

  console.log('═══════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (optionsPass && deletePass) {
    console.log('✅ ALL TESTS PASSED - DELETE endpoint is working!');
    console.log('   You can now delete partners from the admin page.\n');
  } else {
    console.log('❌ TESTS FAILED - CORS configuration needed');
    console.log('   Please follow the steps in N8N_CORS_FIX_GUIDE.md\n');
    
    console.log('QUICK FIX STEPS:');
    console.log('1. Open n8n: https://ai.nibog.in');
    console.log('2. Edit "Partners Delete" workflow');
    console.log('3. Add CORS headers to Webhook node:');
    console.log('   - Allow-Origin: *');
    console.log('   - Allow-Methods: DELETE, OPTIONS');
    console.log('   - Allow-Headers: Content-Type');
    console.log('4. Handle OPTIONS method (preflight)');
    console.log('5. Add same headers to response node');
    console.log('6. Save and activate workflow');
    console.log('7. Run this test again\n');
  }
}

// Execute tests
runTests().catch(console.error);
