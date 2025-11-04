import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log("Server API route: Updating testimonial image");

    // Parse the request body
    const imageData = await request.json();
    console.log("Server API route: Testimonial image data:", JSON.stringify(imageData, null, 2));

    // Validate required fields
    if (!imageData.testimonial_id || !imageData.image_url || !imageData.priority) {
      return NextResponse.json(
        { error: "Missing required testimonial image data" },
        { status: 400 }
      );
    }

    // Ensure is_active is set to true by default
    const payload = {
      testimonial_id: imageData.testimonial_id,
      image_url: imageData.image_url,
      priority: imageData.priority,
      is_active: imageData.is_active !== undefined ? imageData.is_active : true
    };

    // Forward the request to the external API
    const apiUrl = "https://ai.nibog.in/webhook/nibog/testmonialimages/update";
    console.log("Server API route: Calling API URL:", apiUrl);
    console.log("Server API route: Payload:", JSON.stringify(payload, null, 2));

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

    console.log(`Server API route: Testimonial image update response status: ${response.status}`);

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
    console.log(`Server API route: Raw response: ${responseText}`);

    let data;
    try {
      // Try to parse the response as JSON
      data = JSON.parse(responseText);
      console.log("Server API route: Parsed response data:", data);
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
            console.log(`Server API route: Found placeholder URL: ${imageUrl}, attempting to find local image for testimonial ${item.testimonial_id}`);
            // For now, set to null so frontend can handle gracefully
            imageUrl = null;
          }
          // If it already starts with http or /, leave it as is

          console.log(`Server API route: Transformed image URL from "${item.image_url}" to "${imageUrl}"`);

          return {
            ...item,
            image_url: imageUrl
          };
        }
        return item;
      });
    }

    console.log("Server API route: Final transformed data:", data);

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
