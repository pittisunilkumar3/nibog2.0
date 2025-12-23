/**
 * Payment Link Email Service
 * Sends payment links to customers via email with professional templates
 */

import { getEmailSetting } from './emailSettingService';

export interface PaymentLinkEmailData {
  parentName: string;
  parentEmail: string;
  childName: string;
  bookingId: number;
  bookingRef: string;
  eventTitle?: string;
  eventDate?: string;
  eventVenue?: string;
  totalAmount: number;
  paymentLink: string;
  expiryHours?: number; // How many hours the link is valid
}

/**
 * Generate payment link email HTML template
 */
function generatePaymentLinkHTML(data: PaymentLinkEmailData): string {
  const expiryText = data.expiryHours ? `This payment link will expire in ${data.expiryHours} hours.` : '';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Complete Your Payment - NIBOG</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .payment-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 15px 30px; 
          text-decoration: none; 
          border-radius: 8px; 
          margin: 20px 0; 
          font-weight: bold;
          text-align: center;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .payment-button:hover { transform: translateY(-2px); }
        .amount { font-size: 24px; font-weight: bold; color: #667eea; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .security-note { background: #e8f5e8; border: 1px solid #c3e6c3; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💳 Complete Your Payment</h1>
          <p>Secure your spot at NIBOG!</p>
        </div>

        <div class="content">
          <p>Dear ${data.parentName},</p>

          <p>Your booking has been created successfully! Please complete the payment to confirm your registration.</p>

          <div class="booking-details">
            <h3>📋 Booking Details</h3>
            <p><strong>Booking ID:</strong> #${data.bookingId}</p>
            <p><strong>Booking Reference:</strong> ${data.bookingRef}</p>
            <p><strong>Child Name:</strong> ${data.childName}</p>
            ${data.eventTitle ? `<p><strong>Event:</strong> ${data.eventTitle}</p>` : ''}
            ${data.eventDate ? `<p><strong>Date:</strong> ${new Date(data.eventDate).toLocaleDateString()}</p>` : ''}
            ${data.eventVenue ? `<p><strong>Venue:</strong> ${data.eventVenue}</p>` : ''}
            <p><strong>Amount to Pay:</strong> <span class="amount">₹${data.totalAmount.toLocaleString()}</span></p>
          </div>

          <div style="text-align: center;">
            <a href="${data.paymentLink}" class="payment-button">
              🔒 Pay Now Securely
            </a>
          </div>

          <div class="security-note">
            <strong>🔐 Secure Payment:</strong> This payment is processed through PhonePe's secure gateway. Your payment information is encrypted and safe.
          </div>

          ${expiryText ? `<div class="warning"><strong>⏰ Important:</strong> ${expiryText}</div>` : ''}

          <p><strong>Payment Instructions:</strong></p>
          <ol>
            <li>Click the "Pay Now Securely" button above</li>
            <li>You'll be redirected to PhonePe's secure payment page</li>
            <li><strong>For Testing:</strong> Look for "Test Payment" or "Simulate Success" buttons instead of entering real payment details</li>
            <li>Choose your preferred payment method (UPI, Card, Net Banking) or use simulator options</li>
            <li>Complete the payment</li>
            <li>You'll receive a confirmation email once payment is successful</li>
          </ol>

          <p><strong>Need Help?</strong></p>
          <ul>
            <li>If you face any payment issues, please try again after a few minutes</li>
            <li>For support, contact us at newindiababyolympics@gmail.com</li>
            <li>Keep this email for your records</li>
          </ul>

          <div class="footer">
            <p>This is an automated email. Please do not reply to this email.</p>
            <p><strong>NIBOG Team</strong></p>
            <p>Making sports accessible for everyone! 🏃‍♂️⚽🏀</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send payment link email to customer
 */
export async function sendPaymentLinkEmail(
  emailData: PaymentLinkEmailData
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
    const htmlContent = generatePaymentLinkHTML(emailData);

    // Use your existing send-receipt-email API
    const response = await fetch('/api/send-receipt-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: emailData.parentEmail,
        subject: `💳 Complete Payment - Booking #${emailData.bookingId} | NIBOG`,
        html: htmlContent,
        settings: emailSettings
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send payment link email:', errorData);
      return {
        success: false,
        error: errorData.error || `Failed to send email: ${response.status}`
      };
    }

    const result = await response.json();
    
    return {
      success: true
    };

  } catch (error) {
    console.error('Error sending payment link email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Generate WhatsApp message text for payment link
 */
export function generateWhatsAppMessage(data: PaymentLinkEmailData): string {
  return `🎉 *NIBOG Booking Confirmation*

Hi ${data.parentName}! 👋

Your booking has been created successfully:

📋 *Booking Details:*
• Booking ID: #${data.bookingId}
• Child: ${data.childName}
${data.eventTitle ? `• Event: ${data.eventTitle}` : ''}
• Amount: ₹${data.totalAmount.toLocaleString()}

💳 *Complete Payment:*
${data.paymentLink}

🔒 Secure payment via PhonePe
⏰ Please complete payment to confirm your spot

Need help? Reply to this message!

*NIBOG Team* 🏃‍♂️⚽🏀`;
}

/**
 * Generate SMS message text for payment link
 */
export function generateSMSMessage(data: PaymentLinkEmailData): string {
  return `NIBOG: Hi ${data.parentName}! Your booking #${data.bookingId} for ${data.childName} is created. Complete payment: ${data.paymentLink} Amount: ₹${data.totalAmount}. Secure PhonePe payment.`;
}
