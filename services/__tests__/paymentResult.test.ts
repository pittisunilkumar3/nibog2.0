// @vitest-environment node
// Fixtures are synthetic; never a real key or customer identifier.
import { afterEach, expect, test, vi } from 'vitest';
import { checkPhonePePaymentResult } from '../paymentService';

const bookingRef = 'NIBOG_7_1760000000000';

function statusResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test('returns SUCCESS with a numeric booking ID only after backend confirmation', async () => {
  const fetchMock = vi.fn().mockResolvedValue(statusResponse({
    success: true,
    code: 'PAYMENT_SUCCESS',
    data: { state: 'COMPLETED' },
    bookingCreated: true,
    paymentCreated: true,
    bookingId: 42,
    paymentId: 901,
    bookingData: { booking_ref: bookingRef },
  }));
  vi.stubGlobal('fetch', fetchMock);

  const result = await checkPhonePePaymentResult(bookingRef);

  expect(result).toEqual({ status: 'SUCCESS', bookingId: '42', bookingRef, paymentId: 901 });
  expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({ transactionId: bookingRef });
});

test('rejects raw COMPLETED gateway data when backend confirmation is missing', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(statusResponse({
    success: true,
    code: 'PAYMENT_SUCCESS',
    data: { state: 'COMPLETED' },
  })));

  await expect(checkPhonePePaymentResult(bookingRef)).rejects.toThrow('not been confirmed');
});

test('maps pending gateway state without requiring a booking ID', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(statusResponse({
    success: true,
    code: 'PAYMENT_PENDING',
    data: { state: 'PENDING' },
  })));

  await expect(checkPhonePePaymentResult(bookingRef)).resolves.toEqual({ status: 'PENDING' });
});

test('maps failed gateway state without treating it as success', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(statusResponse({
    success: false,
    code: 'PAYMENT_ERROR',
    data: { state: 'FAILED' },
  })));

  await expect(checkPhonePePaymentResult(bookingRef)).resolves.toEqual({ status: 'FAILED' });
});

test('surfaces backend verification failure instead of returning SUCCESS', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(statusResponse({ success: false, error: 'Verification failed' }, 409)));

  await expect(checkPhonePePaymentResult(bookingRef)).rejects.toThrow('Verification failed');
});
