import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large' }, { status: 400 });
    }
    // Create directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'upload', 'partner');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000);
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `partner_${timestamp}_${randomSuffix}.${fileExtension}`;
    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadDir, filename);
    writeFileSync(filePath, buffer);
    // Return the API path for serving
    return NextResponse.json({
      success: true,
      url: `/api/serve-image?path=upload/partner/${filename}`,
      filename,
      originalName: file.name,
      size: file.size,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to upload file' }, { status: 500 });
  }
}
