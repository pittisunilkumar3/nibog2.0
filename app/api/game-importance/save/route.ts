import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    
    const body = await request.json();
    
    const response = await fetch('http://localhost:3004/api/game-importance/save', {
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
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Game importance API: Error saving data:', error);
    
    return NextResponse.json(
      { error: 'Internal server error while saving data' },
      { status: 500 }
    );
  }
}
