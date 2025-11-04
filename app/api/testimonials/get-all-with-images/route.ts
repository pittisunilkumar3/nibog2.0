import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log("Server API route: Getting testimonials with images from external API");

    // Call the testimonial images API endpoint that returns complete data
    const response = await fetch('https://ai.nibog.in/webhook/nibog/testmonialimages/get', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store', // Disable caching to get real-time data
    });

    console.log(`External API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', errorText);
      return NextResponse.json(
        { error: `External API returned error status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Testimonials with images data received:", data);

    // Transform the data to match our expected format
    const transformedData = Array.isArray(data) ? data.map(item => ({
      // Standard testimonial fields (for compatibility)
      id: item.testimonial_id,
      name: item.testimonial_name,
      city: item.city,
      event_id: item.event_id,
      rating: item.rating,
      testimonial: item.testimonial,
      submitted_at: item.submitted_at,
      status: item.status,
      // Original API response fields
      testimonial_id: item.testimonial_id,
      testimonial_name: item.testimonial_name,
      // Image fields
      image_id: item.image_id,
      image_url: item.image_url,
      image_priority: item.image_priority,
      image_is_active: item.image_is_active,
      image_created_at: item.image_created_at,
      image_updated_at: item.image_updated_at
    })) : [];

    return NextResponse.json(transformedData, { status: 200 });
  } catch (error: any) {
    console.error("Server API route: Error getting testimonials with images:", error);
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: "Request timeout - the testimonials service is taking too long to respond" },
        { status: 504 }
      );
    }
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return NextResponse.json(
        { error: "Unable to connect to testimonials service" },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to get testimonials with images" },
      { status: 500 }
    );
  }
}
