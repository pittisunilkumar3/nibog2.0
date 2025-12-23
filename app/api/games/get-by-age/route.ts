import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const requestData = await request.json();
    const ageInMonths = requestData.age_in_months;

    if (!ageInMonths || isNaN(Number(ageInMonths)) || Number(ageInMonths) < 0) {
      return NextResponse.json(
        { error: "Invalid age. Age must be a positive number." },
        { status: 400 }
      );
    }

    console.log(`Server API route: Fetching games for age: ${ageInMonths} months`);

    // Forward the request to the external API with the correct URL
    const apiUrl = "https://ai.nibog.in/webhook/v1/nibog/game/get-by-age";

    // Use POST method with request body as specified in the API documentation
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        age: Number(ageInMonths) // Changed from age_in_months to age based on API patterns
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server API route: Error response: ${errorText}`);
      return NextResponse.json(
        { error: `API returned error status: ${response.status}` },
        { status: response.status }
      );
    }

    // Get the response data
    const responseText = await response.text();

    let responseData;
    try {
      // Try to parse the response as JSON
      responseData = JSON.parse(responseText);

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
    console.error("Server API route: Error fetching games by age:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch games by age" },
      { status: 500 }
    );
  }
}
