import { NextResponse } from 'next/server';
import { BOOKING_API } from '@/config/api';

export async function POST(request: Request) {
  try {

    // Parse the request body
    const bookingData = await request.json();

    // Forward the request to the external API with the correct URL
    const apiUrl = BOOKING_API.CREATE;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
      cache: "no-store",
    });

    // Get the response data
    const responseText = await response.text();
    
    console.log("=== Backend API Response ===");
    console.log("Status:", response.status);
    console.log("Response text:", responseText.substring(0, 1000)); // Log first 1000 chars

    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);
      
      console.log("Parsed response data:", responseData);
      console.log("Response type:", typeof responseData);
      console.log("Is array:", Array.isArray(responseData));
      console.log("Response keys:", Object.keys(responseData || {}));

      // Return with the same status code from the backend
      return NextResponse.json(responseData, { status: response.status });
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
