import { NextResponse } from 'next/server';
import { BOOKING_API } from '@/config/api';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    console.log('[BOOKING] Booking creation request received');
    
    // Parse the request body
    const bookingData = await request.json();
    console.log('[BOOKING] Request data:', JSON.stringify(bookingData, null, 2));

    // Validate required fields
    if (!bookingData.parent || !bookingData.child || !bookingData.booking || !bookingData.booking_games) {
      console.error('[BOOKING] Validation failed: Missing required fields');
      return NextResponse.json(
        { success: false, error: "Missing required booking data" },
        { status: 400 }
      );
    }

    // Forward the request to the external API
    const apiUrl = BOOKING_API.CREATE;
    console.log('[BOOKING] Calling backend API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    console.log('[BOOKING] Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[BOOKING] Error response:", errorText);
      console.error("[BOOKING] Request payload was:", JSON.stringify(bookingData, null, 2));

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
          success: false,
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
      console.log('[BOOKING] Success response:', data);
    } catch (parseError) {
      console.error("[BOOKING] Error parsing response:", parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to parse API response", 
          rawResponse: responseText 
        },
        { status: 500 }
      );
    }
    
    // Return the response with success status
    return NextResponse.json({ success: true, ...data }, { status: 200 });
  } catch (error: any) {
    console.error("[BOOKING] Server error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create booking" },
      { status: 500 }
    );
  }
}
