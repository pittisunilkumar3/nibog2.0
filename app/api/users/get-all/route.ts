import { NextResponse } from 'next/server';
import { USER_API } from '@/config/api';

// Simple in-memory cache to prevent excessive API calls
let cachedData: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

export async function GET() {
  try {
    console.log("Server API route: Fetching all users...");

    // Check if we have cached data that's still valid
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log("Server API route: Returning cached users data");
      return NextResponse.json(cachedData, { status: 200 });
    }

    // Forward the request to the external API with the correct URL
    const apiUrl = USER_API.GET_ALL;
    console.log("Server API route: Calling API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    console.log(`Server API route: Get all users response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server API route: Error response: ${errorText}`);
      return NextResponse.json(
        { error: `API returned error status: ${response.status}` },
        { status: response.status }
      );
    }

    // Get the response data
    const responseText = await response.text();
    console.log(`Server API route: Raw response: ${responseText}`);

    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);
      console.log(`Server API route: Retrieved ${Array.isArray(responseData) ? responseData.length : 'non-array'} users`);

      // Cache the successful response
      cachedData = responseData;
      cacheTimestamp = Date.now();
      console.log("Server API route: Cached users data");

      return NextResponse.json(responseData, { status: 200 });
    } catch (parseError) {
      console.error("Server API route: Error parsing response:", parseError);
      // If parsing fails, return the error
      return NextResponse.json(
        {
          error: "Failed to parse API response",
          rawResponse: responseText.substring(0, 500) // Limit the size of the raw response
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Server API route: Error fetching users:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}
