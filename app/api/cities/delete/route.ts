import { NextResponse } from 'next/server';
import { CITY_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    console.log("Server API route: Deleting city...");

    // Parse the request body
    const { id } = await request.json();
    console.log("Server API route: City ID received:", id);

    // Validate the ID
    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      return NextResponse.json(
        { error: "Invalid city ID. ID must be a positive number." },
        { status: 400 }
      );
    }

    const cityId = Number(id);

    // Forward the request to the external API
    const apiUrl = CITY_API.DELETE;
    console.log("Server API route: Calling API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: cityId }),
    });

    console.log(`Server API route: Delete city response status: ${response.status}`);

    if (!response.ok) {
      // Try fallback with POST method if DELETE fails
      console.log("Server API route: DELETE failed, trying POST fallback...");
      
      const fallbackResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: cityId }),
      });

      if (!fallbackResponse.ok) {
        const errorText = await fallbackResponse.text();
        console.error("Server API route: Error response:", errorText);
        
        let errorMessage = `Error deleting city: ${fallbackResponse.status}`;
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
          { status: fallbackResponse.status }
        );
      }

      const fallbackData = await fallbackResponse.json();
      console.log("Server API route: Delete city fallback response data:", fallbackData);
      return NextResponse.json({ success: true });
    }

    const data = await response.json();
    console.log("Server API route: Delete city response data:", data);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Server API route: Error deleting city:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete city" },
      { status: 500 }
    );
  }
}
