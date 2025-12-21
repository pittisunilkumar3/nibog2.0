// @ts-nocheck
import {
  generateConsistentBookingRef,
  convertBookingRefFormat,
  isValidPPTFormat,
  extractDateFromPPTRef,
  generateManualBookingRef,
  isValidMANFormat,
  isManualBooking
} from '../bookingReference';

describe('Booking Reference Utils', () => {
  describe('generateConsistentBookingRef', () => {
    test('generates PHP format correctly', () => {
      const result = generateConsistentBookingRef('PlayArea', 'Hyd', '2023-12-25');
      expect(result).toMatch(/^PPT-HYD-PA-20231225-[A-Z0-9]{4}$/);
    });

    test('generates valid formats for different inputs', () => {
      const res1 = generateConsistentBookingRef('Cafe', 'Blr', '2024-01-01');
      expect(res1).toContain('PPT-BLR-CA-20240101');
    });
  });

  describe('convertBookingRefFormat', () => {
    test('converts PPT to short format', () => {
      const ppt = 'PPT-HYD-PA-20231225-ABCD';
      const short = convertBookingRefFormat(ppt);
      expect(short).toBe('HYD-PA-20231225-ABCD');
    });

    test('handles already short format', () => {
      const short = 'HYD-PA-20231225-ABCD';
      const result = convertBookingRefFormat(short);
      expect(result).toBe(short);
    });
  });

  describe('isValidPPTFormat', () => {
    test('validates correct PPT format', () => {
      expect(isValidPPTFormat('PPT-HYD-PA-20231225-ABCD')).toBe(true);
    });

    test('invalidates wrong format', () => {
      expect(isValidPPTFormat('INVALID-REF')).toBe(false);
      expect(isValidPPTFormat('HYD-PA-20231225-ABCD')).toBe(false); // Short format is not PPT format
    });
  });

  describe('extractDateFromPPTRef', () => {
    test('extracts date correctly', () => {
      const date = extractDateFromPPTRef('PPT-HYD-PA-20231225-ABCD');
      expect(date).toBe('20231225');
    });

    test('returns null for invalid format', () => {
      expect(extractDateFromPPTRef('INVALID')).toBeNull();
    });
  });

  describe('Manual Booking Refs', () => {
    test('generates manual ref', () => {
      const ref = generateManualBookingRef();
      expect(ref).toMatch(/^MAN-[A-Z0-9]{8}$/);
    });

    test('validates manual format', () => {
      expect(isValidMANFormat('MAN-ABC12345')).toBe(true);
      expect(isValidMANFormat('PPT-ABC-123')).toBe(false);
    });

    test('identifies manual booking', () => {
      expect(isManualBooking('MAN-ABC12345')).toBe(true);
      expect(isManualBooking('PPT-HYD-PA-20231225-ABCD')).toBe(false);
    });
  });
});
