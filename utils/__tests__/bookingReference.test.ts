/**
 * Test file for booking reference utilities
 * Tests the manual booking reference generation and validation
 */

import { 
  generateManualBookingRef, 
  isValidMANFormat, 
  isManualBooking,
  generateConsistentBookingRef 
} from '../bookingReference';

describe('Manual Booking Reference Generation', () => {
  test('generateManualBookingRef should create MAN format reference', () => {
    const timestamp = '1704067200000'; // Example timestamp
    const reference = generateManualBookingRef(timestamp);
    
    // Should start with MAN
    expect(reference).toMatch(/^MAN/);
    
    // Should have correct length (MAN + YYMMDD + 3 digits = 12 characters)
    expect(reference).toHaveLength(12);
    
    // Should match the pattern MANYYMMDDxxx
    expect(reference).toMatch(/^MAN\d{6}\d{3}$/);
  });

  test('isValidMANFormat should validate MAN format correctly', () => {
    const validRef = 'MAN250806123';
    const invalidRef1 = 'PPT250806123';
    const invalidRef2 = 'MAN25080612'; // Too short
    const invalidRef3 = 'MAN25080612a'; // Contains letter
    
    expect(isValidMANFormat(validRef)).toBe(true);
    expect(isValidMANFormat(invalidRef1)).toBe(false);
    expect(isValidMANFormat(invalidRef2)).toBe(false);
    expect(isValidMANFormat(invalidRef3)).toBe(false);
  });

  test('isManualBooking should identify manual bookings correctly', () => {
    const manualRef = 'MAN250806123';
    const frontendRef = 'PPT250806123';
    const otherRef = 'B0001234';
    
    expect(isManualBooking(manualRef)).toBe(true);
    expect(isManualBooking(frontendRef)).toBe(false);
    expect(isManualBooking(otherRef)).toBe(false);
  });

  test('manual and frontend references should be different formats', () => {
    const timestamp = '1704067200000';
    const manualRef = generateManualBookingRef(timestamp);
    const frontendRef = generateConsistentBookingRef(timestamp);
    
    expect(manualRef).toMatch(/^MAN/);
    expect(frontendRef).toMatch(/^PPT/);
    expect(manualRef).not.toEqual(frontendRef);
  });

  test('generateManualBookingRef should handle different identifiers', () => {
    const ref1 = generateManualBookingRef('123456789');
    const ref2 = generateManualBookingRef('987654321');
    const ref3 = generateManualBookingRef('admin_booking_001');
    
    // All should be valid MAN format
    expect(isValidMANFormat(ref1)).toBe(true);
    expect(isValidMANFormat(ref2)).toBe(true);
    expect(isValidMANFormat(ref3)).toBe(true);
    
    // Should have different numeric parts
    expect(ref1).not.toEqual(ref2);
    expect(ref2).not.toEqual(ref3);
  });
});

describe('Integration with existing booking system', () => {
  test('manual booking references should not conflict with frontend references', () => {
    const timestamp = Date.now().toString();
    const manualRef = generateManualBookingRef(timestamp);
    const frontendRef = generateConsistentBookingRef(timestamp);
    
    // Should be clearly distinguishable
    expect(isManualBooking(manualRef)).toBe(true);
    expect(isManualBooking(frontendRef)).toBe(false);
    
    // Should have different prefixes
    expect(manualRef.substring(0, 3)).toBe('MAN');
    expect(frontendRef.substring(0, 3)).toBe('PPT');
  });
});
