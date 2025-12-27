import { NextResponse } from 'next/server';
import { PHONEPE_CONFIG, generateSHA256Hash, logPhonePeConfig } from '@/config/phonepe';
import { validateGameData, formatGamesForAPI, createFallbackGame } from '@/utils/gameIdValidation';
import { generateConsistentBookingRef } from '@/utils/bookingReference';

// Use environment variable for API base URL from .env file
const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3004";
const BOOKING_CREATE_API = `${API_BASE_URL}/api/bookings`;

/**
 * Generates a SINGLE booking reference ID in PPT format that should be used CONSISTENTLY
 * throughout the entire system without any reformatting or conversion
 */
function generateDefinitiveBookingRef(transactionId: string): string {
  // Use the transaction ID as the base for the booking reference
  // This ensures the same reference is used throughout the system
  const cleanTxnId = transactionId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  // If the transaction ID is too short, pad it with random characters
  let reference = cleanTxnId;
  if (cleanTxnId.length < 12) {
    const randomSuffix = Math.random().toString(36).substring(2, 12 - cleanTxnId.length + 2);
    reference = cleanTxnId + randomSuffix.toUpperCase();
  }
  
  // Ensure the reference is exactly 12 characters long
  reference = reference.substring(0, 12);
  
  // removed debug log
  return reference;
}

/**
 * Maps user-provided gender values to database-allowed values
 * Database constraint requires specific values like 'Male', 'Female', 'Other'
 */
function mapGenderToAllowedValue(gender?: string): string {
  if (!gender) return 'Other';
  
  // Debug the incoming gender value
  // removed debug log
  
  // Normalize the gender value by converting to lowercase
  const normalizedGender = gender.toLowerCase().trim();
  
  // Map to allowed database values (likely case-sensitive in the DB)
  let mappedGender: string;
  
  switch (normalizedGender) {
    case 'male':
    case 'm':
      mappedGender = 'Male';
      break;
    case 'female':
    case 'f':
      mappedGender = 'Female'; 
      break;
    case 'non-binary':
    case 'nonbinary':
    case 'non binary':
      mappedGender = 'Non-Binary';
      break;
    default:
      // For any other value, default to 'Other' which is likely a safe value in the DB
      mappedGender = 'Other';
  }
  
  // removed debug log
  return mappedGender;
}

export async function POST(request: Request) {
  try {
    // removed debug log

    // Log and validate configuration
    logPhonePeConfig();

    // Parse the request body
    const { transactionId, bookingData } = await request.json();
    
    // Validate transaction ID format
    if (!transactionId || typeof transactionId !== 'string') {
      console.error('Invalid transaction ID provided');
      return NextResponse.json({
        error: 'Invalid transaction ID',
        success: false
      }, { status: 400 });
    }

    // Prevent duplicate processing - check if already processed recently (within 1 minute)
    const processingKey = `processing_${transactionId}`;
    if (typeof window === 'undefined' && global) {
      // Server-side duplicate check
      const recentlyProcessed = (global as any)[processingKey];
      if (recentlyProcessed && Date.now() - recentlyProcessed < 60000) {
        console.warn(`Duplicate payment check request for ${transactionId} within 1 minute`);
        return NextResponse.json({
          error: 'Request is being processed',
          success: false,
          message: 'Please wait for the previous request to complete'
        }, { status: 429 });
      }
      (global as any)[processingKey] = Date.now();
    }

    // removed debug log
    // removed debug log

    // Use the API endpoints from the configuration
    const apiUrl = `${PHONEPE_CONFIG.API_ENDPOINTS.STATUS}/${PHONEPE_CONFIG.MERCHANT_ID}/${transactionId}`;

    // removed debug log
    // removed debug log

    // Generate the X-VERIFY header
    const dataToHash = `/pg/v1/status/${PHONEPE_CONFIG.MERCHANT_ID}/${transactionId}` + PHONEPE_CONFIG.SALT_KEY;
    const xVerify = await generateSHA256Hash(dataToHash) + '###' + PHONEPE_CONFIG.SALT_INDEX;

    // Call the PhonePe API
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        "X-MERCHANT-ID": PHONEPE_CONFIG.MERCHANT_ID,
      },
    });

    // removed debug log

    // Get the response data
    const responseText = await response.text();
    // removed debug log

    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);
      // removed debug log

      // Update the transaction status in your database here
      // Example: await updateTransactionStatus(transactionId, responseData.data.paymentState);

      // If payment was successful, create booking and payment records
      // In test environment, we need to be more lenient with status codes
      // PhonePe sandbox might return different codes than production
      const isSuccess = responseData.success && (
        responseData.code === 'PAYMENT_SUCCESS' || 
        (responseData.data && responseData.data.state === 'COMPLETED') ||
        (responseData.data && responseData.data.paymentState === 'COMPLETED') ||
        // For sandbox testing, also consider these as success
        (PHONEPE_CONFIG.IS_TEST_MODE && (
          responseData.code === 'PAYMENT_PENDING' || // Sometimes test UI returns this despite selecting success
          responseData.code?.includes('SUCCESS')
        ))
      );
      
      // removed debug log
      // removed debug log
      // removed debug log
      
      // Only create booking if payment is truly successful
      // This prevents booking creation for failed/pending payments
      if (isSuccess) {
        // removed debug log

        try {
          // Extract transaction info
          const transactionId = responseData.data.transactionId;
          const merchantTransactionId = responseData.data.merchantTransactionId;
          const amount = responseData.data.amount;
          const paymentState = responseData.data.state;

          // removed debug log

          // Check if booking already exists for this transaction ID to prevent duplicates
          const bookingRef = generateConsistentBookingRef(transactionId);
          // removed debug log

          try {
            // Check for existing booking using the backend API
            const existingBookingResponse = await fetch(`${API_BASE_URL}/api/bookings/check?booking_ref=${bookingRef}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            });

            if (existingBookingResponse.ok) {
              const existingBooking = await existingBookingResponse.json();
              if (existingBooking && existingBooking.booking_id) {
                // removed debug log
                return NextResponse.json({
                  ...responseData,
                  bookingCreated: true,
                  bookingId: existingBooking.booking_id,
                  paymentCreated: true,
                  bookingData: {
                    booking_ref: bookingRef
                  },
                  message: "Booking already exists for this transaction"
                }, { status: 200 });
              }
            }
          } catch (error) {
            // removed debug log
          }

          // removed debug log

          // Extract user ID from transaction ID if it follows our new format: NIBOG_<userId>_<timestamp>
          const bookingMatch = merchantTransactionId.match(/NIBOG_(\d+)_/);
          const userId = bookingMatch ? parseInt(bookingMatch[1]) : null;

          if (!userId) {
            console.error('Server API route: Could not extract user ID from transaction ID');
            return NextResponse.json({
              ...responseData,
              message: "Payment successful. The client-side will handle booking creation.",
              bookingCreated: false
            }, { status: 200 });
          }

          // removed debug log

          // Get current date for booking date
          const currentDate = new Date();
          const formattedDate = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
          
          // NEW BOOKING API STRUCTURE - follows the updated API documentation
          // booking_games is now nested inside each child object
          let newBookingData: {
            parent_name: string;
            email: string;
            phone: string;
            event_id: number;
            booking_ref: string;
            status: string;
            total_amount: number;
            children: Array<{
              full_name: string;
              date_of_birth: string;
              gender: string;
              school_name: string;
              booking_games: Array<{
                game_id: number;
                slot_id: number;
                game_price: number;
              }>;
            }>;
            payment: {
              transaction_id: string;
              amount: number;
              payment_method: string;
              payment_status: string;
            };
          };
          
          if (bookingData) {
            // removed debug log
            // removed debug log
            // removed debug log
            // removed debug log
            // removed debug log
            // removed debug log
            // removed debug log
            // removed debug log

            // Prepare booking games array - supporting multiple games for the child
            const gameIds = Array.isArray(bookingData.gameId) ? bookingData.gameId : [bookingData.gameId];
            const slotIds = Array.isArray(bookingData.slotId) ? bookingData.slotId : [bookingData.slotId];
            const gamePrices = Array.isArray(bookingData.gamePrice) ? bookingData.gamePrice : [bookingData.gamePrice];

            // Create booking_games array for this child (no child_id needed - API handles it)
            const bookingGamesForChild = gameIds.map((gameId: number, index: number) => ({
              game_id: gameId,
              slot_id: slotIds[index] || slotIds[0],
              game_price: gamePrices[index] || gamePrices[0] || 0
            }));

            // removed debug log
            // removed debug log
            // removed debug log

            newBookingData = {
              parent_name: bookingData.parentName || "PhonePe Customer",
              email: bookingData.email || `customer-${userId}@example.com`,
              phone: bookingData.phone || "",
              event_id: bookingData.eventId || 1,
              booking_ref: bookingRef,
              status: paymentState === 'COMPLETED' ? 'Paid' : 'Pending',
              total_amount: amount / 100, // Convert from paise to rupees
              children: [
                {
                  full_name: bookingData.childName || `Child ${userId}`,
                  date_of_birth: bookingData.childDob || new Date().toISOString().split('T')[0],
                  gender: mapGenderToAllowedValue(bookingData.gender || ''),
                  school_name: bookingData.schoolName || "Unknown School",
                  booking_games: bookingGamesForChild // Nested inside child object
                }
              ],
              payment: {
                transaction_id: transactionId,
                amount: amount / 100, // Convert from paise to rupees
                payment_method: "PhonePe",
                payment_status: paymentState === 'COMPLETED' ? 'Paid' : 'Pending'
              }
            };
          } else {
            // removed debug log
            // removed debug log

            newBookingData = {
              parent_name: "PhonePe Customer",
              email: `customer-${userId}@example.com`,
              phone: "",
              event_id: 1,
              booking_ref: bookingRef,
              status: paymentState === 'COMPLETED' ? 'Paid' : 'Pending',
              total_amount: amount / 100,
              children: [
                {
                  full_name: `Child ${userId}`,
                  date_of_birth: new Date().toISOString().split('T')[0],
                  gender: "Male",
                  school_name: "Unknown School",
                  booking_games: [
                    {
                      game_id: 1,
                      slot_id: 1,
                      game_price: amount / 100
                    }
                  ]
                }
              ],
              payment: {
                transaction_id: transactionId,
                amount: amount / 100,
                payment_method: "PhonePe",
                payment_status: paymentState === 'COMPLETED' ? 'Paid' : 'Pending'
              }
            };
          }
          
          // Log the booking payload for verification
          console.log('📦 Booking Payload being sent to backend API:');
          console.log(JSON.stringify(newBookingData, null, 2));
          
          // Create booking using NEW API endpoint
          // removed debug log
          const bookingResponse = await fetch(BOOKING_CREATE_API, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newBookingData),
          });
          
          // removed debug log
          
          // Handle booking response
          if (!bookingResponse.ok) {
            const errorText = await bookingResponse.text();
            console.error(`Server API route: Failed to create booking: ${bookingResponse.status}`);
            console.error(`Server API route: Error response:`, errorText);
            return NextResponse.json({
              ...responseData,
              bookingCreated: false,
              error: `Failed to create booking: ${bookingResponse.status}`
            }, { status: 200 });
          }
          
          const bookingResult = await bookingResponse.json();
          // removed debug log

          // Extract booking ID from the new API response
          const bookingId = bookingResult.booking_id;

          if (!bookingId) {
            console.error('Server API route: No booking ID returned from API response');
            console.error('Server API route: Full response structure:', JSON.stringify(bookingResult, null, 2));
            return NextResponse.json({
              ...responseData,
              bookingCreated: false,
              error: 'No booking ID returned from API response'
            }, { status: 200 });
          }
          
          // removed debug log
          
          // The new API creates payment record automatically, so we don't need a separate payment API call
          const paymentId = bookingResult.payment_id;

          // Email and WhatsApp notifications removed as per user requirement
          // Only payment verification and booking creation are performed

          // removed debug log

          return NextResponse.json({
            ...responseData,
            bookingCreated: true,
            bookingId,
            paymentId: paymentId, // New API returns payment_id
            paymentCreated: true,
            bookingData: {
              booking_ref: bookingRef
            }
          }, { status: 200 });
          
        } catch (error) {
          console.error("Server API route: Error creating booking and payment:", error);
          return NextResponse.json({
            ...responseData,
            bookingCreated: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 200 });
        }
      }
      
      return NextResponse.json(responseData, { status: 200 });
    } catch (parseError) {
      console.error("Server API route: Error parsing response:", parseError);
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
    console.error("Server API route: Error checking PhonePe payment status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check PhonePe payment status" },
      { status: 500 }
    );
  }
}
