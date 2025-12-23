import { NextResponse } from 'next/server';

// Force dynamic to allow runtime fetches and request.url usage
export const dynamic = 'force-dynamic'

// Simple in-memory cache to prevent excessive API calls
let cachedData: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

export async function GET(request: Request) {
  try {

    // Extract pagination parameters from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = (page - 1) * limit;

    // Create cache key that includes pagination parameters
    const cacheKey = `complete_bookings_${page}_${limit}`;

    // Check if we have cached data that's still valid
    const now = Date.now();
    if (cachedData && cachedData.cacheKey === cacheKey && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json(cachedData.data, { status: 200 });
    }

    // Forward the request to the external API with the original URL
    const apiUrl = "https://ai.nibog.in/webhook/v1/nibog/bookingsevents/get-all";

    // Set a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`Server API route: API request failed with status ${response.status}`);
        const errorText = await response.text();
        console.error("Server API route: Error response:", errorText);
        return NextResponse.json(
          { error: `API request failed: ${response.status} ${response.statusText}` },
          { status: response.status }
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        console.error("Server API route: API response is not an array:", typeof data);
        return NextResponse.json(
          { error: "Invalid API response format" },
          { status: 500 }
        );
      }

      // Flatten the booking data structure
      const flattenedBookings = data.flatMap((booking: any) => {
        if (!booking.children || !Array.isArray(booking.children)) {
          console.warn(`Server API route: Booking ${booking.booking_id} has no children array`);
          return [];
        }

        return booking.children.flatMap((child: any) => {
          if (!child.games || !Array.isArray(child.games)) {
            console.warn(`Server API route: Child ${child.child_id} has no games array`);
            return [];
          }

          return child.games.map((game: any) => {
            const game_name = game.game_name || 'Unknown Game';
            
            return {
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
          });
        });
      });

      // Apply pagination to the flattened data
      const totalCount = flattenedBookings.length;
      const paginatedBookings = flattenedBookings.slice(offset, offset + limit);

      const result = {
        data: paginatedBookings,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: offset + limit < totalCount,
          hasPrev: page > 1
        }
      };

      // Cache the result
      cachedData = {
        cacheKey,
        data: result
      };
      cacheTimestamp = now;

      return NextResponse.json(result, { status: 200 });

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error("Server API route: Request timeout");
        return NextResponse.json(
          { error: "Request timeout - API took too long to respond" },
          { status: 504 }
        );
      }
      
      console.error("Server API route: Fetch error:", fetchError);
      return NextResponse.json(
        { error: `Network error: ${fetchError.message}` },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("Server API route: Unexpected error:", error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}
