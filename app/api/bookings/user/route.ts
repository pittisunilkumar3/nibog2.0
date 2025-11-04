import { NextResponse } from 'next/server';
import { BOOKING_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    console.log("Server API route: Starting user bookings request");

    // Parse the request body
    const requestData = await request.json();
    console.log(`Server API route: Received request body: ${JSON.stringify(requestData)}`);

    // Validate user_id
    if (!requestData.user_id) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    // Forward the request to the external API
    const apiUrl = BOOKING_API.GET_USER_BOOKINGS;
    console.log("Server API route: Calling API URL:", apiUrl);
    console.log(`Server API route: Request method: POST`);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
      cache: "no-store",
    });

    console.log(`Server API route: User bookings response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server API route: API error response: ${errorText}`);
      return NextResponse.json(
        { error: `API returned error status: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`Server API route: User bookings response data length: ${Array.isArray(data) ? data.length : 'Not an array'}`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server API route: Error in user bookings endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
