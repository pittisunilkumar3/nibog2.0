// @vitest-environment node
import { beforeEach, expect, it, test, vi } from 'vitest';
import { createHash } from 'node:crypto';
import { POST } from '../../app/api/payments/phonepe-callback/route';
import { verifyPhonePeAndFinalize } from '../payments/phonepeVerification';

vi.mock('@/config/phonepe', () => ({
  PHONEPE_CONFIG: { SALT_KEY: 'test-salt', SALT_INDEX: '1' },
  generateSHA256Hash: async (value: string) => createHash('sha256').update(value).digest('hex'),
}));

vi.mock('../payments/phonepeVerification', () => ({
  PhonePeVerificationError: class extends Error {},
  verifyPhonePeAndFinalize: vi.fn(),
}));

const bookingRef = 'NIBOG_7_1760000000000';
const signedResponse = Buffer.from(JSON.stringify({
  success: true,
  code: 'PAYMENT_SUCCESS',
  data: { merchantTransactionId: bookingRef },
})).toString('base64');
const validSignature = `${createHash('sha256').update(signedResponse + 'test-salt').digest('hex')}###1`;

function callbackRequest(body: unknown, signature = validSignature) {
  return new Request('http://localhost/api/payments/phonepe-callback', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-verify': signature },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.mocked(verifyPhonePeAndFinalize).mockReset();
});

it.each(['top-level', 'nested'])('verifies the %s signed envelope before finalization', async variant => {
  vi.mocked(verifyPhonePeAndFinalize).mockResolvedValue({
    payload: { success: true, code: 'PAYMENT_SUCCESS', data: { state: 'COMPLETED' } },
    state: 'COMPLETED',
    bookingId: 42,
    bookingRef,
    paymentId: 901,
    confirmationTransition: true,
  });
  const body = variant === 'nested' ? { payload: { response: signedResponse } } : { response: signedResponse };

  const response = await POST(callbackRequest(body));

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toMatchObject({ status: 'SUCCESS', bookingId: 42, paymentId: 901 });
  expect(verifyPhonePeAndFinalize).toHaveBeenCalledWith(bookingRef);
});

test('rejects an invalid callback signature before verification or writes', async () => {
  const response = await POST(callbackRequest({ payload: { response: signedResponse } }, `${'0'.repeat(64)}###1`));

  expect(response.status).toBe(400);
  expect(verifyPhonePeAndFinalize).not.toHaveBeenCalled();
});

test('rejects a missing callback signature before verification or writes', async () => {
  const request = new Request('http://localhost/api/payments/phonepe-callback', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ response: signedResponse }),
  });

  const response = await POST(request);

  expect(response.status).toBe(400);
  expect(verifyPhonePeAndFinalize).not.toHaveBeenCalled();
});

test('rejects malformed signed JSON even when its signature is valid', async () => {
  const malformed = Buffer.from('not-json').toString('base64');
  const signature = `${createHash('sha256').update(malformed + 'test-salt').digest('hex')}###1`;

  const response = await POST(callbackRequest({ response: malformed }, signature));

  expect(response.status).toBe(400);
  expect(verifyPhonePeAndFinalize).not.toHaveBeenCalled();
});
