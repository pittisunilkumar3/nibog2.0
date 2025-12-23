import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const bookingId = params.id;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';
    const apiUrl = `${BACKEND_URL}/api/bookings/${bookingId}`;
    
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        );
      }
      
      const errorText = await response.text();
      console.error('Backend API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to fetch booking: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Return the data directly as the backend should already format it correctly
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}
