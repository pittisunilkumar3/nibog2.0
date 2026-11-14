import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { PHONEPE_CONFIG, generateSHA256Hash } from '@/config/phonepe';
import { PhonePeVerificationError, verifyPhonePeAndFinalize } from '@/lib/payments/phonepeVerification';

export const dynamic = 'force-dynamic';

const callbackBodySchema = z.object({
  response: z.string().optional(),
  payload: z.object({ response: z.string() }).optional(),
}).passthrough();

const decodedCallbackSchema = z.object({
  merchantTransactionId: z.string().optional(),
  data: z.object({ merchantTransactionId: z.string().optional() }).passthrough().optional(),
}).passthrough();

function hashesMatch(received: string, expected: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(received)) return false;
  const receivedBuffer = Buffer.from(received, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

export async function POST(request: Request) {
  let rawBody: unknown;
  if (request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
    const form = await request.formData();
    rawBody = { response: form.get('response') };
  } else {
    rawBody = await request.json().catch(() => null);
  }

  const parsedBody = callbackBodySchema.safeParse(rawBody);
  const signedResponse = parsedBody.success ? parsedBody.data.payload?.response || parsedBody.data.response : undefined;
  if (!signedResponse) {
    return NextResponse.json({ error: 'Missing signed response envelope' }, { status: 400 });
  }

  const xVerify = request.headers.get('x-verify');
  const [providedHash, saltIndex, extra] = xVerify?.split('###') || [];
  if (!providedHash || !saltIndex || extra !== undefined || saltIndex !== PHONEPE_CONFIG.SALT_INDEX) {
    return NextResponse.json({ error: 'Invalid X-VERIFY header' }, { status: 400 });
  }

  const expectedHash = await generateSHA256Hash(signedResponse + PHONEPE_CONFIG.SALT_KEY);
  if (!hashesMatch(providedHash, expectedHash)) {
    return NextResponse.json({ error: 'Callback signature verification failed' }, { status: 400 });
  }

  let decodedJson: unknown;
  try {
    decodedJson = JSON.parse(Buffer.from(signedResponse, 'base64').toString('utf8'));
  } catch {
    return NextResponse.json({ error: 'Invalid signed response envelope' }, { status: 400 });
  }
  const decoded = decodedCallbackSchema.safeParse(decodedJson);
  const bookingRef = decoded.success ? decoded.data.data?.merchantTransactionId || decoded.data.merchantTransactionId : undefined;
  if (!bookingRef) {
    return NextResponse.json({ error: 'Signed response has no merchant transaction ID' }, { status: 400 });
  }

  try {
    const result = await verifyPhonePeAndFinalize(bookingRef);
    return NextResponse.json({
      status: result.bookingId ? 'SUCCESS' : result.state,
      bookingId: result.bookingId,
      paymentId: result.paymentId,
      confirmationTransition: result.confirmationTransition,
    });
  } catch (error) {
    if (error instanceof PhonePeVerificationError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    console.error('PhonePe callback processing failed:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Payment confirmation is temporarily unavailable' }, { status: 503 });
  }
}
