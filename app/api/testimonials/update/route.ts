import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log("Server API route: Updating testimonial via external API");

    // Parse the request body
    const testimonialData = await request.json();
    console.log("Server API route: Testimonial data:", JSON.stringify(testimonialData, null, 2));

    // Validate required fields according to API documentation
    if (!testimonialData.id || !testimonialData.name ||
        !testimonialData.event_id || !testimonialData.rating || !testimonialData.testimonial) {
      return NextResponse.json(
        { error: "Missing required testimonial data" },
        { status: 400 }
      );
    }

    // Call the external API to update testimonial
    console.log("Server API route: Calling external API to update testimonial");

    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/testimonials/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: testimonialData.id,
        name: testimonialData.name,
        city: testimonialData.city || null, // City can be null as shown in the API response
        event_id: testimonialData.event_id,
        rating: testimonialData.rating,
        testimonial: testimonialData.testimonial,
        date: testimonialData.date || new Date().toISOString().split('T')[0],
        status: testimonialData.status || 'Published'
      }),
    });

    console.log(`Server API route: Update testimonial response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', errorText);
      return NextResponse.json(
        { error: `External API returned error status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Server API route: Testimonial updated successfully:", data);

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Server API route: Error updating testimonial:", error);

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
      { error: error.message || "Failed to update testimonial" },
      { status: 500 }
    );
  }
}
