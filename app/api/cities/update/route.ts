import { NextResponse } from 'next/server';
import { CITY_API } from '@/config/api';

export async function POST(request: Request) {
  try {

    // Parse the request body
    const cityData = await request.json();

    // Validate required fields
    if (!cityData.id || !cityData.city_name || !cityData.state) {
      return NextResponse.json(
        { error: "City ID, name, and state are required" },
        { status: 400 }
      );
    }

    // Ensure ID is a number
    if (isNaN(Number(cityData.id)) || Number(cityData.id) <= 0) {
      return NextResponse.json(
        { error: "Invalid city ID. ID must be a positive number." },
        { status: 400 }
      );
    }

    // Normalize the data
    const normalizedData = {
      ...cityData,
      id: Number(cityData.id),
      is_active: Boolean(cityData.is_active)
    };

    // Forward the request to the external API
    const apiUrl = CITY_API.UPDATE;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(normalizedData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server API route: Error response:", errorText);
      
      let errorMessage = `Error updating city: ${response.status}`;
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

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Server API route: Error updating city:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update city" },
      { status: 500 }
    );
  }
}
