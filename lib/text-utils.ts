/**
 * Truncate text with ellipsis
 * @param text The text to truncate
 * @param maxLength Maximum length before truncation (default: 150)
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string | null | undefined, maxLength: number = 150): string {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Truncate text for table cells (shorter length)
 * @param text The text to truncate
 * @param maxLength Maximum length before truncation (default: 100)
 * @returns Truncated text with ellipsis if needed
 */
export function truncateTableText(text: string | null | undefined, maxLength: number = 100): string {
  return truncateText(text, maxLength);
}

/**
 * Truncate text for card descriptions
 * @param text The text to truncate
 * @param maxLength Maximum length before truncation (default: 120)
 * @returns Truncated text with ellipsis if needed
 */
export function truncateCardText(text: string | null | undefined, maxLength: number = 120): string {
  return truncateText(text, maxLength);
}
