import { NextResponse } from 'next/server';
import { testWhatsAppIntegration } from '@/services/whatsappService';

export async function POST(request: Request) {
  try {
    console.log('📱 WhatsApp Test API: Starting test request');

    // Parse the request body
    const { phone } = await request.json();
    
    if (!phone) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Phone number is required' 
        },
        { status: 400 }
      );
    }

    console.log(`📱 WhatsApp Test API: Testing with phone: ${phone}`);

    // Send test WhatsApp message
    const result = await testWhatsAppIntegration(phone);

    if (result.success) {
      console.log(`✅ WhatsApp Test API: Test message sent successfully`);
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'Test WhatsApp message sent successfully'
      });
    } else {
      console.error(`❌ WhatsApp Test API: Test failed: ${result.error}`);
      return NextResponse.json({
        success: false,
        error: result.error,
        zaptraResponse: result.zaptraResponse
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('📱 WhatsApp Test API: Error processing test request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to send test WhatsApp message' 
      },
      { status: 500 }
    );
  }
}
