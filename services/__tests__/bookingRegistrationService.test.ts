import { expect, test } from 'vitest';
import { formatBookingDataForAPI } from '../bookingRegistrationService';

test('formats initial PhonePe registration with a stable reference and Pending state', () => {
  const result = formatBookingDataForAPI({
    userId: 7,
    parentName: 'Parent',
    email: 'parent@example.com',
    phone: '9876543210',
    childName: 'Child',
    childDob: '2020-01-01',
    schoolName: 'School',
    gender: 'Female',
    eventId: 3,
    bookingRef: 'NIBOG_7_1760000000000',
    gameId: 4,
    gamePrice: 100,
    slotId: 5,
    totalAmount: 100,
    paymentMethod: 'PhonePe',
    paymentStatus: 'Pending',
    termsAccepted: true,
    selectedAddOns: [],
  });

  expect(result.user_id).toBe(7);
  expect(result.booking).toMatchObject({
    event_id: 3,
    booking_ref: 'NIBOG_7_1760000000000',
    total_amount: 100,
    payment_method: 'PhonePe',
    payment_status: 'Pending',
  });
  expect(result.booking_games).toEqual([{ game_id: 4, slot_id: 5, game_price: 100 }]);
});
