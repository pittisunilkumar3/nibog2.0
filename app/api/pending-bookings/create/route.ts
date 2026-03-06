import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004'

export async function POST(request: Request) {
  try {
    console.log('[PENDING-BOOKING] ========== CREATE START ==========');
    
    // Parse the request body
    const body = await request.json();
    console.log('[PENDING-BOOKING] Request data keys:', Object.keys(body));
    console.log('[PENDING-BOOKING] userId:', body.userId);
    console.log('[PENDING-BOOKING] parentName:', body.parentName);
    console.log('[PENDING-BOOKING] eventId:', body.eventId);
    console.log('[PENDING-BOOKING] totalAmount:', body.totalAmount);

    // Validate essential fields from frontend (based on PendingBookingData interface)
    if (!body.userId) {
      console.error('[PENDING-BOOKING] Missing userId');
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }
    
    if (!body.parentName) {
      console.error('[PENDING-BOOKING] Missing parentName');
      return NextResponse.json(
        { success: false, error: 'parentName is required' },
        { status: 400 }
      );
    }
    
    if (!body.eventId) {
      console.error('[PENDING-BOOKING] Missing eventId');
      return NextResponse.json(
        { success: false, error: 'eventId is required' },
        { status: 400 }
      );
    }
    
    if (!body.totalAmount) {
      console.error('[PENDING-BOOKING] Missing totalAmount');
      return NextResponse.json(
        { success: false, error: 'totalAmount is required' },
        { status: 400 }
      );
    }

    // Generate a unique transaction ID for this pending booking
    const timestamp = Date.now();
    const transactionId = `NIBOG_${body.userId}_${timestamp}`;
    console.log('[PENDING-BOOKING] Generated transaction ID:', transactionId);

    // Calculate expiration time (30 minutes from now)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const expiresAtStr = expiresAt.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');

    // Create the pending booking payload for backend
    // The backend expects: transaction_id, user_id, booking_data, expires_at, status
    const pendingBookingPayload = {
      transaction_id: transactionId,
      user_id: String(body.userId),
      booking_data: JSON.stringify(body),
      expires_at: expiresAtStr,
      status: 'pending'
    };

    console.log('[PENDING-BOOKING] Calling backend:', `${BACKEND_URL}/api/pending-bookings/create`);
    console.log('[PENDING-BOOKING] Payload:');
    console.log('  - transaction_id:', pendingBookingPayload.transaction_id);
    console.log('  - user_id:', pendingBookingPayload.user_id);
    console.log('  - booking_data length:', pendingBookingPayload.booking_data.length);
    console.log('  - expires_at:', pendingBookingPayload.expires_at);

    const response = await fetch(`${BACKEND_URL}/api/pending-bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pendingBookingPayload),
    });

    console.log('[PENDING-BOOKING] Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[PENDING-BOOKING] Backend error response:', errorText);

      return NextResponse.json(
        {
          success: false,
          error: `Backend error: ${response.status} - ${errorText}`,
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('[PENDING-BOOKING] ========== CREATE SUCCESS ==========');
    console.log('[PENDING-BOOKING] Result:', result);

    return NextResponse.json({
      success: true,
      transactionId,
      pendingBookingId: result.id,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error: any) {
    console.error('[PENDING-BOOKING] ========== CREATE ERROR ==========');
    console.error('[PENDING-BOOKING] Error:', error.message);
    console.error('[PENDING-BOOKING] Stack:', error.stack);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create pending booking" },
      { status: 500 }
    );
  }
}
