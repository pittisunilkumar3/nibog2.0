// @vitest-environment node
// Fixtures are synthetic; never a real key or customer identifier.
import { afterEach, expect, test, vi } from 'vitest';
import { verifyPhonePeAndFinalize } from '../payments/phonepeVerification';

vi.mock('@/config/phonepe', () => ({
  PHONEPE_CONFIG: {
    MERCHANT_ID: 'MERCHANT_TEST',
    SALT_KEY: 'test-salt',
    SALT_INDEX: '1',
    API_ENDPOINTS: { STATUS: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status' },
  },
  generateSHA256Hash: async (value: string) => value,
}));

const bookingRef = 'NIBOG_7_1760000000000';

function completedPayload(overrides: Record<string, unknown> = {}) {
  return {
    success: true,
    code: 'PAYMENT_SUCCESS',
    data: {
      state: 'COMPLETED',
      merchantId: 'MERCHANT_TEST',
      merchantTransactionId: bookingRef,
      transactionId: 'GATEWAY_TXN_1',
      amount: 10000,
      ...overrides,
    },
  };
}

function confirmedBooking(confirmationTransition = true) {
  return {
    booking_id: 42,
    booking_ref: bookingRef,
    payment_id: 901,
    total_amount: 100,
    status: 'Confirmed',
    payment_status: 'Paid',
    created: false,
    confirmationTransition,
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test('finalizes a completed payment with only the reference and gateway-verified fields', async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(jsonResponse(completedPayload()))
    .mockResolvedValueOnce(jsonResponse(confirmedBooking()));
  vi.stubGlobal('fetch', fetchMock);

  const result = await verifyPhonePeAndFinalize(bookingRef);

  expect(result.bookingId).toBe(42);
  expect(result.paymentId).toBe(901);
  expect(result.confirmationTransition).toBe(true);
  expect(fetchMock).toHaveBeenCalledTimes(2);
  const backendRequest = fetchMock.mock.calls[1][1];
  expect(JSON.parse(String(backendRequest?.body))).toEqual({
    booking_ref: bookingRef,
    payment_status: 'Paid',
    payment_method: 'PhonePe',
    payment: {
      transaction_id: 'GATEWAY_TXN_1',
      phonepe_transaction_id: bookingRef,
      amount: 100,
      payment_method: 'PhonePe',
      payment_status: 'Paid',
    },
  });
});

test('rejects a merchant-reference mismatch before any backend write', async () => {
  const fetchMock = vi.fn().mockResolvedValue(jsonResponse(completedPayload({ merchantTransactionId: 'NIBOG_7_1760000000001' })));
  vi.stubGlobal('fetch', fetchMock);

  await expect(verifyPhonePeAndFinalize(bookingRef)).rejects.toMatchObject({ status: 409, code: 'BOOKING_REFERENCE_MISMATCH' });
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test('does not write a booking for pending gateway state', async () => {
  const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
    success: true,
    code: 'PAYMENT_PENDING',
    data: { state: 'PENDING', merchantTransactionId: bookingRef },
  }));
  vi.stubGlobal('fetch', fetchMock);

  const result = await verifyPhonePeAndFinalize(bookingRef);

  expect(result.state).toBe('PENDING');
  expect(result.bookingId).toBeUndefined();
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test('requires merchant identity in a completed gateway response', async () => {
  const fetchMock = vi.fn().mockResolvedValue(jsonResponse(completedPayload({ merchantId: undefined })));
  vi.stubGlobal('fetch', fetchMock);

  await expect(verifyPhonePeAndFinalize(bookingRef)).rejects.toMatchObject({ status: 409 });
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test('propagates backend verification failure instead of returning confirmation', async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(jsonResponse(completedPayload()))
    .mockResolvedValueOnce(jsonResponse({ error: 'Amount mismatch' }, 409));
  vi.stubGlobal('fetch', fetchMock);

  await expect(verifyPhonePeAndFinalize(bookingRef)).rejects.toMatchObject({ status: 409, code: 'BACKEND_CONFIRMATION_FAILED' });
});

test('returns the same numeric identifiers for an idempotent backend completion', async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(jsonResponse(completedPayload()))
    .mockResolvedValueOnce(jsonResponse(confirmedBooking(false)));
  vi.stubGlobal('fetch', fetchMock);

  const result = await verifyPhonePeAndFinalize(bookingRef);

  expect(result.bookingId).toBe(42);
  expect(result.paymentId).toBe(901);
  expect(result.confirmationTransition).toBe(false);
});
