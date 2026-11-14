import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PhonePeVerificationError, verifyPhonePeAndFinalize } from '@/lib/payments/phonepeVerification';

export const dynamic = 'force-dynamic';

const statusRequestSchema = z.object({ transactionId: z.string().min(1) }).strict();

export async function POST(request: Request) {
  const parsedRequest = statusRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsedRequest.success) {
    return NextResponse.json({ success: false, error: 'A valid transactionId is required' }, { status: 400 });
  }

  try {
    const result = await verifyPhonePeAndFinalize(parsedRequest.data.transactionId);
    if (result.bookingId && result.bookingRef && result.paymentId) {
      return NextResponse.json({
        ...result.payload,
        bookingCreated: true,
        paymentCreated: true,
        bookingId: result.bookingId,
        booking_ref: result.bookingRef,
        paymentId: result.paymentId,
        confirmationTransition: result.confirmationTransition,
        bookingData: { booking_ref: result.bookingRef },
      });
    }
    return NextResponse.json(result.payload);
  } catch (error) {
    if (error instanceof PhonePeVerificationError) {
      return NextResponse.json({ success: false, error: error.message, code: error.code }, { status: error.status });
    }
    console.error('PhonePe status processing failed:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ success: false, error: 'Payment status verification is temporarily unavailable' }, { status: 503 });
  }
}
