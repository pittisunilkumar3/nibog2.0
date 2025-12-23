import { NextResponse } from 'next/server';
import { EVENT_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const eventData = await request.json();

    // Validate required fields
    if (!eventData.id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

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

    if (!eventData.games || !Array.isArray(eventData.games) || eventData.games.length === 0) {
      return NextResponse.json(
        { error: "At least one game is required" },
        { status: 400 }
      );
    }

    // Forward the request to the external API with the correct URL
    const apiUrl = EVENT_API.UPDATE;

    // Validate that games array is properly formatted
    if (!eventData.games.every((game: any) =>
      typeof game.game_id === 'number' &&
      typeof game.start_time === 'string' &&
      typeof game.end_time === 'string' &&
      typeof game.slot_price === 'number' &&
      typeof game.max_participants === 'number'
    )) {
      console.error("Server API route: Invalid game data format in request");
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
      cache: "no-store",
    });

    if (!response.ok) {
      // If the first attempt fails, try with a different URL format

      // Try with webhook instead of webhook-test as a fallback
      const alternativeUrl = "https://ai.nibog.in/webhook/v1/nibog/event-game-slots/update";

      const alternativeResponse = await fetch(alternativeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
        cache: "no-store",
      });


      if (!alternativeResponse.ok) {
        const errorText = await alternativeResponse.text();
        console.error("Server API route: Error response from alternative URL:", errorText);
        return NextResponse.json(
          { error: `Failed to update event. API returned status: ${alternativeResponse.status}` },
          { status: alternativeResponse.status }
        );
      }

      // Get the response data from the alternative URL
      const responseText = await alternativeResponse.text();

      try {
        // Try to parse the response as JSON
        const responseData = JSON.parse(responseText);

        return NextResponse.json(responseData, { status: 200 });
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
    }

    // Get the response data
    const responseText = await response.text();

    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);

      return NextResponse.json(responseData, { status: 200 });
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
    console.error("Server API route: Error updating event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update event" },
      { status: 500 }
    );
  }
}
