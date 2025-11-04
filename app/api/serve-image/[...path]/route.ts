import { NextRequest, NextResponse } from 'next/server';
import { readFile, readdir } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    console.log('🖼️ Serving image request:', params.path);

    if (!params.path || params.path.length === 0) {
      console.error('❌ No image path provided');
      return new NextResponse('Image path required', { status: 400 });
    }

    // Reconstruct the file path
    const imagePath = params.path.join('/');
    console.log('📁 Reconstructed image path:', imagePath);

    // Security check - ensure path doesn't contain dangerous patterns
    if (imagePath.includes('..') || imagePath.includes('\\..')) {
      console.error('❌ Invalid path detected:', imagePath);
      return new NextResponse('Invalid path', { status: 400 });
    }

    // Build the full file path
    const fullPath = join(process.cwd(), imagePath);
    console.log('🔍 Full file path:', fullPath);

    // Check if file exists
    if (!existsSync(fullPath)) {
      console.error('❌ Image file not found:', fullPath);

      // FALLBACK LOGIC: Try to find an alternative image in the same directory
      const directory = dirname(fullPath);
      const requestedFilename = basename(fullPath);

      console.log(`🔄 Attempting fallback for missing file: ${requestedFilename}`);
      console.log(`📁 Searching in directory: ${directory}`);

      try {
        const files = await readdir(directory);
        const imageFiles = files.filter(file => {
          const ext = file.split('.').pop()?.toLowerCase();
          return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
        });

        if (imageFiles.length > 0) {
          // Use the first available image as fallback
          const fallbackFile = imageFiles[0];
          const fallbackPath = join(directory, fallbackFile);

          console.log(`🔄 Using fallback image: ${fallbackFile}`);

          const fallbackBuffer = await readFile(fallbackPath);
          const fallbackExt = fallbackFile.split('.').pop()?.toLowerCase();

          let fallbackContentType = 'image/jpeg';
          switch (fallbackExt) {
            case 'png': fallbackContentType = 'image/png'; break;
            case 'gif': fallbackContentType = 'image/gif'; break;
            case 'webp': fallbackContentType = 'image/webp'; break;
            default: fallbackContentType = 'image/jpeg';
          }

          return new NextResponse(fallbackBuffer, {
            status: 200,
            headers: {
              'Content-Type': fallbackContentType,
              'Cache-Control': 'public, max-age=3600', // Shorter cache for fallback
              'Content-Length': fallbackBuffer.length.toString(),
              'X-Fallback-Image': 'true',
              'X-Original-Request': requestedFilename,
              'X-Served-File': fallbackFile,
            },
          });
        }
      } catch (fallbackError) {
        console.log(`❌ Fallback search failed: ${fallbackError}`);
      }

      // If no fallback found, try to serve a default placeholder
      try {
        const defaultImagePath = join(process.cwd(), 'public', 'images', 'default-game.jpg');
        if (existsSync(defaultImagePath)) {
          console.log(`🔄 Using default placeholder image`);

          const defaultBuffer = await readFile(defaultImagePath);

          return new NextResponse(defaultBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'image/jpeg',
              'Cache-Control': 'public, max-age=3600',
              'Content-Length': defaultBuffer.length.toString(),
              'X-Fallback-Image': 'true',
              'X-Original-Request': requestedFilename,
              'X-Served-File': 'default-game.jpg',
            },
          });
        }
      } catch (defaultError) {
        console.log(`❌ Default placeholder not found: ${defaultError}`);
      }

      // Final fallback: return 404 with helpful information
      return new NextResponse(`Image not found: ${requestedFilename}. No fallback images available.`, {
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    // Read the file
    const fileBuffer = await readFile(fullPath);
    console.log('✅ Image file read successfully, size:', fileBuffer.length);

    // Determine content type based on file extension
    const extension = imagePath.split('.').pop()?.toLowerCase();
    let contentType = 'image/jpeg'; // default

    switch (extension) {
      case 'png':
        contentType = 'image/png';
        break;
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'svg':
        contentType = 'image/svg+xml';
        break;
      default:
        contentType = 'image/jpeg';
    }

    console.log('📄 Content type:', contentType);

    // Return the image with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'X-Image-Path': imagePath,
        'X-File-Size': fileBuffer.length.toString()
      },
    });

  } catch (error) {
    console.error('❌ Error serving image:', error);
    return new NextResponse(
      `Error serving image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    );
  }
}
