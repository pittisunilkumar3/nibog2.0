import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';

/**
 * GET /api/city/[city_id]/events
 * List all events for a given city with venue and city names
 * No authentication required
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { city_id: string } }
) {
  try {
    const { city_id } = params;

    if (!city_id || isNaN(Number(city_id))) {
      return NextResponse.json(
        { success: false, message: 'Invalid city ID' },
        { status: 400 }
      );
    }


    const response = await fetch(`${BACKEND_URL}/api/city/${city_id}/events`, {
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
        { success: false, message: `Failed to fetch events for city. Status: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    // Ensure consistent response format
    if (result.success && result.data) {
      return NextResponse.json(result, {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
    }

    // If response is just an array, wrap it
    return NextResponse.json(
      {
        success: true,
        data: Array.isArray(result) ? result : []
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      }
    );
  } catch (error: any) {
    console.error(`GET /api/city/[city_id]/events - Error:`, error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch events for city' },
      { status: 500 }
    );
  }
}
