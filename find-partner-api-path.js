/**
 * Partners API Testing Script - Alternative Paths
 * Testing different webhook path configurations
 */

const BASE_URLS = [
  'https://ai.nibog.in/webhook/v1/nibog',
  'https://ai.nibog.in/webhook',
  'https://ai.nibog.in/webhook/nibog'
];

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(baseUrl, path) {
  try {
    const url = `${baseUrl}${path}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      log(`✅ SUCCESS: ${url}`, 'green');
      console.log('Response:', JSON.stringify(data, null, 2));
      return { success: true, url, data };
    } else if (response.status === 404 && data.message?.includes('not registered')) {
      log(`❌ Not Registered: ${url}`, 'red');
      return { success: false, url, notRegistered: true };
    } else {
      log(`⚠️  Other Error: ${url} - ${response.status}`, 'yellow');
      console.log('Response:', JSON.stringify(data, null, 2));
      return { success: false, url, data };
    }
  } catch (error) {
    log(`❌ Error: ${url} - ${error.message}`, 'red');
    return { success: false, url, error: error.message };
  }
}

async function findWorkingPath() {
  log('\n🔍 Searching for Working Partner API Paths...', 'cyan');
  log('='.repeat(70), 'cyan');
  
  const paths = [
    '/partners',
    '/partners/get',
    '/partners/list',
    '/partners/create',
    '/v1/nibog/partners',
    '/nibog/partners'
  ];
  
  const workingPaths = [];
  
  for (const baseUrl of BASE_URLS) {
    log(`\n📍 Testing Base URL: ${baseUrl}`, 'yellow');
    
    for (const path of paths) {
      const result = await testEndpoint(baseUrl, path);
      if (result.success) {
        workingPaths.push(result);
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  log('\n' + '='.repeat(70), 'cyan');
  
  if (workingPaths.length > 0) {
    log('\n✅ WORKING PATHS FOUND!', 'green');
    workingPaths.forEach(wp => {
      log(`  → ${wp.url}`, 'green');
    });
  } else {
    log('\n❌ NO WORKING PATHS FOUND', 'red');
    log('\nPossible issues:', 'yellow');
    log('  1. Workflows not created in n8n', 'yellow');
    log('  2. Workflows not activated', 'yellow');
    log('  3. Webhook paths configured differently', 'yellow');
    log('\nPlease check your n8n workflows configuration.', 'cyan');
  }
}

findWorkingPath();
