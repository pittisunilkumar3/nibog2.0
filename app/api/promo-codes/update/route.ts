import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // removed debug log

    // Parse the request body
    const requestData = await request.json();
    // removed debug log

    // Validate required fields
    const requiredFields = ['id', 'promo_code', 'type', 'value', 'valid_from', 'valid_to', 'usage_limit', 'minimum_purchase_amount'];
    const missingFields = requiredFields.filter(field => requestData[field] === undefined || requestData[field] === null || requestData[field] === '');

    if (missingFields.length > 0) {
      console.error("Server API route: Missing required fields:", missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Prepare the payload for the external API
    const payload = {
      id: requestData.id,
      promo_code: requestData.promo_code,
      type: requestData.type,
      value: requestData.value,
      valid_from: requestData.valid_from,
      valid_to: requestData.valid_to,
      usage_limit: requestData.usage_limit,
      usage_count: requestData.usage_count || 0,
      minimum_purchase_amount: requestData.minimum_purchase_amount,
      maximum_discount_amount: requestData.maximum_discount_amount || null,
      description: requestData.description || "",
      events: requestData.events || [],
      scope: requestData.scope || "all", // Include the scope field with a default value of "all"
      is_active: requestData.is_active !== undefined ? requestData.is_active : true // Include is_active with default value of true
    };

    // removed debug log

    // Call the external API
    const apiUrl = "https://ai.nibog.in/webhook/v1/nibog/promocode/update";
    // removed debug log

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // removed debug log

    let responseText;
    try {
      responseText = await response.text();
      // removed debug log
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
      // removed debug log
    } catch (parseError) {
      console.error("Server API route: Error parsing JSON response:", parseError);
      // removed debug log
      
      // If parsing fails but status is OK, assume success
      if (response.ok) {
        return NextResponse.json({
          success: true,
          message: "Promo code updated successfully",
          data: null
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
      // The API returns an array with the updated promo code
      if (Array.isArray(data) && data.length > 0) {
        // removed debug log
        return NextResponse.json({
          success: true,
          message: "Promo code updated successfully",
          data: data[0]
        });
      } else if (!Array.isArray(data)) {
        // removed debug log
        return NextResponse.json({
          success: true,
          message: "Promo code updated successfully",
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
          error: data?.message || data?.error || "Failed to update promo code",
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
