import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'
const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:3004').replace(/\/$/, '');

export async function POST(request: Request) {
  try {


    // Parse the request body
    const imageData = await request.json();


    // Validate required fields
    if (!imageData.testimonial_id || !imageData.image_url || !imageData.priority) {
      return NextResponse.json(
        { error: "Missing required testimonial image data" },
        { status: 400 }
      );
    }

    // Ensure is_active is set to true by default
    const payload = {
      image_url: imageData.image_url,
      priority: imageData.priority,
      is_active: imageData.is_active !== undefined ? imageData.is_active : true
    };

    // Update testimonial on backend (PUT to testimonial resource)
    const apiUrl = `${BACKEND_URL}/api/testimonials/${encodeURIComponent(String(imageData.testimonial_id))}`;


    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: 'no-store'
    });

    clearTimeout(timeoutId);



    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server API route: Error response: ${errorText}`);

      let errorMessage = `Error updating testimonial image: ${response.status}`;
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
      data = data.map(item => {
        if (item && item.image_url) {
          let imageUrl = item.image_url;

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
          // If it already starts with http or /, leave it as is



          return {
            ...item,
            image_url: imageUrl
          };
        }
        return item;
      });
    }



    // Return the response with success status
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Server API route: Error updating testimonial image:", error);

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
      { error: error.message || "Failed to update testimonial image" },
      { status: 500 }
    );
  }
}
