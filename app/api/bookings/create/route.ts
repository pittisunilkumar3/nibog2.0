import { NextResponse } from 'next/server';
import { BOOKING_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    console.log("Server API route: Creating new booking");

    // Parse the request body
    const bookingData = await request.json();
    console.log("Server API route: Booking data:", JSON.stringify(bookingData, null, 2));

    // Validate required fields
    if (!bookingData.parent || !bookingData.child || !bookingData.booking || !bookingData.booking_games) {
      console.log("Server API route: Validation failed. Missing fields:", {
        hasParent: !!bookingData.parent,
        hasChild: !!bookingData.child,
        hasBooking: !!bookingData.booking,
        hasBookingGames: !!bookingData.booking_games,
        hasBookingAddons: !!bookingData.booking_addons,
        hasPayment: !!bookingData.payment
      });
      return NextResponse.json(
        { error: "Missing required booking data" },
        { status: 400 }
      );
    }

    // Log the structure for debugging
    console.log("Server API route: Booking structure validation passed");
    console.log("Server API route: booking_addons:", bookingData.booking_addons);

    // Forward the request to the external API
    const apiUrl = BOOKING_API.CREATE;
    console.log("Server API route: Calling API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    console.log(`Server API route: Create booking response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server API route: Error response (${response.status}):`, errorText);
      console.error("Server API route: Request payload was:", JSON.stringify(bookingData, null, 2));

      let errorMessage = `Error creating booking: ${response.status} - ${response.statusText}`;
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
    console.error("Server API route: Error creating booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create booking" },
      { status: 500 }
    );
  }
}
