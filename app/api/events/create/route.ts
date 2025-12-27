import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const eventData = await request.json();

    // Log what we received for debugging
    console.log('📥 API Route received event data:')
    console.log('  Title:', eventData.title)
    console.log('  event_games_with_slots count:', eventData.event_games_with_slots?.length)
    eventData.event_games_with_slots?.forEach((slot: any, idx: number) => {
      console.log(`    Slot ${idx + 1}: game_id=${slot.game_id}, ${slot.start_time} - ${slot.end_time}`)
    })

    // Validate required fields
    if (!eventData.title) {
      return NextResponse.json(
        { error: "Event title is required" },
        { status: 400 }
      );
    }

    if (!eventData.venue_id) {
      return NextResponse.json(
        { error: "Venue ID is required" },
        { status: 400 }
      );
    }

    if (!eventData.event_date) {
      return NextResponse.json(
        { error: "Event date is required" },
        { status: 400 }
      );
    }

    if (!eventData.event_games_with_slots || !Array.isArray(eventData.event_games_with_slots) || eventData.event_games_with_slots.length === 0) {
      return NextResponse.json(
        { error: "At least one game slot is required (event_games_with_slots)" },
        { status: 400 }
      );
    }

    // Get authentication token from request headers
    const authHeader = request.headers.get('authorization');
    
    // Forward the request to the backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3004';
    const apiUrl = `${backendUrl}/api/events/create`;
    // removed debug log

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { "Authorization": authHeader } : {}),
      },
      body: JSON.stringify(eventData),
      cache: "no-store",
    });

    // removed debug log

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server API route: Error response:", errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        return NextResponse.json(errorJson, { status: response.status });
      } catch {
        return NextResponse.json(
          { error: `Failed to create event: ${response.status} ${response.statusText}`, details: errorText },
          { status: response.status }
        );
      }
    }

    // Get the response data
    const responseText = await response.text();
    // removed debug log

    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);

      return NextResponse.json(responseData, { status: 201 });
    } catch (parseError) {
      console.error("Server API route: Error parsing response:", parseError);
      // If parsing fails, return the error
      return NextResponse.json(
        {
          error: "Failed to parse API response",
          rawResponse: responseText.substring(0, 500) // Limit the size of the raw response
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Server API route: Error creating event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create event" },
      { status: 500 }
    );
  }
}
