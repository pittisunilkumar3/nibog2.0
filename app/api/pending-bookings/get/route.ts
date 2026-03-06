import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004'

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transaction_id } = body;

    if (!transaction_id) {
      return NextResponse.json(
        { success: false, error: 'transaction_id is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/pending-bookings/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transaction_id }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Pending booking not found' },
          { status: 404 }
        );
      }
      if (response.status === 410) {
        return NextResponse.json(
          { success: false, error: 'Pending booking has expired' },
          { status: 410 }
        );
      }

      const errorText = await response.text();
      console.error('❌ Failed to get pending booking:', errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve pending booking' },
        { status: 500 }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Error getting pending booking:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get pending booking" },
      { status: 500 }
    );
  }
}
