import { NextResponse } from 'next/server';

// Use environment variable for API base URL or fallback to production
const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3004";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    // Validate userId
    if (!userId || isNaN(Number(userId))) {
      return NextResponse.json(
        { error: "User ID is required and must be a valid number" },
        { status: 400 }
      );
    }

    // Call the external API
    const apiUrl = `${API_BASE_URL}/api/bookings/user/${userId}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (response.status === 404) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server API route: API error response: ${errorText}`);
      return NextResponse.json(
        { error: `API returned error status: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server API route: Error in user profile endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
