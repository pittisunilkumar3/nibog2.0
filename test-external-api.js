const https = require('https');

function testAPI(dob, testName) {
    return new Promise((resolve, reject) => {
        const payload = {
            "user_id": 114,
            "parent": {
                "parent_name": "Test Parent",
                "email": "test@example.com",
                "additional_phone": "1234567890"
            },
            "child": {
                "full_name": "Test Child",
                "date_of_birth": dob,
                "school_name": "Test School",
                "gender": "Male"
            },
            "booking": {
                "event_id": 109,
                "booking_date": "2025-08-14",
                "total_amount": 1,
                "payment_method": "PhonePe",
                "payment_status": "Paid",
                "terms_accepted": true,
                "transaction_id": `TEST_${dob.replace(/-/g, '')}_${Date.now()}`,
                "merchant_transaction_id": `TEST_MERCHANT_${Date.now()}`,
                "booking_ref": `TEST_${Date.now().toString().slice(-6)}`,
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

        const postData = JSON.stringify(payload);
        
        console.log(`\n--- ${testName} ---`);
        console.log(`DOB: ${dob}`);
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
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                console.log(`Response: ${data}`);
                
                try {
                    const jsonResponse = JSON.parse(data);
                    if (jsonResponse[0] && jsonResponse[0].success) {
                        console.log(`✅ SUCCESS: Booking ID ${jsonResponse[0].booking_id}`);
                        resolve(jsonResponse[0].booking_id);
                    } else {
                        console.log(`❌ FAILED: ${JSON.stringify(jsonResponse)}`);
                        reject(new Error(JSON.stringify(jsonResponse)));
                    }
                } catch (e) {
                    console.log(`Response not JSON: ${data}`);
                    if (res.statusCode === 200) {
                        resolve('Success');
                    } else {
                        reject(new Error(data));
                    }
                }
            });
        });
        
        req.on('error', (error) => {
            console.log(`❌ Request failed: ${error.message}`);
            reject(error);
        });
        
        req.write(postData);
        req.end();
    });
}

async function runTests() {
    console.log("=== TESTING EXTERNAL API WITH DIFFERENT DOB VALUES ===");
    
    const testCases = [
        { dob: "2020-05-15", name: "Test 1: DOB 2020-05-15" },
        { dob: "2018-12-25", name: "Test 2: DOB 2018-12-25" },
        { dob: "2022-03-10", name: "Test 3: DOB 2022-03-10" }
    ];
    
    for (const testCase of testCases) {
        try {
            await testAPI(testCase.dob, testCase.name);
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        } catch (error) {
            console.log(`Test failed: ${error.message}`);
        }
    }
    
    console.log("\n=== TESTS COMPLETED ===");
}

runTests();
