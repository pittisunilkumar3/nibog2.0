import { NextResponse } from 'next/server';
import { PHONEPE_CONFIG, generateSHA256Hash, logPhonePeConfig } from '@/config/phonepe';
import { validateGameData, formatGamesForAPI, createFallbackGame } from '@/utils/gameIdValidation';
import { generateConsistentBookingRef } from '@/utils/bookingReference';

// Use environment variable for API base URL or fallback to production
const API_BASE_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3004";
const BOOKING_CREATE_API = `${API_BASE_URL}/api/bookings`;
import { sendBookingConfirmationFromServer } from '@/services/emailNotificationService';
import { sendTicketEmail, TicketEmailData } from '@/services/ticketEmailService';
import { getTicketDetails, TicketDetails } from '@/services/bookingService';

// Define interface for game details
interface GameDetail {
  gameName: string;
  gameDescription: string;
  gamePrice: number;
  gameDuration: number;
  gameTime: string;
  slotPrice: number;
  maxParticipants: number;
  customPrice: number;
}

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
  
  console.log(`✅ Generated consistent booking reference: ${reference}`);
  return reference;
}

/**
 * Maps user-provided gender values to database-allowed values
 * Database constraint requires specific values like 'Male', 'Female', 'Other'
 */
function mapGenderToAllowedValue(gender?: string): string {
  if (!gender) return 'Other';
  
  // Debug the incoming gender value
  console.log(`Server API route: Mapping gender value: '${gender}'`);
  
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
  
  console.log(`Server API route: Mapped gender from '${gender}' to '${mappedGender}'`);
  return mappedGender;
}

export async function POST(request: Request) {
  try {
    console.log("Server API route: Starting PhonePe payment status check request");

    // Log and validate configuration
    logPhonePeConfig();

    // Parse the request body
    const { transactionId, bookingData } = await request.json();
    console.log("Server API route: Received booking data:", bookingData ? "Yes" : "No");
    console.log(`Server API route: Checking status for transaction ID: ${transactionId}`);

    // Use the API endpoints from the configuration
    const apiUrl = `${PHONEPE_CONFIG.API_ENDPOINTS.STATUS}/${PHONEPE_CONFIG.MERCHANT_ID}/${transactionId}`;

    console.log(`Server API route: Using ${PHONEPE_CONFIG.ENVIRONMENT} environment`);
    console.log("Server API route: Calling PhonePe API URL:", apiUrl);

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

    console.log(`Server API route: PhonePe payment status response status: ${response.status}`);

    // Get the response data
    const responseText = await response.text();
    console.log(`Server API route: Raw response: ${responseText}`);

    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);
      console.log("Server API route: PhonePe payment status response:", responseData);

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
      
      console.log("Server API route: Payment success check result:", isSuccess);
      console.log("Server API route: Response code:", responseData.code);
      console.log("Server API route: Payment state:", responseData.data?.paymentState || responseData.data?.state);
      
      if (isSuccess) {
        console.log("Server API route: Payment was successful, creating booking and payment records");

        try {
          // Extract transaction info
          const transactionId = responseData.data.transactionId;
          const merchantTransactionId = responseData.data.merchantTransactionId;
          const amount = responseData.data.amount;
          const paymentState = responseData.data.state;

          console.log(`Server API route: Processing payment success for transaction: ${transactionId}`);

          // Check if booking already exists for this transaction ID to prevent duplicates
          const bookingRef = generateConsistentBookingRef(transactionId);
          console.log(`Server API route: ⚠️ IDEMPOTENCY CHECK: Checking for existing booking with reference: ${bookingRef}`);

          try {
            const existingBookingResponse = await fetch('https://ai.nibog.in/webhook/v1/nibog/tickect/booking_ref/details', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                booking_ref_id: bookingRef
              })
            });

            if (existingBookingResponse.ok) {
              const existingBookings = await existingBookingResponse.json();
              if (existingBookings && existingBookings.length > 0) {
                console.log(`Server API route: ✅ IDEMPOTENCY CHECK: Booking already exists for transaction ${transactionId}, returning existing booking`);
                const existingBooking = existingBookings[0];
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
            console.log(`Server API route: ⚠️ IDEMPOTENCY CHECK: Could not check for existing booking, proceeding with creation:`, error);
          }

          console.log(`Server API route: No existing booking found, proceeding with new booking creation`);

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

          console.log(`Server API route: Extracted User ID from transaction: ${userId}`);

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
            console.log("Server API route: Using booking data from client localStorage");
            console.log("=== DEBUGGING BOOKING DATA FIELD MAPPING ===");
            console.log("bookingData.childDob:", bookingData.childDob);
            console.log("bookingData.childName:", bookingData.childName);
            console.log("bookingData.gender:", bookingData.gender);
            console.log("bookingData.schoolName:", bookingData.schoolName);
            console.log("bookingData.gameId:", bookingData.gameId);
            console.log("bookingData.slotId:", bookingData.slotId);
            console.log("bookingData.gamePrice:", bookingData.gamePrice);

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

            console.log("=== PREPARED BOOKING GAMES FOR CHILD ===");
            console.log("Total games:", bookingGamesForChild.length);
            console.log("Booking games array:", JSON.stringify(bookingGamesForChild, null, 2));

            newBookingData = {
              parent_name: bookingData.parentName || "PhonePe Customer",
              email: bookingData.email || `customer-${userId}@example.com`,
              phone: bookingData.phone || "",
              event_id: bookingData.eventId || 1,
              booking_ref: bookingRef,
              status: "Pending",
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
            console.log("Server API route: Using fallback booking data");
            console.log("⚠️ WARNING: Using fallback booking data - actual user data not found!");

            newBookingData = {
              parent_name: "PhonePe Customer",
              email: `customer-${userId}@example.com`,
              phone: "",
              event_id: 1,
              booking_ref: bookingRef,
              status: "Pending",
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
          
          console.log(`Server API route: Creating booking with NEW API structure:`, JSON.stringify(newBookingData, null, 2));
          
          // Create booking using NEW API endpoint
          console.log(`Server API route: Calling NEW booking creation API at: ${BOOKING_CREATE_API}`);
          const bookingResponse = await fetch(BOOKING_CREATE_API, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newBookingData),
          });
          
          console.log(`Server API route: Booking creation response status: ${bookingResponse.status}`);
          
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
          console.log(`Server API route: Booking created successfully:`, bookingResult);

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
          
          console.log(`Server API route: Booking created with ID: ${bookingId}, payment already recorded in new API`);
          
          // The new API creates payment record automatically, so we don't need a separate payment API call
          const paymentId = bookingResult.payment_id;

          // Send booking confirmation email immediately after successful booking and payment creation
          console.log(`📧 STARTING EMAIL PROCESS for booking ID: ${bookingId}`);
          console.log(`📧 Email parameters - bookingId: ${bookingId}, transactionId: ${transactionId}, amount: ${amount / 100}, bookingRef: ${bookingRef}`);
          console.log(`📧 Booking data for email:`, JSON.stringify(bookingData, null, 2));
          console.log(`📧 Available booking data keys:`, Object.keys(bookingData || {}));

          // Send WhatsApp notification immediately after successful booking and payment creation
          console.log(`📱 STARTING WHATSAPP PROCESS for booking ID: ${bookingId}`);
          try {
            if (bookingData && bookingData.phone) {
              console.log(`📱 Sending WhatsApp notification to: ${bookingData.phone}`);

              const whatsappData = {
                bookingId: parseInt(bookingId.toString()),
                bookingRef: bookingRef,
                parentName: bookingData.parentName || 'Valued Customer',
                parentPhone: bookingData.phone,
                childName: bookingData.childName || 'Child',
                eventTitle: bookingData.eventTitle || 'NIBOG Event',
                eventDate: bookingData.eventDate || new Date().toLocaleDateString(),
                eventVenue: bookingData.eventVenue || 'Main Stadium',
                totalAmount: amount / 100,
                paymentMethod: 'PhonePe',
                transactionId: transactionId,
                gameDetails: bookingData.gameDetails || []
              };

              // Import and call WhatsApp service directly
              const { sendBookingConfirmationWhatsApp } = await import('@/services/whatsappService');
              const whatsappResult = await sendBookingConfirmationWhatsApp(whatsappData);

              if (whatsappResult.success) {
                console.log(`📱 WhatsApp notification sent successfully from server! Message ID: ${whatsappResult.messageId}`);
              } else {
                console.error(`📱 Failed to send WhatsApp notification from server: ${whatsappResult.error}`);
              }
            } else {
              console.log(`📱 No phone number available for WhatsApp notification`);
            }
          } catch (whatsappError) {
            console.error(`📱 Error sending WhatsApp notification from server:`, whatsappError);
            // Don't fail the entire process if WhatsApp fails
          }

          try {
            console.log(`📧 Getting email settings...`);

            // Get email settings by calling the API function directly
            const { GET: getEmailSettings } = await import('@/app/api/emailsetting/get/route');
            const emailSettingsResponse = await getEmailSettings();

            if (!emailSettingsResponse.ok) {
              console.error('📧 Failed to get email settings');
              throw new Error('Email settings not configured');
            }

            const emailSettings = await emailSettingsResponse.json();
            if (!emailSettings || emailSettings.length === 0) {
              console.error('📧 No email settings found');
              throw new Error('No email settings found');
            }

            const settings = emailSettings[0];
            console.log('📧 Email settings retrieved successfully');

            // Generate booking confirmation HTML using the existing function
            // Prepare game details from booking data
            console.log(`📧 Preparing game details from booking data...`);
            console.log(`📧 selectedGamesObj:`, bookingData?.selectedGamesObj);
            console.log(`📧 gameId:`, bookingData?.gameId);
            console.log(`📧 gamePrice:`, bookingData?.gamePrice);

            const gameDetails: GameDetail[] = [];
            if (bookingData?.selectedGamesObj && Array.isArray(bookingData.selectedGamesObj)) {
              console.log(`📧 Using selectedGamesObj with ${bookingData.selectedGamesObj.length} games`);
              bookingData.selectedGamesObj.forEach((game: any, index: number) => {
                const gamePrice = bookingData.gamePrice?.[index] || game.slot_price || game.custom_price || 0;
                gameDetails.push({
                  gameName: game.custom_title || game.game_title || `Game ${game.game_id || game.id}`,
                  gameDescription: game.custom_description || game.game_description || '',
                  gamePrice: gamePrice,
                  gameDuration: game.game_duration_minutes || 0,
                  gameTime: game.start_time && game.end_time ? `${game.start_time} - ${game.end_time}` : 'TBD',
                  slotPrice: game.slot_price || 0,
                  maxParticipants: game.max_participants || 0,
                  customPrice: game.custom_price || 0
                });
              });
            } else if (bookingData?.gameId && bookingData?.gamePrice) {
              console.log(`📧 Using fallback gameId/gamePrice data`);
              // Fallback for simple game data
              const gameIds = Array.isArray(bookingData.gameId) ? bookingData.gameId : [bookingData.gameId];
              const gamePrices = Array.isArray(bookingData.gamePrice) ? bookingData.gamePrice : [bookingData.gamePrice];

              gameIds.forEach((gameId: number, index: number) => {
                gameDetails.push({
                  gameName: `Game ${gameId}`,
                  gameDescription: '',
                  gamePrice: gamePrices[index] || 0,
                  gameDuration: 0,
                  gameTime: 'TBD',
                  slotPrice: 0,
                  maxParticipants: 0,
                  customPrice: 0
                });
              });
            } else {
              console.log(`📧 No game data found, using empty gameDetails array`);
            }

            console.log(`📧 Final gameDetails:`, gameDetails);

            const htmlContent = generateBookingConfirmationHTML({
              bookingId: parseInt(bookingId.toString()),
              bookingRef: bookingRef,
              parentName: bookingData?.parentName || 'Valued Customer',
              childName: bookingData?.childName || 'Child',
              eventTitle: bookingData?.eventTitle || 'NIBOG Event',
              eventDate: bookingData?.eventDate || new Date().toLocaleDateString(),
              eventVenue: bookingData?.eventVenue || 'Main Stadium',
              totalAmount: amount / 100,
              paymentMethod: 'PhonePe',
              transactionId: transactionId,
              gameDetails: gameDetails // Add properly formatted gameDetails array
            });

            console.log(`📧 HTML content generated, sending email...`);

            // Send email using existing send-receipt-email API function directly
            const { POST: sendReceiptEmail } = await import('@/app/api/send-receipt-email/route');
            // Use dynamic URL instead of hardcoded localhost
            const { getAppUrl } = await import('@/config/phonepe');
            const appUrl = getAppUrl();
            const emailRequest = new Request(`${appUrl}/api/send-receipt-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                to: bookingData?.email || `customer-${bookingId}@example.com`,
                subject: `🎉 Booking Confirmed - ${bookingData?.eventTitle || 'NIBOG Event'} | NIBOG`,
                html: htmlContent,
                settings: settings,
                cc: 'newindiababyolympics@gmail.com'
              }),
            });

            const emailResponse = await sendReceiptEmail(emailRequest);

            if (emailResponse.ok) {
              console.log(`📧 Booking confirmation email sent successfully`);

              // Send admin notification email
              try {
                console.log(`📧 Sending admin notification email...`);
                const { sendAdminNotificationEmail } = await import('@/services/emailNotificationService');

                const adminNotificationResult = await sendAdminNotificationEmail({
                  bookingId: parseInt(bookingId.toString()),
                  bookingRef: bookingRef,
                  parentName: bookingData?.parentName || 'Valued Customer',
                  parentEmail: bookingData?.email || `customer-${bookingId}@example.com`,
                  childName: bookingData?.childName || 'Child',
                  eventTitle: bookingData?.eventTitle || 'NIBOG Event',
                  eventDate: bookingData?.eventDate || new Date().toLocaleDateString(),
                  eventVenue: bookingData?.eventVenue || 'Main Stadium',
                  totalAmount: amount / 100,
                  paymentMethod: 'PhonePe',
                  transactionId: transactionId,
                  gameDetails: gameDetails
                });

                if (adminNotificationResult.success) {
                  console.log(`📧 Admin notification email sent successfully`);
                } else {
                  console.error(`📧 Admin notification email failed:`, adminNotificationResult.error);
                }
              } catch (adminEmailError) {
                console.error(`📧 Failed to send admin notification email:`, adminEmailError);
                // Don't fail the entire process if admin email fails
              }

              // After successful booking confirmation email, send ticket email separately
              console.log(`🎫 Starting ticket email process...`);
              try {
                // Fetch ticket details using the booking reference
                const ticketDetails = await getTicketDetails(bookingRef);

                if (ticketDetails && ticketDetails.length > 0) {
                  console.log(`🎫 Retrieved ${ticketDetails.length} ticket details`);

                  // Prepare QR code data (same format as booking confirmation page)
                  const firstTicket = ticketDetails[0];
                  const qrCodeData = JSON.stringify({
                    ref: bookingRef,
                    id: bookingId,
                    name: firstTicket.child_name || bookingData?.childName || 'Child',
                    game: firstTicket.custom_title || firstTicket.event_title || firstTicket.game_name || bookingData?.eventTitle || 'NIBOG Event',
                    slot_id: firstTicket.event_game_slot_id || firstTicket.booking_game_id || 0
                  });

                  // Prepare ticket email data
                  const ticketEmailData: TicketEmailData = {
                    bookingId: parseInt(bookingId.toString()),
                    bookingRef: bookingRef,
                    parentName: bookingData?.parentName || 'Valued Customer',
                    parentEmail: bookingData?.email || `customer-${bookingId}@example.com`,
                    childName: bookingData?.childName || 'Child',
                    eventTitle: bookingData?.eventTitle || 'NIBOG Event',
                    eventDate: bookingData?.eventDate || new Date().toLocaleDateString(),
                    eventVenue: bookingData?.eventVenue || 'Main Stadium',
                    eventCity: bookingData?.eventCity || '',
                    ticketDetails: ticketDetails,
                    qrCodeData: qrCodeData
                  };

                  // Send ticket email
                  const ticketEmailResult = await sendTicketEmail(ticketEmailData);

                  if (ticketEmailResult.success) {
                    console.log(`🎫 Ticket email sent successfully`);
                  } else {
                    console.error(`🎫 Ticket email failed:`, ticketEmailResult.error);
                  }
                } else {
                  console.log(`🎫 No ticket details found for booking reference: ${bookingRef}`);
                }
              } catch (ticketEmailError) {
                console.error(`🎫 Failed to send ticket email:`, ticketEmailError);
                console.error(`🎫 Ticket email error details:`, ticketEmailError instanceof Error ? ticketEmailError.message : ticketEmailError);
                // Don't fail the entire process if ticket email fails
              }
            } else {
              const errorData = await emailResponse.json();
              console.error(`📧 Email sending failed:`, errorData);
            }
          } catch (emailError) {
            console.error(`📧 Failed to send booking confirmation email:`, emailError);
            console.error(`📧 Email error details:`, emailError instanceof Error ? emailError.message : emailError);
            console.error(`📧 Email error stack:`, emailError instanceof Error ? emailError.stack : 'N/A');
            // Don't fail the entire process if email fails - booking and payment were successful
          }

          console.log(`Server API route: Booking and payment process completed successfully`);

          return NextResponse.json({
            ...responseData,
            bookingCreated: true,
            bookingId,
            paymentId: paymentId, // New API returns payment_id
            paymentCreated: true,
            emailSent: true, // Indicate that booking confirmation email was attempted
            ticketEmailSent: true, // Indicate that ticket email was attempted
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

/**
 * Send booking confirmation email using existing booking data (no additional API calls needed)
 */
async function sendBookingConfirmationWithExistingData(
  bookingId: string | number,
  bookingData: any,
  transactionId: string,
  totalAmount: number,
  bookingRef: string
) {
  try {
    console.log(`📧 Preparing booking confirmation email with existing data...`);
    console.log(`📧 Booking data available:`, JSON.stringify(bookingData, null, 2));

    // Use the event and venue data we already have from the booking process
    // No need to make additional API calls - we have everything we need!


    // Extract game details from the rich booking data - no API calls needed!
    const gameDetails: GameDetail[] = [];

    console.log(`📧 Available booking data keys:`, Object.keys(bookingData || {}));
    console.log(`📧 Selected games objects:`, bookingData?.selectedGamesObj);

    // Use the rich game data we now have
    if (bookingData?.selectedGamesObj && Array.isArray(bookingData.selectedGamesObj)) {
      bookingData.selectedGamesObj.forEach((game: any, index: number) => {
        const gamePrice = bookingData.gamePrice?.[index] || game.slot_price || game.custom_price || 0;
        gameDetails.push({
          gameName: game.custom_title || game.game_title || `Game ${game.game_id || game.id}`,
          gameDescription: game.custom_description || game.game_description || '',
          gamePrice: gamePrice,
          gameDuration: game.game_duration_minutes || 0,
          gameTime: game.start_time && game.end_time ?
            `${game.start_time} - ${game.end_time}` : 'TBD',
          slotPrice: game.slot_price || 0,
          maxParticipants: game.max_participants || 0,
          customPrice: game.custom_price || 0
        });
      });
      console.log(`📧 Extracted ${gameDetails.length} rich games from booking data`);
    } else {
      // Fallback to basic game data if rich data not available
      const gameIds = bookingData?.gameId || [];
      const gamePrices = bookingData?.gamePrice || [];

      gameIds.forEach((gameId: number, index: number) => {
        const gamePrice = gamePrices[index] || 0;
        gameDetails.push({
          gameName: `Game ${gameId}`,
          gameDescription: '',
          gamePrice: gamePrice,
          gameDuration: 0,
          gameTime: 'TBD',
          slotPrice: gamePrice,
          maxParticipants: 0,
          customPrice: gamePrice
        });
      });
      console.log(`📧 Used fallback game data for ${gameDetails.length} games`);
    }

    // Prepare email data using the rich booking data - now with real event and game details!
    const emailData = {
      bookingId: parseInt(bookingId.toString()),
      parentName: bookingData?.parentName || 'Valued Customer',
      parentEmail: bookingData?.email || '',
      childName: bookingData?.childName || '',
      eventTitle: bookingData?.eventTitle || `Event ${bookingData?.eventId}`,
      eventDate: bookingData?.eventDate || 'TBD',
      eventVenue: bookingData?.eventVenue || 'TBD',
      eventCity: bookingData?.eventCity || '',
      totalAmount: totalAmount,
      paymentMethod: 'PhonePe',
      transactionId: transactionId,
      gameDetails: gameDetails,
      addOns: bookingData?.addOns || [],
      bookingRef: bookingRef, // Use the consistent booking reference format
      bookingStatus: 'Confirmed',
      paymentStatus: 'Paid'
    };

    console.log(`📧 Prepared email data:`, JSON.stringify(emailData, null, 2));

    // Get email settings by calling the API function directly
    const { GET: getEmailSettings } = await import('@/app/api/emailsetting/get/route');
    const emailSettingsResponse = await getEmailSettings();

    if (!emailSettingsResponse.ok) {
      throw new Error('Email settings not configured');
    }

    const emailSettings = await emailSettingsResponse.json();
    if (!emailSettings || emailSettings.length === 0) {
      throw new Error('No email settings found');
    }

    const settings = emailSettings[0];

    // Generate email HTML
    const htmlContent = generateBookingConfirmationHTML(emailData);

    // Send email using existing send-receipt-email API function directly
    const { POST: sendReceiptEmail } = await import('@/app/api/send-receipt-email/route');
    // Use dynamic URL instead of hardcoded localhost
    const { getAppUrl } = await import('@/config/phonepe');
    const appUrl = getAppUrl();
    const emailRequest = new Request(`${appUrl}/api/send-receipt-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: emailData.parentEmail,
        subject: `🎉 Booking Confirmed - ${emailData.eventTitle} | NIBOG`,
        html: htmlContent,
        settings: settings,
        cc: 'newindiababyolympics@gmail.com'
      }),
    });

    const emailResponse = await sendReceiptEmail(emailRequest);

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(errorData.error || 'Failed to send email');
    }

    console.log(`📧 Booking confirmation email sent successfully to ${emailData.parentEmail}`);
    return { success: true };

  } catch (error) {
    console.error(`📧 Error sending booking confirmation email:`, error);
    throw error;
  }
}

/**
 * Generate HTML content for booking confirmation email
 */
function generateBookingConfirmationHTML(emailData: any): string {
  // Safely handle gameDetails array with proper fallback
  let gameDetailsHtml = '';

  if (emailData.gameDetails && Array.isArray(emailData.gameDetails) && emailData.gameDetails.length > 0) {
    gameDetailsHtml = emailData.gameDetails.map((game: any) =>
      `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">
          <strong>${game.gameName || 'Game'}</strong>
          ${game.gameDescription ? `<br><small style="color: #666;">${game.gameDescription}</small>` : ''}
          ${game.gameDuration > 0 ? `<br><small style="color: #666;">Duration: ${game.gameDuration} minutes</small>` : ''}
          ${game.gameTime !== 'TBD' ? `<br><small style="color: #007bff;">⏰ ${game.gameTime}</small>` : ''}
          ${game.maxParticipants > 0 ? `<br><small style="color: #28a745;">👥 Max ${game.maxParticipants} participants</small>` : ''}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
          ₹${(game.gamePrice || 0).toFixed(2)}
        </td>
      </tr>`
    ).join('');
  } else {
    // Fallback when no game details are available
    gameDetailsHtml = `<tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">
        <strong>Event Registration</strong>
        <br><small style="color: #666;">Your booking has been confirmed</small>
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
        ₹${(emailData.totalAmount || 0).toFixed(2)}
      </td>
    </tr>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - NIBOG</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">🎉 Booking Confirmed!</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for choosing NIBOG</p>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
      <h2 style="margin: 0 0 15px 0; color: #495057; font-size: 20px;">Booking Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 40%;">Booking ID:</td>
          <td style="padding: 8px 0;">#${emailData.bookingId}</td>
        </tr>
        ${emailData.bookingRef ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Booking Reference:</td>
          <td style="padding: 8px 0; font-family: monospace; font-weight: bold; color: #007bff;">${emailData.bookingRef}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Parent Name:</td>
          <td style="padding: 8px 0;">${emailData.parentName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Child Name:</td>
          <td style="padding: 8px 0;">${emailData.childName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Event:</td>
          <td style="padding: 8px 0;">${emailData.eventTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Date:</td>
          <td style="padding: 8px 0;">${emailData.eventDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Venue:</td>
          <td style="padding: 8px 0;">${emailData.eventVenue}${emailData.eventCity ? `, ${emailData.eventCity}` : ''}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Transaction ID:</td>
          <td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${emailData.transactionId}</td>
        </tr>
      </table>
    </div>

    ${gameDetailsHtml ? `
    <div style="margin-bottom: 25px;">
      <h3 style="margin: 0 0 15px 0; color: #495057; font-size: 18px;">Booking Details</h3>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Details</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${gameDetailsHtml}
        </tbody>
      </table>
    </div>
    ` : ''}

    <div style="background: #e9ecef; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span style="font-size: 18px; font-weight: bold;">Total Amount:</span>
        <span style="font-size: 24px; font-weight: bold; color: #28a745;">₹${emailData.totalAmount.toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span>Payment Method:</span>
        <span style="font-weight: bold;">${emailData.paymentMethod}</span>
      </div>
    </div>

    <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
      <strong>✅ Payment Successful!</strong><br>
      Your booking has been confirmed and payment has been processed successfully.
    </div>

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="margin: 0; color: #666; font-size: 14px;">
        If you have any questions, please contact us at newindiababyolympics@gmail.com
      </p>
      <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
        Thank you for choosing NIBOG! 🎮
      </p>
    </div>
  </div>
</body>
</html>`;
}
