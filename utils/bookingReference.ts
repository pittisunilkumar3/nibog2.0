/**
 * Utility functions for generating consistent booking references across the entire system
 * This ensures all booking references use the same format and work with all APIs
 */

/**
 * Generates a CONSISTENT booking reference that works across the entire system
 * Uses PPT format which is expected by the ticket details API and database
 * 
 * Format: PPTYYMMDDxxx
 * - PPT: Prefix for the system
 * - YYMMDD: Current date (2-digit year, month, day)
 * - xxx: 3-digit unique identifier based on input
 * 
 * @param identifier - Unique identifier (transaction ID, timestamp, etc.)
 * @returns Consistent booking reference in PPT format
 */
export function generateConsistentBookingRef(identifier: string): string {
  // Create a PPT format booking reference that's consistent with the API expectations
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString().slice(-2);
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const day = currentDate.getDate().toString().padStart(2, '0');
  
  // Extract numeric part from identifier for uniqueness
  const numericPart = identifier.replace(/\D/g, '').slice(-3).padStart(3, '0');
  
  // Generate PPT format: PPTYYMMDDxxx
  const reference = `PPT${year}${month}${day}${numericPart}`;
  
  console.log(`✅ Generated PPT format booking reference: ${reference} from identifier: ${identifier}`);
  return reference;
}

/**
 * Converts booking reference between different formats for backward compatibility
 * This helps maintain compatibility with existing data while standardizing new references
 * 
 * @param bookingRef - Existing booking reference in any format
 * @param targetFormat - Target format ('PPT' or 'B')
 * @returns Converted booking reference
 */
export function convertBookingRefFormat(bookingRef: string, targetFormat: 'PPT' | 'B' = 'PPT'): string {
  if (!bookingRef) {
    throw new Error('Booking reference is required');
  }

  // Clean the reference (remove quotes, whitespace, etc.)
  const cleanRef = bookingRef.replace(/["\s]/g, '').trim();
  
  if (!cleanRef) {
    throw new Error('Invalid booking reference format');
  }

  // Extract numeric parts based on current format
  let numericPart = '';
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString().slice(-2);
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const day = currentDate.getDate().toString().padStart(2, '0');
  
  if (cleanRef.startsWith('B')) {
    // Extract from B format (B0000123)
    numericPart = cleanRef.replace(/^B(\d+)$/, '$1');
    
    if (targetFormat === 'B') {
      // Already in B format, just normalize
      return `B${numericPart.padStart(7, '0')}`;
    } else {
      // Convert B -> PPT format
      // Use current date + numeric part as the identifier
      return `PPT${year}${month}${day}${numericPart.slice(-3).padStart(3, '0')}`;
    }
  } else if (cleanRef.startsWith('PPT')) {
    // Extract from PPT format (PPTYYMMDDxxx)
    // PPT format typically has date embedded in it
    const pptMatch = cleanRef.match(/^PPT(\d{6})(\d{3,})$/);

    if (pptMatch) {
      const dateStr = pptMatch[1]; // YYMMDD part
      const idPart = pptMatch[2];  // xxx part (numeric ID)

      if (targetFormat === 'PPT') {
        // Already in PPT format, just normalize
        return cleanRef;
      } else {
        // Convert PPT -> B format
        // Use the numeric part as is, pad to 7 digits
        return `B${idPart.padStart(7, '0')}`;
      }
    } else {
      // For PPT references that don't match the strict pattern,
      // preserve the original if target format is PPT
      if (targetFormat === 'PPT') {
        return cleanRef; // Preserve original PPT reference
      } else {
        // Only convert to B format if explicitly requested
        numericPart = cleanRef.replace(/\D/g, '');
        return `B${numericPart.slice(-7).padStart(7, '0')}`;
      }
    }
  } else {
    // Unknown format, extract any numeric parts
    numericPart = cleanRef.replace(/\D/g, '');
    return targetFormat === 'B' ? 
      `B${numericPart.slice(-7).padStart(7, '0')}` : 
      `PPT${year}${month}${day}${numericPart.slice(-3).padStart(3, '0')}`;
  }
}

/**
 * Validates if a booking reference is in the correct PPT format
 * 
 * @param bookingRef - Booking reference to validate
 * @returns True if valid PPT format, false otherwise
 */
export function isValidPPTFormat(bookingRef: string): boolean {
  if (!bookingRef) return false;
  
  const cleanRef = bookingRef.replace(/["\s]/g, '').trim();
  const pptPattern = /^PPT\d{6}\d{3,}$/;
  
  return pptPattern.test(cleanRef);
}

/**
 * Extracts the date from a PPT format booking reference
 *
 * @param bookingRef - PPT format booking reference
 * @returns Date object or null if invalid format
 */
export function extractDateFromPPTRef(bookingRef: string): Date | null {
  if (!isValidPPTFormat(bookingRef)) return null;

  const cleanRef = bookingRef.replace(/["\s]/g, '').trim();
  const match = cleanRef.match(/^PPT(\d{2})(\d{2})(\d{2})\d{3,}$/);

  if (!match) return null;

  const [, year, month, day] = match;
  const fullYear = 2000 + parseInt(year, 10);

  return new Date(fullYear, parseInt(month, 10) - 1, parseInt(day, 10));
}

/**
 * Generates a MANUAL booking reference specifically for admin-created bookings
 * Uses MAN format to distinguish from frontend bookings
 *
 * Format: MANYYMMDDxxx
 * - MAN: Prefix for manual/admin bookings
 * - YYMMDD: Current date (2-digit year, month, day)
 * - xxx: 3-digit unique identifier based on input
 *
 * @param identifier - Unique identifier (timestamp, admin ID, etc.)
 * @returns Manual booking reference in MAN format
 */
export function generateManualBookingRef(identifier: string): string {
  // Create a MAN format booking reference for admin-created bookings
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString().slice(-2);
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const day = currentDate.getDate().toString().padStart(2, '0');

  // Extract numeric part from identifier for uniqueness
  const numericPart = identifier.replace(/\D/g, '').slice(-3).padStart(3, '0');

  // Generate MAN format: MANYYMMDDxxx
  const reference = `MAN${year}${month}${day}${numericPart}`;

  console.log(`✅ Generated MAN format manual booking reference: ${reference} from identifier: ${identifier}`);
  return reference;
}

/**
 * Validates if a booking reference is in the correct MAN format
 *
 * @param bookingRef - Booking reference to validate
 * @returns True if valid MAN format, false otherwise
 */
export function isValidMANFormat(bookingRef: string): boolean {
  if (!bookingRef) return false;

  const cleanRef = bookingRef.replace(/["\s]/g, '').trim();
  const manPattern = /^MAN\d{6}\d{3,}$/;

  return manPattern.test(cleanRef);
}

/**
 * Determines if a booking reference is from a manual/admin booking
 *
 * @param bookingRef - Booking reference to check
 * @returns True if manual booking, false if frontend booking
 */
export function isManualBooking(bookingRef: string): boolean {
  if (!bookingRef) return false;

  const cleanRef = bookingRef.replace(/["\s]/g, '').trim();
  return cleanRef.startsWith('MAN');
}
