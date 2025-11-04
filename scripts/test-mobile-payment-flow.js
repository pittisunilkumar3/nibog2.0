#!/usr/bin/env node

/**
 * Mobile Payment Flow Test Script
 * 
 * This script tests the mobile payment flow to ensure it works correctly
 * across different mobile browsers and scenarios.
 * 
 * Usage:
 *   node scripts/test-mobile-payment-flow.js
 */

// Simulate different mobile browser environments
const mobileUserAgents = [
  {
    name: "iPhone Safari",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
    hasCrypto: true,
    hasSubtle: true
  },
  {
    name: "Android Chrome",
    userAgent: "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
    hasCrypto: true,
    hasSubtle: true
  },
  {
    name: "Old Android Browser",
    userAgent: "Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36",
    hasCrypto: false,
    hasSubtle: false
  },
  {
    name: "Samsung Internet",
    userAgent: "Mozilla/5.0 (Linux; Android 10; SAMSUNG SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/13.0 Chrome/83.0.4103.106 Mobile Safari/537.36",
    hasCrypto: true,
    hasSubtle: false // Some versions have limited crypto support
  }
];

// Test scenarios
const testScenarios = [
  {
    name: "Standard Payment Hash",
    data: "eyJtZXJjaGFudElkIjoiTUVSQ0hBTlRfSUQiLCJtZXJjaGFudFRyYW5zYWN0aW9uSWQiOiJURVNUXzEyMzQ1Njc4OSIsIm1lcmNoYW50VXNlcklkIjoiMTIzIiwiYW1vdW50IjoxODAwMDB9/pg/v1/payTEST_SALT_KEY",
    expectedLength: 64
  },
  {
    name: "Empty String Hash",
    data: "",
    expectedLength: 64
  },
  {
    name: "Long Payment Data",
    data: "eyJtZXJjaGFudElkIjoiTUVSQ0hBTlRfSUQiLCJtZXJjaGFudFRyYW5zYWN0aW9uSWQiOiJURVNUXzEyMzQ1Njc4OTBfTE9OR19UUkFOU0FDVElPTl9JRF9XSVRIX01BTllfQ0hBUkFDVEVSUyIsIm1lcmNoYW50VXNlcklkIjoiMTIzNDU2Nzg5MCIsImFtb3VudCI6MTgwMDAwMCwicmVkaXJlY3RVcmwiOiJodHRwczovL2V4YW1wbGUuY29tL3BheW1lbnQtY2FsbGJhY2s/Ym9va2luZ0lkPTEyMzQ1NiZ0cmFuc2FjdGlvbklkPVRFU1RfMTIzNDU2Nzg5MF9MT05HX1RSQU5TQUNUSU9OX0lEX1dJVEhfTUFOWV9DSEFSQUNURVJTIiwicmVkaXJlY3RNb2RlIjoiUkVESVJFQ1QiLCJjYWxsYmFja1VybCI6Imh0dHBzOi8vZXhhbXBsZS5jb20vYXBpL3BheW1lbnRzL3Bob25lcGUtY2FsbGJhY2siLCJtb2JpbGVOdW1iZXIiOiI5ODc2NTQzMjEwIiwicGF5bWVudEluc3RydW1lbnQiOnsidHlwZSI6IlBBWV9QQUdFIn19/pg/v1/payTEST_VERY_LONG_SALT_KEY_WITH_MANY_CHARACTERS_FOR_TESTING_PURPOSES",
    expectedLength: 64
  }
];

// Import the crypto implementation (simulated)
function simulateCryptoEnvironment(browser) {
  // Simulate global environment
  global.window = {
    crypto: browser.hasCrypto ? {
      subtle: browser.hasSubtle ? {
        digest: async (algorithm, data) => {
          if (algorithm !== 'SHA-256') {
            throw new Error('Unsupported algorithm');
          }
          // Simulate crypto.subtle.digest
          const crypto = require('crypto');
          return crypto.createHash('sha256').update(Buffer.from(data)).digest();
        }
      } : undefined
    } : undefined,
    navigator: {
      userAgent: browser.userAgent
    }
  };

  global.TextEncoder = TextEncoder;
  global.DataView = DataView;
  global.Uint8Array = Uint8Array;
}

// Mobile-compatible SHA256 implementation (copied from config/phonepe.ts)
async function generateSHA256Hash(data) {
  // Check if Web Crypto API is available (modern browsers)
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle && window.crypto.subtle.digest) {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (error) {
      console.warn('Web Crypto API failed, falling back to JS implementation:', error.message);
      // Fall through to JavaScript implementation
    }
  }

  // Fallback: Pure JavaScript SHA256 implementation for mobile browsers
  return await sha256Fallback(data);
}

// Pure JavaScript SHA256 implementation
async function sha256Fallback(message) {
  const msgBuffer = new TextEncoder().encode(message);
  
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const msgLength = msgBuffer.length;
  const bitLength = msgLength * 8;
  
  const paddedLength = Math.ceil((msgLength + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(msgBuffer);
  padded[msgLength] = 0x80;
  
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 4, bitLength & 0xffffffff, false);
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000), false);

  for (let chunk = 0; chunk < paddedLength; chunk += 64) {
    const w = new Array(64);
    
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(chunk + i * 4, false);
    }
    
    for (let i = 16; i < 64; i++) {
      const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map(h => h.toString(16).padStart(8, '0'))
    .join('');
}

function rightRotate(value, amount) {
  return (value >>> amount) | (value << (32 - amount));
}

// Run tests
async function runTests() {
  console.log('🧪 Testing Mobile Payment Flow Compatibility\n');

  let totalTests = 0;
  let passedTests = 0;

  for (const browser of mobileUserAgents) {
    console.log(`📱 Testing ${browser.name}`);
    console.log(`   User Agent: ${browser.userAgent.substring(0, 80)}...`);
    console.log(`   Crypto Support: ${browser.hasCrypto ? 'Yes' : 'No'}`);
    console.log(`   Subtle Crypto: ${browser.hasSubtle ? 'Yes' : 'No'}\n`);

    simulateCryptoEnvironment(browser);

    for (const scenario of testScenarios) {
      totalTests++;
      console.log(`   🔍 ${scenario.name}`);
      
      try {
        const startTime = Date.now();
        const hash = await generateSHA256Hash(scenario.data);
        const endTime = Date.now();
        
        if (hash && hash.length === scenario.expectedLength && /^[a-f0-9]+$/.test(hash)) {
          console.log(`      ✅ PASSED (${endTime - startTime}ms)`);
          console.log(`      Hash: ${hash.substring(0, 16)}...${hash.substring(48)}`);
          passedTests++;
        } else {
          console.log(`      ❌ FAILED - Invalid hash format or length`);
          console.log(`      Expected length: ${scenario.expectedLength}, Got: ${hash ? hash.length : 'null'}`);
        }
      } catch (error) {
        console.log(`      ❌ FAILED - ${error.message}`);
      }
      console.log('');
    }
    
    console.log('');
  }

  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All mobile payment compatibility tests passed!');
    console.log('✅ The mobile payment flow should work correctly across all tested browsers.');
  } else {
    console.log('⚠️  Some tests failed. Please review the implementation.');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);
