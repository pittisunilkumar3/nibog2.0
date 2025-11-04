import { NextResponse } from 'next/server';
import { EVENT_API } from '@/config/api';

export async function GET() {
  try {
    // Forward the request to the external API with the correct URL
    const apiUrl = EVENT_API.GET_ALL;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      // If the first attempt fails, try with a different URL format
      // Try with webhook-test instead of webhook
      const alternativeUrl = "https://ai.nibog.in/webhook-test/v1/nibog/event-game-slot/get-all";

      const alternativeResponse = await fetch(alternativeUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!alternativeResponse.ok) {
        return NextResponse.json(
          { error: `Failed to fetch events. API returned status: ${alternativeResponse.status}` },
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
    return NextResponse.json(
      { error: error.message || "Failed to fetch events" },
      { status: 500 }
    );
  }
}
