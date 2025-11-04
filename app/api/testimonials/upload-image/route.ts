import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, existsSync } from 'fs';
import { promisify } from 'util';
import { join } from 'path';

const writeFileAsync = promisify(writeFile);
const mkdirAsync = promisify(mkdir);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Create directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'upload', 'testmonialimage');
    if (!existsSync(uploadDir)) {
      await mkdirAsync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000);
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `testimonial_${timestamp}_${randomSuffix}.${fileExtension}`;

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadDir, filename);

    await writeFileAsync(filePath, buffer);

    // Return the file path relative to the upload directory
    const relativePath = `/upload/testmonialimage/${filename}`;
    
    console.log(`Testimonial image uploaded successfully: ${relativePath}`);

    return NextResponse.json({
      success: true,
      path: relativePath,
      filename: filename,
      originalName: file.name,
      size: file.size
    });

  } catch (error) {
    console.error('Testimonial image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload testimonial image' },
      { status: 500 }
    );
  }
}
