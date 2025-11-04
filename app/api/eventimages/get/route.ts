import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('🔍 Event images fetch request:', body);

    // Validate required fields
    const { event_id } = body;

    if (!event_id) {
      return NextResponse.json(
        { error: 'event_id is required' },
        { status: 400 }
      );
    }

    const targetEventId = parseInt(event_id);
    console.log(`🎯 Fetching images for Event ${targetEventId} using mapping system...`);

    // Import and use the mapping system
    const { fetchEventImagesWithMapping } = await import('@/lib/eventImageMapping');

    try {
      const images = await fetchEventImagesWithMapping(targetEventId);
      console.log(`✅ Mapping system returned ${images.length} images for Event ${targetEventId}`);

      if (images.length > 0) {
        console.log('📊 Sample image:', {
          id: images[0].id,
          event_id: images[0].event_id,
          priority: images[0].priority,
          image_url: images[0].image_url
        });
      }

      return NextResponse.json(images, { status: 200 });

    } catch (mappingError) {
      console.error('❌ Mapping system failed, falling back to direct API call:', mappingError);

      // Fallback to direct API call
      const apiPayload = {
        event_id: targetEventId
      };

      console.log('📡 Fallback: Fetching from external API directly:', apiPayload);
      console.log('🔗 External API URL:', 'https://ai.nibog.in/webhook/nibog/geteventwithimages/get');

      // Fetch from external API
      const apiResponse = await fetch('https://ai.nibog.in/webhook/nibog/geteventwithimages/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      console.log(`📊 External API response status: ${apiResponse.status}`);

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
      console.log('✅ External API fallback success:', {
        status: apiResponse.status,
        result: apiResult
      });

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
