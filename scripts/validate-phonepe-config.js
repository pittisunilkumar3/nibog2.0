#!/usr/bin/env node

/**
 * PhonePe Configuration Validation Script
 * 
 * This script validates your PhonePe configuration to prevent the 
 * "production key used in test environment" error.
 * 
 * Usage:
 *   node scripts/validate-phonepe-config.js
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

console.log('🔍 PhonePe Configuration Validation');
console.log('=====================================\n');

// Check environment variables
const phonepeEnv = process.env.PHONEPE_ENVIRONMENT || process.env.NEXT_PUBLIC_PHONEPE_ENVIRONMENT || 'sandbox';
const nodeEnv = process.env.NODE_ENV || 'development';

console.log(`📊 Environment Settings:`);
console.log(`   PHONEPE_ENVIRONMENT: ${process.env.PHONEPE_ENVIRONMENT || 'not set'}`);
console.log(`   NEXT_PUBLIC_PHONEPE_ENVIRONMENT: ${process.env.NEXT_PUBLIC_PHONEPE_ENVIRONMENT || 'not set'}`);
console.log(`   NODE_ENV: ${nodeEnv}`);
console.log(`   Resolved PhonePe Environment: ${phonepeEnv}\n`);

const isProduction = phonepeEnv === 'production';

// Get credentials based on environment
const merchantId = isProduction
  ? (process.env.PHONEPE_PROD_MERCHANT_ID || process.env.NEXT_PUBLIC_MERCHANT_ID)
  : (process.env.PHONEPE_TEST_MERCHANT_ID || process.env.NEXT_PUBLIC_TEST_MERCHANT_ID || 'PGTESTPAYUAT86');

const saltKey = isProduction
  ? (process.env.PHONEPE_PROD_SALT_KEY || process.env.NEXT_PUBLIC_SALT_KEY)
  : (process.env.PHONEPE_TEST_SALT_KEY || process.env.NEXT_PUBLIC_TEST_SALT_KEY || '96434309-7796-489d-8924-ab56988a6076');

const saltIndex = isProduction
  ? (process.env.PHONEPE_PROD_SALT_INDEX || process.env.NEXT_PUBLIC_SALT_INDEX || '1')
  : (process.env.PHONEPE_TEST_SALT_INDEX || process.env.NEXT_PUBLIC_TEST_SALT_INDEX || '1');

// Define API endpoints
const API_ENDPOINTS = {
  TEST: {
    INITIATE: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
    STATUS: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status',
  },
  PROD: {
    INITIATE: 'https://api.phonepe.com/apis/hermes/pg/v1/pay',
    STATUS: 'https://api.phonepe.com/apis/hermes/pg/v1/status',
  }
};

const endpoints = isProduction ? API_ENDPOINTS.PROD : API_ENDPOINTS.TEST;

console.log(`🔧 Configuration Details:`);
console.log(`   Environment: ${isProduction ? 'PRODUCTION' : 'SANDBOX'}`);
console.log(`   Merchant ID: ${merchantId ? `${merchantId.substring(0, 8)}...` : 'MISSING'}`);
console.log(`   Salt Key: ${saltKey ? 'SET' : 'MISSING'}`);
console.log(`   Salt Index: ${saltIndex}`);
console.log(`   API Endpoint: ${endpoints.INITIATE}\n`);

// Validation checks
const errors = [];
const warnings = [];

// Check for missing credentials
if (!merchantId) {
  errors.push('Merchant ID is missing');
}

if (!saltKey) {
  errors.push('Salt Key is missing');
}

if (!saltIndex) {
  errors.push('Salt Index is missing');
}

// Check for environment consistency
const isProdEndpoint = endpoints.INITIATE.includes('api.phonepe.com/apis/hermes');
const isTestEndpoint = endpoints.INITIATE.includes('api-preprod.phonepe.com');
const isProdMerchant = merchantId && !merchantId.startsWith('TEST-') && !merchantId.startsWith('PGTEST');

// Critical validation checks
if (isProduction && !isProdEndpoint) {
  errors.push('CRITICAL: Production environment must use production endpoints');
}

if (!isProduction && isProdEndpoint) {
  errors.push('CRITICAL: Test environment must use sandbox endpoints');
}

if (isProdEndpoint && !isProdMerchant) {
  errors.push('CRITICAL: Production endpoints require production merchant ID');
}

if (isTestEndpoint && isProdMerchant && !isProduction) {
  warnings.push('WARNING: Using production merchant ID with test endpoints');
}

// Additional production safety checks
if (isProduction) {
  if (!merchantId || merchantId.includes('TEST')) {
    errors.push('CRITICAL: Production mode requires valid production merchant ID');
  }
  if (!saltKey || saltKey.includes('test')) {
    errors.push('CRITICAL: Production mode requires valid production salt key');
  }
}

// Display results
console.log(`✅ Validation Results:`);

if (errors.length === 0 && warnings.length === 0) {
  console.log('   🎉 Configuration is valid!\n');
} else {
  if (errors.length > 0) {
    console.log('   ❌ ERRORS:');
    errors.forEach(error => console.log(`      - ${error}`));
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log('   ⚠️  WARNINGS:');
    warnings.forEach(warning => console.log(`      - ${warning}`));
    console.log('');
  }
}

// Recommendations
console.log(`💡 Recommendations:`);

if (isProduction) {
  console.log('   - You are in PRODUCTION mode');
  console.log('   - All transactions will be REAL and charge actual money');
  console.log('   - Ensure your domain is approved by PhonePe');
  console.log('   - Test thoroughly in sandbox mode first');
} else {
  console.log('   - You are in SANDBOX mode');
  console.log('   - All transactions are simulated (no real money)');
  console.log('   - Use test credentials from PhonePe Business Dashboard');
  console.log('   - Switch to production when ready to go live');
}

console.log('\n📚 Next Steps:');
if (errors.length > 0) {
  console.log('   1. Fix the critical errors listed above');
  console.log('   2. Update your .env file with correct credentials');
  console.log('   3. Restart your application');
  console.log('   4. Run this script again to verify');
} else {
  console.log('   1. Test a payment transaction');
  console.log('   2. Verify the payment flow works end-to-end');
  console.log('   3. Check PhonePe dashboard for transaction logs');
}

console.log('\n=====================================');

// Exit with error code if there are critical issues
if (errors.length > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
