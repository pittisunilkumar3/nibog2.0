// PhonePe configuration file
// This centralizes all PhonePe-related configuration

// PhonePe API endpoints - Updated to current official endpoints
export const PHONEPE_API = {
  TEST: {
    INITIATE: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
    STATUS: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status',
    REFUND: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/refund',
  },
  PROD: {
    // Current production endpoints as per PhonePe documentation
    INITIATE: 'https://api.phonepe.com/apis/hermes/pg/v1/pay',
    STATUS: 'https://api.phonepe.com/apis/hermes/pg/v1/status',
    REFUND: 'https://api.phonepe.com/apis/hermes/pg/v1/refund',
  }
};

// Helper function to safely access environment variables
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  // For server-side code
  if (typeof process !== 'undefined' && process.env) {
    // In Next.js, environment variables are available via process.env
    // This works for both .env and .env.local files
    const value = process.env[key];
    if (value) return value;
  }

  // For client-side code or when server-side env var is not available
  // Next.js automatically exposes environment variables prefixed with NEXT_PUBLIC_
  if (typeof process !== 'undefined' && process.env) {
    const publicValue = process.env[`NEXT_PUBLIC_${key}`];
    if (publicValue) return publicValue;
  }

  // Client-side fallback
  if (typeof window !== 'undefined') {
    // Fallback for any custom __ENV object that might be defined
    if ((window as any).__ENV && (window as any).__ENV[key]) {
      return (window as any).__ENV[key] || defaultValue;
    }
  }

  return defaultValue;
};

// Get the correct APP_URL based on environment
export const getAppUrl = (): string => {
  // For development, use localhost for callbacks to work properly
  if (process.env.NODE_ENV === 'development') {
    // Check if we're on the client side and can get the current port
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol;
      const hostname = window.location.host; // includes domain and port if any
      return `${protocol}//${hostname}`;
    }
    // Server-side fallback for development - use localhost
    return 'http://localhost:3111';
  }

  // For production, first try to get from environment variable
  const envUrl = getEnvVar('NEXT_PUBLIC_APP_URL', '');
  if (envUrl) {
    return envUrl;
  }

  // For deployment/production, try to get the current hostname
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.host; // includes domain and port if any
    return `${protocol}//${hostname}`;
  }

  // Final fallback for server-side - use the correct production URL
  return process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://www.nibog.in';
};

// Determine if we're in production mode
// Check both server-side and client-side environment variables
const phonepeEnv = process.env.PHONEPE_ENVIRONMENT || process.env.NEXT_PUBLIC_PHONEPE_ENVIRONMENT || 'sandbox';
console.log('PhonePe Environment Variable:', phonepeEnv);
console.log('All Environment Variables:', {
  PHONEPE_ENVIRONMENT: process.env.PHONEPE_ENVIRONMENT,
  NEXT_PUBLIC_PHONEPE_ENVIRONMENT: process.env.NEXT_PUBLIC_PHONEPE_ENVIRONMENT,
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  VERCEL_ENV: process.env.VERCEL_ENV
});
console.log('Resolved APP_URL:', getAppUrl());
const isProduction = phonepeEnv === 'production';

// Environment-specific API endpoints
export const getPhonePeEndpoints = () => {
  return isProduction ? PHONEPE_API.PROD : PHONEPE_API.TEST;
};

// PhonePe merchant configuration from environment variables
// Removed hardcoded production credentials to prevent misuse
export const PHONEPE_CONFIG = {
  MERCHANT_ID: isProduction
    ? (process.env.PHONEPE_PROD_MERCHANT_ID || process.env.NEXT_PUBLIC_MERCHANT_ID || '')
    : (process.env.PHONEPE_TEST_MERCHANT_ID || process.env.NEXT_PUBLIC_TEST_MERCHANT_ID || 'PGTESTPAYUAT86'),

  SALT_KEY: isProduction
    ? (process.env.PHONEPE_PROD_SALT_KEY || process.env.NEXT_PUBLIC_SALT_KEY || '')
    : (process.env.PHONEPE_TEST_SALT_KEY || process.env.NEXT_PUBLIC_TEST_SALT_KEY || '96434309-7796-489d-8924-ab56988a6076'),

  SALT_INDEX: isProduction
    ? (process.env.PHONEPE_PROD_SALT_INDEX || process.env.NEXT_PUBLIC_SALT_INDEX || '1')
    : (process.env.PHONEPE_TEST_SALT_INDEX || process.env.NEXT_PUBLIC_TEST_SALT_INDEX || '1'),

  IS_TEST_MODE: !isProduction,
  ENVIRONMENT: isProduction ? 'production' : 'sandbox',
  APP_URL: getAppUrl(),
  API_ENDPOINTS: getPhonePeEndpoints(),
} as const;

// Mobile-compatible SHA256 hash implementation with fallback
export async function generateSHA256Hash(data: string): Promise<string> {
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
      console.warn('Web Crypto API failed, falling back to JS implementation:', error);
      // Fall through to JavaScript implementation
    }
  }

  // Fallback: Pure JavaScript SHA256 implementation for mobile browsers
  return await sha256Fallback(data);
}

// Pure JavaScript SHA256 implementation for mobile browser compatibility
async function sha256Fallback(message: string): Promise<string> {
  // Convert string to UTF-8 bytes
  const msgBuffer = new TextEncoder().encode(message);

  // SHA-256 constants
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

  // Initial hash values
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  // Pre-processing: adding padding bits
  const msgLength = msgBuffer.length;
  const bitLength = msgLength * 8;

  // Create padded message
  const paddedLength = Math.ceil((msgLength + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(msgBuffer);
  padded[msgLength] = 0x80; // Append '1' bit

  // Append length as 64-bit big-endian integer
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 4, bitLength & 0xffffffff, false);
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000), false);

  // Process message in 512-bit chunks
  for (let chunk = 0; chunk < paddedLength; chunk += 64) {
    const w = new Array(64);

    // Copy chunk into first 16 words of message schedule
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(chunk + i * 4, false);
    }

    // Extend the first 16 words into the remaining 48 words
    for (let i = 16; i < 64; i++) {
      const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    // Initialize working variables
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;

    // Main loop
    for (let i = 0; i < 64; i++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    // Add this chunk's hash to result
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  // Produce the final hash value as a 256-bit number (hex string)
  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map(h => h.toString(16).padStart(8, '0'))
    .join('');
}

// Helper function for right rotation
function rightRotate(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

// Base64 encode a string
export function base64Encode(str: string): string {
  if (typeof window !== 'undefined') {
    return btoa(str);
  } else {
    return Buffer.from(str).toString('base64');
  }
}

// Generate a unique transaction ID (max 38 chars as required by PhonePe)
export function generateTransactionId(bookingId: string | number): string {
  const timestamp = new Date().getTime();
  const prefix = 'NIBOG_';
  const fullId = `${prefix}${bookingId}_${timestamp}`;

  // Check if the ID exceeds 38 characters and truncate if necessary
  if (fullId.length <= 38) {
    return fullId;
  }

  // If too long, use a shortened version
  // Keep the prefix, use last 6 chars of bookingId, and use full timestamp
  const shortBookingId = String(bookingId).slice(-6);
  return `${prefix}${shortBookingId}_${timestamp}`;
}

// Payment status types
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

// PhonePe payment request interface
export interface PhonePePaymentRequest {
  merchantId: string;
  merchantTransactionId: string;
  merchantUserId: string;
  amount: number;
  redirectUrl: string;
  redirectMode: string;
  callbackUrl: string;
  mobileNumber: string;
  paymentInstrument?: {
    type: string;
    [key: string]: any;
  };
}

// PhonePe payment response interface
export interface PhonePePaymentResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    merchantId: string;
    merchantTransactionId: string;
    instrumentResponse: {
      type: string;
      redirectInfo: {
        url: string;
        method: string;
      };
    };
  };
}

// Enhanced validation to prevent credential/endpoint mismatches
export function validatePhonePeConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!PHONEPE_CONFIG.MERCHANT_ID) {
    errors.push('MERCHANT_ID is missing');
  }

  if (!PHONEPE_CONFIG.SALT_KEY) {
    errors.push('SALT_KEY is missing');
  }

  if (!PHONEPE_CONFIG.SALT_INDEX) {
    errors.push('SALT_INDEX is missing');
  }

  if (!PHONEPE_CONFIG.APP_URL) {
    errors.push('APP_URL is missing');
  }

  // Validate environment consistency
  const isProdEndpoint = PHONEPE_CONFIG.API_ENDPOINTS.INITIATE.includes('api.phonepe.com/apis/hermes');
  const isTestEndpoint = PHONEPE_CONFIG.API_ENDPOINTS.INITIATE.includes('api-preprod.phonepe.com');
  const isProdMerchant = PHONEPE_CONFIG.MERCHANT_ID && !PHONEPE_CONFIG.MERCHANT_ID.startsWith('TEST-') && !PHONEPE_CONFIG.MERCHANT_ID.startsWith('PGTEST');

  // Check for dangerous mismatches
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
    errors.push('WARNING: Using production merchant ID with test endpoints');
  }

  // Additional production safety checks
  if (isProduction) {
    if (!PHONEPE_CONFIG.MERCHANT_ID || PHONEPE_CONFIG.MERCHANT_ID.includes('TEST')) {
      errors.push('CRITICAL: Production mode requires valid production merchant ID');
    }
    if (!PHONEPE_CONFIG.SALT_KEY || PHONEPE_CONFIG.SALT_KEY.includes('test')) {
      errors.push('CRITICAL: Production mode requires valid production salt key');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Log PhonePe configuration status with detailed validation
export function logPhonePeConfig(): void {
  const validation = validatePhonePeConfig();

  console.log('=== PhonePe Configuration ===');
  console.log(`Environment: ${PHONEPE_CONFIG.ENVIRONMENT}`);
  console.log(`Merchant ID: ${PHONEPE_CONFIG.MERCHANT_ID ? `✓ Set (${PHONEPE_CONFIG.MERCHANT_ID.substring(0, 8)}...)` : '✗ Missing'}`);
  console.log(`Salt Key: ${PHONEPE_CONFIG.SALT_KEY ? '✓ Set' : '✗ Missing'}`);
  console.log(`Salt Index: ${PHONEPE_CONFIG.SALT_INDEX ? `✓ Set (${PHONEPE_CONFIG.SALT_INDEX})` : '✗ Missing'}`);
  console.log(`App URL: ${PHONEPE_CONFIG.APP_URL}`);
  console.log(`Test Mode: ${PHONEPE_CONFIG.IS_TEST_MODE ? 'Enabled' : 'Disabled'}`);
  console.log(`API Endpoint: ${PHONEPE_CONFIG.API_ENDPOINTS.INITIATE}`);

  // Show endpoint type
  const isProdEndpoint = PHONEPE_CONFIG.API_ENDPOINTS.INITIATE.includes('api.phonepe.com/apis/hermes');
  console.log(`Endpoint Type: ${isProdEndpoint ? 'PRODUCTION' : 'SANDBOX'}`);

  if (!validation.isValid) {
    console.error('PhonePe Configuration Errors:', validation.errors);
    // Throw error for critical mismatches
    const criticalErrors = validation.errors.filter(error => error.includes('CRITICAL'));
    if (criticalErrors.length > 0) {
      throw new Error(`PhonePe Configuration Error: ${criticalErrors.join(', ')}`);
    }
  } else {
    console.log('✓ PhonePe configuration is valid');
  }
  console.log('=============================');
}
