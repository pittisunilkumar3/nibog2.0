import { unlink } from 'fs/promises'
import { join } from 'path'

/**
 * Delete a file from the filesystem
 * @param filePath The relative path to the file (e.g., "./upload/eventimages/filename.jpg")
 * @returns Promise<boolean> - true if deleted successfully, false if file doesn't exist
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    // Convert relative path to absolute path
    // Remove the leading "./" if present
    const cleanPath = filePath.startsWith('./') ? filePath.substring(2) : filePath
    const absolutePath = join(process.cwd(), cleanPath)
    
    await unlink(absolutePath)
    return true
  } catch (error: any) {
    if (error.code === 'ENOENT') {
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
  return filePath.split('/').pop() || filePath
}

/**
 * Check if a file path is valid for deletion (security check)
 * @param filePath The file path to check
 * @returns boolean - true if safe to delete
 */
export function isSafeToDelete(filePath: string): boolean {
  // Only allow deletion of files in upload directories and homepage hero images
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
    'upload/partner/'
  ]
  return allowedPaths.some(allowedPath => filePath.includes(allowedPath))
}
