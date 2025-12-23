import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const data = await request.json();
    const id = data.id;
    
    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      return NextResponse.json(
        { error: "Invalid slot ID. ID must be a positive number." },
        { status: 400 }
      );
    }

    // Forward the request to the external API
    const response = await fetch("https://ai.nibog.in/webhook/v1/nibog/event-game-slot/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: Number(id) }),
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
    console.error("Server API route: Error deleting event game slot:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete event game slot" },
      { status: 500 }
    );
  }
}
