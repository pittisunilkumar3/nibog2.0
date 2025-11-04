/**
 * Simple Node.js script to test the booking API
 */

const https = require('https');

async function testBookingAPI() {
    console.log("=== TESTING BOOKING API ===");
    
    // Test 1: Original payload with 2015-01-01
    console.log("\nTEST 1: Original payload with 2015-01-01");
    const originalPayload = {
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
            "transaction_id": "TEST_ORIGINAL_" + Date.now(),
            "merchant_transaction_id": "TEST_MERCHANT_ORIGINAL_" + Date.now(),
            "booking_ref": "TEST_ORIG_" + Date.now().toString().slice(-6),
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
    
    await makeAPICall(originalPayload, "Original (2015-01-01)");
    
    // Test 2: Modified payload with different DOB
    console.log("\nTEST 2: Modified payload with different DOB (2020-05-15)");
    const modifiedPayload = {
        ...originalPayload,
        "parent": {
            "parent_name": "Test Parent Modified",
            "email": "testmodified@example.com",
            "additional_phone": "9876543210"
        },
        "child": {
            "full_name": "Test Child Modified",
            "date_of_birth": "2020-05-15",
            "school_name": "Test School Modified",
            "gender": "Female"
        },
        "booking": {
            ...originalPayload.booking,
            "transaction_id": "TEST_MODIFIED_" + Date.now(),
            "merchant_transaction_id": "TEST_MERCHANT_MODIFIED_" + Date.now(),
            "booking_ref": "TEST_MOD_" + Date.now().toString().slice(-6)
        }
    };
    
    await makeAPICall(modifiedPayload, "Modified (2020-05-15)");
    
    // Test 3: Current date DOB
    console.log("\nTEST 3: Payload with current date DOB");
    const currentDate = new Date().toISOString().split('T')[0];
    const currentPayload = {
        ...originalPayload,
        "parent": {
            "parent_name": "Test Parent Current",
            "email": "testcurrent@example.com",
            "additional_phone": "1234567890"
        },
        "child": {
            "full_name": "Test Child Current",
            "date_of_birth": currentDate,
            "school_name": "Test School Current",
            "gender": "Male"
        },
        "booking": {
            ...originalPayload.booking,
            "transaction_id": "TEST_CURRENT_" + Date.now(),
            "merchant_transaction_id": "TEST_MERCHANT_CURRENT_" + Date.now(),
            "booking_ref": "TEST_CUR_" + Date.now().toString().slice(-6)
        }
    };
    
    await makeAPICall(currentPayload, `Current Date (${currentDate})`);
}

function makeAPICall(payload, testName) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(payload);
        
        console.log(`\n--- ${testName} ---`);
        console.log(`DOB in payload: ${payload.child.date_of_birth}`);
        console.log(`Transaction ID: ${payload.booking.transaction_id}`);
        
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
        
        const req = https.request(options, (res) => {
            console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`Response: ${data}`);
                
                try {
                    const jsonResponse = JSON.parse(data);
                    console.log(`Parsed Response:`, JSON.stringify(jsonResponse, null, 2));
                    
                    if (jsonResponse[0] && jsonResponse[0].success) {
                        console.log(`✅ SUCCESS: Booking created with ID ${jsonResponse[0].booking_id}`);
                    } else {
                        console.log(`❌ FAILED: ${JSON.stringify(jsonResponse)}`);
                    }
                } catch (e) {
                    console.log(`Response is not valid JSON: ${data}`);
                }
                
                resolve();
            });
        });
        
        req.on('error', (error) => {
            console.error(`❌ API call failed: ${error.message}`);
            resolve();
        });
        
        req.write(postData);
        req.end();
    });
}

// Add delay between requests
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
    try {
        await testBookingAPI();
        console.log("\n=== ALL TESTS COMPLETED ===");
    } catch (error) {
        console.error("Error running tests:", error);
    }
}

runTests();
