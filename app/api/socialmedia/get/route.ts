import { NextResponse } from 'next/server';
import { SOCIAL_MEDIA_API } from '@/config/api';

// Configure route segment to allow dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {

    // Forward the request to the external API with the correct URL
    const apiUrl = SOCIAL_MEDIA_API.GET;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      // If the first attempt fails, try with a different URL format

      // Try with webhook-test instead of webhook
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
        console.error("Server API route: Error response from alternative URL:", errorText);
        return NextResponse.json(
          { error: `Failed to fetch social media. API returned status: ${alternativeResponse.status}` },
          { status: alternativeResponse.status }
        );
      }

      // Get the response data from the alternative URL
      const responseText = await alternativeResponse.text();
      
      try {
        // Try to parse the response as JSON
        const responseData = JSON.parse(responseText);
        
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
    }

    // Get the response data
    const responseText = await response.text();
    
    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);
      
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
    console.error("Server API route: Error fetching social media:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch social media" },
      { status: 500 }
    );
  }
}
