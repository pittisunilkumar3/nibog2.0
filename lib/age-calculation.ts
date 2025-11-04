/**
 * Age calculation utilities for NIBOG platform
 * These functions handle the core logic for calculating a child's age in months
 * relative to an event date, which is critical for event filtering and eligibility checks.
 */

/**
 * Calculate a child's age in months on a specific date
 * @param dob Child's date of birth
 * @param eventDate The date of the event
 * @returns Age in months
 */
export function calculateAgeInMonths(dob: Date, eventDate: Date): number {
  // Calculate difference in months
  const months = (eventDate.getFullYear() - dob.getFullYear()) * 12 + 
                 (eventDate.getMonth() - dob.getMonth());
  
  // Adjust for day of month if needed
  if (eventDate.getDate() < dob.getDate()) {
    return months - 1;
  }
  
  return months;
}

/**
 * Check if a child is eligible for an event based on age range
 * @param dob Child's date of birth
 * @param eventDate The date of the event
 * @param minAgeMonths Minimum age in months required for the event
 * @param maxAgeMonths Maximum age in months allowed for the event
 * @returns Boolean indicating eligibility
 */
export function isChildEligible(
  dob: Date, 
  eventDate: Date, 
  minAgeMonths: number, 
  maxAgeMonths: number
): boolean {
  const ageInMonths = calculateAgeInMonths(dob, eventDate);
  return ageInMonths >= minAgeMonths && ageInMonths <= maxAgeMonths;
}

/**
 * Format age in months to a human-readable string
 * @param months Age in months
 * @returns Formatted age string (e.g., "18 months" or "2 years 6 months")
 */
export function formatAge(months: number): string {
  // Handle edge cases
  if (months < 0) {
    return "0 months";
  }

  if (months < 24) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? "year" : "years"}`;
  }

  return `${years} ${years === 1 ? "year" : "years"} ${remainingMonths} ${remainingMonths === 1 ? "month" : "months"}`;
}

/**
 * Get a child's age in months at the time of an event
 * @param child Child object with DOB
 * @param eventDate The date of the event
 * @returns Age in months
 */
export function getChildAgeAtEvent(childDob: string, eventDate: string): number {
  return calculateAgeInMonths(new Date(childDob), new Date(eventDate));
}
