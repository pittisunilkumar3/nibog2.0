import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and WebP images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file sizes (5MB limit per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB per file.' },
        { status: 400 }
      );
    }

    // Create directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'images', 'addons');

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Process each file
    const uploadedFiles = [];
    
    for (const file of files) {
      // Generate unique filename
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 10000);
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filename = `addon_${timestamp}_${randomSuffix}.${fileExtension}`;

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = join(uploadDir, filename);

      await writeFile(filePath, buffer);

      // Add to results
      uploadedFiles.push({
        filename: filename,
        url: `/images/addons/${filename}`,
        originalName: file.name,
        size: file.size
      });
    }

    // Return the uploaded file information
    const result = {
      success: true,
      files: uploadedFiles,
      count: uploadedFiles.length
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload files' },
      { status: 500 }
    );
  }
}
