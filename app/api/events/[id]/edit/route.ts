import { NextRequest, NextResponse } from 'next/server';

// Use environment variable for API base URL or fallback to local development
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('=== PUT /api/events/[id]/edit ===');
    console.log('Event ID:', id);

    // Get the request body
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    // Validate event_games_with_slots array exists
    if (!body.event_games_with_slots || !Array.isArray(body.event_games_with_slots)) {
      return NextResponse.json(
        { error: 'event_games_with_slots array is required' },
        { status: 400 }
      );
    }

    // Get the Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    console.log('Authorization header:', authHeader ? 'Present' : 'Missing');

    // Prepare headers for the backend request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Forward the request to the backend API
    const backendUrl = `${BACKEND_URL}/api/events/${id}/edit`;
    console.log('Forwarding PUT request to:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    console.log('Backend response status:', response.status);

    // Get the response data
    const data = await response.json();
    console.log('Backend response data:', data);

    // Return the response from the backend
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Error in PUT /api/events/[id]/edit:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
