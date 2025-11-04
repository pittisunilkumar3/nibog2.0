import { NextResponse } from 'next/server';
import { PAYMENT_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    console.log("Server API route: Creating new payment");

    // Parse the request body
    const paymentData = await request.json();
    console.log("Server API route: Payment data:", JSON.stringify(paymentData, null, 2));

    // Validate required fields
    if (!paymentData.booking_id || !paymentData.transaction_id || !paymentData.amount) {
      console.log("Server API route: Validation failed. Missing fields:", {
        hasBookingId: !!paymentData.booking_id,
        hasTransactionId: !!paymentData.transaction_id,
        hasAmount: !!paymentData.amount
      });
      return NextResponse.json(
        { error: "Missing required payment data: booking_id, transaction_id, and amount are required" },
        { status: 400 }
      );
    }

    // Forward the request to the external API
    const apiUrl = PAYMENT_API.CREATE;
    console.log("Server API route: Calling API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    console.log(`Server API route: Create payment response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server API route: Error response (${response.status}):`, errorText);
      console.error("Server API route: Request payload was:", JSON.stringify(paymentData, null, 2));
      
      let errorMessage = `Error creating payment: ${response.status} - ${response.statusText}`;
      let errorDetails = errorText;
      
      try {
        const errorData = JSON.parse(errorText);
        console.log("Server API route: Parsed error data:", errorData);
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        errorDetails = errorData;
      } catch (e) {
        console.log("Server API route: Could not parse error as JSON, using raw text");
        errorDetails = errorText;
      }

      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorDetails,
          status: response.status,
          statusText: response.statusText
        },
        { status: response.status }
      );
    }

    // Get the response data
    const responseText = await response.text();
    console.log(`Server API route: Raw response: ${responseText}`);
    
    let data;
    try {
      // Try to parse the response as JSON
      data = JSON.parse(responseText);
      console.log("Server API route: Parsed response data:", data);
    } catch (parseError) {
      console.error("Server API route: Error parsing response:", parseError);
      return NextResponse.json(
        { 
          error: "Failed to parse API response", 
          rawResponse: responseText 
        },
        { status: 500 }
      );
    }
    
    // Return the response with success status
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Server API route: Error creating payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment" },
      { status: 500 }
    );
  }
}
