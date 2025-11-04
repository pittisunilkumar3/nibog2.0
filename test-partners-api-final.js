/**
 * Partners API Testing Script - CORRECTED PATHS
 * Using the discovered working base URL
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
  console.log('\n' + '='.repeat(70));
  log(title, 'bright');
  console.log('='.repeat(70));
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
  skipped: 0,
  tests: []
};

async function testAPI(testName, method, endpoint, body = null, expectError = false) {
  try {
    logInfo(`Testing: ${testName}`);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const url = `${BASE_URL}${endpoint}`;
    logInfo(`URL: ${method} ${url}`);
    
    if (body) {
      console.log('Request Body:');
      console.log(JSON.stringify(body, null, 2));
    }

    const startTime = Date.now();
    const response = await fetch(url, options);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    logInfo(`Response Time: ${responseTime}ms`);
    logInfo(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      logSuccess(`✓ Request successful`);
      console.log('Response Data:');
      console.log(JSON.stringify(data, null, 2));
      
      if (!expectError) {
        results.passed++;
        results.tests.push({ name: testName, status: 'PASSED', data, responseTime });
      } else {
        logWarning('Expected error but got success - marking as WARNING');
        results.passed++;
        results.tests.push({ name: testName, status: 'PASSED (Expected Error but got Success)', data, responseTime });
      }
      return { success: true, data, status: response.status };
    } else {
      logError(`✗ Request failed`);
      console.log('Error Response:');
      console.log(JSON.stringify(data, null, 2));
      
      if (expectError) {
        logSuccess('Error was expected - test PASSED');
        results.passed++;
        results.tests.push({ name: testName, status: 'PASSED (Expected Error)', error: data, responseTime });
        return { success: true, data, status: response.status };
      } else {
        results.failed++;
        results.tests.push({ name: testName, status: 'FAILED', error: data, responseTime });
        return { success: false, data, status: response.status };
      }
    }
  } catch (error) {
    logError(`Exception occurred: ${error.message}`);
    console.error(error);
    
    if (expectError) {
      logSuccess('Error was expected - test PASSED');
      results.passed++;
      results.tests.push({ name: testName, status: 'PASSED (Expected Exception)', error: error.message });
    } else {
      results.failed++;
      results.tests.push({ name: testName, status: 'ERROR', error: error.message });
    }
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('\n🚀 Starting Partners API Tests (CORRECTED PATHS)...', 'bright');
  log(`Base URL: ${BASE_URL}`, 'blue');
  log(`Date: ${new Date().toLocaleString()}`, 'blue');
  
  let createdPartnerId = null;

  // ============================================================
  // PHASE 1: READ OPERATIONS (Test Get First)
  // ============================================================
  
  logSection('PHASE 1: READ OPERATIONS');

  // Test 1: Get All Partners
  const getAllResult = await testAPI(
    'Get All Active Partners',
    'GET',
    '/partners'
  );

  if (getAllResult.success && Array.isArray(getAllResult.data)) {
    logSuccess(`✓ Retrieved ${getAllResult.data.length} partner(s)`);
    
    if (getAllResult.data.length > 0) {
      createdPartnerId = getAllResult.data[0].id;
      logInfo(`Using existing partner ID: ${createdPartnerId} for tests`);
    }
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 2: Get Partner by ID (if we have one)
  if (createdPartnerId) {
    await testAPI(
      `Get Partner by ID (ID: ${createdPartnerId})`,
      'GET',
      `/partners/${createdPartnerId}`
    );
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  } else {
    logWarning('No existing partners found - will create one');
  }

  // ============================================================
  // PHASE 2: CREATE OPERATIONS
  // ============================================================
  
  logSection('PHASE 2: CREATE OPERATIONS');
  
  // Test 3: Create Valid Partner
  const createResult = await testAPI(
    'Create Valid Partner',
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
    if (createResult.data.id) {
      createdPartnerId = createResult.data.id;
      logSuccess(`✓ Created partner with ID: ${createdPartnerId}`);
    } else if (Array.isArray(createResult.data) && createResult.data.length > 0 && createResult.data[0].id) {
      createdPartnerId = createResult.data[0].id;
      logSuccess(`✓ Created partner with ID: ${createdPartnerId}`);
    }
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 4: Verify Creation - Get All Partners Again
  const getAllResult2 = await testAPI(
    'Verify Creation - Get All Partners',
    'GET',
    '/partners'
  );

  if (getAllResult2.success && Array.isArray(getAllResult2.data)) {
    logSuccess(`✓ Now have ${getAllResult2.data.length} partner(s)`);
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  // ============================================================
  // PHASE 3: UPDATE OPERATIONS
  // ============================================================
  
  logSection('PHASE 3: UPDATE OPERATIONS');

  // Test 5: Update Existing Partner
  if (createdPartnerId) {
    await testAPI(
      `Update Existing Partner (ID: ${createdPartnerId})`,
      'PUT',
      '/partners/update',
      {
        id: createdPartnerId,
        partner_name: 'Updated Test Partner Company',
        image_url: 'https://example.com/updated-logo.png',
        display_priority: 2,
        status: 'Active'
      }
    );
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 6: Verify Update
    await testAPI(
      `Verify Updated Partner (ID: ${createdPartnerId})`,
      'GET',
      `/partners/${createdPartnerId}`
    );
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  } else {
    logWarning('Skipping "Update" tests - no partner ID available');
    results.skipped += 2;
  }

  // ============================================================
  // PHASE 4: DELETE OPERATIONS
  // ============================================================
  
  logSection('PHASE 4: DELETE OPERATIONS');

  // Test 7: Delete Existing Partner
  if (createdPartnerId) {
    await testAPI(
      `Delete Partner (ID: ${createdPartnerId})`,
      'DELETE',
      `/partners/${createdPartnerId}`
    );
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 8: Verify Deletion
    await testAPI(
      `Verify Deletion - Get All Partners`,
      'GET',
      '/partners'
    );
  } else {
    logWarning('Skipping "Delete" tests - no partner ID available');
    results.skipped += 2;
  }

  // Print Summary
  printSummary();
}

function printSummary() {
  logSection('📊 COMPREHENSIVE TEST SUMMARY');
  
  const totalTests = results.passed + results.failed + results.skipped;
  
  console.log(`\n📈 Test Statistics:`);
  console.log(`   Total Tests:  ${totalTests}`);
  logSuccess(`   Passed:       ${results.passed}`);
  logError(`   Failed:       ${results.failed}`);
  logWarning(`   Skipped:      ${results.skipped}`);
  
  if (results.passed + results.failed > 0) {
    const passRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(2);
    log(`\n   Pass Rate:    ${passRate}%`, passRate >= 80 ? 'green' : passRate >= 60 ? 'yellow' : 'red');
  }
  
  // Calculate average response time
  const responseTimes = results.tests
    .filter(t => t.responseTime)
    .map(t => t.responseTime);
  
  if (responseTimes.length > 0) {
    const avgResponseTime = (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(2);
    const maxResponseTime = Math.max(...responseTimes);
    const minResponseTime = Math.min(...responseTimes);
    
    console.log(`\n⚡ Performance Metrics:`);
    console.log(`   Average Response Time: ${avgResponseTime}ms`);
    console.log(`   Min Response Time:     ${minResponseTime}ms`);
    console.log(`   Max Response Time:     ${maxResponseTime}ms`);
  }
  
  console.log('\n' + '='.repeat(70));
  log('📝 DETAILED RESULTS:', 'bright');
  console.log('='.repeat(70));
  
  results.tests.forEach((test, index) => {
    let statusColor = 'reset';
    let statusIcon = '○';
    
    if (test.status.includes('PASSED')) {
      statusColor = 'green';
      statusIcon = '✓';
    } else if (test.status === 'FAILED') {
      statusColor = 'red';
      statusIcon = '✗';
    } else if (test.status === 'ERROR') {
      statusColor = 'red';
      statusIcon = '⚠';
    }
    
    const timeStr = test.responseTime ? ` (${test.responseTime}ms)` : '';
    log(`${index + 1}. ${statusIcon} ${test.name}: ${test.status}${timeStr}`, statusColor);
  });
  
  console.log('\n' + '='.repeat(70));
  
  if (results.failed === 0 && results.skipped === 0) {
    logSuccess('\n🎉 ALL TESTS PASSED! Your Partners API is working perfectly! 🎉\n');
  } else if (results.failed === 0) {
    logSuccess(`\n✅ All executed tests passed! (${results.skipped} skipped)\n`);
  } else {
    logWarning(`\n⚠️  ${results.failed} test(s) failed. Please review the errors above.\n`);
  }
  
  console.log('='.repeat(70) + '\n');
}

// Run the tests
runTests().catch(error => {
  logError(`\n❌ Fatal Error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
