# PhonePe Integration Fix

## Problem Identified

The error "Transaction blocked: production key used in test environment" occurred because:

1. **Wrong API Endpoints**: Production configuration was using old Hermes API endpoints
2. **Environment Mismatch**: Production credentials were being used with sandbox/UAT endpoints  
3. **Inconsistent Configuration**: Environment variables and endpoint selection had mismatches

## Root Cause

From your PhonePe Business Dashboard screenshot:
- **Test Merchant ID**: `TEST-M11BWXEAW0AJ`
- **Production Merchant ID**: `M11BWXEAW0AJ` 
- **Production API Key**: `63542457-2eb4-4ed4-83f2-da9eaed9fcca`

The system was using production credentials (`M11BWXEAW0AJ`) but hitting test endpoints, causing the mismatch error.

## Changes Made

### 1. Updated Configuration (`config/phonepe.ts`)

- ✅ Fixed API endpoints to use current PhonePe URLs
- ✅ Added environment validation to prevent credential/endpoint mismatches
- ✅ Removed hardcoded production credentials from fallbacks
- ✅ Added runtime validation with clear error messages

### 2. Updated Environment Variables (`.env`)

**Current Setup (SANDBOX MODE - SAFE FOR TESTING):**
```env
PHONEPE_ENVIRONMENT=sandbox
NEXT_PUBLIC_PHONEPE_ENVIRONMENT=sandbox

# Test Credentials (from your PhonePe Dashboard)
PHONEPE_TEST_MERCHANT_ID=TEST-M11BWXEAW0AJ
PHONEPE_TEST_SALT_KEY=MirQnYzQTQZWONCOMDUOLWE3OGYZDRnxTBJNDYNOGMZ
PHONEPE_TEST_SALT_INDEX=1
```

### 3. Updated API Routes

- ✅ `app/api/payments/phonepe-initiate/route.ts` - Uses new configuration structure
- ✅ `app/api/payments/phonepe-status/route.ts` - Uses new configuration structure  
- ✅ Added configuration validation on each API call

### 4. Added Validation Scripts

- ✅ `scripts/validate-phonepe-config.js` - Validates configuration
- ✅ `scripts/test-phonepe-integration.js` - Tests integration without real payments

## Environment Configuration

### TEST/SANDBOX Mode (Current - SAFE)
```env
PHONEPE_ENVIRONMENT=sandbox
# Uses TEST-M11BWXEAW0AJ and sandbox endpoints
# No real money transactions
```

### PRODUCTION Mode (When Ready)
```env
PHONEPE_ENVIRONMENT=production  
# Uses M11BWXEAW0AJ and production endpoints
# REAL money transactions
```

## Verification Steps

### 1. Validate Configuration
```bash
node scripts/validate-phonepe-config.js
```

### 2. Test Integration
```bash
node scripts/test-phonepe-integration.js
```

### 3. Check Application Logs
The application now logs detailed configuration info:
```
=== PhonePe Configuration ===
Environment: sandbox
Merchant ID: ✓ Set (TEST-M11...)
API Endpoint: https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay
Endpoint Type: SANDBOX
✓ PhonePe configuration is valid
```

## Switching to Production

When ready to go live:

1. **Update Environment Variables:**
   ```bash
   # In your deployment environment (Vercel/server)
   PHONEPE_ENVIRONMENT=production
   NEXT_PUBLIC_PHONEPE_ENVIRONMENT=production
   ```

2. **Verify Production Credentials:**
   - Merchant ID: `M11BWXEAW0AJ`
   - Salt Key: `63542457-2eb4-4ed4-83f2-da9eaed9fcca`
   - Salt Index: `2`

3. **Test Thoroughly:**
   ```bash
   node scripts/validate-phonepe-config.js
   ```

## Safety Features Added

### 1. Runtime Validation
- ✅ Prevents production credentials with test endpoints
- ✅ Prevents test credentials with production endpoints
- ✅ Throws clear errors on mismatches

### 2. Environment Consistency Checks
- ✅ Validates merchant ID format matches environment
- ✅ Validates API endpoints match environment
- ✅ Logs detailed configuration for debugging

### 3. Fail-Safe Defaults
- ✅ Defaults to sandbox mode if environment unclear
- ✅ Requires explicit production configuration
- ✅ No hardcoded production credentials in code

## Testing Recommendations

### 1. Current Sandbox Testing
```bash
# 1. Validate configuration
node scripts/validate-phonepe-config.js

# 2. Test integration
node scripts/test-phonepe-integration.js

# 3. Test payment flow
# - Create a booking
# - Initiate payment
# - Use PhonePe test cards
# - Verify callback handling
```

### 2. Before Going Live
```bash
# 1. Switch to production environment
# 2. Validate production configuration
# 3. Test with small amount (₹1)
# 4. Verify end-to-end flow
# 5. Check PhonePe dashboard for transaction
```

## Curl Examples

### TEST Environment
```bash
curl -X POST https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay \
  -H "Content-Type: application/json" \
  -H "X-VERIFY: [signature]" \
  -d '{"request": "[base64_payload]"}'
```

### PRODUCTION Environment  
```bash
curl -X POST https://api.phonepe.com/apis/hermes/pg/v1/pay \
  -H "Content-Type: application/json" \
  -H "X-VERIFY: [signature]" \
  -d '{"request": "[base64_payload]"}'
```

## Deployment Checklist

- [ ] Environment variables updated in deployment platform
- [ ] Configuration validation passes
- [ ] Test payment flow works
- [ ] Callback URLs are accessible
- [ ] PhonePe dashboard shows transactions
- [ ] Email notifications work
- [ ] Error handling works properly

## Support

If issues persist:
1. Check application logs for detailed error messages
2. Run validation scripts to identify configuration problems
3. Verify PhonePe dashboard settings match your environment
4. Ensure domain is approved by PhonePe for production use
