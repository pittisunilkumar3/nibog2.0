import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Proxy /api/events/participants to the backend.
// nginx routes /api/events/* to this frontend, so we forward the request.
export async function GET(request: Request) {
  try {
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      console.error('BACKEND_URL is not defined in environment variables');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'event_id is required' },
        { status: 400 }
      );
    }

    const apiUrl = `${backendUrl}/api/events/participants?event_id=${encodeURIComponent(eventId)}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to fetch participants' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Error in participants API route:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred', message: error.message },
      { status: 500 }
    );
  }
}
