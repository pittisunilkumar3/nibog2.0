import { NextResponse } from 'next/server';
import { BABY_GAME_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const data = await request.json();

    // Validate required fields
    if (!data.id) {
      return NextResponse.json(
        { error: "Game ID is required for update" },
        { status: 400 }
      );
    }

    if (!data.game_name) {
      return NextResponse.json(
        { error: "Game name is required" },
        { status: 400 }
      );
    }

    // Ensure we're using the correct field names as specified in the API documentation
    // Since edit works with min_age_months/max_age_months, use that format
    const apiData = {
      id: data.id,
      game_name: data.game_name,
      description: data.description || data.game_description,
      min_age: data.min_age_months || data.min_age, // API expects min_age_months
      max_age: data.max_age_months || data.max_age, // API expects max_age_months
      duration_minutes: data.duration_minutes,
      categories: data.categories,
      is_active: data.is_active
    };

    // Forward the request to the external API with the correct URL
    const apiUrl = BABY_GAME_API.UPDATE;
    const response = await fetch(apiUrl, {
      method: "POST", // Changed from PUT to POST as per API documentation
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiData),
      cache: "no-store",
    });

    if (!response.ok) {
      // If the first attempt fails, try with the webhook-test URL

      const alternativeUrl = apiUrl.replace("webhook/v1", "webhook-test/v1");

      const alternativeResponse = await fetch(alternativeUrl, {
        method: "POST", // Changed from PUT to POST as per API documentation
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
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
      { error: error.message || "Failed to update baby game" },
      { status: 500 }
    );
  }
}
