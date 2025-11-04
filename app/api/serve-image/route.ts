import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json(
        { error: 'Image path is required' },
        { status: 400 }
      );
    }

    // Remove leading ./ if present and normalize path
    const cleanPath = path.replace(/^\.\//, '');
    const filePath = join(process.cwd(), cleanPath);

    // Security check: ensure path is within upload directory
    const uploadDir = join(process.cwd(), 'upload');
    if (!filePath.startsWith(uploadDir)) {
      return NextResponse.json(
        { error: 'Invalid image path' },
        { status: 403 }
      );
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Read the file
    const imageBuffer = await readFile(filePath);

    // Determine content type based on file extension
    const ext = path.split('.').pop()?.toLowerCase();
    const contentTypeMap: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
    };
    const contentType = contentTypeMap[ext || 'jpg'] || 'image/jpeg';

    // Return image with cache-busting headers
    return new NextResponse(imageBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('Image serving error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to serve image' },
      { status: 500 }
    );
  }
}
