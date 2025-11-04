import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log("Server API route: Starting booking payment status update request");

    // Parse the request body
    const { bookingId, paymentStatus } = await request.json();
    console.log(`Server API route: Updating booking ID: ${bookingId}, payment status: ${paymentStatus}`);

    // Validate required fields
    if (!bookingId || !paymentStatus) {
      return NextResponse.json(
        { error: "Missing required fields: bookingId and paymentStatus are required" },
        { status: 400 }
      );
    }

    // Try to update the booking using the general update endpoint
    const updateUrl = "https://ai.nibog.in/webhook/v1/nibog/bookingsevents/update";
    console.log("Server API route: Calling external API:", updateUrl);

    const response = await fetch(updateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        booking_id: bookingId,
        payment_status: paymentStatus
      }),
      cache: "no-store",
    });

    console.log(`External API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`External API error: ${errorText}`);
      
      // If the payment status update fails, try updating the booking status instead
      console.log("Payment status update failed, trying booking status update...");
      
      const statusMapping = {
        'successful': 'Confirmed',
        'paid': 'Confirmed', 
        'pending': 'Pending',
        'failed': 'Cancelled'
      };
      
      const bookingStatus = statusMapping[paymentStatus.toLowerCase() as keyof typeof statusMapping] || 'Pending';
      
      const statusResponse = await fetch("https://ai.nibog.in/webhook/v1/nibog/bookingsevents/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          booking_id: bookingId,
          status: bookingStatus
        }),
        cache: "no-store",
      });

      if (!statusResponse.ok) {
        const statusErrorText = await statusResponse.text();
        console.error(`Status update also failed: ${statusErrorText}`);
        throw new Error(`Both payment status and booking status updates failed: ${response.status} / ${statusResponse.status}`);
      }

      const statusData = await statusResponse.json();
      console.log("Booking status updated successfully:", statusData);
      
      return NextResponse.json({
        ...statusData,
        message: `Booking status updated to ${bookingStatus} (payment status: ${paymentStatus})`
      }, { status: 200 });
    }

    const data = await response.json();
    console.log("External API response data:", data);

    // Return the response from the external API
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Server API route: Error updating booking payment status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update booking payment status" },
      { status: 500 }
    );
  }
}
