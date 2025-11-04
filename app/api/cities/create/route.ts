import { NextResponse } from 'next/server';
import { CITY_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    console.log("Server API route: Creating city...");

    // Parse the request body
    const cityData = await request.json();
    console.log("Server API route: City data received:", cityData);

    // Validate required fields
    if (!cityData.city_name || !cityData.state) {
      return NextResponse.json(
        { error: "City name and state are required" },
        { status: 400 }
      );
    }

    // Forward the request to the external API
    const apiUrl = CITY_API.CREATE;
    console.log("Server API route: Calling API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cityData),
    });

    console.log(`Server API route: Create city response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server API route: Error response:", errorText);
      
      let errorMessage = `Error creating city: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If we can't parse the error as JSON, use the status code
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Server API route: Create city response data:", data);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Server API route: Error creating city:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create city" },
      { status: 500 }
    );
  }
}
