import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log("Server API route: Getting promo codes by event");

    // Parse the request body
    const requestData = await request.json();
    console.log("Server API route: Request data:", JSON.stringify(requestData, null, 2));

    // Validate required fields
    if (!requestData.event_id) {
      console.log("Server API route: Validation failed - missing event_id");
      return NextResponse.json(
        { error: "Missing required field: event_id" },
        { status: 400 }
      );
    }

    // Forward the request to the external API
    const apiUrl = "https://ai.nibog.in/webhook/v1/nibog/promocode/get-by-event";
    console.log("Server API route: Calling API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    console.log(`Server API route: Get promo codes by event response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server API route: Error response (${response.status}):`, errorText);
      
      let errorMessage = `Error fetching promo codes by event: ${response.status} - ${response.statusText}`;
      let errorDetails = errorText;
      
      try {
        const errorData = JSON.parse(errorText);
        console.log("Server API route: Parsed error data:", errorData);
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        errorDetails = errorData;
      } catch (e) {
        console.log("Server API route: Could not parse error as JSON, using raw text");
        errorDetails = errorText;
      }

      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorDetails,
          status: response.status,
          statusText: response.statusText
        },
        { status: response.status }
      );
    }

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
      return NextResponse.json(
        { 
          error: "Failed to parse API response", 
          rawResponse: responseText 
        },
        { status: 500 }
      );
    }
    
    // Return the response with success status
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Server API route: Error getting promo codes by event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get promo codes by event" },
      { status: 500 }
    );
  }
}
