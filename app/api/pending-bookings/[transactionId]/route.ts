import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { transactionId: string } }
) {
  try {
    const { transactionId } = params;
    console.log(`=== RETRIEVING PENDING BOOKING ===`);
    console.log(`Transaction ID: ${transactionId}`);

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // Retrieve from database via external API
    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/pending-bookings/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction_id: transactionId
      }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Pending booking not found for transaction: ${transactionId}`);
        return NextResponse.json(
          { error: "Pending booking not found" },
          { status: 404 }
        );
      }
      
      const errorText = await response.text();
      console.error('Failed to retrieve pending booking:', errorText);
      return NextResponse.json(
        { error: `Failed to retrieve pending booking: ${response.status}` },
        { status: 500 }
      );
    }

    const result = await response.json();
    
    // Check if the booking has expired
    const expiresAt = new Date(result.expires_at);
    const now = new Date();
    
    if (now > expiresAt) {
      console.log(`Pending booking expired for transaction: ${transactionId}`);
      return NextResponse.json(
        { error: "Pending booking has expired" },
        { status: 410 } // Gone
      );
    }

    // Parse the booking data
    let bookingData;
    try {
      bookingData = JSON.parse(result.booking_data);
    } catch (parseError) {
      console.error('Failed to parse booking data:', parseError);
      return NextResponse.json(
        { error: "Invalid booking data format" },
        { status: 500 }
      );
    }

    console.log("✅ Pending booking retrieved successfully");

    return NextResponse.json({
      success: true,
      transactionId: result.transaction_id,
      bookingData,
      expiresAt: result.expires_at,
      status: result.status
    });

  } catch (error: any) {
    console.error("Error retrieving pending booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve pending booking" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to clean up pending bookings
export async function DELETE(
  request: Request,
  { params }: { params: { transactionId: string } }
) {
  try {
    const { transactionId } = params;
    console.log(`=== DELETING PENDING BOOKING ===`);
    console.log(`Transaction ID: ${transactionId}`);

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // Delete from database via external API
    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/pending-bookings/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction_id: transactionId
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to delete pending booking:', errorText);
      return NextResponse.json(
        { error: `Failed to delete pending booking: ${response.status}` },
        { status: 500 }
      );
    }

    console.log("✅ Pending booking deleted successfully");

    return NextResponse.json({
      success: true,
      message: "Pending booking deleted successfully"
    });

  } catch (error: any) {
    console.error("Error deleting pending booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete pending booking" },
      { status: 500 }
    );
  }
}
