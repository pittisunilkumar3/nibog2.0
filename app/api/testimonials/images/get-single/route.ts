import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {


    // Parse the request body
    const requestData = await request.json();


    // Validate required fields
    if (!requestData.testmonial_id) {
      return NextResponse.json(
        { error: "Missing required testmonial_id" },
        { status: 400 }
      );
    }

    // Prepare payload for external API (note: API expects 'testmonial_id' not 'testimonial_id')
    const payload = {
      testmonial_id: requestData.testmonial_id
    };

    // Forward the request to the external API
    const apiUrl = "https://ai.nibog.in/webhook/nibog/testmonialimages/getsingle";


    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);



    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server API route: Error response: ${errorText}`);

      let errorMessage = `Error getting testimonial image: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If we can't parse the error as JSON, use the status code
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // Get the response data
    const responseText = await response.text();


    let data;
    try {
      // Try to parse the response as JSON
      data = JSON.parse(responseText);

    } catch (parseError) {
      console.error("Server API route: Error parsing response:", parseError);
      return NextResponse.json(
        {
          error: "Failed to parse API response",
          rawResponse: responseText.substring(0, 500)
        },
        { status: 500 }
      );
    }

    // Transform image URLs to use local image serving API (similar to events)
    if (Array.isArray(data)) {
      data = await Promise.all(data.map(async (item) => {
        if (item && item.image_url) {
          let imageUrl = item.image_url;
          let originalUrl = imageUrl;

          // Convert relative paths to use local serving API
          if (imageUrl.startsWith('./')) {
            // Remove the './' prefix and use local serving API
            imageUrl = `/api/serve-image/${imageUrl.substring(2)}`;
          } else if (imageUrl.startsWith('upload/')) {
            // If it starts with 'upload/', use it directly with local serving API
            imageUrl = `/api/serve-image/${imageUrl}`;
          } else if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
            // If it's a relative path without './', assume it's in upload directory
            imageUrl = `/api/serve-image/upload/testmonialimage/${imageUrl}`;
          } else if (imageUrl.includes('example.com') || imageUrl.includes('placeholder')) {
            // Handle placeholder URLs - try to find actual local image

            // For now, set to null so frontend can handle gracefully
            imageUrl = null;
          }

          // Check if the transformed path exists, if not try alternative paths
          if (imageUrl && imageUrl.startsWith('/api/serve-image/')) {
            const { existsSync } = await import('fs');
            const { join } = await import('path');

            // Extract the file path from the API URL
            const filePath = imageUrl.replace('/api/serve-image/', '');
            const fullPath = join(process.cwd(), filePath);

            if (!existsSync(fullPath)) {


              // Try alternative directory mappings
              const alternatives = [
                filePath.replace('upload/testimonial/', 'upload/testmonialimage/'),
                filePath.replace('upload/testmonialimage/', 'upload/testimonial/'),
                `upload/testmonialimage/${filePath.split('/').pop()}`, // Just filename in testmonialimage
                `upload/testimonial/${filePath.split('/').pop()}` // Just filename in testimonial
              ];

              let foundPath = null;
              for (const altPath of alternatives) {
                const altFullPath = join(process.cwd(), altPath);
                if (existsSync(altFullPath)) {
                  foundPath = `/api/serve-image/${altPath}`;

                  break;
                }
              }

              if (foundPath) {
                imageUrl = foundPath;
              } else {

                imageUrl = null;
              }
            }
          }
          // If it already starts with http or /, leave it as is



          return {
            ...item,
            image_url: imageUrl
          };
        }
        return item;
      }));
    }



    // Return the response with success status
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Server API route: Error getting testimonial image:", error);

    // Handle specific error types
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: "Request timeout - the testimonial images service is taking too long to respond" },
        { status: 504 }
      );
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return NextResponse.json(
        { error: "Unable to connect to testimonial images service" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to get testimonial image" },
      { status: 500 }
    );
  }
}