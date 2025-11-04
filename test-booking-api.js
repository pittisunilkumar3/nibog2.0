/**
 * Test script to verify the booking API and DOB handling
 */

// Test the booking API with your exact payload
async function testBookingAPI() {
    console.log("=== TESTING BOOKING API ===");
    
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

    console.log("Payload being sent:");
    console.log(JSON.stringify(payload, null, 2));
    
    try {
        const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/bookingsevents/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        console.log(`Response status: ${response.status}`);
        console.log(`Response status text: ${response.statusText}`);
        
        const responseText = await response.text();
        console.log("Raw response:", responseText);
        
        try {
            const responseData = JSON.parse(responseText);
            console.log("Parsed response:", responseData);
        } catch (parseError) {
            console.log("Could not parse response as JSON:", parseError.message);
        }
        
    } catch (error) {
        console.error("API call failed:", error);
    }
}

// Test DOB formatting functions
function testDOBFormatting() {
    console.log("\n=== TESTING DOB FORMATTING ===");
    
    // Simulate the formatDateForAPI function from the codebase
    function formatDateForAPI(date) {
        if (date instanceof Date) {
            return date.toISOString().split('T')[0];
        } else if (typeof date === 'string') {
            return date.includes('T') ? date.split('T')[0] : date;
        } else {
            throw new Error('Invalid date format');
        }
    }
    
    // Test various date inputs
    const testCases = [
        new Date('2015-01-01'),
        new Date('2020-05-15'),
        '2015-01-01',
        '2020-05-15T00:00:00.000Z',
        new Date('2015-01-01T10:30:00.000Z')
    ];
    
    testCases.forEach((testDate, index) => {
        try {
            const formatted = formatDateForAPI(testDate);
            console.log(`Test ${index + 1}: ${testDate} -> ${formatted}`);
        } catch (error) {
            console.log(`Test ${index + 1}: ${testDate} -> ERROR: ${error.message}`);
        }
    });
}

// Simulate the registration form flow
function simulateRegistrationFlow() {
    console.log("\n=== SIMULATING REGISTRATION FORM FLOW ===");
    
    // Simulate user selecting a date in the calendar
    const userSelectedDate = new Date('2015-01-01');
    console.log("1. User selects date in calendar:", userSelectedDate);
    console.log("   Date type:", typeof userSelectedDate);
    console.log("   Date toString:", userSelectedDate.toString());
    console.log("   Date toISOString:", userSelectedDate.toISOString());
    
    // Simulate the formatDateForAPI function
    function formatDateForAPI(date) {
        if (date instanceof Date) {
            return date.toISOString().split('T')[0];
        } else if (typeof date === 'string') {
            return date.includes('T') ? date.split('T')[0] : date;
        } else {
            throw new Error('Invalid date format');
        }
    }
    
    // Format for storage
    const formattedDob = formatDateForAPI(userSelectedDate);
    console.log("2. Formatted DOB for storage:", formattedDob);
    
    // Simulate creating booking data
    const bookingData = {
        childDob: formattedDob,
        // ... other fields
    };
    console.log("3. Booking data childDob:", bookingData.childDob);
    
    // Simulate API payload construction
    const apiPayload = {
        child: {
            date_of_birth: bookingData.childDob
        }
    };
    console.log("4. Final API payload child.date_of_birth:", apiPayload.child.date_of_birth);
    
    // Validate format
    const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(apiPayload.child.date_of_birth);
    console.log("5. Format validation:", isValidFormat ? "✅ Valid YYYY-MM-DD" : "❌ Invalid format");
}

// Run all tests
async function runAllTests() {
    testDOBFormatting();
    simulateRegistrationFlow();
    await testBookingAPI();
}

// Run tests if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    runAllTests();
} else {
    // Run tests if in browser environment
    window.runAllTests = runAllTests;
    window.testBookingAPI = testBookingAPI;
    window.testDOBFormatting = testDOBFormatting;
    window.simulateRegistrationFlow = simulateRegistrationFlow;
}
