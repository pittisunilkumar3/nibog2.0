import { NextResponse } from 'next/server';
import { GENERAL_SETTING_API } from '@/config/api';

export async function GET() {
  try {
    console.log("Server API route: Fetching general settings...");

    // Forward the request to the external API with the correct URL
    const apiUrl = GENERAL_SETTING_API.GET;
    console.log("Server API route: Calling API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    console.log(`Server API route: Get general settings response status: ${response.status}`);

    if (!response.ok) {
      // If the first attempt fails, try with a different URL format
      console.log("Server API route: First attempt failed, trying with alternative URL format");

      // Try with webhook instead of webhook-test
      const alternativeUrl = apiUrl.replace("webhook-test/v1", "webhook/v1");
      console.log("Server API route: Trying alternative URL:", alternativeUrl);

      const alternativeResponse = await fetch(alternativeUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      console.log(`Server API route: Alternative get general settings response status: ${alternativeResponse.status}`);

      if (!alternativeResponse.ok) {
        const errorText = await alternativeResponse.text();
        console.error("Server API route: Error response from alternative URL:", errorText);
        return NextResponse.json(
          { error: `Failed to fetch general settings. API returned status: ${alternativeResponse.status}` },
          { status: alternativeResponse.status }
        );
      }

      // Get the response data from the alternative URL
      const responseText = await alternativeResponse.text();
      console.log(`Server API route: Raw response from alternative URL: ${responseText}`);
      
      try {
        // Try to parse the response as JSON
        const responseData = JSON.parse(responseText);
        console.log("Server API route: Retrieved general settings:", responseData);
        
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
    console.log(`Server API route: Raw response: ${responseText}`);
    
    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);
      console.log("Server API route: Retrieved general settings:", responseData);
      
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
    console.error("Server API route: Error fetching general settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch general settings" },
      { status: 500 }
    );
  }
}
