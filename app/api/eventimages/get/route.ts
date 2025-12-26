import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { event_id } = body;

    if (!event_id) {
      return NextResponse.json(
        { error: 'event_id is required' },
        { status: 400 }
      );
    }

    const targetEventId = parseInt(event_id);

    // Import and use the mapping system
    const { fetchEventImagesWithMapping } = await import('@/lib/eventImageMapping');

    try {
      const images = await fetchEventImagesWithMapping(targetEventId);

      return NextResponse.json(images, { status: 200 });

    } catch (mappingError) {
      // Fallback to direct API call
      const apiPayload = {
        event_id: targetEventId
      };

      // Fetch from external API
      const apiResponse = await fetch('https://ai.nibog.in/webhook/nibog/geteventwithimages/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        return NextResponse.json(
          { error: `External API failed: ${apiResponse.status} ${apiResponse.statusText}`, details: errorText },
          { status: apiResponse.status }
        );
      }

      const apiResult = await apiResponse.json();

      return NextResponse.json(apiResult, { status: 200 });
    }

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch event images' },
      { status: 500 }
    );
  }
}
