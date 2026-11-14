// Fixtures are synthetic; never a real key or customer identifier.
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import PaymentCallbackPage from '../../app/payment-callback/page';
import BookingConfirmationClientPage from '../../app/(main)/booking-confirmation/client-page';
import { checkPhonePePaymentResult } from '@/services/paymentService';

const navigation = vi.hoisted(() => ({
  searchParams: new URLSearchParams(),
  replace: vi.fn(),
  push: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => navigation.searchParams,
  useRouter: () => ({ replace: navigation.replace, push: navigation.push }),
}));

vi.mock('@/services/paymentService', () => ({
  checkPhonePePaymentResult: vi.fn(),
}));

const bookingRef = 'NIBOG_7_1760000000000';
const fetchMock = vi.fn();

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

beforeEach(() => {
  navigation.searchParams = new URLSearchParams();
  navigation.replace.mockReset();
  navigation.push.mockReset();
  vi.mocked(checkPhonePePaymentResult).mockReset();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  window.localStorage.clear();
  window.sessionStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test('successful backend confirmation navigates to the reference-based confirmation URL', async () => {
  navigation.searchParams = new URLSearchParams({ transactionId: bookingRef });
  vi.mocked(checkPhonePePaymentResult).mockResolvedValue({
    status: 'SUCCESS',
    bookingId: '42',
    bookingRef,
    paymentId: 901,
  });

  render(<PaymentCallbackPage />);

  await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith(
    `/booking-confirmation?ref=${encodeURIComponent(bookingRef)}`,
  ));
  expect(window.localStorage.getItem('lastBookingRef')).toBe(bookingRef);
});

test('verification errors preserve the transaction and offer status retry, not another payment', async () => {
  navigation.searchParams = new URLSearchParams({ transactionId: bookingRef });
  vi.mocked(checkPhonePePaymentResult).mockRejectedValue(new Error('Gateway temporarily unavailable'));

  render(<PaymentCallbackPage />);

  await screen.findByText(/Check this same transaction again or contact support before making another payment/);
  expect(screen.getByRole('button', { name: 'Check Status Again' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Try Again' })).toBeNull();
  expect(navigation.replace).not.toHaveBeenCalled();
});

test('an arbitrary reference neither renders confirmation nor clears registration data', async () => {
  navigation.searchParams = new URLSearchParams({ ref: bookingRef });
  window.sessionStorage.setItem('registrationData', 'saved-registration');
  fetchMock.mockResolvedValue(jsonResponse({ success: false, error: 'Not found' }, 404));

  render(<BookingConfirmationClientPage />);

  await screen.findByRole('heading', { name: 'We couldn’t find this confirmation' });
  expect(screen.queryByRole('heading', { name: 'Registration confirmed' })).toBeNull();
  expect(window.sessionStorage.getItem('registrationData')).toBe('saved-registration');
});

test('a pending booking does not render confirmation or clear registration data', async () => {
  navigation.searchParams = new URLSearchParams({ ref: bookingRef });
  window.sessionStorage.setItem('registrationData', 'saved-registration');
  fetchMock.mockResolvedValue(jsonResponse({
    success: true,
    data: { id: 42, booking_ref: bookingRef, status: 'Pending', payment_status: 'Pending' },
  }));

  render(<BookingConfirmationClientPage />);

  await screen.findByRole('heading', { name: 'Payment is not confirmed yet' });
  expect(screen.queryByRole('heading', { name: 'Registration confirmed' })).toBeNull();
  expect(window.sessionStorage.getItem('registrationData')).toBe('saved-registration');
});

test('a matching Confirmed and Paid booking renders the ticket and clears saved registration', async () => {
  navigation.searchParams = new URLSearchParams({ ref: bookingRef });
  window.sessionStorage.setItem('registrationData', 'saved-registration');
  fetchMock.mockResolvedValue(jsonResponse({
    success: true,
    data: { id: 42, booking_ref: bookingRef, status: 'Confirmed', payment_status: 'Paid' },
  }));

  render(<BookingConfirmationClientPage />);

  await screen.findByRole('heading', { name: 'Registration confirmed' });
  expect(screen.getByRole('link', { name: 'Download Ticket' }).getAttribute('href')).toBe('/dashboard/bookings/42/ticket');
  expect(window.sessionStorage.getItem('registrationData')).toBeNull();
});
