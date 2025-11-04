/**
 * Partners API Testing Script
 * Tests all CRUD operations for the Partners API
 */

const BASE_URL = 'https://ai.nibog.in/webhook';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

async function testAPI(testName, method, endpoint, body = null) {
  try {
    logInfo(`Testing: ${testName}`);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const url = `${BASE_URL}${endpoint}`;
    logInfo(`URL: ${method} ${url}`);
    
    if (body) {
      logInfo(`Body: ${JSON.stringify(body, null, 2)}`);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok) {
      logSuccess(`Status: ${response.status} ${response.statusText}`);
      console.log('Response:', JSON.stringify(data, null, 2));
      results.passed++;
      results.tests.push({ name: testName, status: 'PASSED', data });
      return { success: true, data };
    } else {
      logError(`Status: ${response.status} ${response.statusText}`);
      console.log('Error Response:', JSON.stringify(data, null, 2));
      results.failed++;
      results.tests.push({ name: testName, status: 'FAILED', error: data });
      return { success: false, data };
    }
  } catch (error) {
    logError(`Exception: ${error.message}`);
    results.failed++;
    results.tests.push({ name: testName, status: 'ERROR', error: error.message });
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('\n🚀 Starting Partners API Tests...', 'bright');
  log(`Base URL: ${BASE_URL}`, 'blue');
  
  let createdPartnerId = null;
  let createdPartner = null;

  // Test 1: Create Partner
  logSection('TEST 1: Create Partner');
  const createResult = await testAPI(
    'Create New Partner',
    'POST',
    '/partners/create',
    {
      partner_name: 'Test Partner Company',
      image_url: 'https://example.com/test-logo.png',
      display_priority: 1,
      status: 'Active'
    }
  );

  if (createResult.success && createResult.data) {
    createdPartnerId = createResult.data.id;
    createdPartner = createResult.data;
    logSuccess(`Created partner with ID: ${createdPartnerId}`);
  }

  // Small delay between requests
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 2: Get All Partners
  logSection('TEST 2: Get All Active Partners');
  const getAllResult = await testAPI(
    'Get All Active Partners',
    'GET',
    '/partners'
  );

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 3: Get Partner by ID
  if (createdPartnerId) {
    logSection('TEST 3: Get Partner by ID');
    await testAPI(
      `Get Partner ID: ${createdPartnerId}`,
      'GET',
      `/partners/${createdPartnerId}`
    );
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  } else {
    logWarning('Skipping Get by ID test - no partner was created');
  }

  // Test 4: Update Partner
  if (createdPartnerId) {
    logSection('TEST 4: Update Partner');
    await testAPI(
      `Update Partner ID: ${createdPartnerId}`,
      'PUT',
      '/partners/update',
      {
        id: createdPartnerId,
        partner_name: 'Updated Test Partner',
        image_url: 'https://example.com/updated-logo.png',
        display_priority: 2,
        status: 'Active'
      }
    );
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  } else {
    logWarning('Skipping Update test - no partner was created');
  }

  // Test 5: Get Updated Partner
  if (createdPartnerId) {
    logSection('TEST 5: Verify Update - Get Partner by ID');
    await testAPI(
      `Verify Updated Partner ID: ${createdPartnerId}`,
      'GET',
      `/partners/${createdPartnerId}`
    );
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Test 6: Delete Partner
  if (createdPartnerId) {
    logSection('TEST 6: Delete Partner');
    await testAPI(
      `Delete Partner ID: ${createdPartnerId}`,
      'DELETE',
      `/partners/${createdPartnerId}`
    );
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  } else {
    logWarning('Skipping Delete test - no partner was created');
  }

  // Test 7: Verify Deletion
  if (createdPartnerId) {
    logSection('TEST 7: Verify Deletion - Try to Get Deleted Partner');
    await testAPI(
      `Try to Get Deleted Partner ID: ${createdPartnerId}`,
      'GET',
      `/partners/${createdPartnerId}`
    );
  }

  // Test 8: Edge Cases - Invalid ID
  logSection('TEST 8: Edge Case - Get Non-existent Partner');
  await testAPI(
    'Get Partner with Invalid ID',
    'GET',
    '/partners/999999'
  );

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 9: Edge Cases - Invalid Create
  logSection('TEST 9: Edge Case - Create Partner with Missing Fields');
  await testAPI(
    'Create Partner with Missing Required Fields',
    'POST',
    '/partners/create',
    {
      partner_name: 'Incomplete Partner'
      // Missing other required fields
    }
  );

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 10: Edge Cases - Invalid Update
  logSection('TEST 10: Edge Case - Update Non-existent Partner');
  await testAPI(
    'Update Non-existent Partner',
    'PUT',
    '/partners/update',
    {
      id: 999999,
      partner_name: 'Does Not Exist',
      image_url: 'https://example.com/none.png',
      display_priority: 1,
      status: 'Active'
    }
  );

  // Print Summary
  printSummary();
}

function printSummary() {
  logSection('TEST SUMMARY');
  
  console.log(`\nTotal Tests Run: ${results.passed + results.failed}`);
  logSuccess(`Passed: ${results.passed}`);
  logError(`Failed: ${results.failed}`);
  
  const passRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(2);
  log(`\nPass Rate: ${passRate}%`, passRate >= 70 ? 'green' : 'red');
  
  console.log('\n' + '='.repeat(60));
  log('DETAILED RESULTS:', 'bright');
  console.log('='.repeat(60));
  
  results.tests.forEach((test, index) => {
    const statusColor = test.status === 'PASSED' ? 'green' : 'red';
    log(`${index + 1}. ${test.name}: ${test.status}`, statusColor);
  });
  
  console.log('\n' + '='.repeat(60));
  
  if (results.failed === 0) {
    logSuccess('🎉 All tests passed! Your Partners API is working correctly! 🎉');
  } else {
    logWarning(`⚠️  ${results.failed} test(s) failed. Please review the errors above.`);
  }
  
  console.log('='.repeat(60) + '\n');
}

// Run the tests
runTests().catch(error => {
  logError(`Fatal Error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
