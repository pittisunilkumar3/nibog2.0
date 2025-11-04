import { NextResponse } from 'next/server';
import { BABY_GAME_API } from '@/config/api';

// Simple in-memory cache to prevent excessive API calls
let cachedData: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

export async function GET() {
  try {
    // Check if we have cached data that's still valid
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json(cachedData, { status: 200 });
    }

    // Forward the request to the external API with the correct URL
    const apiUrl = BABY_GAME_API.GET_ALL;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      // If the first attempt fails, try with the webhook-test URL
      
      const alternativeUrl = apiUrl.replace("webhook/v1", "webhook-test/v1");
      
      const alternativeResponse = await fetch(alternativeUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      
      if (!alternativeResponse.ok) {
        const errorText = await alternativeResponse.text();
        return NextResponse.json(
          { error: `API returned error status: ${alternativeResponse.status}` },
          { status: alternativeResponse.status }
        );
      }
      
      // Get the response data from successful alternative attempt
      const responseText = await alternativeResponse.text();
      
      try {
        const responseData = JSON.parse(responseText);

        // Cache the successful response
        cachedData = responseData;
        cacheTimestamp = Date.now();
        return NextResponse.json(responseData, { status: 200 });
      } catch (parseError) {
        return NextResponse.json(
          { 
            error: "Failed to parse API response", 
            rawResponse: responseText.substring(0, 500) // Limit the size of the raw response
          },
          { status: 500 }
        );
      }
    }

    // Get the response data
    const responseText = await response.text();
    
    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);


      // Cache the successful response
      cachedData = responseData;
      cacheTimestamp = Date.now();

      return NextResponse.json(responseData, { status: 200 });
    } catch (parseError) {
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
    return NextResponse.json(
      { error: error.message || "Failed to fetch baby games" },
      { status: 500 }
    );
  }
}
