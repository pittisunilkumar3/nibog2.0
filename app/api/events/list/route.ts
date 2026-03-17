import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';

/**
 * GET /api/events/list
 * List all events with their slots, venue name, city name, and event_games_with_slots
 * No authentication required
 * Query params:
 *   - all: if set to 'true', returns all events (including inactive) - for admin use
 */
export async function GET(request: Request) {
  try {
    // Get the URL and extract query params
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all');
    
    // Build backend URL with query param if needed
    const backendUrl = showAll === 'true' 
      ? `${BACKEND_URL}/api/events/list?all=true`
      : `${BACKEND_URL}/api/events/list`;

    const response = await fetch(backendUrl, {
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
