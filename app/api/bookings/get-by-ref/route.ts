import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { booking_ref_id } = body;

    if (!booking_ref_id) {
      return NextResponse.json(
        { error: "Booking reference is required" },
        { status: 400 }
      );
    }

    console.log('Fetching booking details for reference:', booking_ref_id);

    // Call the external API to get booking details by reference
    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/tickect/booking_ref/details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        booking_ref_id: booking_ref_id
      })
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        );
      }
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    
    // The API returns an array, get the first item
    const bookingData = Array.isArray(data) && data.length > 0 ? data[0] : data;

    if (!bookingData) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(bookingData, { status: 200 });
  } catch (error: any) {
    console.error("Failed to fetch booking by reference:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch booking details" },
      { status: 500 }
    );
  }
}

