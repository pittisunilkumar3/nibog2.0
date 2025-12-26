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


    // Call the backend API to get booking details by reference
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3004';
    const response = await fetch(`${backendUrl}/api/bookings/check?booking_ref=${booking_ref_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
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
    
    // The backend now returns a single booking object
    const bookingData = data;

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

