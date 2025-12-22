import { NextResponse } from 'next/server';
import { BOOKING_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const bookingData = await request.json();

    // Validate required fields
    if (!bookingData.parent || !bookingData.child || !bookingData.booking || !bookingData.booking_games) {
      // Validation failed - missing required fields
      return NextResponse.json(
        { error: "Missing required booking data" },
        { status: 400 }
      );
    }

    // Forward the request to the external API
    const apiUrl = BOOKING_API.CREATE;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server API route: Error response (${response.status}):`, errorText);
      console.error("Server API route: Request payload was:", JSON.stringify(bookingData, null, 2));

      let errorMessage = `Error creating booking: ${response.status} - ${response.statusText}`;
      let errorDetails = errorText;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        errorDetails = errorData;
      } catch (e) {
        // Could not parse error as JSON, using raw text
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
    
    let data;
    try {
      // Try to parse the response as JSON
      data = JSON.parse(responseText);
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
    console.error("Server API route: Error creating booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create booking" },
      { status: 500 }
    );
  }
}
