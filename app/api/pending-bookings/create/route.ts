import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {

    // Parse the request body
    const bookingData = await request.json();

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

    // Store in database via external API

    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/pending-bookings/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pendingBookingPayload),
    });

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
