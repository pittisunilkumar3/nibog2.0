import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log("Server API route: Creating new testimonial");

    // Parse the request body
    const testimonialData = await request.json();
    console.log("Server API route: Testimonial data:", JSON.stringify(testimonialData, null, 2));

    // Validate required fields according to API documentation
    if (!testimonialData.name || !testimonialData.event_id ||
        !testimonialData.rating || !testimonialData.testimonial) {
      return NextResponse.json(
        { error: "Missing required testimonial data" },
        { status: 400 }
      );
    }

    // Call the external API to create testimonial
    console.log("Server API route: Calling external API to create testimonial");

    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/testimonials/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: testimonialData.name,
        city_id: testimonialData.city_id || null, // Send city_id instead of city name
        event_id: testimonialData.event_id,
        rating: testimonialData.rating,
        testimonial: testimonialData.testimonial,
        date: testimonialData.date || new Date().toISOString().split('T')[0],
        status: testimonialData.status || 'Published'
      }),
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
    console.log("Server API route: Testimonial created successfully:", data);
    
    // Return the response with success status
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Server API route: Error creating testimonial:", error);
    
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
      { error: error.message || "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
