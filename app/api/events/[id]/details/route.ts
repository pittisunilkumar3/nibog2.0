import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';

// Force dynamic rendering - disable all caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/events/[id]/details
 * Get an event with its games, venue name, city name, and event_games_with_slots
 * No authentication required
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      );
    }


    const response = await fetch(`${BACKEND_URL}/api/events/${id}/details`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }

      const errorText = await response.text();
      console.error('External API error:', errorText);
      return NextResponse.json(
        { error: `Failed to fetch event. Status: ${response.status}` },
        { status: response.status }
      );
    }

    const event = await response.json();

    return NextResponse.json(event, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error: any) {
    console.error(`GET /api/events/[id]/details - Error:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch event details' },
      { status: 500 }
    );
  }
}
