import { NextResponse } from 'next/server';

// Use environment variable for API base URL or fallback to production
const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3004";

export async function GET(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Await params before accessing (required in Next.js 15+)
    const params = await context.params;
    const userId = params.userId;

    console.log('[API /bookings/user/[userId]] Fetching bookings for userId:', userId);

    // Validate userId
    if (!userId || isNaN(Number(userId))) {
      console.log('[API /bookings/user/[userId]] Invalid userId:', userId);
      return NextResponse.json(
        { success: false, error: "User ID is required and must be a valid number" },
        { 
          status: 400,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }

    // Call the external API
    const apiUrl = `${API_BASE_URL}/api/bookings/user/${userId}`;
    console.log('[API /bookings/user/[userId]] Calling backend:', apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
      cache: "no-store",
      // Add a signal to prevent hanging requests
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    console.log('[API /bookings/user/[userId]] Backend response status:', response.status);

    if (response.status === 404) {
      console.log('[API /bookings/user/[userId]] User not found');
      return NextResponse.json(
        { success: false, error: "User not found" },
        { 
          status: 404,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API /bookings/user/[userId]] API error response: ${errorText}`);
      return NextResponse.json(
        { success: false, error: `API returned error status: ${response.status}`, details: errorText },
        { 
          status: response.status,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }

    const data = await response.json();
    console.log('[API /bookings/user/[userId]] Success, bookings count:', data?.data?.bookings?.length || 0);

    // Create response with no-cache headers
    const jsonResponse = NextResponse.json(data);
    
    // Set cache control headers to prevent caching
    jsonResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    jsonResponse.headers.set('Pragma', 'no-cache');
    jsonResponse.headers.set('Expires', '0');
    
    return jsonResponse;
  } catch (error) {
    console.error("[API /bookings/user/[userId]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  }
}
