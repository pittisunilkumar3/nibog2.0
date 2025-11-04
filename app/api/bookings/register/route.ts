import { NextResponse } from 'next/server';
import { BOOKING_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    console.log("Server API route: Starting booking registration request");

    // Parse the request body
    const bookingData = await request.json();
    console.log(`Server API route: Received request body: ${JSON.stringify(bookingData)}`);

    // Forward the request to the external API with the correct URL
    const apiUrl = BOOKING_API.CREATE;
    console.log("Server API route: Calling API URL:", apiUrl);
    console.log(`Server API route: Request method: POST`);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
      cache: "no-store",
    });

    console.log(`Server API route: Booking registration response status: ${response.status}`);

    // Get the response data
    const responseText = await response.text();
    console.log(`Server API route: Raw response: ${responseText}`);

    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);
      console.log("Server API route: Booking registration response:", responseData);

      return NextResponse.json(responseData, { status: 200 });
    } catch (parseError) {
      console.error("Server API route: Error parsing response:", parseError);
      // If parsing fails but we got a 200 status, consider it a success
      if (response.status >= 200 && response.status < 300) {
        return NextResponse.json({ success: true }, { status: 200 });
      }
      // Otherwise, return the error
      return NextResponse.json(
        {
          error: "Failed to parse API response",
          rawResponse: responseText.substring(0, 500) // Limit the size of the raw response
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Server API route: Error registering booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register booking" },
      { status: 500 }
    );
  }
}
