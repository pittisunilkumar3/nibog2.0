import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Calculate age in months between two dates
export function calculateAgeInMonths(dob: Date, eventDate: Date = new Date()): number {
  // Clone dates to avoid modifying the originals
  const birthDate = new Date(dob)
  const targetDate = new Date(eventDate)

  let months = (targetDate.getFullYear() - birthDate.getFullYear()) * 12
  months -= birthDate.getMonth()
  months += targetDate.getMonth()

  // Adjust for day of month
  if (targetDate.getDate() < birthDate.getDate()) {
    months--
  }

  return months
}

// Format age in months to a readable string
export function formatAge(ageInMonths: number): string {
  if (ageInMonths < 24) {
    return `${ageInMonths} months`
  } else {
    const years = Math.floor(ageInMonths / 12)
    const months = ageInMonths % 12
    if (months === 0) {
      return `${years} ${years === 1 ? "year" : "years"}`
    } else {
      return `${years} ${years === 1 ? "year" : "years"} ${months} ${months === 1 ? "month" : "months"}`
    }
  }
}

// Check if a child is eligible for an event based on age range
export function isChildEligible(childDob: Date, eventDate: Date, minAgeMonths: number, maxAgeMonths: number): boolean {
  const ageInMonths = calculateAgeInMonths(childDob, eventDate)
  return ageInMonths >= minAgeMonths && ageInMonths <= maxAgeMonths
}

// Format date to YYYY-MM-DD format for API consistency
export function formatDateForAPI(date: Date | string): string {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  } else if (typeof date === 'string') {
    // If it's already a string, check if it's an ISO string and convert
    return date.includes('T') ? date.split('T')[0] : date;
  } else {
    throw new Error('Invalid date format');
  }
}

// Parse date from various formats to Date object
export function parseDateFromAPI(dateString: string): Date {
  // Handle YYYY-MM-DD format
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return new Date(dateString + 'T00:00:00.000Z');
  }
  // Handle ISO string format
  return new Date(dateString);
}

// Format price in Indian Rupees
export function formatPrice(price: number | string | undefined): string {
  // Convert price to a number and handle undefined/NaN cases
  const numericPrice = typeof price === 'string' ? parseFloat(price) : Number(price || 0);
  
  // Check if the result is a valid number
  if (isNaN(numericPrice)) {
    console.warn('Invalid price value:', price);
    return '₹0';
  }
  
  // Round to 2 decimal places
  const roundedPrice = Math.round(numericPrice * 100) / 100;
  
  // If it's a whole number, don't show decimal places
  if (roundedPrice === Math.floor(roundedPrice)) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(roundedPrice);
  }
  
  // Otherwise format with exactly 2 decimal places
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(roundedPrice);
}

// Format date to Indian format
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

// Format time
export function formatTime(time: string): string {
  return time
}

// Generate a random avatar based on name
export function getAvatarUrl(name: string): string {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff`
}
