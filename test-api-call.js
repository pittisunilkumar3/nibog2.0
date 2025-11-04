/**
 * Simple test script to verify the booking API call
 * Run this with: node test-api-call.js
 */

const https = require('https');

// Your exact payload
const payload = {
  "user_id": 114,
  "parent": {
    "parent_name": "Pitti Sunil Kumar",
    "email": "pittisunilkumar3@gmail.com",
    "additional_phone": "6303727148"
  },
  "child": {
    "full_name": "Pitti Sunil Kumar",
    "date_of_birth": "2015-01-01",
    "school_name": "hgfds",
    "gender": "Male"
  },
  "booking": {
    "event_id": 109,
    "booking_date": "2025-08-14",
    "total_amount": 1,
    "payment_method": "PhonePe",
    "payment_status": "Paid",
    "terms_accepted": true,
    "transaction_id": "OMO2508141555013643309314",
    "merchant_transaction_id": "NIBOG_114_1755167101252",
    "booking_ref": "PPT250814314",
    "status": "Confirmed"
  },
  "booking_games": [
    {
      "slot_id": 339,
      "game_id": 9,
      "game_price": 1
    }
  ]
};

console.log("=== TESTING BOOKING API ===");
console.log("Payload:");
console.log(JSON.stringify(payload, null, 2));

// Validate DOB format
const dobFormat = /^\d{4}-\d{2}-\d{2}$/;
const isValidDOB = dobFormat.test(payload.child.date_of_birth);
console.log(`\nDOB validation: ${isValidDOB ? '✅ Valid' : '❌ Invalid'}`);
console.log(`DOB value: ${payload.child.date_of_birth}`);

// Make the API call
const postData = JSON.stringify(payload);

const options = {
  hostname: 'ai.nibog.in',
  port: 443,
  path: '/webhook/v1/nibog/bookingsevents/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log("\nMaking API call...");

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Status Message: ${res.statusMessage}`);
  console.log('Headers:', res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\nResponse Body:');
    console.log(data);
    
    try {
      const jsonResponse = JSON.parse(data);
      console.log('\nParsed Response:');
      console.log(JSON.stringify(jsonResponse, null, 2));
    } catch (e) {
      console.log('Response is not valid JSON');
    }
  });
});

req.on('error', (error) => {
  console.error('Error making request:', error);
});

// Write data to request body
req.write(postData);
req.end();

// Test with a modified payload (different transaction ID to avoid duplicates)
setTimeout(() => {
  console.log("\n\n=== TESTING WITH MODIFIED PAYLOAD ===");
  
  const modifiedPayload = {
    ...payload,
    booking: {
      ...payload.booking,
      transaction_id: "TEST_" + Date.now(),
      merchant_transaction_id: "TEST_MERCHANT_" + Date.now(),
      booking_ref: "TEST_" + Date.now().toString().slice(-6)
    }
  };
  
  console.log("Modified payload:");
  console.log(JSON.stringify(modifiedPayload, null, 2));
  
  const modifiedPostData = JSON.stringify(modifiedPayload);
  
  const modifiedOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(modifiedPostData)
    }
  };
  
  const req2 = https.request(modifiedOptions, (res) => {
    console.log(`\nModified payload - Status Code: ${res.statusCode}`);
    console.log(`Modified payload - Status Message: ${res.statusMessage}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\nModified payload - Response Body:');
      console.log(data);
      
      try {
        const jsonResponse = JSON.parse(data);
        console.log('\nModified payload - Parsed Response:');
        console.log(JSON.stringify(jsonResponse, null, 2));
      } catch (e) {
        console.log('Modified payload - Response is not valid JSON');
      }
    });
  });
  
  req2.on('error', (error) => {
    console.error('Error making modified request:', error);
  });
  
  req2.write(modifiedPostData);
  req2.end();
}, 2000);
