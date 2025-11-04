import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log("Server API route: Starting promo code delete request");

    // Parse the request body
    const requestData = await request.json();
    console.log("Server API route: Received request body:", JSON.stringify(requestData, null, 2));

    // Validate required fields
    if (!requestData.id) {
      console.error("Server API route: Missing required field: id");
      return NextResponse.json(
        { error: "Promo code ID is required" },
        { status: 400 }
      );
    }

    // Prepare the payload for the external API
    const payload = {
      id: parseInt(requestData.id)
    };

    console.log("Server API route: Prepared payload:", JSON.stringify(payload, null, 2));

    // Call the external API
    const apiUrl = "https://ai.nibog.in/webhook/v1/nibog/promocode/delete";
    console.log("Server API route: Calling API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log(`Server API route: Delete promo code response status: ${response.status}`);

    let responseText;
    try {
      responseText = await response.text();
      console.log("Server API route: Raw response:", responseText);
    } catch (textError) {
      console.error("Server API route: Error reading response text:", textError);
      return NextResponse.json(
        { error: "Failed to read response from external API" },
        { status: 500 }
      );
    }

    // Try to parse the response as JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log("Server API route: Parsed response:", data);
    } catch (parseError) {
      console.error("Server API route: Error parsing JSON response:", parseError);
      console.log("Server API route: Raw response text:", responseText);
      
      // If parsing fails but status is OK, assume success
      if (response.ok) {
        return NextResponse.json({
          success: true,
          message: "Promo code deleted successfully"
        });
      } else {
        return NextResponse.json(
          { error: "Invalid response format from external API" },
          { status: 500 }
        );
      }
    }

    // Check if the response indicates success
    if (response.ok) {
      // The API returns an array with success object
      if (Array.isArray(data) && data.length > 0 && data[0].success === true) {
        console.log("Server API route: Promo code deleted successfully");
        return NextResponse.json({
          success: true,
          message: "Promo code deleted successfully",
          data: data[0]
        });
      } else if (data.success === true) {
        console.log("Server API route: Promo code deleted successfully");
        return NextResponse.json({
          success: true,
          message: "Promo code deleted successfully",
          data: data
        });
      } else {
        console.error("Server API route: Unexpected response format:", data);
        return NextResponse.json(
          { error: "Unexpected response format from external API" },
          { status: 500 }
        );
      }
    } else {
      console.error("Server API route: External API returned error:", data);
      return NextResponse.json(
        { 
          error: data?.message || data?.error || "Failed to delete promo code",
          details: data
        },
        { status: response.status }
      );
    }

  } catch (error: any) {
    console.error("Server API route: Unexpected error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
