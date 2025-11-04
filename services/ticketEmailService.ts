/**
 * Ticket Email Service
 * Handles sending ticket details with QR codes to parents after booking confirmation
 */

import { TicketDetails } from './bookingService';
import QRCode from 'qrcode';

export interface TicketEmailData {
  bookingId: number;
  bookingRef: string;
  parentName: string;
  parentEmail: string;
  childName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  eventCity?: string;
  ticketDetails: TicketDetails[];
  qrCodeData: string;
}

/**
 * Send ticket email to parent with QR code and ticket details
 * 
 * @param ticketData The ticket data for generating and sending email
 * @returns Object with success status and optional error message
 */
export async function sendTicketEmail(ticketData: TicketEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🎫 Starting ticket email process for booking ID: ${ticketData.bookingId}`);
    console.log(`🎫 Recipient: ${ticketData.parentEmail}`);

    // Get email settings by calling the API function directly (same as booking email service)
    const { GET: getEmailSettings } = await import('@/app/api/emailsetting/get/route');
    const emailSettingsResponse = await getEmailSettings();

    if (!emailSettingsResponse.ok) {
      console.error('🎫 Failed to get email settings');
      return {
        success: false,
        error: "Email settings not configured"
      };
    }

    const emailSettings = await emailSettingsResponse.json();
    if (!emailSettings || emailSettings.length === 0) {
      console.error('🎫 No email settings found');
      return {
        success: false,
        error: "No email settings found"
      };
    }

    const settings = emailSettings[0];
    console.log('🎫 Email settings retrieved successfully');

    // Generate ticket HTML content
    const htmlContent = await generateTicketHTML(ticketData);
    console.log(`🎫 HTML content generated successfully`);

    // Generate QR code as buffer for attachment
    console.log('🎫 Generating QR code buffer for data:', ticketData.qrCodeData);
    const qrCodeBuffer = await generateQRCodeBuffer(ticketData.qrCodeData);
    console.log('🎫 QR code buffer generated successfully, size:', qrCodeBuffer.length, 'bytes');

    // Validate QR code buffer
    if (!qrCodeBuffer || qrCodeBuffer.length === 0) {
      throw new Error('QR code buffer generation failed - buffer is empty');
    }

    // Debug: Log ticket details being sent to API
    console.log('🎫 Ticket details summary:', {
      bookingId: ticketData.bookingId,
      bookingRef: ticketData.bookingRef,
      childName: ticketData.childName,
      eventTitle: ticketData.eventTitle,
      ticketsCount: ticketData.ticketDetails?.length || 0
    });

    // Get the app URL from the same helper used in PhonePe config
    const { getAppUrl } = await import('@/config/phonepe');
    const appUrl = getAppUrl();
    
    // Prepare the email payload once
    const emailPayload = {
      to: ticketData.parentEmail,
      subject: `🎫 Your Tickets - ${ticketData.eventTitle} | NIBOG`,
      html: htmlContent,
      settings: settings,
      qrCodeBuffer: Array.from(qrCodeBuffer),
      bookingRef: ticketData.bookingRef,
      ticketDetails: ticketData.ticketDetails
    };
    
    // Log all URL options we'll try for sending email
    console.log('🎫 Environment details:', {
      appUrl,
      nodeEnv: process.env.NODE_ENV,
      vercelUrl: process.env.VERCEL_URL || 'not set',
      vercelEnv: process.env.VERCEL_ENV || 'not set',
      baseUrl: typeof window !== 'undefined' ? window.location.origin : 'server-side'
    });
    
    // Create a list of URLs to try in order
    const apiUrls = [];
    
    // 1. Try using the dynamic app URL first (from getAppUrl)
    if (appUrl) apiUrls.push(appUrl);
    
    // 2. Use absolute URL with current hostname if in browser
    if (typeof window !== 'undefined') {
      apiUrls.push(window.location.origin);
    }
    
    // 3. Use VERCEL_URL if available (for Vercel deployments)
    if (process.env.VERCEL_URL) {
      apiUrls.push(`https://${process.env.VERCEL_URL}`);
    }
    
    // 4. Add common fallbacks
    if (process.env.NODE_ENV === 'production') {
      apiUrls.push('https://www.nibog.in');
    } else {
      // Local development fallbacks
      apiUrls.push('http://localhost:3111');
    }
    
    // Remove duplicates from the URL list
    const uniqueApiUrls = [...new Set(apiUrls)];
    console.log('🎫 Will try these base URLs in order:', uniqueApiUrls);
    
    // Try each URL in sequence until one works
    let succeeded = false;
    let lastError = null;
    let lastResponse = null;
    
    for (let i = 0; i < uniqueApiUrls.length; i++) {
      const baseUrl = uniqueApiUrls[i];
      const fullApiUrl = `${baseUrl}/api/send-ticket-email-with-attachment`;
      
      try {
        console.log(`🎫 [ATTEMPT ${i+1}] Trying: ${fullApiUrl}`);
        
        const response = await fetch(fullApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailPayload),
        });
        
        lastResponse = response;
        console.log(`🎫 [ATTEMPT ${i+1}] Response status:`, response.status);
        
        let responseData;
        try {
          responseData = await response.json();
          console.log(`🎫 [ATTEMPT ${i+1}] Response data:`, responseData);
        } catch (parseError) {
          console.error(`🎫 [ATTEMPT ${i+1}] Could not parse JSON response:`, parseError);
          responseData = { error: 'Could not parse response' };
        }
        
        if (response.ok) {
          console.log(`🎫 Success! Email sent via ${fullApiUrl}`);
          succeeded = true;
          break; // Exit the loop on success
        } else {
          lastError = responseData.error || `Failed with status ${response.status}`;
        }
      } catch (error) {
        console.error(`🎫 [ATTEMPT ${i+1}] Network error:`, error);
        lastError = error instanceof Error ? error.message : 'Network error';
      }
      
      console.log(`🎫 [ATTEMPT ${i+1}] Failed, trying next URL if available...`);
    }
    
    // Return final result
    if (succeeded) {
      console.log(`🎫 Ticket email sent successfully to ${ticketData.parentEmail}`);
      return { success: true };
    } else {
      console.error('🎫 All attempts failed to send ticket email');
      return {
        success: false,
        error: lastError || 'Failed to send ticket email after multiple attempts'
      };
    }
  } catch (error) {
    console.error(`🎫 Unhandled error in sendTicketEmail:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Generate HTML content for ticket email with QR code
 */
async function generateTicketHTML(ticketData: TicketEmailData): Promise<string> {
  // Use placeholder for QR code that will be replaced with CID reference for attachment
  console.log('🎫 Generating ticket HTML with QR code placeholder');
  const qrCodePlaceholder = 'data:image/png;base64,placeholder';
  
  // Generate ticket details HTML
  const ticketDetailsHtml = ticketData.ticketDetails.map((ticket, index) => {
    // Determine the game/slot name with proper fallbacks
    const gameName = ticket.custom_title || ticket.slot_title || ticket.game_name || `Game ${ticket.booking_game_id || ticket.game_id || index + 1}`;

    // Determine the price with proper fallbacks
    const gamePrice = Number(ticket.custom_price || ticket.slot_price || ticket.game_price || 0).toFixed(2);

    return `
    <div style="background: white; border: 2px dashed #007bff; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
        <div style="flex: 1;">
          <h3 style="margin: 0 0 10px 0; color: #007bff; font-size: 18px; font-weight: bold;">
            🎮 ${gameName}
          </h3>
          ${ticket.custom_description || ticket.slot_description ? `<p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${ticket.custom_description || ticket.slot_description}</p>` : ''}
          ${ticket.start_time && ticket.end_time ? `
            <p style="margin: 0 0 5px 0; color: #28a745; font-weight: bold;">
              ⏰ ${ticket.start_time} - ${ticket.end_time}
            </p>
          ` : ''}
          ${ticket.max_participants ? `
            <p style="margin: 0 0 5px 0; color: #6c757d; font-size: 14px;">
              👥 Max ${ticket.max_participants} participants
            </p>
          ` : ''}
          <p style="margin: 0; color: #28a745; font-weight: bold; font-size: 16px;">
            💰 ₹${gamePrice}
          </p>
        </div>
        <div style="text-align: center; margin-left: 20px;">
          <div style="background: white; padding: 10px; border: 1px solid #ddd; border-radius: 8px; display: inline-block;">
            <img src="${qrCodePlaceholder}" width="200" height="200" alt="QR Code for ${ticketData.bookingRef}" style="display: block; max-width: 200px; max-height: 200px; border: none;" />
          </div>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #666; font-weight: bold;">📱 Scan this QR code at the venue</p>
          <p style="margin: 4px 0 0 0; font-size: 10px; color: #999;">Booking: ${ticketData.bookingRef}</p>
          <p style="margin: 2px 0 0 0; font-size: 11px; font-weight: bold; color: #007bff; font-family: monospace;">
            ${ticketData.bookingRef}
          </p>
        </div>
      </div>

      <div style="border-top: 1px dashed #ddd; padding-top: 15px; margin-top: 15px;">
        <div style="display: flex; justify-content: space-between; font-size: 14px;">
          <div>
            <strong>Child:</strong> ${ticketData.childName}<br>
            <strong>Booking ID:</strong> #${ticketData.bookingId}
          </div>
          <div style="text-align: right;">
            <strong>Event:</strong> ${ticketData.eventTitle}<br>
            <strong>Date:</strong> ${ticketData.eventDate}
          </div>
        </div>
      </div>
    </div>
    `
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Tickets - NIBOG</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">🎫 Your Event Tickets</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Ready for your NIBOG experience!</p>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
    <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #007bff;">
      <h2 style="margin: 0 0 15px 0; color: #0056b3; font-size: 20px;">Event Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 30%;">Parent:</td>
          <td style="padding: 8px 0;">${ticketData.parentName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Child:</td>
          <td style="padding: 8px 0;">${ticketData.childName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Event:</td>
          <td style="padding: 8px 0;">${ticketData.eventTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Date:</td>
          <td style="padding: 8px 0;">${ticketData.eventDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Venue:</td>
          <td style="padding: 8px 0;">${ticketData.eventVenue}${ticketData.eventCity ? `, ${ticketData.eventCity}` : ''}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Booking Ref:</td>
          <td style="padding: 8px 0; font-family: monospace; font-weight: bold; color: #007bff;">${ticketData.bookingRef}</td>
        </tr>
      </table>
    </div>

    <div style="margin-bottom: 25px;">
      <h3 style="margin: 0 0 20px 0; color: #0056b3; font-size: 18px;">🎟️ Your Tickets</h3>
      ${ticketDetailsHtml}
    </div>

    <div style="background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
      <h4 style="margin: 0 0 10px 0; color: #0c5460;">📱 Important Instructions:</h4>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Show this email, the attached PDF ticket, or scan the QR code at the venue entrance</li>
        <li>Download and save the PDF ticket attachment for easy access</li>
        <li>Arrive 15 minutes before your scheduled game time</li>
        <li>Keep your booking reference handy: <strong>${ticketData.bookingRef}</strong></li>
        <li>Contact support if you have any questions</li>
      </ul>
    </div>

    <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
      <h4 style="margin: 0 0 10px 0; color: #155724;">📎 PDF Ticket Attached!</h4>
      <p style="margin: 0;">
        <strong>Your printable ticket is attached as a PDF file.</strong><br>
        You can download, save, or print this PDF for easy access at the venue.
      </p>
    </div>

    <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
      <strong>✅ Tickets Confirmed!</strong><br>
      Your tickets are ready. We can't wait to see you at the event!
    </div>

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="margin: 0; color: #666; font-size: 14px;">
        If you have any questions, please contact us at newindiababyolympics@gmail.com
      </p>
      <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
        Have an amazing time at NIBOG! 🎮🎉
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generate QR Code as buffer for email attachment
 */
async function generateQRCodeBuffer(data: string): Promise<Buffer> {
  try {
    console.log('🎫 Generating QR code buffer for data:', data);

    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      console.log('🎫 Browser environment detected, using data URL approach');

      // In browser, generate as data URL first, then convert to buffer
      const qrCodeDataURL = await QRCode.toDataURL(data, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      // Convert data URL to buffer
      const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      console.log('🎫 QR code buffer generated successfully from data URL, size:', buffer.length);
      return buffer;
    } else {
      // In Node.js environment, use toBuffer directly
      console.log('🎫 Node.js environment detected, using toBuffer');
      const qrCodeBuffer = await QRCode.toBuffer(data, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      console.log('🎫 QR code buffer generated successfully, size:', qrCodeBuffer.length);
      return qrCodeBuffer;
    }
  } catch (error) {
    console.error('🎫 Error generating QR code buffer:', error);
    console.error('🎫 QR code error details:', error instanceof Error ? error.message : error);
    console.error('🎫 QR code data that failed:', data);

    // Try with simpler data as fallback
    try {
      console.log('🎫 Attempting QR code buffer generation with simpler data...');
      const simpleData = `NIBOG-${Date.now()}`;

      if (typeof window !== 'undefined') {
        // Browser fallback
        const fallbackDataURL = await QRCode.toDataURL(simpleData, {
          width: 200,
          margin: 2,
          errorCorrectionLevel: 'L'
        });
        const base64Data = fallbackDataURL.replace(/^data:image\/png;base64,/, '');
        const fallbackBuffer = Buffer.from(base64Data, 'base64');
        console.log('🎫 Fallback QR code buffer generated successfully (browser)');
        return fallbackBuffer;
      } else {
        // Node.js fallback
        const fallbackBuffer = await QRCode.toBuffer(simpleData, {
          width: 200,
          margin: 2,
          errorCorrectionLevel: 'L'
        });
        console.log('🎫 Fallback QR code buffer generated successfully (Node.js)');
        return fallbackBuffer;
      }
    } catch (fallbackError) {
      console.error('🎫 Fallback QR code buffer also failed:', fallbackError);

      // Create a minimal PNG buffer as final fallback
      const fallbackPng = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
        0x00, 0x00, 0x00, 0xC8, 0x00, 0x00, 0x00, 0xC8, // 200x200 dimensions
        0x08, 0x02, 0x00, 0x00, 0x00, 0x4C, 0x8D, 0x87, 0x29 // rest of minimal PNG
      ]);
      console.log('🎫 Using minimal PNG buffer as final fallback');
      return fallbackPng;
    }
  }
}

/**
 * Generate QR Code as base64 data URL using the qrcode library (legacy function)
 */
async function generateQRCodeDataURL(data: string): Promise<string> {
  try {
    console.log('🎫 Generating QR code for data:', data);
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
    console.log('🎫 QR code generated successfully, length:', qrCodeDataURL.length);
    console.log('🎫 QR code starts with:', qrCodeDataURL.substring(0, 50));
    return qrCodeDataURL;
  } catch (error) {
    console.error('🎫 Error generating QR code:', error);
    console.error('🎫 QR code error details:', error instanceof Error ? error.message : error);
    console.error('🎫 QR code data that failed:', data);

    // Try with simpler data as fallback
    try {
      console.log('🎫 Attempting QR code generation with simpler data...');
      const simpleData = `NIBOG-${Date.now()}`;
      const fallbackQR = await QRCode.toDataURL(simpleData, {
        width: 200,
        margin: 2,
        errorCorrectionLevel: 'L'
      });
      console.log('🎫 Fallback QR code generated successfully');
      return fallbackQR;
    } catch (fallbackError) {
      console.error('🎫 Fallback QR code also failed:', fallbackError);

      // Final fallback to SVG placeholder
      const fallbackSvg = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white" stroke="#ddd" stroke-width="2"/>
          <rect x="20" y="20" width="160" height="160" fill="none" stroke="#333" stroke-width="2"/>
          <text x="100" y="95" text-anchor="middle" font-size="16" fill="#333">QR CODE</text>
          <text x="100" y="115" text-anchor="middle" font-size="12" fill="#666">PLACEHOLDER</text>
        </svg>`;
      const fallbackDataURL = 'data:image/svg+xml;base64,' + Buffer.from(fallbackSvg).toString('base64');
      console.log('🎫 Using SVG fallback QR code placeholder');
      return fallbackDataURL;
    }
  }
}
