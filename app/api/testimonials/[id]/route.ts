import { NextRequest, NextResponse } from 'next/server';

// Base URL for external API
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';

/**
 * GET /api/testimonials/[id]
 * Public endpoint - Get a single testimonial by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, message: 'Invalid testimonial ID' },
        { status: 400 }
      );
    }

    console.log(`GET /api/testimonials/${id} - Fetching testimonial`);

    // Call external API to get single testimonial
    const response = await fetch(
      `${BACKEND_URL}/api/testimonials/${id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, message: 'Testimonial not found' },
          { status: 404 }
        );
      }
      
      const errorText = await response.text();
      console.error('External API error:', errorText);
      return NextResponse.json(
        { success: false, message: `Failed to fetch testimonial: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    // Handle both direct data and wrapped response
    const testimonial = result.data || result;
    
    return NextResponse.json(
      {
        success: true,
        data: testimonial
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`GET /api/testimonials/[id] - Error:`, error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/testimonials/[id]
 * Protected endpoint - Update a testimonial (requires employee auth)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check for authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, message: 'Invalid testimonial ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate rating if provided
    if (body.rating !== undefined && (body.rating < 1 || body.rating > 5)) {
      return NextResponse.json(
        { success: false, message: 'rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    console.log(`PUT /api/testimonials/${id} - Updating testimonial:`, body);

    // Prepare payload for external API (only include fields that are provided)
    const payload: any = { id: Number(id) };
    
    if (body.name !== undefined) payload.name = body.name;
    if (body.city_id !== undefined) payload.city_id = body.city_id;
    if (body.event_id !== undefined) payload.event_id = body.event_id;
    if (body.rating !== undefined) payload.rating = body.rating;
    if (body.testimonial !== undefined) payload.testimonial = body.testimonial;
    if (body.submitted_at !== undefined) payload.submitted_at = body.submitted_at;
    if (body.status !== undefined) payload.status = body.status;
    if (body.image_url !== undefined) payload.image_url = body.image_url;
    if (body.priority !== undefined) payload.priority = body.priority;
    if (body.is_active !== undefined) payload.is_active = body.is_active;

    // Call external API to update testimonial
    const response = await fetch(
      `${BACKEND_URL}/api/testimonials/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, message: 'Testimonial not found' },
          { status: 404 }
        );
      }
      
      const errorText = await response.text();
      console.error('External API error:', errorText);
      return NextResponse.json(
        { success: false, message: `Failed to update testimonial: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(
      {
        success: true,
        message: 'Testimonial updated'
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`PUT /api/testimonials/[id] - Error:`, error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/testimonials/[id]
 * Protected endpoint - Delete a testimonial (requires employee auth)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check for authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, message: 'Invalid testimonial ID' },
        { status: 400 }
      );
    }

    console.log(`DELETE /api/testimonials/${id} - Deleting testimonial`);

    // Call external API to delete testimonial
    const response = await fetch(
      `${BACKEND_URL}/api/testimonials/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({ id: Number(id) })
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, message: 'Testimonial not found' },
          { status: 404 }
        );
      }
      
      const errorText = await response.text();
      console.error('External API error:', errorText);
      return NextResponse.json(
        { success: false, message: `Failed to delete testimonial: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(
      {
        success: true,
        message: 'Testimonial deleted'
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`DELETE /api/testimonials/[id] - Error:`, error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
