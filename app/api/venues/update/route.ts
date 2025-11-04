import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const venueData = await request.json();
    
    console.log("Server API route: Updating venue with data:", venueData);

    // Validate required fields
    if (!venueData.id || isNaN(Number(venueData.id)) || Number(venueData.id) <= 0) {
      return NextResponse.json(
        { error: "id is required and must be a positive number" },
        { status: 400 }
      );
    }

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

    // Normalize the data - ensure all required fields are present
    const normalizedData = {
      id: Number(venueData.id),
      venue_name: venueData.venue_name.trim(),
      city_id: Number(venueData.city_id),
      address: venueData.address.trim(),
      capacity: venueData.capacity ? Number(venueData.capacity) : 0,
      is_active: venueData.is_active !== undefined ? Boolean(venueData.is_active) : true
    };

    // Remove undefined values
    Object.keys(normalizedData).forEach(key => {
      if ((normalizedData as any)[key] === undefined) {
        delete (normalizedData as any)[key];
      }
    });

    console.log("Server API route: Normalized venue data:", normalizedData);
    console.log("Server API route: Data being sent to external API:", JSON.stringify(normalizedData, null, 2));

    // Forward the request to the external API with the correct URL
    const apiUrl = "https://ai.nibog.in/webhook/v1/nibog/venues/update";
    console.log("Server API route: Calling API URL:", apiUrl);

    // Try POST method first (as per documentation)
    let response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(normalizedData),
    });

    // If POST fails, try PUT method as fallback
    if (!response.ok) {
      console.log("POST method failed, trying PUT method as fallback...");
      response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(normalizedData),
      });
    }

    console.log(`Server API route: Update venue response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server API route: Error response: ${errorText}`);

      let errorMessage = `Error updating venue: ${response.status}`;
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

    // Get the response data
    const responseText = await response.text();
    console.log(`Server API route: Raw response: ${responseText}`);
    
    let responseData;
    try {
      // Try to parse the response as JSON
      responseData = JSON.parse(responseText);
      console.log("Server API route: Parsed response data:", responseData);
      
      // Handle different response formats
      if (Array.isArray(responseData) && responseData.length > 0) {
        // If the API returns an array with one venue, return the first item
        return NextResponse.json(responseData[0], { status: 200 });
      } else if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
        // If the API returns a single venue object, return it
        return NextResponse.json(responseData, { status: 200 });
      } else if (Array.isArray(responseData) && responseData.length === 0) {
        // If the API returns an empty array, return an error
        return NextResponse.json(
          { error: `Failed to update venue with ID ${venueData.id}` },
          { status: 404 }
        );
      } else {
        // Unexpected response format
        return NextResponse.json(
          { error: "Unexpected response format from API", data: responseData },
          { status: 500 }
        );
      }
    } catch (parseError) {
      console.error("Server API route: Error parsing response:", parseError);
      // If parsing fails, return the raw text
      return NextResponse.json(
        { 
          error: "Failed to parse API response", 
          rawResponse: responseText.substring(0, 500) // Limit the size of the raw response
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Server API route: Error updating venue:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update venue" },
      { status: 500 }
    );
  }
}
