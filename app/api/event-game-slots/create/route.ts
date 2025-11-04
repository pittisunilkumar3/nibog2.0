import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const data = await request.json();
    
    console.log(`Server API route: Creating event game slot with data:`, data);

    // Validate required fields
    const requiredFields = ['event_id', 'game_id', 'start_time', 'end_time', 'max_participants'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Forward the request to the external API
    const response = await fetch("https://ai.nibog.in/webhook/v1/nibog/event-game-slot/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log(`External API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`External API error: ${errorText}`);
      return NextResponse.json(
        { error: `External API returned error status: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log("Server API route: Event game slot created successfully:", result);

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Server API route: Error creating event game slot:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create event game slot" },
      { status: 500 }
    );
  }
}
