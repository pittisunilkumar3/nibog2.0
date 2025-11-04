import { NextResponse } from 'next/server';

// Support both GET and POST methods for flexibility
export async function GET(request: Request) {
  try {
    // Get city_id from URL parameters
    const url = new URL(request.url);
    const cityId = url.searchParams.get('city_id');

    if (!cityId || isNaN(Number(cityId)) || Number(cityId) <= 0) {
      return NextResponse.json(
        { error: "Invalid city ID. ID must be a positive number." },
        { status: 400 }
      );
    }

    return await getVenuesByCity(Number(cityId));
  } catch (error: any) {
    console.error("Server API route: Error fetching venues by city:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch venues by city" },
      { status: 500 }
    );
  }
}

// Also support POST for backward compatibility
export async function POST(request: Request) {
  try {
    // Parse the request body
    const data = await request.json();
    const cityId = data.city_id;

    if (!cityId || isNaN(Number(cityId)) || Number(cityId) <= 0) {
      return NextResponse.json(
        { error: "Invalid city ID. ID must be a positive number." },
        { status: 400 }
      );
    }

    return await getVenuesByCity(Number(cityId));
  } catch (error: any) {
    console.error("Server API route: Error fetching venues by city:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch venues by city" },
      { status: 500 }
    );
  }
}

// Helper function to get venues by city ID
async function getVenuesByCity(cityId: number) {
  try {
    console.log(`Server API route: Fetching venues for city ID: ${cityId}`);

    // Forward the request to the external API with the correct URL
    const apiUrl = "https://ai.nibog.in/webhook/v1/nibog/venues/get-by-city";
    console.log("Server API route: Calling API URL:", apiUrl);

    // Use POST method with request body as specified in the API documentation
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ city_id: cityId }),
      cache: "no-store",
    });

    console.log(`Server API route: Get venues by city response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server API route: Error response from POST: ${errorText}`);

      // If POST fails, try an alternative approach
      console.log("Server API route: POST failed, trying alternative approach...");

      // Try using a different format for the request body
      console.log("Server API route: Trying alternative request body format...");

      const alternativeResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cityId: cityId }), // Try different key name
        cache: "no-store",
      });

      console.log(`Server API route: Alternative approach response status: ${alternativeResponse.status}`);

      if (!alternativeResponse.ok) {
        const altErrorText = await alternativeResponse.text();
        console.error(`Server API route: Error response from alternative approach: ${altErrorText}`);
        return NextResponse.json(
          { error: `API returned error status: ${alternativeResponse.status}` },
          { status: alternativeResponse.status }
        );
      }

      // If alternative approach succeeded, use that response
      const altResponseText = await alternativeResponse.text();
      console.log(`Server API route: Raw response from alternative approach: ${altResponseText}`);

      try {
        const altResponseData = JSON.parse(altResponseText);
        console.log(`Server API route: Retrieved ${Array.isArray(altResponseData) ? altResponseData.length : 'non-array'} venues for city ID ${cityId} using alternative approach`);

        if (!Array.isArray(altResponseData)) {
          console.warn("Server API route: Alternative approach did not return an array:", altResponseData);
          return NextResponse.json([], { status: 200 });
        }

        return NextResponse.json(altResponseData, { status: 200 });
      } catch (parseError) {
        console.error("Server API route: Error parsing alternative approach response:", parseError);
        return NextResponse.json(
          {
            error: "Failed to parse API response from alternative approach",
            rawResponse: altResponseText.substring(0, 500)
          },
          { status: 500 }
        );
      }
    }

    // Get the response data from successful GET request
    const responseText = await response.text();
    console.log(`Server API route: Raw response from GET: ${responseText}`);

    let responseData;
    try {
      // Try to parse the response as JSON
      responseData = JSON.parse(responseText);
      console.log(`Server API route: Retrieved ${Array.isArray(responseData) ? responseData.length : 'non-array'} venues for city ID ${cityId}`);

      // Ensure we have an array
      if (!Array.isArray(responseData)) {
        console.warn("Server API route: API did not return an array:", responseData);
        responseData = [];
      }
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

    // Return the response with the appropriate status
    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error("Server API route: Error in getVenuesByCity helper:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch venues by city" },
      { status: 500 }
    );
  }
}
