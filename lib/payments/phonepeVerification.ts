import { z } from 'zod';
import { PHONEPE_CONFIG, generateSHA256Hash } from '@/config/phonepe';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:3004';
const BOOKING_CREATE_API = `${API_BASE_URL}/api/bookings`;

const phonePeStatusSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string().optional(),
  data: z.object({
    merchantId: z.string().optional(),
    merchantTransactionId: z.string().optional(),
    transactionId: z.string().optional(),
    amount: z.number().optional(),
    state: z.string().optional(),
    paymentState: z.string().optional(),
  }).passthrough().optional(),
}).passthrough();

const confirmedBookingSchema = z.object({
  booking_id: z.number().int().positive(),
  booking_ref: z.string(),
  payment_id: z.number().int().positive(),
  total_amount: z.number().optional(),
  status: z.literal('Confirmed'),
  payment_status: z.literal('Paid'),
  created: z.literal(false),
  confirmationTransition: z.boolean(),
}).passthrough();

const backendErrorSchema = z.object({
  error: z.string().optional(),
  message: z.string().optional(),
}).passthrough();

export type PhonePeStatusPayload = z.infer<typeof phonePeStatusSchema>;

export interface PhonePeVerificationResult {
  payload: PhonePeStatusPayload;
  state: string;
  bookingId?: number;
  bookingRef?: string;
  paymentId?: number;
  confirmationTransition?: boolean;
}

export class PhonePeVerificationError extends Error {
  constructor(message: string, public readonly status: number, public readonly code: string) {
    super(message);
    this.name = 'PhonePeVerificationError';
  }
}

export async function verifyPhonePeAndFinalize(bookingRef: string): Promise<PhonePeVerificationResult> {
  if (!/^NIBOG_\d+_\d+$/.test(bookingRef) || bookingRef.length > 38) {
    throw new PhonePeVerificationError('Invalid booking reference', 400, 'INVALID_BOOKING_REFERENCE');
  }

  const statusPath = `/pg/v1/status/${encodeURIComponent(PHONEPE_CONFIG.MERCHANT_ID)}/${encodeURIComponent(bookingRef)}`;
  const xVerify = `${await generateSHA256Hash(statusPath + PHONEPE_CONFIG.SALT_KEY)}###${PHONEPE_CONFIG.SALT_INDEX}`;
  const response = await fetch(`${PHONEPE_CONFIG.API_ENDPOINTS.STATUS}/${encodeURIComponent(PHONEPE_CONFIG.MERCHANT_ID)}/${encodeURIComponent(bookingRef)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': xVerify,
      'X-MERCHANT-ID': PHONEPE_CONFIG.MERCHANT_ID,
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });

  const parsed = phonePeStatusSchema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) {
    throw new PhonePeVerificationError('Invalid PhonePe status response', 502, 'INVALID_PHONEPE_RESPONSE');
  }
  if (!response.ok) {
    throw new PhonePeVerificationError('PhonePe status verification failed', 502, 'PHONEPE_VERIFICATION_FAILED');
  }

  const payload = parsed.data;
  const state = payload.data?.state || payload.data?.paymentState || 'FAILED';
  const isCompleted = payload.success === true && payload.code === 'PAYMENT_SUCCESS' && state === 'COMPLETED';
  if (!isCompleted) return { payload, state };

  const gatewayData = payload.data;
  if (!gatewayData || gatewayData.merchantTransactionId !== bookingRef || gatewayData.merchantId !== PHONEPE_CONFIG.MERCHANT_ID) {
    throw new PhonePeVerificationError('PhonePe merchant identity does not match the booking', 409, 'BOOKING_REFERENCE_MISMATCH');
  }
  const amount = gatewayData.amount;
  if (typeof amount !== 'number' || !Number.isInteger(amount) || amount <= 0 || !gatewayData.transactionId) {
    throw new PhonePeVerificationError('PhonePe returned invalid completed-payment data', 502, 'INVALID_PHONEPE_RESPONSE');
  }

  const bookingResponse = await fetch(BOOKING_CREATE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      booking_ref: bookingRef,
      payment_status: 'Paid',
      payment_method: 'PhonePe',
      payment: {
        transaction_id: gatewayData.transactionId,
        phonepe_transaction_id: bookingRef,
        amount: amount / 100,
        payment_method: 'PhonePe',
        payment_status: 'Paid',
      },
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });

  const rawBookingResult: unknown = await bookingResponse.json().catch(() => null);
  if (!bookingResponse.ok) {
    const parsedError = backendErrorSchema.safeParse(rawBookingResult);
    throw new PhonePeVerificationError(
      parsedError.success ? parsedError.data.error || parsedError.data.message || 'Backend payment confirmation failed' : 'Backend payment confirmation failed',
      bookingResponse.status,
      'BACKEND_CONFIRMATION_FAILED'
    );
  }

  const confirmed = confirmedBookingSchema.safeParse(rawBookingResult);
  if (!confirmed.success || confirmed.data.booking_ref !== bookingRef) {
    throw new PhonePeVerificationError('Backend did not confirm the expected booking', 502, 'INVALID_BACKEND_CONFIRMATION');
  }

  return {
    payload,
    state,
    bookingId: confirmed.data.booking_id,
    bookingRef: confirmed.data.booking_ref,
    paymentId: confirmed.data.payment_id,
    confirmationTransition: confirmed.data.confirmationTransition,
  };
}
