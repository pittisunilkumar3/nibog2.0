/**
 * WhatsApp notification service for booking confirmations
 * Integrates with Zaptra WhatsApp platform via API
 */

import {
  getWhatsAppSettings,
  logWhatsAppEvent,
  safeWhatsAppCall,
  WhatsAppSettings
} from './whatsappConfigService';

export interface WhatsAppBookingData {
  bookingId: number;
  bookingRef?: string;
  parentName: string;
  parentPhone: string; // Customer's WhatsApp number
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

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  zaptraResponse?: any;
  deliveryStatus?: string;
}

/**
 * Validates WhatsApp booking data to prevent parameter mismatch errors
 * @param bookingData - The booking data to validate
 * @returns Validation result with any issues found
 */
export function validateWhatsAppBookingData(bookingData: WhatsAppBookingData): {
  isValid: boolean;
  issues: string[];
  warnings: string[];
} {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  const requiredFields = [
    'bookingId', 'parentName', 'parentPhone',
    'childName', 'eventTitle', 'eventDate', 'eventVenue',
    'totalAmount', 'paymentMethod', 'transactionId'
  ];

  for (const field of requiredFields) {
    const value = bookingData[field as keyof WhatsAppBookingData];
    if (value === undefined || value === null) {
      issues.push(`Required field '${field}' is undefined or null`);
    } else if (typeof value === 'string' && value.trim() === '') {
      warnings.push(`Field '${field}' is empty string - will use fallback value`);
    }
  }

  // Check phone number format
  if (bookingData.parentPhone && !bookingData.parentPhone.startsWith('+')) {
    warnings.push('Phone number should start with + for international format');
  }

  // Check data types
  if (typeof bookingData.bookingId !== 'number') {
    issues.push('bookingId must be a number');
  }
  if (typeof bookingData.totalAmount !== 'number') {
    issues.push('totalAmount must be a number');
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings
  };
}

/**
 * Validate and format phone number for WhatsApp
 */
function formatPhoneNumber(phone: string): string | null {
  if (!phone) return null;
  
  // Remove all non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Handle Indian numbers
  if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
    return `+${cleanPhone}`;
  } else if (cleanPhone.length === 10) {
    return `+91${cleanPhone}`;
  } else if (cleanPhone.startsWith('+')) {
    return phone; // Already formatted
  }
  
  // For other international numbers, assume they're correctly formatted
  if (cleanPhone.length >= 10) {
    return `+${cleanPhone}`;
  }
  
  return null;
}

/**
 * Generate WhatsApp message content for booking confirmation
 */
function generateWhatsAppMessage(bookingData: WhatsAppBookingData): string {
  const gamesList = bookingData.gameDetails
    .map(game => `• ${game.gameName} - ${game.gameTime} - ₹${game.gamePrice}`)
    .join('\n');

  const addOnsList = bookingData.addOns && bookingData.addOns.length > 0
    ? '\n\n*Add-ons:*\n' + bookingData.addOns
        .map(addon => `• ${addon.name} (Qty: ${addon.quantity}) - ₹${addon.price}`)
        .join('\n')
    : '';

  const bookingRef = bookingData.bookingRef || `B${String(bookingData.bookingId).padStart(7, '0')}`;

  return `🎉 *Booking Confirmed!*

Hi ${bookingData.parentName},

Your booking has been confirmed:

📅 *Event:* ${bookingData.eventTitle}
🗓️ *Date:* ${bookingData.eventDate}
📍 *Venue:* ${bookingData.eventVenue}
👶 *Child:* ${bookingData.childName}
🎫 *Booking ID:* ${bookingRef}

*Games Booked:*
${gamesList}${addOnsList}

💰 *Total Amount:* ₹${bookingData.totalAmount}
💳 *Payment:* ${bookingData.paymentMethod}
🔗 *Transaction ID:* ${bookingData.transactionId}

Thank you for choosing NIBOG! 🎈

_Powered by Zaptra_ 📱`;
}

/**
 * Send WhatsApp message via Zaptra API with safety measures
 * Supports both template messages and text messages
 */
async function sendWhatsAppMessageSafe(
  phone: string,
  messageData: string | { templateName: string; templateData: any },
  settings: ReturnType<typeof getWhatsAppSettings>
): Promise<WhatsAppResponse> {
  try {
    console.log(`📱 Sending WhatsApp message to: ${phone}`);

    // Determine if using template or text message
    const isTemplate = typeof messageData === 'object';
    const endpoint = isTemplate ? '/sendtemplatemessage' : '/sendmessage';

    console.log(`📱 Using Zaptra API: ${settings.apiUrl}${endpoint}`);

    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), settings.timeoutMs);

    // Prepare request body based on message type
    const requestBody = isTemplate
      ? {
          token: settings.apiToken,
          phone: phone,
          template_name: messageData.templateName,
          template_language: 'en_US', // Correct language for booking_confirmation_nibog template
          components: [
            {
              type: "body",
              parameters: messageData.templateData.map((text: string) => ({
                type: "text",
                text: text
              }))
            }
          ]
        }
      : {
          token: settings.apiToken,
          phone: phone,
          message: messageData
        };

    console.log(`📱 Sending request to: ${settings.apiUrl}${endpoint}`);
    console.log(`📱 Request body:`, JSON.stringify(requestBody, null, 2));

    // Additional debugging for template requests
    if (isTemplate && 'components' in requestBody && requestBody.components) {
      console.log('📱 Template debugging:');
      console.log(`  Template name: ${requestBody.template_name}`);
      console.log(`  Template language: ${requestBody.template_language}`);
      const templateParams = requestBody.components[0].parameters;
      console.log(`  Template parameters count: ${templateParams.length}`);
      console.log('  Template parameters contents:');
      templateParams.forEach((param: any, index: number) => {
        console.log(`    [${index}]: "${param.text}" (${typeof param.text})`);
      });

      if (templateParams.length !== 8) {
        console.error('🚨 CRITICAL: Template parameters count is not 8!');
        console.error(`Expected: 8, Got: ${templateParams.length}`);
        console.error('This will cause Zaptra error #132000');
      }
    }

    const response = await fetch(`${settings.apiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(`📱 Response status: ${response.status}`);
    const responseData = await response.json();
    console.log(`📱 Zaptra API response:`, JSON.stringify(responseData, null, 2));

    // Enhanced response handling with message_wamid analysis
    if (response.ok && responseData.status === 'success') {
      console.log(`✅ WhatsApp message sent successfully - Message ID: ${responseData.message_id}`);

      // Analyze message_wamid for delivery insights
      if (responseData.message_wamid) {
        console.log(`📱 WhatsApp Message WAMID: ${responseData.message_wamid} (Message delivered to WhatsApp servers)`);
      } else {
        console.log(`⚠️ WhatsApp Message WAMID is null - Message queued but may not be delivered yet`);
        console.log(`📋 This can happen when:`);
        console.log(`   - Phone number is not opted-in to WhatsApp Business`);
        console.log(`   - Template message has issues`);
        console.log(`   - Message is still being processed by WhatsApp servers`);
        console.log(`   - Phone number format is incorrect`);
      }

      return {
        success: true,
        messageId: responseData.message_id || 'unknown',
        zaptraResponse: responseData,
        deliveryStatus: responseData.message_wamid ? 'delivered_to_whatsapp' : 'queued_pending_delivery'
      };
    } else {
      console.error(`❌ WhatsApp message failed - Status: ${response.status}, Response:`, responseData);
      return {
        success: false,
        error: responseData.message || responseData.error || `API returned status: ${response.status}`,
        zaptraResponse: responseData
      };
    }
  } catch (error) {
    console.error('📱 Error sending WhatsApp message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get available WhatsApp templates from Zaptra
 */
export async function getWhatsAppTemplates(): Promise<{
  success: boolean;
  templates?: any[];
  error?: string;
}> {
  try {
    const settings = getWhatsAppSettings();

    if (!settings.enabled || !settings.apiToken) {
      return {
        success: false,
        error: 'WhatsApp not configured'
      };
    }

    const response = await fetch(`${settings.apiUrl}/getTemplates?token=${settings.apiToken}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const responseData = await response.json();

    if (response.ok) {
      return {
        success: true,
        templates: responseData.templates || responseData
      };
    } else {
      return {
        success: false,
        error: responseData.message || 'Failed to get templates'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Main function to send booking confirmation via WhatsApp
 */
export async function sendBookingConfirmationWhatsApp(
  bookingData: WhatsAppBookingData
): Promise<WhatsAppResponse> {
  const startTime = Date.now();

  try {
    logWhatsAppEvent('attempt', {
      bookingId: bookingData.bookingId,
      phone: bookingData.parentPhone
    });

    console.log('📱 Starting WhatsApp booking confirmation...');
    console.log(`📱 Booking ID: ${bookingData.bookingId}`);
    console.log(`📱 Customer: ${bookingData.parentName}`);
    console.log(`📱 Phone: ${bookingData.parentPhone}`);

    // Validate booking data to prevent parameter mismatch errors
    const validation = validateWhatsAppBookingData(bookingData);

    if (!validation.isValid) {
      console.error('🚨 WhatsApp booking data validation failed!');
      console.error('🚨 Issues found:', validation.issues);
      logWhatsAppEvent('failure', {
        bookingId: bookingData.bookingId,
        error: `Validation failed: ${validation.issues.join(', ')}`
      });
      return {
        success: false,
        error: `Data validation failed: ${validation.issues.join(', ')}`
      };
    }

    if (validation.warnings.length > 0) {
      console.warn('⚠️ WhatsApp booking data warnings:', validation.warnings);
    }

    // Get configuration with safety checks
    const settings = getWhatsAppSettings();

    // Check if WhatsApp notifications are enabled
    if (!settings.enabled) {
      logWhatsAppEvent('disabled', { bookingId: bookingData.bookingId });
      console.log('📱 WhatsApp notifications are disabled');
      return {
        success: false,
        error: 'WhatsApp notifications are disabled'
      };
    }

    // Validate API token
    if (!settings.apiToken) {
      logWhatsAppEvent('config_error', {
        bookingId: bookingData.bookingId,
        error: 'API token not configured'
      });
      console.error('📱 Zaptra API token not configured');
      return {
        success: false,
        error: 'Zaptra API token not configured'
      };
    }

    // Enhanced phone number formatting and validation
    console.log(`📱 Original phone number: ${bookingData.parentPhone}`);
    const formattedPhone = formatPhoneNumber(bookingData.parentPhone);
    console.log(`📱 Formatted phone number: ${formattedPhone}`);

    // Enhanced phone number validation with detailed feedback
    if (!formattedPhone) {
      console.error(`📱 Invalid phone number format: ${bookingData.parentPhone}`);
      console.error('📱 Phone number requirements:');
      console.error('   - Must include country code (e.g., +91 for India)');
      console.error('   - Must be 10-15 digits after country code');
      console.error('   - Examples: +916303727148, +919876543210');
      console.error('📱 This may cause message_wamid to be null in response');

      logWhatsAppEvent('failure', {
        bookingId: bookingData.bookingId,
        phone: bookingData.parentPhone,
        error: 'Invalid phone number format'
      });

      return {
        success: false,
        error: `Invalid phone number format: ${bookingData.parentPhone}. Please include country code (e.g., +91 for India)`
      };
    }

    // Additional phone number quality checks for better WhatsApp delivery
    const phoneDigits = formattedPhone.replace(/[^0-9]/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      console.error('📱 Phone number length invalid:', {
        phone: formattedPhone,
        digitCount: phoneDigits.length,
        expected: '10-15 digits'
      });
      console.error('📱 This may cause message_wamid to be null in response');

      return {
        success: false,
        error: `Phone number must be 10-15 digits long. Got ${phoneDigits.length} digits.`
      };
    }

    console.log('✅ Phone number validation passed:', {
      original: bookingData.parentPhone,
      formatted: formattedPhone,
      digitCount: phoneDigits.length
    });

    // Try to use template first, fallback to text message
    let messageData: string | { templateName: string; templateData: any };

    // Check if we should use templates (you can configure this)
    const useTemplates = process.env.WHATSAPP_USE_TEMPLATES === 'true';

    if (useTemplates) {
      // Use Zaptra template with WhatsApp Business API components format
      // Based on the template structure you created in demo.zaptra.in
      const bookingRef = bookingData.bookingRef || `B${String(bookingData.bookingId).padStart(7, '0')}`;

      // Validate and sanitize template data to prevent parameter mismatch errors
      const templateData = [
        bookingData.parentName || 'Customer',                    // {{1}} - customer_name
        bookingData.eventTitle || 'NIBOG Event',                 // {{2}} - event_title
        bookingData.eventDate || new Date().toLocaleDateString(), // {{3}} - event_date
        bookingData.eventVenue || 'Event Venue',                 // {{4}} - venue_name
        bookingData.childName || 'Child',                        // {{5}} - child_name
        bookingRef || 'N/A',                                     // {{6}} - booking_ref
        `${bookingData.totalAmount || 0}`,                       // {{7}} - total_amount (no currency symbol)
        bookingData.paymentMethod || 'Payment'                   // {{8}} - payment_method
      ];

      // Ensure all parameters are strings and not null/undefined
      const sanitizedTemplateData = templateData.map(param =>
        param !== null && param !== undefined ? String(param) : 'N/A'
      );

      console.log('📱 Template data validation:', {
        originalCount: templateData.length,
        sanitizedCount: sanitizedTemplateData.length,
        hasNullUndefined: templateData.some(param => param === null || param === undefined),
        sanitizedData: sanitizedTemplateData
      });

      // Additional debugging for parameter mismatch issues
      console.log('📱 Detailed parameter mapping:');
      sanitizedTemplateData.forEach((param, index) => {
        console.log(`  {{${index + 1}}}: "${param}" (type: ${typeof param}, length: ${param.length})`);
      });

      // Validate parameter count matches template expectation
      if (sanitizedTemplateData.length !== 8) {
        console.error('🚨 PARAMETER COUNT MISMATCH!');
        console.error(`Expected: 8 parameters, Got: ${sanitizedTemplateData.length} parameters`);
        console.error('This will cause Zaptra error #132000');
      }

      messageData = {
        templateName: 'booking_confirmation_nibog', // Template name in Zaptra
        templateData: sanitizedTemplateData
      };

      if (settings.debugMode) {
        console.log('📱 Using template:', messageData);
      }
    } else {
      // Generate text message as fallback
      messageData = generateWhatsAppMessage(bookingData);
      if (settings.debugMode) {
        console.log('📱 Generated text message:', messageData);
      }
    }

    // Send WhatsApp message with circuit breaker protection and template fallback
    console.log(`📱 Sending WhatsApp message to: ${formattedPhone}`);
    console.log(`📱 Message type: ${typeof messageData === 'string' ? 'text' : 'template'}`);

    let result = await safeWhatsAppCall(
      () => sendWhatsAppMessageSafe(formattedPhone, messageData, settings),
      settings.fallbackEnabled ? () => Promise.resolve({
        success: false,
        error: 'WhatsApp service unavailable, fallback triggered'
      }) : undefined
    );

    // If template message failed with #132000 error, fallback to text message
    if (!result.success && typeof messageData === 'object' && result.error && result.error.includes('132000')) {
      console.log('🔄 Template failed with #132000 error, falling back to text message...');

      try {
        const textMessage = generateWhatsAppMessage(bookingData);
        console.log('📱 Generated fallback text message (first 100 chars):', textMessage.substring(0, 100) + '...');

        result = await safeWhatsAppCall(
          () => sendWhatsAppMessageSafe(formattedPhone, textMessage, settings),
          settings.fallbackEnabled ? () => Promise.resolve({
            success: false,
            error: 'WhatsApp service unavailable, text fallback triggered'
          }) : undefined
        );

        if (result.success) {
          console.log('✅ Text message fallback successful after template failure');
        }
      } catch (fallbackError) {
        console.error('❌ Text message fallback also failed:', fallbackError);
      }
    }

    console.log(`📱 WhatsApp send result:`, result);

    const duration = Date.now() - startTime;

    if (result.success) {
      logWhatsAppEvent('success', {
        bookingId: bookingData.bookingId,
        phone: formattedPhone,
        messageId: result.messageId,
        duration
      });
      console.log(`✅ WhatsApp message sent successfully! Message ID: ${result.messageId}`);
    } else {
      logWhatsAppEvent('failure', {
        bookingId: bookingData.bookingId,
        phone: formattedPhone,
        error: result.error,
        duration
      });
      console.error(`❌ Failed to send WhatsApp message: ${result.error}`);
    }

    return result;

  } catch (error) {
    const duration = Date.now() - startTime;
    logWhatsAppEvent('failure', {
      bookingId: bookingData.bookingId,
      phone: bookingData.parentPhone,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration
    });
    console.error('📱 Error in sendBookingConfirmationWhatsApp:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test function to verify WhatsApp integration
 */
export async function testWhatsAppIntegration(testPhone: string): Promise<WhatsAppResponse> {
  const testData: WhatsAppBookingData = {
    bookingId: 999999,
    bookingRef: 'TEST001',
    parentName: 'Test User',
    parentPhone: testPhone,
    childName: 'Test Child',
    eventTitle: 'Test Event',
    eventDate: new Date().toLocaleDateString(),
    eventVenue: 'Test Venue',
    totalAmount: 100,
    paymentMethod: 'Test',
    transactionId: 'TEST_TXN_001',
    gameDetails: [{
      gameName: 'Test Game',
      gameTime: '10:00 AM',
      gamePrice: 100
    }]
  };

  return sendBookingConfirmationWhatsApp(testData);
}
