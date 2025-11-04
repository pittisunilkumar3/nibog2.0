import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const venueData = await request.json();
    
    console.log("Server API route: Creating venue with data:", venueData);

    // Validate required fields
    if (!venueData.venue_name || typeof venueData.venue_name !== 'string') {
      return NextResponse.json(
        { error: "venue_name is required and must be a string" },
        { status: 400 }
      );
    }

    if (!venueData.city_id || isNaN(Number(venueData.city_id))) {
      return NextResponse.json(
        { error: "city_id is required and must be a number" },
        { status: 400 }
      );
    }

    if (!venueData.address || typeof venueData.address !== 'string') {
      return NextResponse.json(
        { error: "address is required and must be a string" },
        { status: 400 }
      );
    }

    // Normalize the data
    const normalizedData = {
      venue_name: venueData.venue_name,
      city_id: Number(venueData.city_id),
      address: venueData.address,
      capacity: venueData.capacity ? Number(venueData.capacity) : undefined,
      is_active: venueData.is_active !== undefined ? venueData.is_active : true
    };

    console.log("Server API route: Normalized venue data:", normalizedData);

    // Forward the request to the external API with the correct URL
    const apiUrl = "https://ai.nibog.in/webhook/v1/nibog/venues/create";
    console.log("Server API route: Calling API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(normalizedData),
    });

    console.log(`Server API route: Create venue response status: ${response.status}`);

    // Get the response data
    const responseText = await response.text();
    console.log(`Server API route: Raw response: ${responseText}`);
    
    let data;
    try {
      // Try to parse the response as JSON
      data = JSON.parse(responseText);
      console.log("Server API route: Parsed response data:", data);
    } catch (parseError) {
      console.error("Server API route: Error parsing response:", parseError);
      // If parsing fails, return the raw text
      return NextResponse.json(
        { 
          error: "Failed to parse API response", 
          rawResponse: responseText 
        },
        { status: response.status }
      );
    }
    
    // Return the response with the appropriate status
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Server API route: Error creating venue:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create venue" },
      { status: 500 }
    );
  }
}
