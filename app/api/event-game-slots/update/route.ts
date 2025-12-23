import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.id) {
      return NextResponse.json(
        { error: "Slot ID is required" },
        { status: 400 }
      );
    }

    // Forward the request to the external API
    const response = await fetch("https://ai.nibog.in/webhook/v1/nibog/event-game-slot/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`External API error: ${errorText}`);
      return NextResponse.json(
        { error: `External API returned error status: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Server API route: Error updating event game slot:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update event game slot" },
      { status: 500 }
    );
  }
}
