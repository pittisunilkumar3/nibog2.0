import { NextResponse } from 'next/server';
import { EVENT_DETAILS_API } from '@/config/api';

export async function GET() {
  try {
    // Use the working external API endpoint
    const apiUrl = EVENT_DETAILS_API.GET_WITH_IMAGES;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch events. API returned status: ${response.status}` },
        { status: response.status }
      );
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
