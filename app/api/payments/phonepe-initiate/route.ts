import { NextResponse } from 'next/server';
import { PHONEPE_CONFIG, logPhonePeConfig } from '@/config/phonepe';

export async function POST(request: Request) {
  try {
    console.log("=== SERVER API ROUTE: PHONEPE PAYMENT INITIATION ===");

    // Log and validate configuration
    logPhonePeConfig();

    console.log("Server API route: Starting PhonePe payment initiation request");

    // Environment debugging
    console.log('Environment Variables Debug:', {
      NODE_ENV: process.env.NODE_ENV,
      PHONEPE_ENVIRONMENT: process.env.PHONEPE_ENVIRONMENT,
      NEXT_PUBLIC_PHONEPE_ENVIRONMENT: process.env.NEXT_PUBLIC_PHONEPE_ENVIRONMENT,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL
    });

    // Parse the request body
    const requestBody = await request.json();
    console.log("Server API route: Full request body:", JSON.stringify(requestBody, null, 2));

    const { request: base64Payload, xVerify, transactionId, bookingId } = requestBody;
    console.log(`Server API route: Received transaction ID: ${transactionId}, booking ID: ${bookingId}`);
    console.log(`Server API route: Base64 payload length: ${base64Payload?.length || 0}`);
    console.log(`Server API route: X-Verify: ${xVerify}`);

    // Validate PhonePe configuration first
    if (!PHONEPE_CONFIG.MERCHANT_ID) {
      console.error("Server API route: MERCHANT_ID is missing from configuration");
      return NextResponse.json(
        { success: false, error: "PhonePe configuration error: MERCHANT_ID is missing" },
        { status: 500 }
      );
    }

    if (!PHONEPE_CONFIG.SALT_KEY) {
      console.error("Server API route: SALT_KEY is missing from configuration");
      return NextResponse.json(
        { success: false, error: "PhonePe configuration error: SALT_KEY is missing" },
        { status: 500 }
      );
    }

    if (!PHONEPE_CONFIG.SALT_INDEX) {
      console.error("Server API route: SALT_INDEX is missing from configuration");
      return NextResponse.json(
        { success: false, error: "PhonePe configuration error: SALT_INDEX is missing" },
        { status: 500 }
      );
    }

    // Validate required fields
    if (!base64Payload) {
      console.error("Server API route: Missing base64Payload");
      return NextResponse.json(
        { success: false, error: "Missing base64Payload" },
        { status: 400 }
      );
    }

    if (!xVerify) {
      console.error("Server API route: Missing xVerify");
      return NextResponse.json(
        { success: false, error: "Missing xVerify" },
        { status: 400 }
      );
    }

    // Use the API endpoints from the configuration
    const apiUrl = PHONEPE_CONFIG.API_ENDPOINTS.INITIATE;

    console.log(`Server API route: Using ${PHONEPE_CONFIG.ENVIRONMENT} environment`);
    console.log("Server API route: Calling PhonePe API URL:", apiUrl);

    // Call the PhonePe API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    console.log(`Server API route: PhonePe payment initiation response status: ${response.status}`);

    // Get the response data
    const responseText = await response.text();
    console.log(`Server API route: Raw response: ${responseText}`);

    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);
      console.log("Server API route: PhonePe payment initiation response:", responseData);

      // Check if the response indicates an error
      if (!responseData.success && responseData.message) {
        console.error("PhonePe API Error:", responseData.message);
        return NextResponse.json(
          {
            success: false,
            error: responseData.message,
            code: responseData.code
          },
          { status: 400 }
        );
      }

      // Store the transaction details in your database here
      // This is important for reconciliation and callback handling
      // Example: await storeTransactionDetails(transactionId, bookingId, responseData);

      return NextResponse.json(responseData, { status: 200 });
    } catch (parseError) {
      console.error("Server API route: Error parsing response:", parseError);
      console.error("Raw response text:", responseText);

      // If parsing fails but we got a 200 status, consider it a success
      if (response.status >= 200 && response.status < 300) {
        return NextResponse.json({ success: true }, { status: 200 });
      }
      // Otherwise, return the error
      return NextResponse.json(
        {
          error: "Failed to parse PhonePe API response",
          rawResponse: responseText.substring(0, 500) // Limit the size of the raw response
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Server API route: Error initiating PhonePe payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate PhonePe payment" },
      { status: 500 }
    );
  }
}
