import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    console.log("Server API route: Deleting testimonial via external API");

    // Parse the request body
    const { id } = await request.json();
    console.log(`Server API route: Deleting testimonial with ID: ${id}`);

    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      return NextResponse.json(
        { error: "Invalid testimonial ID. ID must be a positive number." },
        { status: 400 }
      );
    }

    // Call the external API to delete testimonial
    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/testimonials/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: Number(id) }),
    });

    console.log(`Server API route: Delete testimonial response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', errorText);
      return NextResponse.json(
        { error: `External API returned error status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Server API route: Delete operation successful:", data);

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
