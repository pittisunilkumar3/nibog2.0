import { NextResponse } from 'next/server';
import { VENUE_API } from '@/config/api';

export async function GET() {
  try {
    // Forward the request to the external API
    const apiUrl = VENUE_API.GET_ALL;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      let errorMessage = `Error fetching venues: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If we can't parse the error as JSON, use the status code
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Validate the data structure
    if (!Array.isArray(data)) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch venues" },
      { status: 500 }
    );
  }
}
