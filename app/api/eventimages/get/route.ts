import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // removed debug log

    // Validate required fields
    const { event_id } = body;

    if (!event_id) {
      return NextResponse.json(
        { error: 'event_id is required' },
        { status: 400 }
      );
    }

    const targetEventId = parseInt(event_id);
    // removed debug log

    // Import and use the mapping system
    const { fetchEventImagesWithMapping } = await import('@/lib/eventImageMapping');

    try {
      const images = await fetchEventImagesWithMapping(targetEventId);
      // removed debug log

      if (images.length > 0) {
        // removed debug log
      }

      return NextResponse.json(images, { status: 200 });

    } catch (mappingError) {
      console.error('❌ Mapping system failed, falling back to direct API call:', mappingError);

      // Fallback to direct API call
      const apiPayload = {
        event_id: targetEventId
      };

      // removed debug log
      // removed debug log

      // Fetch from external API
      const apiResponse = await fetch('https://ai.nibog.in/webhook/nibog/geteventwithimages/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      // removed debug log

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('❌ External API error:', {
          status: apiResponse.status,
          statusText: apiResponse.statusText,
          errorText: errorText
        });
        return NextResponse.json(
          { error: `External API failed: ${apiResponse.status} ${apiResponse.statusText}`, details: errorText },
          { status: apiResponse.status }
        );
      }

      const apiResult = await apiResponse.json();
      // removed debug log

      return NextResponse.json(apiResult, { status: 200 });
    }

  } catch (error) {
    console.error('Event images fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch event images' },
      { status: 500 }
    );
  }
}
