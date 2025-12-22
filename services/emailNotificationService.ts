/**
 * Email notification service for booking confirmations
 * Uses existing email settings infrastructure and send-receipt-email API
 */

import { getEmailSetting } from './emailSettingService';

export interface BookingConfirmationData {
  bookingId: number;
  bookingRef?: string; // Add optional booking reference property that matches database format
  parentName: string;
  parentEmail: string;
  childName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  totalAmount: number;
  paymentMethod: string;
  transactionId: string;
  gameDetails: Array<{
    gameName: string;
    gameTime: string;
    gamePrice: number;
  }>;
  addOns?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

/**
 * Generate admin notification email HTML template
 */
function generateAdminNotificationHTML(confirmationData: BookingConfirmationData): string {
  const gamesList = confirmationData.gameDetails.map(game =>
    `<li>${game.gameName} - ${game.gameTime} - ₹${game.gamePrice}</li>`
  ).join('');

  const addOnsList = confirmationData.addOns && confirmationData.addOns.length > 0
    ? confirmationData.addOns.map(addon =>
        `<li>${addon.name} (Qty: ${addon.quantity}) - ₹${addon.price}</li>`
      ).join('')
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Booking Notification - NIBOG Admin</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: bold; color: #495057; }
        .detail-value { color: #212529; }
        .games-list { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .games-list ul { margin: 0; padding-left: 20px; }
        .payment-info { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
        .alert-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 New Booking Alert</h1>
          <p>A new booking has been confirmed and payment completed</p>
        </div>

        <div class="content">
          <div class="alert-box">
            <strong>⚡ Action Required:</strong> A new booking has been successfully processed. Please review the details below and take any necessary follow-up actions.
          </div>

          <div class="booking-details">
            <h3>📋 Booking Information</h3>
            <div class="detail-row">
              <span class="detail-label">Booking Reference:</span>
              <span class="detail-value">${confirmationData.bookingRef || `B${String(confirmationData.bookingId).padStart(7, '0')}`}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">#${confirmationData.bookingId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Booking Time:</span>
              <span class="detail-value">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
            </div>
          </div>

          <div class="booking-details">
            <h3>👨‍👩‍👧‍👦 Customer Information</h3>
            <div class="detail-row">
              <span class="detail-label">Parent Name:</span>
              <span class="detail-value">${confirmationData.parentName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Parent Email:</span>
              <span class="detail-value">${confirmationData.parentEmail}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Child Name:</span>
              <span class="detail-value">${confirmationData.childName}</span>
            </div>
          </div>

          <div class="booking-details">
            <h3>🎪 Event Information</h3>
            <div class="detail-row">
              <span class="detail-label">Event:</span>
              <span class="detail-value">${confirmationData.eventTitle}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Event Date:</span>
              <span class="detail-value">${confirmationData.eventDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Venue:</span>
              <span class="detail-value">${confirmationData.eventVenue}</span>
            </div>
          </div>

          ${gamesList ? `
          <div class="games-list">
            <h4>🎮 Games Selected:</h4>
            <ul>${gamesList}</ul>
          </div>
          ` : ''}

          ${addOnsList ? `
          <div class="games-list">
            <h4>🎁 Add-ons:</h4>
            <ul>${addOnsList}</ul>
          </div>
          ` : ''}

          <div class="payment-info">
            <h3>💳 Payment Information</h3>
            <div class="detail-row">
              <span class="detail-label">Total Amount:</span>
              <span class="detail-value"><strong>₹${confirmationData.totalAmount}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value">${confirmationData.paymentMethod}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Transaction ID:</span>
              <span class="detail-value">${confirmationData.transactionId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Status:</span>
              <span class="detail-value"><strong style="color: #28a745;">✅ COMPLETED</strong></span>
            </div>
          </div>

          <div class="footer">
            <p>This is an automated notification from the NIBOG booking system.</p>
            <p>Please log in to the admin panel to view full booking details and manage the booking.</p>
            <p><strong>NIBOG Admin Team</strong></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate booking confirmation email HTML template
 */
function generateBookingConfirmationHTML(confirmationData: BookingConfirmationData): string {
  const gamesList = confirmationData.gameDetails.map(game =>
    `<li>${game.gameName} - ${game.gameTime} - ₹${game.gamePrice}</li>`
  ).join('');

  const addOnsList = confirmationData.addOns && confirmationData.addOns.length > 0
    ? confirmationData.addOns.map(addon =>
        `<li>${addon.name} (Qty: ${addon.quantity}) - ₹${addon.price}</li>`
      ).join('')
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Confirmation - NIBOG</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: bold; color: #555; }
        .detail-value { color: #333; }
        .games-list, .addons-list { margin: 15px 0; }
        .games-list ul, .addons-list ul { list-style-type: none; padding: 0; }
        .games-list li, .addons-list li { background: #e8f4fd; padding: 10px; margin: 5px 0; border-radius: 5px; border-left: 4px solid #667eea; }
        .total-amount { font-size: 1.2em; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0; padding: 15px; background: white; border-radius: 8px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Booking Confirmed!</h1>
          <p>Thank you for registering with NIBOG</p>
        </div>

        <div class="content">
          <p>Dear ${confirmationData.parentName},</p>

          <p>Great news! Your booking has been confirmed successfully. Here are your booking details:</p>

          <div class="booking-details">
            <h3>📋 Booking Information</h3>
            <div class="detail-row">
              <span class="detail-label">Booking Reference:</span>
              <span class="detail-value">${confirmationData.bookingRef || `B${String(confirmationData.bookingId).padStart(7, '0')}`}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Child Name:</span>
              <span class="detail-value">${confirmationData.childName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Event:</span>
              <span class="detail-value">${confirmationData.eventTitle}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Event Date:</span>
              <span class="detail-value">${confirmationData.eventDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Venue:</span>
              <span class="detail-value">${confirmationData.eventVenue}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Transaction ID:</span>
              <span class="detail-value">${confirmationData.transactionId}</span>
            </div>
          </div>

          ${gamesList ? `
          <div class="games-list">
            <h3>🎮 Selected Games</h3>
            <ul>${gamesList}</ul>
          </div>
          ` : ''}

          ${addOnsList ? `
          <div class="addons-list">
            <h3>🎁 Add-ons</h3>
            <ul>${addOnsList}</ul>
          </div>
          ` : ''}

          <div class="total-amount">
            💰 Total Amount Paid: ₹${confirmationData.totalAmount}
            <br><small>Payment Method: ${confirmationData.paymentMethod}</small>
          </div>

          <p><strong>What's Next?</strong></p>
          <ul>
            <li>Please arrive 15 minutes before the event start time</li>
            <li>Bring a copy of this confirmation email</li>
            <li>Ensure your child is well-rested and ready for fun!</li>
            <li>Contact us if you have any questions</li>
          </ul>

          <div class="footer">
            <p>Thank you for choosing NIBOG!</p>
            <p>For any queries, please contact us at newindiababyolympics@gmail.com</p>
            <p><small>This is an automated email. Please do not reply to this email.</small></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send booking confirmation email from server callback
 * Uses existing email settings and send-receipt-email API
 */
export async function sendBookingConfirmationFromServer(
  confirmationData: BookingConfirmationData
): Promise<{ success: boolean; error?: string }> {
  try {

    // Get email settings from your existing API
    const emailSettings = await getEmailSetting();

    if (!emailSettings) {
      console.error("❌ No email settings found");
      return {
        success: false,
        error: "Email settings not configured. Please configure email settings first."
      };
    }

    // Generate HTML email content
    const htmlContent = generateBookingConfirmationHTML(confirmationData);

    // Use your existing send-receipt-email API
    const response = await fetch('/api/send-receipt-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: confirmationData.parentEmail,
        subject: `🎉 Booking Confirmed - ${confirmationData.eventTitle} | NIBOG`,
        html: htmlContent,
        settings: emailSettings,
        cc: 'newindiababyolympics@gmail.com'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send booking confirmation email:', errorData);
      return {
        success: false,
        error: errorData.error || `Failed to send email: ${response.status}`
      };
    }

    const result = await response.json();

    return { success: true };

  } catch (error: any) {
    console.error("❌ Error sending booking confirmation email from server:", error);
    return {
      success: false,
      error: error.message || "Failed to send booking confirmation email"
    };
  }
}

/**
 * Send booking confirmation email from client side (backup method)
 * Uses existing email settings and send-receipt-email API
 */
export async function sendBookingConfirmationFromClient(
  confirmationData: BookingConfirmationData
): Promise<{ success: boolean; error?: string }> {
  try {

    // Get email settings from your existing API
    const emailSettings = await getEmailSetting();

    if (!emailSettings) {
      console.error("❌ No email settings found");
      return {
        success: false,
        error: "Email settings not configured. Please configure email settings first."
      };
    }



    // Generate HTML email content
    const htmlContent = generateBookingConfirmationHTML(confirmationData);

    // Use your existing send-receipt-email API
    const response = await fetch('/api/send-receipt-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: confirmationData.parentEmail,
        subject: `🎉 Booking Confirmed - ${confirmationData.eventTitle} | NIBOG`,
        html: htmlContent,
        settings: emailSettings,
        cc: 'newindiababyolympics@gmail.com'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send booking confirmation email from client:', errorData);
      return {
        success: false,
        error: errorData.error || `Failed to send email: ${response.status}`
      };
    }

    const result = await response.json();

    return { success: true };

  } catch (error: any) {
    console.error("❌ Error sending booking confirmation email from client:", error);
    return {
      success: false,
      error: error.message || "Failed to send booking confirmation email"
    };
  }
}

/**
 * Send admin notification email for new bookings
 * Uses existing email settings and send-receipt-email API
 */
export async function sendAdminNotificationEmail(
  confirmationData: BookingConfirmationData
): Promise<{ success: boolean; error?: string }> {
  try {

    // Get email settings from your existing API
    const emailSettings = await getEmailSetting();

    if (!emailSettings) {
      console.error("❌ No email settings found for admin notification");
      return {
        success: false,
        error: "Email settings not configured. Please configure email settings first."
      };
    }

    // Generate HTML email content for admin
    const htmlContent = generateAdminNotificationHTML(confirmationData);

    // Use your existing send-receipt-email API
    const response = await fetch('/api/send-receipt-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'newindiababyolympics@gmail.com',
        subject: `🚨 New Booking Alert - ${confirmationData.eventTitle} | Booking #${confirmationData.bookingId}`,
        html: htmlContent,
        settings: emailSettings
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send admin notification email:', errorData);
      return {
        success: false,
        error: errorData.error || `Failed to send admin email: ${response.status}`
      };
    }

    const result = await response.json();

    return { success: true };
  } catch (error: any) {
    console.error("❌ Error sending admin notification email:", error);
    return {
      success: false,
      error: error.message || "Failed to send admin notification email"
    };
  }
}

/**
 * Generate payment failure email HTML template
 */
function generatePaymentFailureHTML(parentName: string, transactionId: string, reason: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Issue - NIBOG</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Payment Issue</h1>
          <p>There was an issue with your payment</p>
        </div>

        <div class="content">
          <p>Dear ${parentName},</p>

          <div class="alert-box">
            <strong>Payment Status:</strong> ${reason}
            <br><strong>Transaction ID:</strong> ${transactionId}
          </div>

          <p>We encountered an issue while processing your payment for the NIBOG event registration.</p>

          <p><strong>What you can do:</strong></p>
          <ul>
            <li>Try registering again with a different payment method</li>
            <li>Check if the amount was deducted from your account</li>
            <li>Contact our support team if money was deducted</li>
            <li>Wait a few minutes and try again</li>
          </ul>

          <p>If the amount was deducted from your account, please contact our support team immediately with the transaction ID above.</p>

          <div class="footer">
            <p>Need help? Contact us at newindiababyolympics@gmail.com</p>
            <p><small>This is an automated email. Please do not reply to this email.</small></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send payment failure notification email
 * Uses existing email settings and send-receipt-email API
 */
export async function sendPaymentFailureNotification(
  parentEmail: string,
  parentName: string,
  transactionId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {

    // Get email settings from your existing API
    const emailSettings = await getEmailSetting();

    if (!emailSettings) {
      console.error("❌ No email settings found");
      return {
        success: false,
        error: "Email settings not configured"
      };
    }

    // Generate HTML email content
    const htmlContent = generatePaymentFailureHTML(
      parentName,
      transactionId,
      reason || 'Payment was not completed successfully'
    );

    // Use your existing send-receipt-email API
    const response = await fetch('/api/send-receipt-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: parentEmail,
        subject: `⚠️ Payment Issue - Transaction ${transactionId} | NIBOG`,
        html: htmlContent,
        settings: emailSettings
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send payment failure notification:', errorData);
      return {
        success: false,
        error: errorData.error || `Failed to send email: ${response.status}`
      };
    }

    return { success: true };

  } catch (error: any) {
    console.error("❌ Error sending payment failure notification:", error);
    return {
      success: false,
      error: error.message || "Failed to send payment failure notification"
    };
  }
}

/**
 * Send booking reminder email using existing email infrastructure
 * Can be used for event reminders or follow-ups
 */
export async function sendBookingReminder(
  confirmationData: BookingConfirmationData,
  reminderType: 'event_reminder' | 'payment_pending' = 'event_reminder'
): Promise<{ success: boolean; error?: string }> {
  try {

    // Get email settings from your existing API
    const emailSettings = await getEmailSetting();

    if (!emailSettings) {
      console.error("❌ No email settings found");
      return {
        success: false,
        error: "Email settings not configured"
      };
    }

    // Generate reminder email content
    const subject = reminderType === 'event_reminder'
      ? `🎉 Event Reminder - ${confirmationData.eventTitle} | NIBOG`
      : `⏰ Payment Pending - ${confirmationData.eventTitle} | NIBOG`;

    const htmlContent = reminderType === 'event_reminder'
      ? generateEventReminderHTML(confirmationData)
      : generatePaymentPendingHTML(confirmationData);

    // Use your existing send-receipt-email API
    const response = await fetch('/api/send-receipt-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: confirmationData.parentEmail,
        subject: subject,
        html: htmlContent,
        settings: emailSettings,
        cc: 'newindiababyolympics@gmail.com'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send booking reminder:', errorData);
      return {
        success: false,
        error: errorData.error || `Failed to send email: ${response.status}`
      };
    }

    return { success: true };

  } catch (error: any) {
    console.error("❌ Error sending booking reminder:", error);
    return {
      success: false,
      error: error.message || "Failed to send booking reminder"
    };
  }
}

/**
 * Generate event reminder email HTML template
 */
function generateEventReminderHTML(confirmationData: BookingConfirmationData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Event Reminder - NIBOG</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .reminder-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Event Reminder</h1>
          <p>Your NIBOG event is coming up!</p>
        </div>

        <div class="content">
          <p>Dear ${confirmationData.parentName},</p>

          <div class="reminder-box">
            <strong>Event:</strong> ${confirmationData.eventTitle}<br>
            <strong>Date:</strong> ${confirmationData.eventDate}<br>
            <strong>Venue:</strong> ${confirmationData.eventVenue}<br>
            <strong>Child:</strong> ${confirmationData.childName}<br>
            <strong>Booking ID:</strong> #${confirmationData.bookingId}
          </div>

          <p>We're excited to see you and ${confirmationData.childName} at the event!</p>

          <p><strong>Important Reminders:</strong></p>
          <ul>
            <li>Please arrive 15 minutes before the event start time</li>
            <li>Bring a copy of your booking confirmation</li>
            <li>Ensure your child is well-rested and ready for fun!</li>
            <li>Contact us if you have any questions</li>
          </ul>

          <div class="footer">
            <p>See you soon!</p>
            <p>NIBOG Team</p>
            <p>For any queries, contact us at newindiababyolympics@gmail.com</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate payment pending email HTML template
 */
function generatePaymentPendingHTML(confirmationData: BookingConfirmationData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Pending - NIBOG</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ffc107; color: #212529; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .pending-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Payment Pending</h1>
          <p>Complete your booking payment</p>
        </div>

        <div class="content">
          <p>Dear ${confirmationData.parentName},</p>

          <div class="pending-box">
            <strong>Event:</strong> ${confirmationData.eventTitle}<br>
            <strong>Child:</strong> ${confirmationData.childName}<br>
            <strong>Amount:</strong> ₹${confirmationData.totalAmount}<br>
            <strong>Booking ID:</strong> #${confirmationData.bookingId}
          </div>

          <p>Your booking is almost complete! Please complete the payment to confirm your registration.</p>

          <p>If you've already made the payment, please ignore this email. If you're facing any issues, please contact our support team.</p>

          <div class="footer">
            <p>Need help? Contact us at newindiababyolympics@gmail.com</p>
            <p>NIBOG Team</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
