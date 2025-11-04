/**
 * Image Cache Buster Utility
 * 
 * This utility helps prevent image caching issues in production by adding
 * timestamps to image URLs, ensuring that newly uploaded images are always
 * visible without requiring a rebuild.
 */

/**
 * Add a cache-busting query parameter to an image URL
 * @param imageUrl - The original image URL
 * @param timestamp - Optional timestamp (defaults to current time)
 * @returns The image URL with cache-busting parameter
 */
export function addCacheBuster(imageUrl: string, timestamp?: number): string {
  if (!imageUrl) return imageUrl;
  
  const ts = timestamp || Date.now();
  const separator = imageUrl.includes('?') ? '&' : '?';
  
  return `${imageUrl}${separator}t=${ts}`;
}

/**
 * Extract the base URL without cache-busting parameters
 * @param imageUrl - The image URL possibly with cache-busting parameters
 * @returns The base image URL
 */
export function removeCacheBuster(imageUrl: string): string {
  if (!imageUrl) return imageUrl;
  
  return imageUrl.split('?')[0];
}

/**
 * Convert a relative upload path to an absolute URL with cache busting
 * @param path - The relative path (e.g., "./upload/eventimages/image.jpg")
 * @param baseUrl - Optional base URL (defaults to current origin)
 * @returns Absolute URL with cache busting
 */
export function toAbsoluteImageUrl(path: string, baseUrl?: string): string {
  if (!path) return path;
  
  // If already an absolute URL, just add cache buster
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return addCacheBuster(path);
  }
  
  // Remove leading ./ if present
  const cleanPath = path.replace(/^\.\//, '');
  
  // Use provided base URL or construct from current origin
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  
  // Construct absolute URL with cache buster
  return addCacheBuster(`${base}/${cleanPath}`);
}

/**
 * Get a cache-busted image URL for Next.js Image component
 * This handles both relative and absolute URLs
 * @param imageUrl - The image URL
 * @returns Cache-busted image URL suitable for Next.js Image
 */
export function getCacheBustedImageUrl(imageUrl: string): string {
  if (!imageUrl) return imageUrl;
  
  // For relative paths starting with ./, convert to absolute
  if (imageUrl.startsWith('./')) {
    return toAbsoluteImageUrl(imageUrl);
  }
  
  // For paths starting with /, add cache buster
  if (imageUrl.startsWith('/')) {
    return addCacheBuster(imageUrl);
  }
  
  // For absolute URLs, add cache buster
  return addCacheBuster(imageUrl);
}
