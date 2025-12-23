import { NextResponse } from 'next/server';

// Configure route segment to allow dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {

    // Call the backend API to get testimonials
    const base = (process.env.BACKEND_URL || "http://localhost:3004").replace(/\/$/, "");
    const response = await fetch(`${base}/api/testimonials?limit=1000&offset=0`, {
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
      console.error('External API error:', errorText);
      return NextResponse.json(
        { error: `External API returned error status: ${response.status}` },
        { status: response.status }
      );
    }

    const testimonials = await response.json();
    
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
