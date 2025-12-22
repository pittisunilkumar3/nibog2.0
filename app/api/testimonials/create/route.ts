import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {


    // Parse the request body
    const testimonialData = await request.json();


    // Validate required fields according to API documentation
    if (!testimonialData.name || !testimonialData.event_id ||
      !testimonialData.rating || !testimonialData.testimonial) {
      return NextResponse.json(
        { error: "Missing required testimonial data" },
        { status: 400 }
      );
    }

    // Call the backend API to create testimonial

    const base = (process.env.BACKEND_URL || 'http://localhost:3004').replace(/\/$/, '');
    const backendUrl = `${base}/api/testimonials`;
    const forwardAuth = request.headers.get('authorization');

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(forwardAuth ? { 'Authorization': forwardAuth } : {})
      },
      body: JSON.stringify({
        name: testimonialData.name,
        city_id: testimonialData.city_id || null,
        event_id: testimonialData.event_id,
        rating: testimonialData.rating,
        testimonial: testimonialData.testimonial,
        submitted_at: testimonialData.date || new Date().toISOString().split('T')[0],
        status: testimonialData.status || 'Published'
      }),
      cache: 'no-store'
    });



    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', errorText);
      return NextResponse.json(
        { error: `External API returned error status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();


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
