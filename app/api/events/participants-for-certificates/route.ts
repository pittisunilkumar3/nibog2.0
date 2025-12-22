import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching participants for event ID: ${eventId}`);
    
    // Try the new API endpoint first
    const apiUrl = `https://ai.nibog.in/webhook/v1/nibog/events/participants?event_id=${eventId}`;
    console.log(`Using API URL: ${apiUrl}`);
    
    const response = await fetch(
      apiUrl,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add a timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000) // 10 second timeout
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`n8n participants error (${response.status}):`, errorText);
      throw new Error(`Failed to fetch participants: ${response.status}`);
    }

    const result = await response.json();

    // Log the response structure for debugging
    console.log('Participants API response structure:', {
      resultType: typeof result,
      isArray: Array.isArray(result),
      length: Array.isArray(result) ? result.length : 'N/A',
      hasParticipants: Array.isArray(result) && result.length > 0 ? 'participants' in result[0] : 'N/A'
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Get participants error:', error);
    
    return NextResponse.json(
      { error: `Failed to fetch participants: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
