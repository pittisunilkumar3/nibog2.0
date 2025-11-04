import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log("Server API route: Getting testimonials from external API");

    // Call the external API
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

    const testimonials = await response.json();
    console.log(`Retrieved ${testimonials.length} testimonials from external API`);
    
    // Log first testimonial for debugging
    if (testimonials.length > 0) {
      console.log('Sample testimonial:', testimonials[0]);
    }

    // Return with cache-busting headers
    return NextResponse.json(testimonials, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error: any) {
    console.error("Server API route: Error getting testimonials:", error);

    return NextResponse.json(
      { error: error.message || "Failed to get testimonials" },
      { status: 500 }
    );
  }
}
