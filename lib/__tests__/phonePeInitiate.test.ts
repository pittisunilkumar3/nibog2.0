// @vitest-environment node
// Fixtures are synthetic; never a real key or customer identifier.
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { createHash } from 'node:crypto';
import { POST } from '../../app/api/payments/phonepe-initiate/route';

vi.mock('@/config/phonepe', () => ({
  PHONEPE_CONFIG: {
    MERCHANT_ID: 'MERCHANT_TEST',
    SALT_KEY: 'server-salt',
    SALT_INDEX: '1',
    APP_URL: 'https://www.nibog.in',
    API_ENDPOINTS: { INITIATE: 'https://gateway.example/pg/v1/pay' },
  },
  base64Encode: (value: string) => Buffer.from(value).toString('base64'),
  generateSHA256Hash: async (value: string) => createHash('sha256').update(value).digest('hex'),
  validatePhonePeConfig: () => ({ isValid: true, errors: [] }),
}));

const bookingRef = 'NIBOG_7_1760000000000';
const fetchMock = vi.fn();

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

function pendingBooking(overrides: Record<string, unknown> = {}) {
  return {
    success: true,
    data: {
      id: 42,
      booking_ref: bookingRef,
      status: 'Pending',
      total_amount: '100.00',
      payment_method: 'PhonePe',
      payment_status: 'Pending',
      parent: { phone: '+91 98765 43210', user_id: 7 },
      ...overrides,
    },
  };
}

function initiationRequest(body: unknown = { bookingRef }) {
  return new Request('http://localhost/api/payments/phonepe-initiate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('derives and signs the gateway payload from the persisted pending booking', async () => {
  fetchMock
    .mockResolvedValueOnce(jsonResponse(pendingBooking()))
    .mockResolvedValueOnce(jsonResponse({
      success: true,
      code: 'PAYMENT_INITIATED',
      data: { instrumentResponse: { redirectInfo: { url: 'https://gateway.example/pay/transaction' } } },
    }));

  const response = await POST(initiationRequest());

  expect(response.status).toBe(200);
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(String(fetchMock.mock.calls[0][0])).toContain(`booking_ref=${encodeURIComponent(bookingRef)}`);

  const [gatewayUrl, gatewayOptions] = fetchMock.mock.calls[1];
  expect(gatewayUrl).toBe('https://gateway.example/pg/v1/pay');
  const base64Payload = JSON.parse(String(gatewayOptions?.body)).request as string;
  const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf8'));
  expect(payload).toMatchObject({
    merchantId: 'MERCHANT_TEST',
    merchantTransactionId: bookingRef,
    merchantUserId: '7',
    amount: 10000,
    mobileNumber: '919876543210',
    redirectUrl: `https://www.nibog.in/payment-callback?transactionId=${encodeURIComponent(bookingRef)}`,
    callbackUrl: 'https://www.nibog.in/api/payments/phonepe-callback',
    paymentInstrument: { type: 'PAY_PAGE' },
  });
  const expectedHash = createHash('sha256').update(base64Payload + '/pg/v1/pay' + 'server-salt').digest('hex');
  expect(gatewayOptions?.headers['X-VERIFY']).toBe(`${expectedHash}###1`);
});

test('does not accept browser-supplied payloads or signatures', async () => {
  const response = await POST(initiationRequest({
    bookingRef,
    request: 'browser-payload',
    xVerify: 'browser-signature',
    amount: 1,
  }));

  expect(response.status).toBe(400);
  expect(fetchMock).not.toHaveBeenCalled();
});

test('refuses to initiate another payment for a confirmed booking', async () => {
  fetchMock.mockResolvedValueOnce(jsonResponse(pendingBooking({ status: 'Confirmed', payment_status: 'Paid' })));

  const response = await POST(initiationRequest());

  expect(response.status).toBe(409);
  await expect(response.json()).resolves.toMatchObject({ code: 'BOOKING_NOT_PAYABLE' });
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test('refuses a reference whose embedded user differs from the persisted parent', async () => {
  fetchMock.mockResolvedValueOnce(jsonResponse(pendingBooking({ parent: { phone: '9876543210', user_id: 8 } })));

  const response = await POST(initiationRequest());

  expect(response.status).toBe(409);
  await expect(response.json()).resolves.toMatchObject({ code: 'BOOKING_USER_MISMATCH' });
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
