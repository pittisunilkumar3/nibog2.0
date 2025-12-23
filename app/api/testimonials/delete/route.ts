import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {

    // Parse the request body
    const { id } = await request.json();

    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      return NextResponse.json(
        { error: "Invalid testimonial ID. ID must be a positive number." },
        { status: 400 }
      );
    }

    // Call the backend API to delete the testimonial
    const base = (process.env.BACKEND_URL || 'http://localhost:3004').replace(/\/$/, '');
    const forwardAuth = request.headers.get('authorization');
    const response = await fetch(`${base}/api/testimonials/${encodeURIComponent(String(id))}`, {
      method: 'DELETE',
      headers: {
        ...(forwardAuth ? { 'Authorization': forwardAuth } : {}),
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API error:', errorText);
      return NextResponse.json(
        { error: `Backend API returned error status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Server API route: Error deleting testimonial:", error);
    
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
      { error: error.message || "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}

// Also support POST method since frontend uses POST
export async function POST(request: Request) {
  return DELETE(request);
}
