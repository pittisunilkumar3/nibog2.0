import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log("=== CREATING PENDING BOOKING ===");
    
    // Parse the request body
    const bookingData = await request.json();
    console.log("Pending booking data:", JSON.stringify(bookingData, null, 2));

    // Specifically track DOB for debugging
    console.log("=== DOB TRACKING IN PENDING BOOKING CREATION ===");
    console.log("Received childDob:", bookingData.childDob);
    console.log("childDob type:", typeof bookingData.childDob);
    console.log("DOB format validation:", /^\d{4}-\d{2}-\d{2}$/.test(bookingData.childDob) ? "✅ Valid YYYY-MM-DD" : "❌ Invalid format");

    // Validate required fields
    const requiredFields = [
      'userId', 'parentName', 'email', 'phone', 'childName', 'childDob',
      'schoolName', 'gender', 'eventId', 'gameId', 'totalAmount', 'termsAccepted'
    ];

    for (const field of requiredFields) {
      if (!bookingData[field]) {
        console.error(`❌ Missing required field: ${field}`);
        console.error(`❌ Field value:`, bookingData[field]);
        console.error(`❌ Field type:`, typeof bookingData[field]);
        console.error(`❌ All booking data:`, JSON.stringify(bookingData, null, 2));
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    console.log("✅ All required fields validation passed");

    // Generate a unique transaction ID for this pending booking
    const timestamp = Date.now();
    const transactionId = `NIBOG_${bookingData.userId}_${timestamp}`;
    
    // Create the pending booking record
    const pendingBookingPayload = {
      transaction_id: transactionId,
      user_id: bookingData.userId,
      booking_data: JSON.stringify(bookingData),
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
      status: 'pending'
    };

    console.log("Creating pending booking with transaction ID:", transactionId);

    // Verify DOB is preserved in the stringified booking data
    console.log("=== VERIFYING DOB IN STRINGIFIED BOOKING DATA ===");
    const stringifiedData = JSON.stringify(bookingData);
    console.log("Stringified booking data contains childDob:", stringifiedData.includes('"childDob"'));
    console.log("Stringified childDob value:", stringifiedData.match(/"childDob":"([^"]+)"/)?.[1] || "NOT FOUND");

    // Double-check by parsing it back
    try {
      const parsedBack = JSON.parse(stringifiedData);
      console.log("Parsed back childDob:", parsedBack.childDob);
      console.log("DOB preserved correctly:", parsedBack.childDob === bookingData.childDob ? "✅ YES" : "❌ NO");
    } catch (parseError) {
      console.error("❌ Error parsing back stringified data:", parseError);
    }

    // Store in database via external API
    console.log("📡 Calling external API: https://ai.nibog.in/webhook/v1/nibog/pending-bookings/create");
    console.log("📋 Payload being sent:", JSON.stringify(pendingBookingPayload, null, 2));

    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/pending-bookings/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pendingBookingPayload),
    });

    console.log(`📡 External API response status: ${response.status}`);
    console.log(`📡 External API response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to create pending booking - External API Error:');
      console.error(`❌ Status: ${response.status}`);
      console.error(`❌ Status Text: ${response.statusText}`);
      console.error(`❌ Response Body: ${errorText}`);
      console.error(`❌ Request Payload: ${JSON.stringify(pendingBookingPayload, null, 2)}`);

      return NextResponse.json(
        {
          error: `Failed to create pending booking: ${response.status} - ${response.statusText}`,
          details: errorText,
          status: response.status
        },
        { status: 500 }
      );
    }

    const result = await response.json();
    console.log("✅ Pending booking created successfully");

    return NextResponse.json({
      success: true,
      transactionId,
      pendingBookingId: result.id || result.pending_booking_id,
      expiresAt: pendingBookingPayload.expires_at
    });

  } catch (error: any) {
    console.error("Error creating pending booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create pending booking" },
      { status: 500 }
    );
  }
}
