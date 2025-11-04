import { NextResponse } from 'next/server';
import { EVENT_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const eventData = await request.json();

    console.log("Server API route: Creating event:", eventData);

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

    if (!eventData.games || !Array.isArray(eventData.games) || eventData.games.length === 0) {
      return NextResponse.json(
        { error: "At least one game is required" },
        { status: 400 }
      );
    }

    // Forward the request to the external API with the correct URL
    const apiUrl = EVENT_API.CREATE;
    console.log("Server API route: Calling API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
      cache: "no-store",
    });

    console.log(`Server API route: Create event response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server API route: Error response:", errorText);
      return NextResponse.json(
        { error: `Failed to create event: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get the response data
    const responseText = await response.text();
    console.log(`Server API route: Raw response: ${responseText}`);

    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);
      console.log("Server API route: Created event:", responseData);

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
