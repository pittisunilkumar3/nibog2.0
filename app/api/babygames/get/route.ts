import { NextResponse } from 'next/server';
import { BABY_GAME_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const data = await request.json();
    const id = data.id;

    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      return NextResponse.json(
        { error: "Invalid game ID. ID must be a positive number." },
        { status: 400 }
      );
    }

    // Forward the request to the external API with the correct URL
    const apiUrl = BABY_GAME_API.GET;

    const response = await fetch(apiUrl, {
      method: "POST", // According to API documentation, this should be POST
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
      cache: "no-store",
    });

    if (!response.ok) {
      // If the first attempt fails, try with the webhook-test URL

      const alternativeUrl = apiUrl.replace("webhook/v1", "webhook-test/v1");
      const alternativeResponse = await fetch(alternativeUrl, {
        method: "POST", // According to API documentation, this should be POST
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
        cache: "no-store",
      });

      if (!alternativeResponse.ok) {
        const errorText = await alternativeResponse.text();
        return NextResponse.json(
          { error: `API returned error status: ${alternativeResponse.status}` },
          { status: alternativeResponse.status }
        );
      }

      // Get the response data from successful alternative attempt
      const responseText = await alternativeResponse.text();

      try {
        const responseData = JSON.parse(responseText);
        return NextResponse.json(responseData, { status: 200 });
      } catch (parseError) {
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
      { error: error.message || "Failed to fetch baby game" },
      { status: 500 }
    );
  }
}
