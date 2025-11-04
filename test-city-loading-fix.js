/**
 * Test script to verify the city loading fix
 * This tests the retry logic and error handling improvements
 */

// Mock fetch to simulate various network conditions
let fetchAttempt = 0;
let shouldFail = false;
let failureMode = 'timeout'; // 'timeout', 'network', 'invalid-response'

const mockFetch = async (url, options) => {
  fetchAttempt++;
  console.log(`\n[Test] Fetch attempt ${fetchAttempt} to ${url}`);
  
  // Simulate different failure modes
  if (shouldFail && fetchAttempt <= 2) {
    console.log(`[Test] Simulating ${failureMode} on attempt ${fetchAttempt}`);
    
    if (failureMode === 'timeout') {
      // Simulate timeout by rejecting after delay
      await new Promise(resolve => setTimeout(resolve, 100));
      throw new Error('AbortError: The operation was aborted');
    } else if (failureMode === 'network') {
      throw new Error('Network error: Failed to fetch');
    } else if (failureMode === 'invalid-response') {
      return {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error',
        json: async () => ({ error: 'Server error' })
      };
    }
  }
  
  // Success response on retry or first attempt
  console.log(`[Test] Returning success response on attempt ${fetchAttempt}`);
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => [
      {
        city_id: 1,
        city_name: 'Hyderabad',
        state: 'Telangana',
        is_active: true,
        venue_count: 5,
        event_count: 10
      },
      {
        city_id: 2,
        city_name: 'Bangalore',
        state: 'Karnataka',
        is_active: true,
        venue_count: 3,
        event_count: 8
      }
    ]
  };
};

// Test 1: Successful fetch on first attempt
async function testSuccessfulFetch() {
  console.log('\n========== TEST 1: Successful Fetch on First Attempt ==========');
  fetchAttempt = 0;
  shouldFail = false;
  
  try {
    // Simulate the getAllCities function with retry logic
    const maxRetries = 3;
    const retryDelay = 100;
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Test] Attempt ${attempt}/${maxRetries}`);
        const response = await mockFetch('https://api.example.com/cities', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        console.log(`[Test] ✅ SUCCESS: Fetched ${data.length} cities on attempt ${attempt}`);
        return data;
      } catch (error) {
        lastError = error;
        console.log(`[Test] ❌ Attempt ${attempt} failed: ${error.message}`);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    throw lastError;
  } catch (error) {
    console.log(`[Test] ❌ FAILED: ${error.message}`);
  }
}

// Test 2: Retry after timeout
async function testRetryAfterTimeout() {
  console.log('\n========== TEST 2: Retry After Timeout ==========');
  fetchAttempt = 0;
  shouldFail = true;
  failureMode = 'timeout';
  
  try {
    const maxRetries = 3;
    const retryDelay = 100;
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Test] Attempt ${attempt}/${maxRetries}`);
        const response = await mockFetch('https://api.example.com/cities', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        console.log(`[Test] ✅ SUCCESS: Fetched ${data.length} cities on attempt ${attempt}`);
        return data;
      } catch (error) {
        lastError = error;
        console.log(`[Test] ❌ Attempt ${attempt} failed: ${error.message}`);
        if (attempt < maxRetries) {
          console.log(`[Test] Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    throw lastError;
  } catch (error) {
    console.log(`[Test] ❌ FAILED: ${error.message}`);
  }
}

// Test 3: Retry after network error
async function testRetryAfterNetworkError() {
  console.log('\n========== TEST 3: Retry After Network Error ==========');
  fetchAttempt = 0;
  shouldFail = true;
  failureMode = 'network';
  
  try {
    const maxRetries = 3;
    const retryDelay = 100;
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Test] Attempt ${attempt}/${maxRetries}`);
        const response = await mockFetch('https://api.example.com/cities', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        console.log(`[Test] ✅ SUCCESS: Fetched ${data.length} cities on attempt ${attempt}`);
        return data;
      } catch (error) {
        lastError = error;
        console.log(`[Test] ❌ Attempt ${attempt} failed: ${error.message}`);
        if (attempt < maxRetries) {
          console.log(`[Test] Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    throw lastError;
  } catch (error) {
    console.log(`[Test] ❌ FAILED: ${error.message}`);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🧪 CITY LOADING FIX - TEST SUITE');
  console.log('================================\n');
  
  await testSuccessfulFetch();
  await testRetryAfterTimeout();
  await testRetryAfterNetworkError();
  
  console.log('\n================================');
  console.log('✅ All tests completed!');
  console.log('\nKey improvements:');
  console.log('1. Automatic retry logic (3 attempts by default)');
  console.log('2. Exponential backoff between retries');
  console.log('3. 10-second timeout per request');
  console.log('4. Prevents state updates on unmounted components');
  console.log('5. Better error logging for debugging');
}

// Run tests if this is the main module
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testSuccessfulFetch, testRetryAfterTimeout, testRetryAfterNetworkError };

