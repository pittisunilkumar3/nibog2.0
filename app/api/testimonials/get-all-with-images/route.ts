import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';

export async function GET() {
  try {


    // Call the backend API endpoint for testimonials
    const response = await fetch(`${BACKEND_URL}/api/testimonials?status=Published`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store', // Disable caching to get real-time data
    });



    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API error:', errorText);
      return NextResponse.json(
        { error: `Backend API returned error status: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();


    // Extract data from the response
    const data = result.success && Array.isArray(result.data) ? result.data : [];

    // Transform the data to match our expected format
    const transformedData = data.map((item: any) => ({
      // Standard testimonial fields
      testimonial_id: item.id,
      testimonial_name: item.name,
      city: item.city_name || item.city,
      event_id: item.event_id,
      rating: item.rating,
      testimonial: item.testimonial,
      submitted_at: item.submitted_at,
      status: item.status,
      // Image fields
      image_url: item.image_url || '',
      image_priority: item.priority || 0,
      image_is_active: item.is_active === 1 || item.is_active === true,
      image_created_at: item.created_at,
      image_updated_at: item.updated_at
    }));



    return NextResponse.json(transformedData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error: any) {
    console.error("Server API route: Error getting testimonials:", error);

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
      { error: error.message || "Failed to get testimonials" },
      { status: 500 }
    );
  }
}
