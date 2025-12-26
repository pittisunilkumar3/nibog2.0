import { formatBookingDataForAPI } from '../bookingRegistrationService'

describe('formatBookingDataForAPI - multiple games', () => {
  test('formats booking data with multiple games and slotIds', () => {
    const formData: any = {
      userId: 123,
      parentName: 'Parent',
      email: 'parent@example.com',
      phone: '9999999999',
      childName: 'Child',
      childDob: '2020-01-01',
      schoolName: 'School',
      gender: 'female',
      eventId: 8,
      gameId: [5, 6],
      gamePrice: [12.5, 8],
      slotId: [101, 102],
      totalAmount: 20.5,
      paymentMethod: 'Test',
      paymentStatus: 'Paid',
      termsAccepted: true,
      selectedAddOns: []
    }

    const formatted = formatBookingDataForAPI(formData)

    expect(formatted.booking.event_id).toBe(8)
    expect(Array.isArray(formatted.booking_games)).toBe(true)
    expect(formatted.booking_games.length).toBe(2)

    expect(formatted.booking_games[0]).toEqual({ slot_id: 101, game_id: 5, game_price: 12.5 })
    expect(formatted.booking_games[1]).toEqual({ slot_id: 102, game_id: 6, game_price: 8 })
  })
})