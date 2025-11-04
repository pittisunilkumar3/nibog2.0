import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // First, get the template details to find the background image path
    let templateData = null;
    try {
      const getResponse = await fetch(
        'https://ai.nibog.in/webhook/v1/nibog/certificate-templates/get',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: body.id }),
        }
      );

      if (getResponse.ok) {
        const getResult = await getResponse.json();
        // Handle both array and object response formats
        templateData = Array.isArray(getResult) ? getResult[0] : getResult;
        console.log('Template data for deletion:', templateData);
      }
    } catch (error) {
      console.warn('Could not fetch template details before deletion:', error);
      // Continue with deletion even if we can't get template details
    }

    // Delete the template from the database
    const response = await fetch(
      'https://ai.nibog.in/webhook/v1/nibog/certificate-templates/delete',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n delete error:', errorText);
      throw new Error(`Failed to delete template: ${response.status}`);
    }

    const result = await response.json();

    // If template deletion was successful and we have image files, delete them
    if (templateData) {
      const imagesToDelete = [];

      // Add background image to deletion list
      if (templateData.background_image) {
        imagesToDelete.push({
          path: templateData.background_image,
          type: 'background'
        });
      }

      // Add signature image to deletion list
      if (templateData.signature_image) {
        imagesToDelete.push({
          path: templateData.signature_image,
          type: 'signature'
        });
      }

      // Delete all image files
      for (const imageInfo of imagesToDelete) {
        try {
          const imagePath = imageInfo.path;

          if (imagePath && imagePath.startsWith('/images/certificatetemplates/')) {
            // Convert the URL path to actual file system path
            const filename = imagePath.split('/').pop();
            const filePath = join(process.cwd(), 'public', 'images', 'certificatetemplates', filename);

            console.log(`Attempting to delete ${imageInfo.type} image file:`, filePath);

            // Check if file exists before trying to delete
            if (existsSync(filePath)) {
              await unlink(filePath);
              console.log(`Successfully deleted ${imageInfo.type} image file:`, filename);
            } else {
              console.log(`${imageInfo.type} image file not found, may have been already deleted:`, filename);
            }
          } else {
            console.log(`${imageInfo.type} image path does not match expected format:`, imagePath);
          }
        } catch (fileError) {
          console.error(`Error deleting ${imageInfo.type} image file:`, fileError);
          // Don't fail the entire operation if file deletion fails
          // The template has already been deleted from the database
        }
      }
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Delete template error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete template' },
      { status: 500 }
    );
  }
}
