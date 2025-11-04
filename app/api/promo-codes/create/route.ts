import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log("Server API route: Starting promo code creation request");

    // Parse the request body
    const requestData = await request.json();
    console.log("Server API route: Received request body:", JSON.stringify(requestData, null, 2));

    // Validate required fields
    const requiredFields = ['promo_code', 'type', 'value', 'valid_from', 'valid_to', 'usage_limit', 'minimum_purchase_amount'];
    const missingFields = requiredFields.filter(field => !requestData[field]);

    if (missingFields.length > 0) {
      console.error("Server API route: Missing required fields:", missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate date formats
    try {
      new Date(requestData.valid_from).toISOString();
      new Date(requestData.valid_to).toISOString();
    } catch (dateError) {
      console.error("Server API route: Invalid date format:", dateError);
      return NextResponse.json(
        { error: "Invalid date format. Please use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)" },
        { status: 400 }
      );
    }

    // Prepare the payload for the external API
    // Try without ID field first (most creation APIs don't require pre-existing ID)
    const payload = {
      promo_code: requestData.promo_code,
      type: requestData.type,
      value: requestData.value,
      valid_from: requestData.valid_from,
      valid_to: requestData.valid_to,
      usage_limit: requestData.usage_limit,
      minimum_purchase_amount: requestData.minimum_purchase_amount,
      maximum_discount_amount: requestData.maximum_discount_amount || null,
      description: requestData.description || "",
      events: requestData.events || [],
      scope: requestData.scope || "all", // Include the scope field with a default value of "all"
      is_active: requestData.is_active !== undefined ? requestData.is_active : true // Include is_active with default value of true
    };

    console.log("Server API route: Prepared payload:", JSON.stringify(payload, null, 2));

    // Validate payload structure
    if (!payload.events || payload.events.length === 0) {
      console.warn("Server API route: No events provided in payload");
    } else {
      payload.events.forEach((event: any, index: number) => {
        console.log(`Server API route: Event ${index + 1}: ID=${event.id}, Games=[${event.games_id.join(', ')}]`);
      });
    }

    // Call the external API
    const apiUrl = "https://ai.nibog.in/webhook/v1/nibog/promocode/create";
    console.log("Server API route: Calling API URL:", apiUrl);
    console.log("Server API route: Payload being sent:", JSON.stringify(payload, null, 2));

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log(`Server API route: Promo code creation response status: ${response.status}`);

    // Get the response data
    const responseText = await response.text();
    console.log(`Server API route: Raw response: ${responseText}`);
    console.log(`Server API route: Response headers:`, Object.fromEntries(response.headers.entries()));
    console.log(`Server API route: Response content-type:`, response.headers.get('content-type'));

    // Try to parse the response as JSON first
    let responseData = null;
    let isValidJson = false;

    try {
      responseData = JSON.parse(responseText);
      isValidJson = true;
      console.log("Server API route: Parsed response data:", responseData);
    } catch (parseError: any) {
      console.log("Server API route: Response is not valid JSON:", parseError.message);
      responseData = { raw_response: responseText };
    }

    // Check if the response indicates success regardless of HTTP status
    // Some APIs return success data even with non-200 status codes
    const isSuccessfulCreation = (
      // Check for common success indicators in the response
      (isValidJson && responseData && (
        responseData.success === true ||
        responseData.status === 'success' ||
        responseData.message?.toLowerCase().includes('success') ||
        responseData.id || // If an ID is returned, it's likely successful
        responseData.promo_code // If promo_code is returned, it's likely successful
      )) ||
      // If response text contains success indicators
      responseText.toLowerCase().includes('success') ||
      responseText.toLowerCase().includes('created') ||
      // If it's a 2xx status code
      (response.status >= 200 && response.status < 300)
    );

    if (isSuccessfulCreation) {
      console.log("Server API route: Treating as successful creation");
      return NextResponse.json({
        success: true,
        message: "Promo code created successfully",
        data: responseData
      }, { status: 200 });
    }

    // If we reach here, it's likely an error, but let's verify if the promo code was actually created
    console.error(`Server API route: Error response - Status: ${response.status}, Body: ${responseText}`);
    console.log("Server API route: Attempting to verify if promo code was created despite error response...");

    // Try to verify if the promo code was actually created by checking if it exists
    try {
      // Wait a moment for the database to be updated
      await new Promise(resolve => setTimeout(resolve, 1000));

      const verifyUrl = "https://ai.nibog.in/webhook/v1/nibog/promocode/get-by-code";
      const verifyResponse = await fetch(verifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ promo_code: payload.promo_code }),
      });

      console.log(`Server API route: Verification response status: ${verifyResponse.status}`);

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        console.log("Server API route: Verification response data:", verifyData);

        if (verifyData && verifyData.length > 0) {
          console.log("Server API route: Verification successful - promo code was created despite error response");
          return NextResponse.json({
            success: true,
            message: "Promo code created successfully (verified)",
            data: verifyData[0]
          }, { status: 200 });
        } else {
          console.log("Server API route: Verification returned empty result - promo code not found");
        }
      } else {
        const verifyErrorText = await verifyResponse.text();
        console.log("Server API route: Verification failed with status:", verifyResponse.status, "Response:", verifyErrorText);
      }
    } catch (verifyError) {
      console.log("Server API route: Verification failed with exception:", verifyError);
    }

    // Extract error message from response if possible
    let errorMessage = `API returned error status: ${response.status}`;
    if (isValidJson && responseData) {
      if (responseData.error) {
        errorMessage = responseData.error;
      } else if (responseData.message) {
        errorMessage = responseData.message;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: responseText,
        status_code: response.status
      },
      { status: response.status >= 400 ? response.status : 500 }
    );

  } catch (error: any) {
    console.error("Server API route: Error creating promo code:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to create promo code",
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
