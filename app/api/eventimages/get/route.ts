import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[API /api/eventimages/get] Received request with body:', body);

    // Validate required fields
    const { event_id } = body;

    if (!event_id) {
      console.error('[API /api/eventimages/get] Missing event_id in request');
      return NextResponse.json(
        { error: 'event_id is required' },
        { status: 400 }
      );
    }

    const targetEventId = parseInt(event_id);
    console.log(`[API /api/eventimages/get] Processing request for event ID: ${targetEventId}`);

    // Import and use the mapping system
    const { fetchEventImagesWithMapping } = await import('@/lib/eventImageMapping');

    try {
      console.log('[API /api/eventimages/get] Calling fetchEventImagesWithMapping...');
      const images = await fetchEventImagesWithMapping(targetEventId);
      console.log(`[API /api/eventimages/get] Retrieved ${images.length} images`);

      if (images.length > 0) {
        console.log(`[API /api/eventimages/get] ✅ Success: Found ${images.length} images for event ${targetEventId}`);
      } else {
        console.log(`[API /api/eventimages/get] ⚠️ No images found for event ${targetEventId}`);
      }

      return NextResponse.json(images, { status: 200 });

    } catch (mappingError) {
      console.error('[API /api/eventimages/get] ❌ Mapping system failed, falling back to direct API call:', mappingError);

      // Fallback to direct API call
      const apiPayload = {
        event_id: targetEventId
      };

      console.log('[API /api/eventimages/get] Calling external API directly...');
      console.log('[API /api/eventimages/get] Payload:', apiPayload);

      // Fetch from external API
      const apiResponse = await fetch('https://ai.nibog.in/webhook/nibog/geteventwithimages/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      console.log(`[API /api/eventimages/get] External API response status: ${apiResponse.status}`);

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('[API /api/eventimages/get] ❌ External API error:', {
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
      console.log('[API /api/eventimages/get] External API result:', apiResult);

      return NextResponse.json(apiResult, { status: 200 });
    }

  } catch (error) {
    console.error('[API /api/eventimages/get] ❌ Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch event images' },
      { status: 500 }
    );
  }
}
