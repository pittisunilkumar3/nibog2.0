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
      return NextResponse.json(
        { error: `Failed to fetch booking: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Return the data directly as the backend should already format it correctly
    return NextResponse.json(data);
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const bookingId = params.id;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const body = await request.json();

    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';
    const apiUrl = `${BACKEND_URL}/api/bookings/${bookingId}`;

    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to update booking: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(
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
      method: 'DELETE',
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
      
      let errorMessage = `Failed to delete booking: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // Not JSON, use default message
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the success response
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
