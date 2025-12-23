import { NextResponse } from 'next/server';
import { createManualPayment, ManualPaymentData } from '@/services/paymentService';

export async function POST(request: Request) {
  try {

    // Parse the request body
    const paymentData: ManualPaymentData = await request.json();

    // Validate required fields
    const requiredFields = ['booking_id', 'amount', 'payment_method', 'payment_status'];
    for (const field of requiredFields) {
      if (!paymentData[field as keyof ManualPaymentData]) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Missing required field: ${field}` 
          },
          { status: 400 }
        );
      }
    }

    // Validate payment status
    if (!['successful', 'pending', 'failed'].includes(paymentData.payment_status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid payment status. Must be: successful, pending, or failed' 
        },
        { status: 400 }
      );
    }

    // Create manual payment record
    const result = await createManualPayment(paymentData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        payment_id: result.payment_id,
        message: result.message
      });
    } else {
      console.error(`❌ Manual payment API: Failed to create payment for booking ${paymentData.booking_id}: ${result.error}`);
      return NextResponse.json({
        success: false,
        error: result.error,
        message: result.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Manual payment API: Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to create manual payment record'
    }, { status: 500 });
  }
}
