import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log(`Received PUT request to edit event ${id}`);

    let body;
    try {
      body = await request.json();
      console.log(`Request body parsed successfully`);
    } catch (parseError: any) {
      console.error(`Failed to parse request JSON: ${parseError.message}`);
      return NextResponse.json(
        { error: 'Invalid JSON in request body', details: parseError.message },
        { status: 400 }
      );
    }

    console.log(`Event ID ${id} - Received event_date:`, body.event_date);
    console.log(`Event ID ${id} - event_date type:`, typeof body.event_date);
    console.log(`Event ID ${id} - Full request body:`, JSON.stringify(body, null, 2));

    // Validate required fields
    if (!body.title || typeof body.title !== 'string') {
      console.error(`title is missing or invalid`);
      return NextResponse.json(
        { error: 'Event title is required' },
        { status: 400 }
      );
    }

    // Validate event_date if provided
    if (body.event_date && typeof body.event_date !== 'string') {
      console.error(`event_date has invalid type: ${typeof body.event_date}`);
      return NextResponse.json(
        { error: 'event_date must be a valid date string' },
        { status: 400 }
      );
    }

    if (!body.event_games_with_slots || !Array.isArray(body.event_games_with_slots)) {
      console.error(`event_games_with_slots array missing or invalid`);
      return NextResponse.json(
        { error: 'event_games_with_slots array is required and must be an array' },
        { status: 400 }
      );
    }

    // Log detailed update information
    console.log(`Total slots in request: ${body.event_games_with_slots.length}`);
    console.log(`Slots to delete: ${body.event_games_with_slots_to_delete?.length || 0}`);
    
    // Log slots with IDs (existing) vs without IDs (new)
    const existingSlots = body.event_games_with_slots.filter((slot: any) => slot.id);
    const newSlots = body.event_games_with_slots.filter((slot: any) => !slot.id);
    console.log(`Existing slots to update: ${existingSlots.length}`);
    console.log(`New slots to create: ${newSlots.length}`);

    console.log(`Validation passed, forwarding to backend`);

    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      console.warn(`No authorization header provided`);
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const backendUrl = `${BACKEND_URL}/api/events/${id}/edit`;

    console.log(`Forwarding to backend: ${backendUrl}`);

    let response;
    try {
      response = await fetch(backendUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });
      console.log(`Backend fetch completed with status: ${response.status}`);
    } catch (fetchError: any) {
      console.error(`Backend fetch failed: ${fetchError.message}`);
      return NextResponse.json(
        { error: `Backend connection failed: ${fetchError.message}` },
        { status: 503 }
      );
    }

    let responseText = '';
    try {
      responseText = await response.text();
      console.log(`Backend response received (length: ${responseText.length})`);
    } catch (textError: any) {
      console.error(`Failed to read response text: ${textError.message}`);
      return NextResponse.json(
        { error: 'Failed to read backend response' },
        { status: 502 }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
      console.log(`Backend response parsed successfully`);
    } catch (parseError: any) {
      console.error(`Failed to parse backend response: ${parseError.message}`);
      return NextResponse.json(
        { error: 'Failed to parse backend response as JSON', details: responseText.substring(0, 500) },
        { status: 502 }
      );
    }

    if (!response.ok) {
      console.error(`Backend returned error status: ${response.status}`, data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log(`Event ${id} updated successfully`);
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error(`Error in PUT /api/events/[id]/edit:`, error.message);
    return NextResponse.json(
      { error: error.message || 'Internal server error', details: error.stack?.substring(0, 200) },
      { status: 500 }
    );
  }
}