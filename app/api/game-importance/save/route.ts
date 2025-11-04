import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('Game importance API: Saving data to external API...');
    
    const body = await request.json();
    console.log('Game importance API: Request body:', body);
    
    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/game-importance/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Game importance API: External API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Game importance API: Error details:', errorText);
      
      return NextResponse.json(
        { error: `Failed to save data: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Game importance API: Successfully saved data');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Game importance API: Error saving data:', error);
    
    return NextResponse.json(
      { error: 'Internal server error while saving data' },
      { status: 500 }
    );
  }
}
