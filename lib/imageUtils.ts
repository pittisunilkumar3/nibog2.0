import { isAbsolute, normalize } from 'path'

/**
 * Normalize a filesystem path and convert backslashes to forward slashes
 */
export function normalizeToPosix(p: string): string {
  if (!p) return p
  // Remove leading './' and normalize slashes
  const cleaned = normalize(p).replace(/\\/g, '/')
  return cleaned.startsWith('./') ? cleaned.substring(2) : cleaned
}

/**
 * Build a URL that serves an image via the local `/api/serve-image` route.
 * Accepts a filename, relative upload path, or absolute path.
 * Returns a URL like `/api/serve-image?path=upload/eventimages/filename.jpg`
 */
export function buildServeImageUrl(rawPath: string, defaultUploadDir = 'upload/eventimages/'): string {
  if (!rawPath) return rawPath

  // If already an absolute HTTP URL or a data URL, return as-is
  const lower = rawPath.toLowerCase()
  if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('data:')) {
    return rawPath
  }

  // If it's already our API format with query, leave it
  if (rawPath.startsWith('/api/serve-image?path=')) {
    return rawPath
  }

  // If it's a path-like '/api/serve-image/...' (legacy), try to convert to query format
  if (rawPath.startsWith('/api/serve-image/')) {
    const rest = rawPath.replace('/api/serve-image/', '')
    return `/api/serve-image?path=${encodeURIComponent(rest)}`
  }

  // Normalize slashes and remove leading './' or leading drive letters
  const normalized = normalizeToPosix(rawPath)

  // If it already contains upload/ prefix, use it directly
  let relPath = normalized
  const idx = normalized.toLowerCase().indexOf('upload/')
  if (idx !== -1) {
    relPath = normalized.substring(idx)
  } else if (!normalized.includes('/')) {
    // If it's just a filename with no slashes, assume default upload directory
    relPath = `${defaultUploadDir}${normalized}`
  }

  return `/api/serve-image?path=${encodeURIComponent(relPath)}`
}