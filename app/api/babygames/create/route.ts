import { NextResponse } from 'next/server';
import { BABY_GAME_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const data = await request.json();

    // Validate required fields
    if (!data.game_name) {
      return NextResponse.json(
        { error: "Game name is required" },
        { status: 400 }
      );
    }

    if (!data.description || data.description.trim() === "") {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    // Ensure we're using the correct field names as specified in the API documentation
    const apiData = {
      game_name: data.game_name,
      description: data.description || data.game_description,
      game_description: data.description || data.game_description, // Try both field names
      min_age_months: data.min_age_months || data.min_age, // API expects min_age_months
      max_age_months: data.max_age_months || data.max_age, // API expects max_age_months
      duration_minutes: data.duration_minutes,
      categories: data.categories,
      is_active: data.is_active
    };


    // Forward the request to the external API with the correct URL
    // Note: The API documentation shows the URL as webhook-test but config has webhook
    // We'll use the config value but be prepared to handle errors
    const apiUrl = BABY_GAME_API.CREATE;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiData),
      cache: "no-store",
    });

    if (!response.ok) {
      // If the first attempt fails, try with a different URL format

      // Try with uppercase V1 instead of lowercase v1
      const alternativeUrl = apiUrl.replace("webhook/V1", "webhook/v1");
      console.log("Server API route: Trying alternative URL:", alternativeUrl);

      const alternativeResponse = await fetch(alternativeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
        cache: "no-store",
      });

      if (!alternativeResponse.ok) {
        const errorText = await alternativeResponse.text();
        console.error(`Server API route: Error response from alternative attempt: ${errorText}`);
        return NextResponse.json(
          { error: `API returned error status: ${alternativeResponse.status}` },
          { status: alternativeResponse.status }
        );
      }

      // Get the response data from successful alternative attempt
      const responseText = await alternativeResponse.text();

      try {
        const responseData = JSON.parse(responseText);
        return NextResponse.json(responseData, { status: 201 });
      } catch (parseError) {
        console.error("Server API route: Error parsing alternative response:", parseError);
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

      return NextResponse.json(responseData, { status: 201 });
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
      { error: error.message || "Failed to create baby game" },
      { status: 500 }
    );
  }
}
