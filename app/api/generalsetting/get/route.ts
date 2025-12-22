import { NextResponse } from 'next/server';
import { GENERAL_SETTING_API } from '@/config/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log("Server API route: Fetching general settings...");

    // Call the backend API to get general settings
    const apiUrl = GENERAL_SETTING_API.GET;
    console.log("Server API route: Calling backend API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    console.log(`Server API route: Get general settings response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server API route: Error response from backend:", errorText);
      return NextResponse.json(
        { error: `Failed to fetch general settings. Backend returned status: ${response.status}` },
        { status: response.status }
      );
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
