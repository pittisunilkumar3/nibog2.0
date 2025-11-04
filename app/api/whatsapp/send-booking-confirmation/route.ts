import { NextResponse } from 'next/server';
import { sendBookingConfirmationWhatsApp, WhatsAppBookingData } from '@/services/whatsappService';

export async function POST(request: Request) {
  try {
    console.log('📱 WhatsApp API route: Starting booking confirmation request');

    // Parse the request body
    const bookingData: WhatsAppBookingData = await request.json();
    console.log(`📱 WhatsApp API route: Received booking data for ID: ${bookingData.bookingId}`);

    // Validate required fields
    const requiredFields = ['bookingId', 'parentName', 'parentPhone', 'childName', 'eventTitle'];
    for (const field of requiredFields) {
      if (!bookingData[field as keyof WhatsAppBookingData]) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Missing required field: ${field}` 
          },
          { status: 400 }
        );
      }
    }

    // Send WhatsApp notification
    const result = await sendBookingConfirmationWhatsApp(bookingData);

    if (result.success) {
      console.log(`✅ WhatsApp API route: Message sent successfully for booking ${bookingData.bookingId}`);
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'WhatsApp notification sent successfully',
        zaptraResponse: result.zaptraResponse // Include Zaptra response for debugging
      });
    } else {
      console.error(`❌ WhatsApp API route: Failed to send message for booking ${bookingData.bookingId}: ${result.error}`);
      return NextResponse.json({
        success: false,
        error: result.error,
        zaptraResponse: result.zaptraResponse
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('📱 WhatsApp API route: Error processing request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to send WhatsApp notification' 
      },
      { status: 500 }
    );
  }
}
