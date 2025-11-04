import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    console.log('Starting home hero image deletion for ID:', body.id);

    // First, get the image details to find the file path
    let imageData = null;
    try {
      const getResponse = await fetch(
        'https://ai.nibog.in/webhook/v1/nibog/homesection/get',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (getResponse.ok) {
        const getResult = await getResponse.json();
        const images = Array.isArray(getResult) ? getResult : [];
        // Find the specific image by ID
        imageData = images.find((img: any) => img.id === body.id);
        console.log('Found image data for deletion:', imageData);
      }
    } catch (error) {
      console.warn('Could not fetch image details before deletion:', error);
      // Continue with deletion even if we can't get image details
    }

    // Delete the image record from the database via external API
    const response = await fetch(
      'https://ai.nibog.in/webhook/v1/nibog/homesection/delete',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: body.id }),
      }
    );

    console.log('External API delete response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API delete error:', errorText);
      throw new Error(`Failed to delete image from database: ${response.status}`);
    }

    const result = await response.json();
    console.log('External API delete result:', result);

    // Check if deletion was successful - handle various response formats
    let isSuccess = false;
    
    if (Array.isArray(result) && result.length > 0 && result[0]?.success) {
      isSuccess = true;
    } else if (result?.success === true) {
      isSuccess = true;
    } else if (Object.keys(result).length === 0) {
      // Empty object {} - treat as success if HTTP status was 200
      console.log('External API returned empty object, treating as success based on HTTP 200 status');
      isSuccess = true;
    } else if (response.status === 200) {
      // If HTTP status is 200, treat as success even with unexpected format
      console.log('External API returned HTTP 200, treating as success');
      isSuccess = true;
    }
    
    if (!isSuccess) {
      throw new Error(`External API did not confirm successful deletion. Response: ${JSON.stringify(result)}`);
    }

    // If database deletion was successful and we have image file path, delete the local file
    if (imageData && imageData.image_path) {
      try {
        const imagePath = imageData.image_path;
        console.log('Attempting to delete local file:', imagePath);

        // Convert the stored path to actual file system path
        // imagePath format: "public/images/blog/home/filename.jpg"
        let filePath;
        
        if (imagePath.startsWith('public/')) {
          // Remove 'public/' prefix and build full path
          const relativePath = imagePath.replace(/^public\//, '');
          filePath = join(process.cwd(), 'public', relativePath);
        } else if (imagePath.startsWith('/images/')) {
          // Handle URL format: "/images/blog/home/filename.jpg"
          filePath = join(process.cwd(), 'public', imagePath.substring(1));
        } else {
          // Assume it's already a relative path from public
          filePath = join(process.cwd(), 'public', imagePath);
        }

        console.log('Resolved file path for deletion:', filePath);

        // Check if file exists before trying to delete
        if (existsSync(filePath)) {
          await unlink(filePath);
          console.log('Successfully deleted local image file:', filePath);
        } else {
          console.log('Local image file not found, may have been already deleted:', filePath);
        }
      } catch (fileError) {
        console.error('Error deleting local image file:', fileError);
        // Don't fail the entire operation if file deletion fails
        // The image has already been deleted from the database
        
        // Return success but with a warning
        return NextResponse.json({
          ...result,
          warning: 'Image deleted from database but local file could not be removed',
          timestamp: Date.now(),
          deletedImagePath: imageData.image_path,
          cacheBust: true
        });
      }
    } else {
      console.log('No image path found, skipping local file deletion');
    }

    // Return success with cache-busting information
    return NextResponse.json({
      ...result,
      timestamp: Date.now(),
      deletedImagePath: imageData?.image_path,
      cacheBust: true
    });

  } catch (error) {
    console.error('Delete home hero image error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete image' },
      { status: 500 }
    );
  }
}