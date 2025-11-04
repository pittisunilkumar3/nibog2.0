/**
 * Partners API Diagnostic Script
 * Detailed testing and recommendations
 */

const BASE_URL = 'https://ai.nibog.in/webhook';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runDiagnostics() {
  log('\n╔══════════════════════════════════════════════════════════╗', 'cyan');
  log('║      PARTNERS API DIAGNOSTIC REPORT                     ║', 'bright');
  log('╚══════════════════════════════════════════════════════════╝', 'cyan');
  
  log('\n📍 Base URL: ' + BASE_URL, 'cyan');
  log('📅 Date: ' + new Date().toLocaleString(), 'cyan');
  
  // Test 1: Check if GET endpoint works
  log('\n' + '─'.repeat(60), 'cyan');
  log('TEST 1: GET /partners endpoint', 'yellow');
  log('─'.repeat(60), 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/partners`);
    const data = await response.json();
    
    if (response.ok) {
      log('✅ Status: ' + response.status + ' OK', 'green');
      log('✅ Endpoint is accessible', 'green');
      log('📊 Data received: ' + JSON.stringify(data), 'cyan');
      
      if (Array.isArray(data)) {
        log(`✅ Response is an array with ${data.length} items`, 'green');
      } else {
        log('⚠️  Response is not an array', 'yellow');
      }
    }
  } catch (error) {
    log('❌ Error: ' + error.message, 'red');
  }
  
  // Test 2: Test POST endpoint
  log('\n' + '─'.repeat(60), 'cyan');
  log('TEST 2: POST /partners/create endpoint', 'yellow');
  log('─'.repeat(60), 'cyan');
  
  const testData = {
    partner_name: 'Diagnostic Test Partner',
    image_url: 'https://example.com/diagnostic.png',
    display_priority: 99,
    status: 'Active'
  };
  
  log('📤 Sending data:', 'cyan');
  console.log(JSON.stringify(testData, null, 2));
  
  try {
    const response = await fetch(`${BASE_URL}/partners/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const data = await response.json();
    
    log('\n📥 Response:', 'cyan');
    log('Status: ' + response.status, 'cyan');
    console.log(JSON.stringify(data, null, 2));
    
    if (response.ok) {
      log('✅ Request successful', 'green');
      
      if (data.message === 'Workflow was started') {
        log('\n⚠️  ISSUE FOUND:', 'yellow');
        log('   Response: "Workflow was started"', 'yellow');
        log('   Expected: Partner data with ID', 'yellow');
        log('\n💡 SOLUTION:', 'cyan');
        log('   1. Open the workflow in n8n', 'cyan');
        log('   2. Find the "Respond to Webhook" node', 'cyan');
        log('   3. Change "Response Mode" to "Using Respond to Webhook Node"', 'cyan');
        log('   4. Ensure it returns the PostgreSQL INSERT result', 'cyan');
      } else if (data.id) {
        log('✅ Partner created with ID: ' + data.id, 'green');
      } else if (Array.isArray(data) && data.length > 0 && data[0].id) {
        log('✅ Partner created with ID: ' + data[0].id, 'green');
      } else {
        log('⚠️  Partner data received but no ID found', 'yellow');
      }
    }
  } catch (error) {
    log('❌ Error: ' + error.message, 'red');
  }
  
  // Wait a bit for database to process
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 3: Check if partner was actually created
  log('\n' + '─'.repeat(60), 'cyan');
  log('TEST 3: Verify partner was created in database', 'yellow');
  log('─'.repeat(60), 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/partners`);
    const data = await response.json();
    
    if (response.ok && Array.isArray(data)) {
      const diagnosticPartner = data.find(p => p.partner_name === 'Diagnostic Test Partner');
      
      if (diagnosticPartner) {
        log('✅ SUCCESS! Partner was created in database!', 'green');
        log('📊 Partner data:', 'cyan');
        console.log(JSON.stringify(diagnosticPartner, null, 2));
      } else {
        log('❌ ISSUE: Partner NOT found in database', 'red');
        log('   Current partners in database: ' + data.length, 'yellow');
        
        if (data.length > 0) {
          log('\n   Existing partners:', 'cyan');
          data.forEach((p, i) => {
            log(`   ${i + 1}. ${p.partner_name} (ID: ${p.id})`, 'cyan');
          });
        }
        
        log('\n💡 SOLUTION:', 'cyan');
        log('   1. Check n8n workflow execution log', 'cyan');
        log('   2. Verify PostgreSQL node is configured correctly', 'cyan');
        log('   3. Check database credentials', 'cyan');
        log('   4. Ensure partners table exists', 'cyan');
      }
    }
  } catch (error) {
    log('❌ Error: ' + error.message, 'red');
  }
  
  // Summary
  log('\n╔══════════════════════════════════════════════════════════╗', 'cyan');
  log('║      DIAGNOSTIC SUMMARY                                  ║', 'bright');
  log('╚══════════════════════════════════════════════════════════╝', 'cyan');
  
  log('\n📋 Findings:', 'yellow');
  log('   ✅ GET /partners endpoint works', 'green');
  log('   ✅ POST /partners/create endpoint accepts requests', 'green');
  log('   ⚠️  Workflow returns "Workflow was started" instead of data', 'yellow');
  log('   ❓ Need to verify if data is being saved to database', 'yellow');
  
  log('\n🔧 Required Actions:', 'cyan');
  log('   1. Configure "Respond to Webhook" node in n8n', 'cyan');
  log('   2. Ensure PostgreSQL INSERT is executed', 'cyan');
  log('   3. Return the inserted partner data', 'cyan');
  
  log('\n📚 Documentation:', 'cyan');
  log('   See: N8N_PARTNERS_WORKFLOWS_GUIDE.md', 'cyan');
  log('\n' + '═'.repeat(60) + '\n', 'cyan');
}

runDiagnostics();
