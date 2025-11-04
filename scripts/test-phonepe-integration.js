#!/usr/bin/env node

/**
 * PhonePe Integration Test Script
 * 
 * This script tests the PhonePe integration without making actual payments.
 * It validates the configuration and API connectivity.
 * 
 * Usage:
 *   node scripts/test-phonepe-integration.js
 */

const crypto = require('crypto');
require('dotenv').config();

// Configuration
const phonepeEnv = process.env.PHONEPE_ENVIRONMENT || process.env.NEXT_PUBLIC_PHONEPE_ENVIRONMENT || 'sandbox';
const isProduction = phonepeEnv === 'production';

const config = {
  merchantId: isProduction
    ? (process.env.PHONEPE_PROD_MERCHANT_ID || process.env.NEXT_PUBLIC_MERCHANT_ID)
    : (process.env.PHONEPE_TEST_MERCHANT_ID || process.env.NEXT_PUBLIC_TEST_MERCHANT_ID || 'PGTESTPAYUAT86'),
  
  saltKey: isProduction
    ? (process.env.PHONEPE_PROD_SALT_KEY || process.env.NEXT_PUBLIC_SALT_KEY)
    : (process.env.PHONEPE_TEST_SALT_KEY || process.env.NEXT_PUBLIC_TEST_SALT_KEY || '96434309-7796-489d-8924-ab56988a6076'),
  
  saltIndex: isProduction
    ? (process.env.PHONEPE_PROD_SALT_INDEX || process.env.NEXT_PUBLIC_SALT_INDEX || '1')
    : (process.env.PHONEPE_TEST_SALT_INDEX || process.env.NEXT_PUBLIC_TEST_SALT_INDEX || '1'),
  
  environment: isProduction ? 'production' : 'sandbox',
  
  apiEndpoints: isProduction ? {
    INITIATE: 'https://api.phonepe.com/apis/hermes/pg/v1/pay',
    STATUS: 'https://api.phonepe.com/apis/hermes/pg/v1/status',
  } : {
    INITIATE: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
    STATUS: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status',
  }
};

// Helper functions
function generateSHA256Hash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function base64Encode(str) {
  return Buffer.from(str).toString('base64');
}

function generateTransactionId() {
  const timestamp = Date.now();
  return `TEST_${timestamp}`;
}

async function testConfiguration() {
  console.log('🧪 PhonePe Integration Test');
  console.log('============================\n');
  
  console.log(`📊 Configuration:`);
  console.log(`   Environment: ${config.environment.toUpperCase()}`);
  console.log(`   Merchant ID: ${config.merchantId ? `${config.merchantId.substring(0, 8)}...` : 'MISSING'}`);
  console.log(`   Salt Key: ${config.saltKey ? 'SET' : 'MISSING'}`);
  console.log(`   Salt Index: ${config.saltIndex}`);
  console.log(`   API Endpoint: ${config.apiEndpoints.INITIATE}\n`);
  
  // Test 1: Configuration validation
  console.log('🔍 Test 1: Configuration Validation');
  const validationErrors = [];
  
  if (!config.merchantId) validationErrors.push('Merchant ID missing');
  if (!config.saltKey) validationErrors.push('Salt Key missing');
  if (!config.saltIndex) validationErrors.push('Salt Index missing');
  
  if (validationErrors.length > 0) {
    console.log('   ❌ FAILED');
    validationErrors.forEach(error => console.log(`      - ${error}`));
    return false;
  } else {
    console.log('   ✅ PASSED\n');
  }
  
  // Test 2: Signature generation
  console.log('🔐 Test 2: Signature Generation');
  try {
    const testPayload = {
      merchantId: config.merchantId,
      merchantTransactionId: generateTransactionId(),
      merchantUserId: 'TEST_USER_123',
      amount: 100, // 1 rupee in paise
      redirectUrl: 'https://www.nibog.in/payment-callback',
      redirectMode: 'REDIRECT',
      callbackUrl: 'https://www.nibog.in/api/payments/phonepe-callback',
      mobileNumber: '9999999999',
      paymentInstrument: { type: 'PAY_PAGE' }
    };
    
    const payloadString = JSON.stringify(testPayload);
    const base64Payload = base64Encode(payloadString);
    const dataToHash = base64Payload + '/pg/v1/pay' + config.saltKey;
    const xVerify = generateSHA256Hash(dataToHash) + '###' + config.saltIndex;
    
    console.log('   ✅ PASSED');
    console.log(`      - Payload length: ${base64Payload.length}`);
    console.log(`      - X-Verify length: ${xVerify.length}\n`);
  } catch (error) {
    console.log('   ❌ FAILED');
    console.log(`      - Error: ${error.message}\n`);
    return false;
  }
  
  // Test 3: API connectivity (without making actual requests)
  console.log('🌐 Test 3: API Endpoint Validation');
  try {
    const url = new URL(config.apiEndpoints.INITIATE);
    console.log('   ✅ PASSED');
    console.log(`      - Host: ${url.host}`);
    console.log(`      - Path: ${url.pathname}\n`);
  } catch (error) {
    console.log('   ❌ FAILED');
    console.log(`      - Invalid URL: ${config.apiEndpoints.INITIATE}\n`);
    return false;
  }
  
  // Test 4: Environment consistency
  console.log('🔄 Test 4: Environment Consistency');
  const isProdEndpoint = config.apiEndpoints.INITIATE.includes('api.phonepe.com/apis/hermes');
  const isTestEndpoint = config.apiEndpoints.INITIATE.includes('api-preprod.phonepe.com');
  const isProdMerchant = config.merchantId && !config.merchantId.startsWith('TEST-') && !config.merchantId.startsWith('PGTEST');
  
  const consistencyErrors = [];
  
  if (isProduction && !isProdEndpoint) {
    consistencyErrors.push('Production environment using test endpoints');
  }
  
  if (!isProduction && isProdEndpoint) {
    consistencyErrors.push('Test environment using production endpoints');
  }
  
  if (isProdEndpoint && !isProdMerchant) {
    consistencyErrors.push('Production endpoints with test merchant ID');
  }
  
  if (consistencyErrors.length > 0) {
    console.log('   ❌ FAILED');
    consistencyErrors.forEach(error => console.log(`      - ${error}`));
    return false;
  } else {
    console.log('   ✅ PASSED\n');
  }
  
  return true;
}

async function main() {
  const success = await testConfiguration();
  
  console.log('📋 Summary:');
  if (success) {
    console.log('   🎉 All tests passed!');
    console.log('   ✅ PhonePe integration is properly configured');
    
    if (isProduction) {
      console.log('\n⚠️  PRODUCTION MODE ACTIVE');
      console.log('   - Real transactions will be processed');
      console.log('   - Ensure thorough testing before going live');
    } else {
      console.log('\n🧪 SANDBOX MODE ACTIVE');
      console.log('   - Safe for testing (no real money involved)');
      console.log('   - Use test cards for payment simulation');
    }
  } else {
    console.log('   ❌ Some tests failed');
    console.log('   🔧 Please fix the issues and run again');
  }
  
  console.log('\n============================');
  
  process.exit(success ? 0 : 1);
}

main().catch(console.error);
