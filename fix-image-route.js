const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'api', 'serve-image', '[...path]', 'route.ts');
const content = `import { NextRequest, NextResponse } from 'next/server';
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
    console.log('IMAGE REQUEST:', params.path);
    
    if (!params.path || params.path.length === 0) {
      return new NextResponse('Image path required', { status: 400 });
    }

    const imagePath = params.path.join(sep);
    const normalizedPath = normalize(imagePath);
    const basePath = process.cwd();
    let fullPath = join(basePath, normalizedPath);
    
    if (!existsSync(fullPath)) {
      fullPath = join(basePath, 'upload', normalizedPath);
    }
    
    if (!existsSync(fullPath)) {
      console.log('File not found:', fullPath);
      return new NextResponse('Image not found', { status: 404 });
    }

    const fileBuffer = await readFile(fullPath);
    const ext = normalizedPath.split('.').pop()?.toLowerCase();
    
    let contentType = 'image/jpeg';
    if (ext === 'png') contentType = 'image/png';
    else if (ext === 'gif') contentType = 'image/gif';
    else if (ext === 'webp') contentType = 'image/webp';
    else if (ext === 'svg') contentType = 'image/svg+xml';

    console.log('Serving image:', fullPath, 'Size:', fileBuffer.length);

    return new NextResponse(fileBuffer, {
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
`;

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ File written successfully to:', filePath);
