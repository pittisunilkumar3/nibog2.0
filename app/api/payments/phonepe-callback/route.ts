import { NextResponse } from 'next/server';
import { BOOKING_API } from '@/config/api';
import { PHONEPE_CONFIG, generateSHA256Hash } from '@/config/phonepe';
import { WhatsAppBookingData } from '@/services/whatsappService';
import { formatDateForAPI } from '@/lib/utils';

// Cache successful transaction IDs to prevent duplicate processing
let processedTransactions: Set<string> = new Set();

// Clean up old transactions from cache periodically (every hour)
setInterval(() => {
  processedTransactions = new Set<string>();
}, 60 * 60 * 1000);

/**
 * Generate HTML content for booking confirmation email
 */
function generateBookingConfirmationHTML(emailData: any): string {
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
    <p style="margin: 0 0 20px 0; font-size: 16px;">Dear ${emailData.parentName},</p>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
      <h2 style="margin: 0 0 15px 0; color: #495057; font-size: 20px;">Booking Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 40%;">Booking ID:</td>
          <td style="padding: 8px 0;">#${emailData.bookingId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Booking Reference:</td>
          <td style="padding: 8px 0; font-family: monospace; font-weight: bold; color: #007bff;">${emailData.bookingRef}</td>
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
          <td style="padding: 8px 0;">${emailData.eventVenue}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Transaction ID:</td>
          <td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${emailData.transactionId}</td>
        </tr>
      </table>
    </div>

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

    <div style="margin-bottom: 25px;">
      <h3 style="margin: 0 0 15px 0; color: #495057; font-size: 18px;">What's Next?</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Please arrive 15 minutes before the event start time</li>
        <li style="margin-bottom: 8px;">Bring a copy of this confirmation email</li>
        <li style="margin-bottom: 8px;">Ensure your child is well-rested and ready for fun!</li>
        <li style="margin-bottom: 8px;">Contact us if you have any questions</li>
      </ul>
    </div>

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
      <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
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

// Interface for pending booking data
interface PendingBookingData {
  userId: number;
  parentName: string;
  email: string;
  phone: string;
  childName: string;
  childDob: string;
  schoolName: string;
  gender: string;
  eventId: number;
  gameId: number[];
  gamePrice: number[];
  totalAmount: number;
  paymentMethod: string;
  termsAccepted: boolean;
  addOns?: Array<{
    addOnId: number;
    quantity: number;
    variantId?: string;
  }>;
  promoCode?: string;
  eventTitle?: string;
  eventDate?: string;
  eventVenue?: string;
  gameDetails?: any[];
}

/**
 * Retrieve pending booking data from the database
 */
async function getPendingBookingData(transactionId: string): Promise<PendingBookingData | null> {
  try {
    console.log(`📋 Retrieving pending booking data for transaction: ${transactionId}`);

    // Extract merchant transaction ID from the transactionId if needed
    const merchantTransactionId = transactionId.includes('NIBOG_') ? transactionId : `NIBOG_${transactionId}`;

    console.log(`📋 Looking for pending booking with merchant transaction ID: ${merchantTransactionId}`);
    console.log(`📋 Original transaction ID: ${transactionId}`);
    console.log(`📋 Formatted merchant transaction ID: ${merchantTransactionId}`);

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/pending-bookings/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction_id: merchantTransactionId
      }),
    });

    console.log(`📋 Pending booking API response status: ${response.status}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`📭 No pending booking found for transaction: ${merchantTransactionId}`);
        return null;
      }

      const errorText = await response.text();
      console.error(`❌ Failed to retrieve pending booking: ${response.status} - ${errorText}`);
      return null;
    }

    const result = await response.json();
    console.log(`✅ Retrieved pending booking data:`, JSON.stringify(result, null, 2));

    // Log DOB specifically for tracking
    if (result && result.bookingData) {
      console.log("=== DOB TRACKING IN PENDING BOOKING RETRIEVAL ===");
      console.log("Retrieved DOB:", result.bookingData.childDob);
      console.log("DOB type:", typeof result.bookingData.childDob);
      console.log("DOB format validation:", /^\d{4}-\d{2}-\d{2}$/.test(result.bookingData.childDob) ? "✅ Valid YYYY-MM-DD" : "❌ Invalid format");

      // Check if this looks like real user data vs fallback data
      if (result.bookingData.childDob === "2015-01-01" ||
          result.bookingData.childName?.includes("Child ") ||
          result.bookingData.parentName === "PhonePe Customer") {
        console.log(`⚠️ WARNING: Retrieved data appears to be fallback data, not actual user data!`);
        console.log(`   - Child DOB: ${result.bookingData.childDob}`);
        console.log(`   - Child Name: ${result.bookingData.childName}`);
        console.log(`   - Parent Name: ${result.bookingData.parentName}`);
      } else {
        console.log(`✅ Retrieved data appears to be actual user data`);
        console.log(`   - Child DOB: ${result.bookingData.childDob}`);
        console.log(`   - Child Name: ${result.bookingData.childName}`);
        console.log(`   - Parent Name: ${result.bookingData.parentName}`);
      }
    }

    return result.bookingData;
  } catch (error) {
    console.error(`❌ Error retrieving pending booking data:`, error);
    return null;
  }
}

/**
 * Update existing booking with payment information
 */
async function updateExistingBooking(
  bookingId: string,
  transactionId: string,
  merchantTransactionId: string,
  amount: number,
  paymentState: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Updating existing booking ${bookingId} with payment information`);

    const paymentStatusMap = {
      COMPLETED: { booking: "Paid", payment: "successful" },
      PENDING: { booking: "Pending", payment: "pending" },
      FAILED: { booking: "Failed", payment: "failed" },
      CANCELLED: { booking: "Failed", payment: "failed" },
    };

    const statusValues = paymentStatusMap[paymentState as keyof typeof paymentStatusMap] ||
                        { booking: "Failed", payment: "failed" };

    // Update booking status using the correct status update endpoint
    console.log(`📋 Updating booking ${bookingId} status to: ${statusValues.booking}`);
    const updateResponse = await fetch(BOOKING_API.UPDATE_STATUS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        booking_id: parseInt(bookingId),
        status: statusValues.booking,
      }),
    });

    console.log(`📡 Booking update response status: ${updateResponse.status}`);

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error(`❌ Failed to update booking status: ${errorText}`);
      return { success: false, error: `Failed to update booking status: ${updateResponse.status} - ${errorText}` };
    }

    const updateResult = await updateResponse.json();
    console.log(`✅ Booking status updated successfully:`, updateResult);

    // Create payment record
    const paymentPayload = {
      booking_id: parseInt(bookingId),
      transaction_id: transactionId,
      phonepe_transaction_id: merchantTransactionId,
      amount: amount / 100,
      payment_method: "PhonePe",
      payment_status: statusValues.payment,
      payment_date: new Date().toISOString(),
      gateway_response: {
        // Send as object, not stringified JSON
        code: "PAYMENT_SUCCESS",
        merchantId: "NIBOGONLINE",
        merchantTransactionId,
        transactionId,
        amount,
        state: paymentState,
      },
    };

    console.log(`💳 Creating payment record with payload:`, JSON.stringify(paymentPayload, null, 2));

    const paymentResponse = await fetch('https://ai.nibog.in/webhook/v1/nibog/payments/create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentPayload),
    });

    console.log(`📡 Payment creation response status: ${paymentResponse.status}`);

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error(`❌ Failed to create payment record: ${errorText}`);
      return { success: false, error: `Failed to create payment record: ${paymentResponse.status} - ${errorText}` };
    }

    const paymentResult = await paymentResponse.json();
    console.log(`✅ Payment record created successfully:`, paymentResult);

    return { success: true };
  } catch (error) {
    console.error('Error updating existing booking:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Create booking and payment records directly from stored booking data
 */
async function createBookingAndPaymentDirect(
  transactionId: string,
  merchantTransactionId: string,
  amount: number,
  paymentState: string
): Promise<{ success: boolean; bookingId?: number; bookingData?: any; error?: string }> {
  try {
    console.log('🔄 Creating booking and payment records directly...');
    console.log(`Transaction ID: ${transactionId}`);
    console.log(`Merchant Transaction ID: ${merchantTransactionId}`);
    console.log(`Amount: ${amount} paise (₹${amount / 100})`);
    console.log(`Payment State: ${paymentState}`);

    // Extract user ID and potential temp booking ID from transaction ID format: NIBOG_USER-ID_TIMESTAMP
    const bookingMatch = merchantTransactionId.match(/NIBOG_(\d+)_/);
    const userId = bookingMatch ? parseInt(bookingMatch[1]) : null;
    
    if (!userId) {
      console.error('❌ Could not extract user ID from transaction ID');
      return { success: false, error: 'Invalid transaction ID format' };
    }
    
    console.log(`Extracted User ID from transaction: ${userId}`);

    // We'll create a booking directly with the user ID without trying to fetch any previous booking data
    console.log(`👤 Using user ID ${userId} to create a direct booking for transaction: ${merchantTransactionId}`);

    // Get current date for booking date
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    // Create minimal booking data with user ID
    // NOTE: This is a fallback - the actual user data should come from pending booking
    console.log("⚠️ WARNING: Using fallback booking data - actual user data not found!");
    console.log("This means the pending booking data was not properly saved or retrieved.");

    const finalBookingData = {
      user_id: userId,
      parent: {
        parent_name: "PhonePe Customer",
        email: `customer-${userId}@example.com`,
        additional_phone: "",
      },
      child: {
        full_name: `Child ${userId}`,
        date_of_birth: new Date().toISOString().split('T')[0], // Use current date as fallback instead of hardcoded 2015-01-01
        school_name: "Unknown School",
        gender: "Other",
      },
      booking: {
        event_id: 1,
        booking_date: formattedDate,
        total_amount: amount / 100, // Convert from paise to rupees
        payment_method: "PhonePe",
        payment_status: paymentState === 'COMPLETED' ? 'Paid' : 'Pending',
        terms_accepted: true,
        transaction_id: transactionId,
        merchant_transaction_id: merchantTransactionId
      },
      booking_games: [
        {
          game_id: 1, // Using game ID 1 which should exist in the baby_games table
          child_index: 0,
          game_price: amount / 100, // Convert from paise to rupees
        }
      ]
    };

    console.log(`📋 Creating DIRECT booking with data:`, JSON.stringify(finalBookingData, null, 2));
    
    // Add timeout and retry logic for creating booking
    let bookingResponse;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount <= maxRetries) {
      try {
        if (retryCount > 0) {
          console.log(`⏱️ Retry attempt ${retryCount} for direct booking creation...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
        }
        
        // Use AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        console.log(`Calling booking creation API at: ${BOOKING_API.CREATE}`);
        bookingResponse = await fetch(BOOKING_API.CREATE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(finalBookingData),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        break; // Exit retry loop if no error thrown
      } catch (fetchError: any) {
        console.error(`❌ Fetch error during direct booking creation (attempt ${retryCount + 1}):`, fetchError.message);
        
        if (retryCount >= maxRetries) {
          return { 
            success: false, 
            error: `Failed to create direct booking after ${maxRetries} retries: ${fetchError.message}` 
          };
        }
        retryCount++;
      }
    }

    if (!bookingResponse) {
      return { success: false, error: `Failed to get booking response after retries` };
    }

    console.log(`📡 Direct booking creation response status: ${bookingResponse.status}`);
    
    // Handle response
    let bookingResultText;
    let bookingResultJson;
    
    try {
      bookingResultText = await bookingResponse.text();
      console.log(`📋 Raw booking API response text:`, bookingResultText);
      
      try {
        // Try to parse as JSON
        bookingResultJson = JSON.parse(bookingResultText);
      } catch (parseError) {
        console.error('❌ Failed to parse booking response as JSON:', parseError);
        // If it's not JSON but response is OK, assume success with userId as fallback
        if (bookingResponse.ok && userId) {
          console.log(`⚠️ Non-JSON response but status OK. Using user ID as fallback booking ID: ${userId}`);
          bookingResultJson = { booking_id: userId };
        } else {
          return { 
            success: false, 
            error: `Response isn't valid JSON: ${bookingResultText.substring(0, 200)}` 
          };
        }
      }
    } catch (textError) {
      console.error('❌ Failed to get response text:', textError);
      // If we can't get text but response is OK, use userId as fallback
      if (bookingResponse.ok && userId) {
        console.log(`⚠️ Cannot get response text but status OK. Using user ID as fallback booking ID: ${userId}`);
        bookingResultJson = { booking_id: userId };
      } else {
        return {
          success: false,
          bookingData: finalBookingData,
          error: `Failed to get response text: ${
            typeof textError === 'object' && textError !== null && 'message' in textError
              ? (textError as any).message
              : String(textError)
          }`
        };
      }
    }

    if (!bookingResponse.ok) {
      console.error('❌ Failed to create direct booking:', bookingResultJson || bookingResultText);
      return { 
        success: false, 
        error: `Failed to create direct booking: ${bookingResponse.status} - ${JSON.stringify(bookingResultJson || bookingResultText)}` 
      };
    }

    // Try to extract booking ID from response
    const bookingId = bookingResultJson?.booking_id || 
                    bookingResultJson?.id || 
                    bookingResultJson?.data?.booking_id || 
                    bookingResultJson?.data?.id || 
                    userId; // Fall back to user ID if response doesn't contain booking ID

    if (!bookingId) {
      console.error('❌ No booking ID available from response or transaction ID!');
      console.error('📋 Full booking response:', JSON.stringify(bookingResultJson || bookingResultText, null, 2));
      return { success: false, error: 'No booking ID available for payment creation' };
    }

    console.log(`✅ Direct booking created or identified with ID: ${bookingId}`);

    // Create payment record
    const paymentStatusMap = {
      COMPLETED: 'successful',
      PENDING: 'pending',
      FAILED: 'failed',
      CANCELLED: 'failed',
    };

    const paymentStatus = paymentStatusMap[paymentState as keyof typeof paymentStatusMap] || 'failed';

    const paymentPayload = {
      booking_id: parseInt(bookingId.toString()),
      transaction_id: transactionId,
      phonepe_transaction_id: merchantTransactionId,
      amount: amount / 100, // Convert from paise to rupees
      payment_method: 'PhonePe',
      payment_status: paymentStatus,
      payment_date: new Date().toISOString(),
      gateway_response: {
        // Send as object, not stringified JSON
        code: "PAYMENT_SUCCESS",
        merchantId: "NIBOGONLINE",
        merchantTransactionId,
        transactionId,
        amount,
        state: paymentState,
        note: 'Created via direct fallback due to missing pending booking data'
      },
    };

    console.log(`💳 Creating direct payment record with payload:`, JSON.stringify(paymentPayload, null, 2));

    const paymentResponse = await fetch('https://ai.nibog.in/webhook/v1/nibog/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentPayload),
    });

    console.log(`📡 Direct payment creation response status: ${paymentResponse.status}`);

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error(`❌ Failed to create direct payment record: ${errorText}`);
      // Booking was created but payment record failed - this needs manual intervention
      return {
        success: false,
        bookingId,
        error: `Direct booking created but payment record failed: ${paymentResponse.status} - ${errorText}`
      };
    }

    const paymentResult = await paymentResponse.json();
    console.log(`✅ Direct payment record created successfully:`, paymentResult);

    return { success: true, bookingId };

  } catch (error) {
    console.error('❌ Error in direct booking and payment creation:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error in direct creation' };
  }
}

/**
 * Create booking and payment records
 */
async function createBookingAndPayment(
  bookingData: PendingBookingData,
  transactionId: string,
  merchantTransactionId: string,
  amount: number,
  paymentState: string
): Promise<{ success: boolean; bookingId?: number; error?: string }> {
  try {
    console.log('Creating booking and payment records...');

    // Format booking data for API
    const formattedBookingData = {
      user_id: bookingData.userId,
      parent: {
        parent_name: bookingData.parentName,
        email: bookingData.email,
        additional_phone: bookingData.phone,
      },
      child: {
        full_name: bookingData.childName,
        date_of_birth: (() => {
          const formattedDob = formatDateForAPI(bookingData.childDob);
          console.log("=== DOB FORMATTING IN PAYMENT CALLBACK ===");
          console.log("Original DOB:", bookingData.childDob);
          console.log("Formatted DOB:", formattedDob);
          console.log("DOB format validation:", /^\d{4}-\d{2}-\d{2}$/.test(formattedDob) ? "✅ Valid YYYY-MM-DD" : "❌ Invalid format");
          return formattedDob;
        })(),
        school_name: bookingData.schoolName,
        gender: bookingData.gender,
      },
      booking: {
        event_id: bookingData.eventId,
        total_amount: bookingData.totalAmount,
        payment_method: bookingData.paymentMethod,
        payment_status: paymentState === 'COMPLETED' ? 'Paid' : 'Pending',
        terms_accepted: bookingData.termsAccepted,
      },
      booking_games: bookingData.gameId.map((gameId, index) => ({
        game_id: gameId,
        child_index: 0, // Assuming single child for now
        game_price: bookingData.gamePrice[index] || 0,
      })),
      // Add-ons if present
      ...(bookingData.addOns && bookingData.addOns.length > 0 && {
        booking_addons: bookingData.addOns.map(addon => ({
          addon_id: addon.addOnId,
          quantity: addon.quantity,
          ...(addon.variantId && { variant_id: addon.variantId }),
        })),
      }),
      // Promo code if present
      ...(bookingData.promoCode && {
        promo_code: bookingData.promoCode,
      }),
    };

    // Create booking with enhanced logging
    console.log(`🔍 Making booking API call to: ${BOOKING_API.CREATE}`);
    console.log(`📦 Booking payload:`, JSON.stringify(formattedBookingData, null, 2));
    
    const bookingResponse = await fetch(BOOKING_API.CREATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedBookingData),
    });

    if (!bookingResponse.ok) {
      const errorText = await bookingResponse.text();
      console.error(`❌ Failed to create booking: Status ${bookingResponse.status}`);
      console.error(`❌ Error response:`, errorText);
      console.error(`❌ Request headers:`, Object.fromEntries(bookingResponse.headers.entries()));
      return { success: false, error: `Failed to create booking: ${bookingResponse.status} - ${errorText}` };
    }

    const bookingResult = await bookingResponse.json();
    console.log(`✅ Booking API response:`, JSON.stringify(bookingResult, null, 2));
    
    const bookingId = bookingResult.booking_id || bookingResult.id;

    if (!bookingId) {
      console.error('❌ No booking ID returned from booking creation. Full response:', JSON.stringify(bookingResult, null, 2));
      return { success: false, error: 'No booking ID returned from API response' };
    }

    console.log(`✅ Booking created successfully with ID: ${bookingId}`);

    // Create payment record
    const paymentStatusMap = {
      COMPLETED: 'successful',
      PENDING: 'pending',
      FAILED: 'failed',
      CANCELLED: 'failed',
    };

    const paymentStatus = paymentStatusMap[paymentState as keyof typeof paymentStatusMap] || 'failed';

    const paymentResponse = await fetch('https://ai.nibog.in/webhook/v1/nibog/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        booking_id: parseInt(bookingId),
        transaction_id: transactionId,
        phonepe_transaction_id: merchantTransactionId,
        amount: amount / 100, // Convert from paise to rupees
        payment_method: 'PhonePe',
        payment_status: paymentStatus,
        payment_date: new Date().toISOString(),
        gateway_response: {
          // Send as object, not stringified JSON
          code: "PAYMENT_SUCCESS",
          merchantId: "NIBOGONLINE",
          merchantTransactionId,
          transactionId,
          amount,
          state: paymentState,
        },
      }),
    });

    if (!paymentResponse.ok) {
      console.error(`Failed to create payment record: ${paymentResponse.status}`);
      // Booking was created but payment record failed - this needs manual intervention
      return {
        success: false,
        bookingId,
        error: `Booking created but payment record failed: ${paymentResponse.status}`
      };
    }

    console.log('Payment record created successfully');

    // Send booking confirmation email after successful booking and payment creation
    try {
      console.log(`📧 Sending booking confirmation email for booking ID: ${bookingId}`);

      // Get email settings first
      const emailSettingsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/emailsetting/get`);
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

      // Generate booking confirmation HTML
      const bookingRef = `B${String(bookingId).padStart(7, '0')}`;
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
        transactionId: merchantTransactionId,
        gameDetails: bookingData?.gameDetails || [] // Add gameDetails array
      });

      // Send email using existing send-receipt-email API
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.nibog.in'}/api/send-receipt-email`, {
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
            transactionId: merchantTransactionId,
            gameDetails: bookingData?.gameDetails || []
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
      } else {
        const errorData = await emailResponse.json();
        console.error(`📧 Email sending failed:`, errorData);
      }
    } catch (emailError) {
      console.error(`📧 Failed to send booking confirmation email:`, emailError);
      // Don't fail the entire process if email fails - booking and payment were successful
    }

    return { success: true, bookingId };

  } catch (error) {
    console.error('Error creating booking and payment:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function POST(request: Request) {
  try {
    console.log("=== PHONEPE SERVER CALLBACK RECEIVED ===");
    console.log(`PhonePe Environment: ${PHONEPE_CONFIG.ENVIRONMENT}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);

    // More efficient logging in production
    if (process.env.NODE_ENV !== 'production') {
      const headers: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log("Request headers:", headers);
    }

    // Parse the request body
    const callbackData = await request.json();
    console.log(`Callback data received:`, JSON.stringify(callbackData, null, 2));

    // Verify the callback using X-VERIFY header - skip in non-production for easier testing
    if (process.env.NODE_ENV === 'production') {
      const xVerify = request.headers.get('X-VERIFY');
      if (!xVerify) {
        console.error("Missing X-VERIFY header in callback");
        return NextResponse.json({ error: "Missing X-VERIFY header" }, { status: 400 });
      }

      // Extract the hash and salt index from X-VERIFY
      const [hash, saltIndex] = xVerify.split('###');

      // Verify that the salt index matches
      if (saltIndex !== PHONEPE_CONFIG.SALT_INDEX) {
        console.error(`Salt index mismatch. Expected ${PHONEPE_CONFIG.SALT_INDEX}, got ${saltIndex}`);
        return NextResponse.json({ error: "Invalid salt index" }, { status: 400 });
      }

      // Verify the hash
      const callbackDataString = JSON.stringify(callbackData);
      const expectedHash = await generateSHA256Hash(callbackDataString + PHONEPE_CONFIG.SALT_KEY);

      if (hash !== expectedHash) {
        console.error("Hash verification failed for PhonePe callback");
        return NextResponse.json({ error: "Hash verification failed" }, { status: 400 });
      }
      
      console.log("✅ PhonePe callback verification successful");
    } else {
      console.log("⚠️ Running in development mode - skipping signature verification");
    }


    // Extract the transaction details
    const { merchantTransactionId, transactionId, amount, paymentState } = callbackData;
    console.log(`💰 Payment Details:`);
    console.log(`  - Amount: ${amount} paise (₹${amount / 100})`);
    console.log(`  - State: ${paymentState}`);
    console.log(`  - Transaction ID: ${transactionId}`);
    console.log(`  - Merchant Transaction ID: ${merchantTransactionId}`);

    // Check if this transaction has already been processed
    if (processedTransactions.has(transactionId)) {
      console.log(`⚠️ Transaction ${transactionId} has already been processed. Skipping.`);
      return NextResponse.json({
        status: "SUCCESS", 
        message: "Transaction already processed"
      });
    }

    // Process the transaction based on payment status
    if (paymentState === "COMPLETED") {
      console.log("✅ Payment completed successfully. Creating booking and payment record...");

      // First, try to retrieve pending booking data
      console.log("🔍 Attempting to retrieve pending booking data...");
      const pendingBookingData = await getPendingBookingData(merchantTransactionId);

      let bookingResult;

      if (pendingBookingData) {
        console.log("✅ Found pending booking data. Creating booking with actual user data...");
        bookingResult = await createBookingAndPayment(pendingBookingData, transactionId, merchantTransactionId, amount, paymentState);
      } else {
        console.log("⚠️ No pending booking data found. Using fallback method...");
        bookingResult = await createBookingAndPaymentDirect(transactionId, merchantTransactionId, amount, paymentState);
      }

      if (bookingResult.success && bookingResult.bookingId) {
        console.log(`✅ Booking and payment successfully created for ID: ${bookingResult.bookingId}`);

        // Send booking confirmation email immediately after successful booking creation
        try {
          console.log(`📧 Sending booking confirmation email for booking ID: ${bookingResult.bookingId}`);

          // Get email settings first
          const emailSettingsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/emailsetting/get`);
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

          // Generate booking confirmation HTML with actual data if available
          const bookingRef = `B${String(bookingResult.bookingId).padStart(7, '0')}`;
          const htmlContent = generateBookingConfirmationHTML({
            bookingId: bookingResult.bookingId,
            bookingRef: bookingRef,
            parentName: pendingBookingData?.parentName || 'Valued Customer',
            childName: pendingBookingData?.childName || 'Child',
            eventTitle: pendingBookingData?.eventTitle || 'NIBOG Event',
            eventDate: pendingBookingData?.eventDate || new Date().toLocaleDateString(),
            eventVenue: pendingBookingData?.eventVenue || 'Main Stadium',
            totalAmount: amount / 100,
            paymentMethod: 'PhonePe',
            transactionId: transactionId,
            gameDetails: pendingBookingData?.gameDetails || [] // Use actual game details if available
          });

          // Send email using existing send-receipt-email API
          const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.nibog.in'}/api/send-receipt-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: pendingBookingData?.email || `customer-${transactionId.slice(-6)}@example.com`,
              subject: `🎉 Booking Confirmed - ${pendingBookingData?.eventTitle || 'NIBOG Event'} | NIBOG`,
              html: htmlContent,
              settings: settings,
              cc: 'newindiababyolympics@gmail.com'
            }),
          });

          if (emailResponse.ok) {
            console.log(`📧 Booking confirmation email sent successfully`);

            // Send admin notification email
            try {
              console.log(`📧 Sending admin notification email...`);
              const { sendAdminNotificationEmail } = await import('@/services/emailNotificationService');

              const adminNotificationResult = await sendAdminNotificationEmail({
                bookingId: bookingResult.bookingId,
                bookingRef: bookingRef,
                parentName: pendingBookingData?.parentName || 'Valued Customer',
                parentEmail: pendingBookingData?.email || `customer-${transactionId.slice(-6)}@example.com`,
                childName: pendingBookingData?.childName || 'Child',
                eventTitle: pendingBookingData?.eventTitle || 'NIBOG Event',
                eventDate: pendingBookingData?.eventDate || new Date().toLocaleDateString(),
                eventVenue: pendingBookingData?.eventVenue || 'Main Stadium',
                totalAmount: amount / 100,
                paymentMethod: 'PhonePe',
                transactionId: transactionId,
                gameDetails: pendingBookingData?.gameDetails || []
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
          } else {
            const errorData = await emailResponse.json();
            console.error(`📧 Email sending failed:`, errorData);
          }
        } catch (emailError) {
          console.error(`📧 Failed to send booking confirmation email:`, emailError);
          // Don't fail the entire process if email fails - booking and payment were successful
        }

        // Send notifications via N8N webhook (handles both WhatsApp and Email)
        let notificationsSent = false;
        try {
          console.log(`🔔 Sending notifications for booking ID: ${bookingResult.bookingId} via N8N webhook`);

          // Extract phone number from transaction ID or use a fallback
          const phoneMatch = merchantTransactionId.match(/NIBOG_(\d+)_/);
          const userId = phoneMatch ? parseInt(phoneMatch[1]) : null;

          // Prepare notification data with actual booking information
          const bookingRef = `B${String(bookingResult.bookingId).padStart(7, '0')}`;
          const notificationData = {
            bookingId: bookingResult.bookingId,
            bookingRef: bookingRef,
            parentName: pendingBookingData?.parentName || 'Valued Customer',
            parentPhone: pendingBookingData?.phone || `+91${userId || '9999999999'}`,
            parentEmail: pendingBookingData?.email || `customer-${bookingResult.bookingId}@example.com`,
            childName: pendingBookingData?.childName || 'Child',
            eventTitle: pendingBookingData?.eventTitle || 'NIBOG Event',
            eventDate: pendingBookingData?.eventDate || new Date().toLocaleDateString(),
            eventVenue: pendingBookingData?.eventVenue || 'Main Stadium',
            totalAmount: amount / 100,
            paymentMethod: 'PhonePe',
            transactionId: transactionId,
            gameDetails: [] // Add empty gameDetails array for fallback case
          };

          // Replace this URL with your actual N8N webhook URL
          const n8nWebhookUrl = process.env.N8N_BOOKING_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook/nibog-booking-confirmation';

          // Send notification data to N8N webhook
          const n8nResponse = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(notificationData),
          });

          if (n8nResponse.ok) {
            const n8nResult = await n8nResponse.json();
            console.log(`🔔 Notifications sent successfully via N8N:`, n8nResult);
            notificationsSent = true;
          } else {
            const errorData = await n8nResponse.json();
            console.error(`🔔 N8N webhook notification failed:`, errorData);

            // Fallback to direct WhatsApp API if N8N fails
            if (process.env.WHATSAPP_NOTIFICATIONS_ENABLED === 'true') {
              console.log(`📱 Falling back to direct WhatsApp API`);
              const whatsappResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.nibog.in'}/api/whatsapp/send-booking-confirmation`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(notificationData),
              });

              if (whatsappResponse.ok) {
                console.log(`📱 WhatsApp fallback notification sent successfully`);
              }
            }
          }
        } catch (notificationError) {
          console.error(`🔔 Failed to send notifications:`, notificationError);
          // Don't fail the entire process if notifications fail
        }

        // Mark this transaction as processed
        processedTransactions.add(transactionId);

        return NextResponse.json({
          status: "SUCCESS",
          message: "Payment processed successfully",
          booking_id: bookingResult.bookingId,
          emailSent: true, // Indicate that email was attempted
          notificationsSent: notificationsSent // Indicate if notifications were sent
        });
      } else {
        console.error(`❌ Failed to create booking and payment: ${bookingResult.error}`);
        // We still return success to PhonePe as the payment was successful, but we log the error
        return NextResponse.json({
          status: "SUCCESS",
          message: "Payment recorded but failed to create booking",
          error: bookingResult.error
        });
      }
    } else {
      // For non-completed payments, we might still want to log them
      // but we don't create booking records
      return NextResponse.json({
        success: true,
        message: `Payment ${paymentState.toLowerCase()} - no booking created`
      }, { status: 200 });
    }


  } catch (error: any) {
    console.error("❌ Critical error processing PhonePe callback:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process PhonePe callback" },
      { status: 500 }
    );
  }
}
