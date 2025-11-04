import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;
    console.log(`Server API route: Fetching complete booking with ID: ${bookingId}`);

    // Forward the request to the external API
    const apiUrl = "https://ai.nibog.in/webhook/v1/nibog/bookingsevents/get-all";
    console.log("Server API route: Calling API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store"
    });

    console.log(`Server API route: Get complete booking response status: ${response.status}`);

    if (!response.ok) {
      console.error(`Server API route: API request failed with status ${response.status}`);
      return NextResponse.json(
        { error: `API request failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`Server API route: Received ${Array.isArray(data) ? data.length : 'unknown'} complete bookings from API`);

    if (!Array.isArray(data)) {
      console.error("Server API route: API response is not an array:", typeof data);
      return NextResponse.json(
        { error: "Invalid API response format" },
        { status: 500 }
      );
    }

    // Find the specific booking and flatten it
    let result = null;

    for (const booking of data) {
      if (String(booking.booking_id) === String(bookingId)) {
        // Found the booking, now flatten it
        if (booking.children && Array.isArray(booking.children)) {
          for (const child of booking.children) {
            if (child.games && Array.isArray(child.games)) {
              for (const game of child.games) {
                const game_name = game.game_name || 'Unknown Game';
                
                result = {
                  ...booking,
                  child_full_name: child.child_full_name,
                  child_date_of_birth: child.child_date_of_birth,
                  child_school_name: child.child_school_name,
                  child_gender: child.child_gender,
                  child_is_active: child.child_is_active,
                  child_created_at: child.child_created_at,
                  child_updated_at: child.child_updated_at,
                  child_id: child.child_id,
                  child_age: child.child_age, // Add the new child_age field
                  game_name
                };
                break; // Take the first game for this booking
              }
            }
            if (result) break; // Take the first child for this booking
          }
        }
        break; // Found the booking, stop searching
      }
    }

    if (!result) {
      console.log(`Server API route: Complete booking with ID ${bookingId} not found`);
      return NextResponse.json(
        { error: "Complete booking not found" },
        { status: 404 }
      );
    }

    console.log(`Server API route: Found complete booking with ID ${bookingId}`);
    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error("Server API route: Error fetching complete booking:", error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}
