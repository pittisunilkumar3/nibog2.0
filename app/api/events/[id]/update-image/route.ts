import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';

/**
 * PATCH /api/events/:id/update-image
 * Update event's image_url and priority after image upload
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const body = await request.json();
    const { image_url, priority } = body;

    console.log(`PATCH /api/events/${eventId}/update-image - Updating image_url to:`, image_url);

    if (!image_url) {
      return NextResponse.json(
        { error: 'image_url is required' },
        { status: 400 }
      );
    }

    // Call backend API to update the event's image_url
    const response = await fetch(`${BACKEND_URL}/api/events/${eventId}/update-image`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url,
        priority: priority || 1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API error:', errorText);
      return NextResponse.json(
        { error: `Failed to update event image. Status: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log(`Event ${eventId} image updated successfully`);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error: any) {
    console.error('PATCH /api/events/:id/update-image - Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update event image' },
      { status: 500 }
    );
  }
}
