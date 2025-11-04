import { NextResponse } from 'next/server';
import { VENUE_API } from '@/config/api';

export async function GET() {
  try {
    console.log("Server API route: Fetching all venues with city details");

    // According to the API documentation, this endpoint requires POST with city_id
    // Since we want all venues, we'll try without city_id first, then with a default city_id
    const apiUrl = VENUE_API.GET_ALL_WITH_CITY;
    console.log("Server API route: Calling API URL:", apiUrl);

    // Try POST method as specified in the API documentation
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}), // Try empty body first
      cache: "no-store",
    });

    console.log(`External API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`External API error: ${errorText}`);

      // Try alternative approach - use the regular get-all endpoint
      console.log("Server API route: POST failed, trying GET /venues/get-all as fallback...");

      try {
        const fallbackResponse = await fetch(VENUE_API.GET_ALL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          console.log(`Server API route: Fallback successful, retrieved ${Array.isArray(fallbackData) ? fallbackData.length : 'unknown'} venues`);

          // Return the venues without city details as fallback
          return NextResponse.json(fallbackData, { status: 200 });
        }
      } catch (fallbackError) {
        console.error("Server API route: Fallback also failed:", fallbackError);
      }

      let errorMessage = `Error fetching venues with city: ${response.status}`;
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
    console.log(`Server API route: Retrieved ${Array.isArray(data) ? data.length : 'unknown'} venues with city details`);

    // Validate the data structure
    if (!Array.isArray(data)) {
      console.warn("API did not return an array for venues with city:", data);
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Server API route: Error fetching venues with city:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch venues with city" },
      { status: 500 }
    );
  }
}
