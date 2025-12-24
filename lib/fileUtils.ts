import { unlink } from 'fs/promises'
import { join, isAbsolute } from 'path'

/**
 * Delete a file from the filesystem
 * @param filePath The path to the file (relative or absolute)
 * @returns Promise<boolean> - true if deleted successfully, false if file doesn't exist
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    // Normalize to forward slashes for consistent checks
    const normalized = filePath.replace(/\\/g, '/')

    // Remove the leading "./" if present
    const cleanPath = normalized.startsWith('./') ? normalized.substring(2) : normalized

    // If an absolute path was supplied, use it as-is; otherwise resolve relative to cwd
    const absolutePath = isAbsolute(filePath) ? filePath : join(process.cwd(), cleanPath)

    await unlink(absolutePath)
    return true
  } catch (error: any) {
    if (error && (error.code === 'ENOENT' || error.code === 'ENOENT'.toString())) {
      return false
    }
    console.error(`Error deleting file ${filePath}:`, error)
    throw error
  }
}

/**
 * Extract filename from a file path
 * @param filePath The file path (e.g., "./upload/eventimages/filename.jpg")
 * @returns The filename (e.g., "filename.jpg")
 */
export function extractFilename(filePath: string): string {
  // Normalize and split on forward slash
  const normalized = filePath.replace(/\\/g, '/')
  return normalized.split('/').pop() || normalized
}

/**
 * Check if a file path is valid for deletion (security check)
 * @param filePath The file path to check
 * @returns boolean - true if safe to delete
 */
export function isSafeToDelete(filePath: string): boolean {
  // Normalize to forward slashes to handle Windows paths
  const normalized = filePath.replace(/\\/g, '/')

  // Allowlist of upload directories (include both spellings for testimonials)
  const allowedPaths = [
    './upload/eventimages/',
    './upload/gamesimage/',
    './upload/gameimages/',
    'upload/eventimages/',
    'upload/gamesimage/',
    'upload/gameimages/',
    './upload/blog/home/',
    'upload/blog/home/',
    './upload/partner/',
    'upload/partner/',
    './upload/babygames/',
    'upload/babygames/',
    // Testimonial images - include both 'testimonial' and existing 'testmonialimage' directories
    './upload/testmonialimage/',
    'upload/testmonialimage/',
    './upload/testimonial/',
    'upload/testimonial/',
    './upload/testimonialimage/',
    'upload/testimonialimage/'
  ]

  return allowedPaths.some(allowedPath => normalized.includes(allowedPath))
}
