import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join, normalize, sep } from 'path';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    
    if (!params.path || params.path.length === 0) {
      return new NextResponse('Image path required', { status: 400 });
    }

    // Clean up path segments - remove any leading './' or '.'
    const cleanedPath = params.path.map(segment => segment.replace(/^\.\//, '').replace(/^\./, ''));
    const imagePath = cleanedPath.join(sep);
    const normalizedPath = normalize(imagePath);
    const basePath = process.cwd();
    
    // First, try the path as-is from the base
    let fullPath = join(basePath, normalizedPath);
    
    // If not found and path doesn't start with 'upload', prepend it
    if (!existsSync(fullPath) && !normalizedPath.startsWith('upload')) {
      fullPath = join(basePath, 'upload', normalizedPath);
    }
    
    if (!existsSync(fullPath)) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const fileBuffer = await readFile(fullPath);
    const ext = normalizedPath.split('.').pop()?.toLowerCase();
    
    let contentType = 'image/jpeg';
    if (ext === 'png') contentType = 'image/png';
    else if (ext === 'gif') contentType = 'image/gif';
    else if (ext === 'webp') contentType = 'image/webp';
    else if (ext === 'svg') contentType = 'image/svg+xml';


    // Convert Buffer to Uint8Array for Response compatibility
    const uint8Array = new Uint8Array(fileBuffer);

    return new Response(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Error serving image', { status: 500 });
  }
}
