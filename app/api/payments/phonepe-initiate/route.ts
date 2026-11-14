import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  PHONEPE_CONFIG,
  base64Encode,
  generateSHA256Hash,
  validatePhonePeConfig,
} from '@/config/phonepe';

export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:3004';
const initiateRequestSchema = z.object({
  bookingRef: z.string().regex(/^NIBOG_\d+_\d+$/).max(38),
}).strict();

const bookingLookupSchema = z.object({
  success: z.literal(true),
  data: z.object({
    booking_ref: z.string(),
    status: z.string(),
    total_amount: z.union([z.string(), z.number()]),
    payment_method: z.string().nullable().optional(),
    payment_status: z.string(),
    parent: z.object({
      phone: z.string(),
      user_id: z.union([z.string(), z.number()]),
    }).passthrough(),
  }).passthrough(),
}).passthrough();

const phonePeResponseSchema = z.object({
  success: z.boolean(),
  code: z.string().optional(),
  message: z.string().optional(),
  data: z.object({
    instrumentResponse: z.object({
      redirectInfo: z.object({ url: z.string().url() }),
    }).optional(),
  }).passthrough().optional(),
}).passthrough();

function errorResponse(error: string, status: number, code?: string) {
  return NextResponse.json({ success: false, error, ...(code ? { code } : {}) }, { status });
}

export async function POST(request: Request) {
  const parsedRequest = initiateRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsedRequest.success) return errorResponse('A valid pending booking reference is required', 400);

  const bookingRef = parsedRequest.data.bookingRef;
  let bookingResponse: Response;
  try {
    bookingResponse = await fetch(`${API_BASE_URL}/api/bookings/check?booking_ref=${encodeURIComponent(bookingRef)}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return errorResponse('Booking verification is temporarily unavailable', 503, 'BOOKING_LOOKUP_UNAVAILABLE');
  }

  if (!bookingResponse.ok) {
    return errorResponse(
      bookingResponse.status === 404 ? 'Pending booking not found' : 'Unable to verify the pending booking',
      bookingResponse.status === 404 ? 404 : 502,
      'BOOKING_LOOKUP_FAILED',
    );
  }

  const parsedBooking = bookingLookupSchema.safeParse(await bookingResponse.json().catch(() => null));
  if (!parsedBooking.success) return errorResponse('Backend returned an invalid pending booking', 502, 'INVALID_BOOKING');

  const booking = parsedBooking.data.data;
  if (booking.booking_ref !== bookingRef) return errorResponse('Booking reference mismatch', 409, 'BOOKING_REFERENCE_MISMATCH');
  if (booking.status !== 'Pending' || booking.payment_status !== 'Pending' || booking.payment_method?.toLowerCase() !== 'phonepe') {
    return errorResponse('Payment can only be initiated for a pending PhonePe booking', 409, 'BOOKING_NOT_PAYABLE');
  }

  const referenceMatch = /^NIBOG_(\d+)_\d+$/.exec(bookingRef);
  if (!referenceMatch || Number(referenceMatch[1]) !== Number(booking.parent.user_id)) {
    return errorResponse('Booking reference does not match the customer', 409, 'BOOKING_USER_MISMATCH');
  }

  const amountPaise = Math.round(Number(booking.total_amount) * 100);
  if (!Number.isSafeInteger(amountPaise) || amountPaise <= 0) {
    return errorResponse('Pending booking has an invalid amount', 409, 'INVALID_BOOKING_AMOUNT');
  }
  const mobileNumber = booking.parent.phone.replace(/\D/g, '');
  if (!/^\d{10,15}$/.test(mobileNumber)) {
    return errorResponse('Pending booking has an invalid mobile number', 409, 'INVALID_BOOKING_MOBILE');
  }

  const configValidation = validatePhonePeConfig();
  if (!configValidation.isValid) {
    console.error('PhonePe initiation configuration is invalid:', configValidation.errors);
    return errorResponse('PhonePe configuration is unavailable', 500, 'PHONEPE_CONFIGURATION_ERROR');
  }

  const appUrl = PHONEPE_CONFIG.APP_URL.replace(/\/+$/, '');
  const paymentRequest = {
    merchantId: PHONEPE_CONFIG.MERCHANT_ID,
    merchantTransactionId: bookingRef,
    merchantUserId: referenceMatch[1],
    amount: amountPaise,
    redirectUrl: `${appUrl}/payment-callback?transactionId=${encodeURIComponent(bookingRef)}`,
    redirectMode: 'REDIRECT',
    callbackUrl: `${appUrl}/api/payments/phonepe-callback`,
    mobileNumber,
    paymentInstrument: { type: 'PAY_PAGE' },
  };
  const base64Payload = base64Encode(JSON.stringify(paymentRequest));
  const hash = await generateSHA256Hash(base64Payload + '/pg/v1/pay' + PHONEPE_CONFIG.SALT_KEY);
  const xVerify = `${hash}###${PHONEPE_CONFIG.SALT_INDEX}`;

  let gatewayResponse: Response;
  try {
    gatewayResponse = await fetch(PHONEPE_CONFIG.API_ENDPOINTS.INITIATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-VERIFY': xVerify },
      body: JSON.stringify({ request: base64Payload }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return errorResponse('PhonePe initiation is temporarily unavailable', 503, 'PHONEPE_UNAVAILABLE');
  }

  const parsedGateway = phonePeResponseSchema.safeParse(await gatewayResponse.json().catch(() => null));
  if (!parsedGateway.success) return errorResponse('PhonePe returned an invalid initiation response', 502, 'INVALID_PHONEPE_RESPONSE');
  if (!gatewayResponse.ok || !parsedGateway.data.success) {
    return errorResponse(parsedGateway.data.message || 'PhonePe rejected the payment initiation', 502, parsedGateway.data.code);
  }
  const redirectUrl = parsedGateway.data.data?.instrumentResponse?.redirectInfo.url;
  if (!redirectUrl) return errorResponse('PhonePe returned no payment URL', 502, 'INVALID_PHONEPE_RESPONSE');

  return NextResponse.json(parsedGateway.data);
}
