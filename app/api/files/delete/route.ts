import { NextRequest, NextResponse } from 'next/server'
import { deleteFile, isSafeToDelete } from '@/lib/fileUtils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filePath } = body

    // Validate required fields
    if (!filePath) {
      return NextResponse.json(
        { error: 'Missing required field: filePath' },
        { status: 400 }
      )
    }

    // Security check - only allow deletion of files in upload directories
    if (!isSafeToDelete(filePath)) {
      return NextResponse.json(
        { error: 'File deletion not allowed for this path' },
        { status: 403 }
      )
    }


    // Attempt to delete the file
    const deleted = await deleteFile(filePath)

    return NextResponse.json({
      success: true,
      message: deleted ? 'File deleted successfully' : 'File not found (may have been already deleted)',
      deleted: deleted,
      filePath: filePath
    })

  } catch (error) {
    console.error('File deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
