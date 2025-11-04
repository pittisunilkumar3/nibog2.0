import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Game images fetch request:', body);

    // Validate required fields
    const { game_id } = body;
    
    if (!game_id) {
      return NextResponse.json(
        { error: 'game_id is required' },
        { status: 400 }
      );
    }

    // Prepare the payload for the external API
    const apiPayload = {
      game_id: parseInt(game_id)
    };

    console.log('Fetching game images from external API:', apiPayload);
    console.log('External API URL:', 'https://ai.nibog.in/webhook/nibog/gamesimage/get');

    // Fetch from external API
    const apiResponse = await fetch('https://ai.nibog.in/webhook/nibog/gamesimage/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPayload),
    });

    console.log(`External API response status: ${apiResponse.status}`);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('External API error:', {
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
    console.log('External API success:', {
      status: apiResponse.status,
      result: apiResult
    });

    return NextResponse.json(apiResult, { status: 200 });

  } catch (error) {
    console.error('Game images fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch game images' },
      { status: 500 }
    );
  }
}
