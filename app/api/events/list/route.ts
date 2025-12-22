import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';

/**
 * GET /api/events/list
 * List all events with their slots, venue name, city name, and event_games_with_slots
 * No authentication required
 */
export async function GET() {
  try {
    console.log('GET /api/events/list - Fetching all events with details');

    const response = await fetch(`${BACKEND_URL}/api/events/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', errorText);
      return NextResponse.json(
        { error: `Failed to fetch events. Status: ${response.status}` },
        { status: response.status }
      );
    }

    const events = await response.json();
    console.log(`Retrieved ${events.length} events from API`);

    return NextResponse.json(events, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error: any) {
    console.error('GET /api/events/list - Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
