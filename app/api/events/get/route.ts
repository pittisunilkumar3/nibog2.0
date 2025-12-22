import { NextResponse } from 'next/server';
import { EVENT_API } from '@/config/api';

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Parse the request body
    const data = await request.json();
    const id = data.id;
    
    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      return NextResponse.json(
        { error: "Invalid event ID. ID must be a positive number." },
        { status: 400 }
      );
    }
    
    // removed debug log

    // Forward the request to the external API with the correct URL
    const apiUrl = EVENT_API.GET;
    // removed debug log

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
      cache: "no-store",
    });

    // removed debug log

    if (!response.ok) {
      // If the first attempt fails, try with a different URL format
      // removed debug log

      // Try with webhook-test instead of webhook
      const alternativeUrl = "https://ai.nibog.in/webhook-test/v1/nibog/event-game-slots/get";
      // removed debug log

      const alternativeResponse = await fetch(alternativeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
        cache: "no-store",
      });

      // removed debug log

      if (!alternativeResponse.ok) {
        // If both attempts fail, return an error
        return NextResponse.json(
          { error: `Failed to fetch event. API returned status: ${alternativeResponse.status}` },
          { status: alternativeResponse.status }
        );
      }

      // Get the response data from the alternative URL
      const responseText = await alternativeResponse.text();
      // removed debug log

      try {
        // Try to parse the response as JSON
        const responseData = JSON.parse(responseText);
        // removed debug log

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
    // removed debug log

    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);
      // removed debug log
      // removed debug log

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
    console.error("Server API route: Error fetching event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch event" },
      { status: 500 }
    );
  }
}
