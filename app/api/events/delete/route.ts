import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3004';

export async function POST(request: Request) {
  try {
    console.log("=== DELETE Event API Route ===");

    // Parse the request body
    const data = await request.json();
    const id = Number(data.id);
    
    console.log("Event ID to delete:", id);

    if (!id || isNaN(id) || id <= 0) {
      console.error("Invalid event ID:", id);
      return NextResponse.json(
        { error: "Invalid event ID. ID must be a positive number." },
        { status: 400 }
      );
    }

    // Get the Authorization header from the incoming request or from storage
    let authHeader = request.headers.get('authorization');
    
    // If no auth header, try to get from cookies
    if (!authHeader) {
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const authTokenMatch = cookieHeader.match(/auth-token=([^;]+)/);
        const superadminTokenMatch = cookieHeader.match(/superadmin-token=([^;]+)/);
        const token = authTokenMatch?.[1] || superadminTokenMatch?.[1];
        if (token) {
          authHeader = `Bearer ${token}`;
        }
      }
    }

    console.log("Authorization header:", authHeader ? "Present" : "Missing");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      );
    }

    // Prepare headers for the backend request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': authHeader
    };

    // Forward the request to the backend API
    const backendUrl = `${BACKEND_URL}/api/events/${id}/delete`;
    console.log("Calling DELETE:", backendUrl);

    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers,
    });

    console.log("Backend response status:", response.status);

    // Get the response data
    const responseText = await response.text();
    console.log("Backend response:", responseText);

    // Try to parse as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      // If not JSON, create a success response for 2xx status codes
      if (response.ok) {
        responseData = { success: true, message: "Event deleted successfully" };
      } else {
        return NextResponse.json(
          { error: `Failed to delete event. Status: ${response.status}` },
          { status: response.status }
        );
      }
    }

    // Return the response from the backend
    if (!response.ok) {
      return NextResponse.json(responseData, { status: response.status });
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error("Error in DELETE event API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
