import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // removed debug log
    
    // Parse the request body to get transaction ID
    const { transaction_id } = await request.json();
    // removed debug log

    if (!transaction_id) {
      console.error('❌ Missing transaction_id in request body');
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // Retrieve from database via external API
    // removed debug log
    // removed debug log

    try {
      const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/pending-bookings/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_id: transaction_id
        }),
        // Increase timeout for network issues
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      // removed debug log

      if (!response.ok) {
        if (response.status === 404) {
          // removed debug log
          // Don't clean up in case of 404, it might be a valid state
          return NextResponse.json(
            { error: "Pending booking not found", status: response.status, transaction_id },
            { status: 404 }
          );
        }
        
        try {
          // Try to get detailed error information
          const errorData = await response.text();
          console.error(`❌ Failed to retrieve pending booking: Status ${response.status}`);
          console.error(`❌ Error details:`, errorData);
          
          // Instead of cleaning up and returning error, we'll return what we know
          // so the client can use fallback mechanisms
          return NextResponse.json(
            { 
              error: `Failed to retrieve pending booking: ${response.status}`,
              status: response.status,
              transaction_id,
              errorDetails: errorData
            },
            { status: response.status }
          );
        } catch (respError) {
          console.error('❌ Failed to parse error response:', respError);
          return NextResponse.json(
            { 
              error: `Failed to retrieve pending booking: ${response.status}`,
              status: response.status,
              transaction_id
            },
            { status: response.status }
          );
        }
      }

      // Parse the response body
      let result;
      try {
        result = await response.json();
        // removed debug log
        // removed debug log
        // removed debug log
        // removed debug log
      } catch (jsonError) {
        console.error('❌ Failed to parse JSON response:', jsonError);
        const rawText = await response.text();
        console.error('❌ Raw response text:', rawText.substring(0, 500)); // First 500 chars
        
        return NextResponse.json(
          { 
            error: "Invalid JSON response from pending booking API",
            transaction_id,
            rawResponse: rawText.substring(0, 1000) // First 1000 chars
          },
          { status: 500 }
        );
      }

      // Check if the booking has expired
      if (result.expires_at) {
        const expiresAt = new Date(result.expires_at);
        const now = new Date();
        
        if (now > expiresAt) {
          // removed debug log
          return NextResponse.json(
            { error: "Pending booking has expired", transaction_id, expiresAt: result.expires_at },
            { status: 410 } // Gone
          );
        }
      } else {
        console.warn(`⚠️ Missing expires_at field for transaction: ${transaction_id}`);
      }

      // Parse the booking data
      let bookingData;
      try {
        // Check if booking_data is null, undefined, or the string "undefined"
        if (!result.booking_data || result.booking_data === 'undefined' || result.booking_data === 'null') {
          console.error('❌ Booking data is null, undefined, or invalid:', result.booking_data);

          // Return partial data instead of cleaning up immediately
          return NextResponse.json(
            { 
              error: "Booking data is missing or corrupted",
              transaction_id,
              partialData: result,
              needsCleanup: true
            },
            { status: 207 } // Partial Content status
          );
        }

        // If booking_data is already an object, don't parse it
        if (typeof result.booking_data === 'object' && result.booking_data !== null) {
          bookingData = result.booking_data;
        } else {
          bookingData = JSON.parse(result.booking_data);
        }
        
        // Validate booking data has required fields
        if (!bookingData.userId || !bookingData.email || !bookingData.eventId) {
          console.warn('⚠️ Booking data missing required fields:', 
            JSON.stringify({
              hasUserId: !!bookingData.userId,
              hasEmail: !!bookingData.email,
              hasEventId: !!bookingData.eventId
            })
          );
        }
      } catch (parseError) {
        console.error('❌ Failed to parse booking data:', parseError);
        console.error('❌ Raw booking_data value:', 
          typeof result.booking_data === 'string' 
            ? result.booking_data.substring(0, 200) + '...' 
            : result.booking_data
        );

        // Return partial data for fallback processing
        return NextResponse.json(
          { 
            error: "Invalid booking data format", 
            transaction_id,
            rawBookingData: typeof result.booking_data === 'string' 
              ? result.booking_data.substring(0, 1000)  // First 1000 chars
              : null,
            needsCleanup: true
          },
          { status: 207 } // Partial Content status
        );
      }

      // removed debug log

      // Track DOB specifically in retrieval
      // removed debug log
      // removed debug log
      // removed debug log

      // Return success with complete booking data
      return NextResponse.json({
        success: true,
        transactionId: result.transaction_id,
        bookingData,
        expiresAt: result.expires_at,
        status: result.status
      });

    } catch (fetchError: any) {
      // Network errors, timeouts, etc.
      console.error(`❌ Network error when retrieving pending booking:`, fetchError);
      console.error(`❌ Error details:`, fetchError.message);
      
      return NextResponse.json(
        { 
          error: `Network error: ${fetchError.message}`, 
          transaction_id,
          networkError: true
        },
        { status: 503 } // Service Unavailable
      );
    }

  } catch (error: any) {
    // Unhandled errors
    console.error("❌ Unhandled error in pending booking retrieval:", error);
    console.error("❌ Error stack:", error.stack);
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to retrieve pending booking",
        errorType: error.name,
        transaction_id: request.body ? JSON.stringify(request.body).substring(0, 100) : 'unknown'
      },
      { status: 500 }
    );
  }
}
