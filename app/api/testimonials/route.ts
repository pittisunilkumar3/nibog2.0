import { NextRequest, NextResponse } from 'next/server';

// Base URL for external API
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';

/**
 * GET /api/testimonials
 * Public endpoint - List all testimonials with pagination and filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract query parameters
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';
    const status = searchParams.get('status'); // Published, Pending, Rejected
    const city_id = searchParams.get('city_id');
    const event_id = searchParams.get('event_id');
    const is_active = searchParams.get('is_active');

    console.log('GET /api/testimonials - Fetching testimonials with filters:', {
      limit,
      offset,
      status,
      city_id,
      event_id,
      is_active
    });

    // Build query string for external API
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    if (city_id) queryParams.append('city_id', city_id);
    if (event_id) queryParams.append('event_id', event_id);
    if (is_active) queryParams.append('is_active', is_active);
    queryParams.append('limit', limit);
    queryParams.append('offset', offset);

    // Call external API
    const response = await fetch(
      `${BACKEND_URL}/api/testimonials?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', errorText);
      return NextResponse.json(
        { success: false, message: `Failed to fetch testimonials: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    // Check if external API already returns the correct format
    const testimonials = result.data || result;
    const total = result.total || result.meta?.total || testimonials.length;
    
    // Format response according to API documentation
    return NextResponse.json(
      {
        success: true,
        data: testimonials,
        meta: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: total
        }
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        }
      }
    );
  } catch (error: any) {
    console.error('GET /api/testimonials - Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/testimonials
 * Protected endpoint - Create a new testimonial (requires employee auth)
 */
export async function POST(request: NextRequest) {
  try {
    // Check for authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { success: false, message: 'name is required' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (body.rating && (body.rating < 1 || body.rating > 5)) {
      return NextResponse.json(
        { success: false, message: 'rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    console.log('POST /api/testimonials - Creating testimonial:', body);

    // Prepare payload for external API
    const payload = {
      name: body.name,
      city_id: body.city_id || null,
      event_id: body.event_id || null,
      rating: body.rating || 5,
      testimonial: body.testimonial || '',
      submitted_at: body.submitted_at || new Date().toISOString().split('T')[0],
      status: body.status || 'Pending',
      image_url: body.image_url || null,
      priority: body.priority || 0,
      is_active: body.is_active !== undefined ? body.is_active : 1
    };

    // Call external API to create testimonial
    const response = await fetch(
      `${BACKEND_URL}/api/testimonials/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', errorText);
      return NextResponse.json(
        { success: false, message: `Failed to create testimonial: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Format response according to API documentation
    return NextResponse.json(
      {
        success: true,
        message: 'Testimonial created',
        id: data.id,
        data: data
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/testimonials - Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
