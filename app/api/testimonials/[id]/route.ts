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



    // Call external backend API to get single testimonial
    const base = (BACKEND_URL || '').replace(/\/$/, '');
    const getUrl = `${base}/api/testimonials/${id}`;

    let response;
    try {
      response = await fetch(getUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
    } catch (err) {
      console.error(`Failed to reach backend at ${getUrl}:`, err);
      return NextResponse.json(
        { success: false, message: 'Backend service unavailable' },
        { status: 503 }
      );
    }

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

    // Enrich testimonial with city_name and event_name
    try {
      const citiesResp = await fetch(`${base}/api/city/`, { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });
      const eventsResp = await fetch(`${base}/api/events/list`, { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });

      let cities: any[] = [];
      let events: any[] = [];

      if (citiesResp.ok) {
        const cityData = await citiesResp.json();
        cities = Array.isArray(cityData) ? cityData : (cityData.data || []);
      }

      if (eventsResp.ok) {
        const eventData = await eventsResp.json();
        events = Array.isArray(eventData) ? eventData : (eventData.data || eventData);
      }

      const cityMap = new Map<number, string>();
      cities.forEach((c: any) => {
        const id = c.id || c.city_id;
        const name = c.city_name || c.name || c.city || '';
        if (id) cityMap.set(Number(id), name);
      });

      const eventMap = new Map<number, string>();
      events.forEach((e: any) => {
        const id = e.id || e.event_id;
        const title = e.title || e.event_title || e.name || '';
        if (id) eventMap.set(Number(id), title);
      });

      if (testimonial && testimonial.city_id && !testimonial.city_name) {
        const name = cityMap.get(Number(testimonial.city_id));
        if (name) testimonial.city_name = name;
      }

      // Backwards compatibility: ensure `city` string is present for UI
      if (testimonial && !testimonial.city) {
        if (testimonial.city_name) {
          testimonial.city = testimonial.city_name;
        } else if (testimonial.city_id) {
          const name = cityMap.get(Number(testimonial.city_id));
          if (name) testimonial.city = name;
        }
      }

      if (testimonial && testimonial.event_id && !testimonial.event_name) {
        const en = eventMap.get(Number(testimonial.event_id));
        if (en) testimonial.event_name = en;
      }

      // Backwards compatibility: ensure `event_title` is present
      if (testimonial && !testimonial.event_title) {
        if (testimonial.event_name) {
          testimonial.event_title = testimonial.event_name;
        } else if (testimonial.event_id) {
          const en = eventMap.get(Number(testimonial.event_id));
          if (en) testimonial.event_title = en;
        }
      }
    } catch (enrichErr) {
      console.warn(`Failed to enrich testimonial ${id} with city/event names:`, enrichErr);
    }

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



    // Prepare payload for backend API
    const payload: any = {
      name: body.name,
      city_id: body.city_id || null,
      event_id: body.event_id,
      rating: body.rating,
      testimonial: body.testimonial,
      submitted_at: body.date || body.submitted_at || new Date().toISOString().split('T')[0],
      status: body.status || 'Published',
      priority: body.priority || 1,
      is_active: body.is_active !== undefined ? body.is_active : true
    };

    // Use BACKEND_URL to call the backend API directly
    const base = (BACKEND_URL || '').replace(/\/$/, '');
    const updateUrl = `${base}/api/testimonials/${id}`;



    let response;
    try {
      response = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader // Forward the auth header
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error(`Failed to reach backend at ${updateUrl}:`, err);
      return NextResponse.json(
        { success: false, message: 'Backend service unavailable' },
        { status: 503 }
      );
    }



    // If we get 401 (unauthorized), return clear auth error
    if (response.status === 401) {
      const errorBody = await response.text();

      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required. Please ensure you are logged in with valid admin credentials.'
        },
        { status: 401 }
      );
    }

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, message: 'Testimonial not found' },
          { status: 404 }
        );
      }

      const errorText = await response.text();
      console.error('Backend API error:', errorText);
      return NextResponse.json(
        { success: false, message: `Failed to update testimonial: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();


    // Check if the response indicates success
    if (data && data.success) {
      return NextResponse.json(
        {
          success: true,
          message: data.message || 'Testimonial updated',
          data: data.data
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || 'Update failed'
        },
        { status: 400 }
      );
    }
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

    // Use BACKEND_URL to call the backend API directly
    const base = (BACKEND_URL || '').replace(/\/$/, '');
    
    // First, get the testimonial to retrieve image_url before deletion
    const getUrl = `${base}/api/testimonials/${id}`;
    let testimonialData: any = null;
    
    try {
      const getResponse = await fetch(getUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      
      if (getResponse.ok) {
        const result = await getResponse.json();
        testimonialData = result.data || result;
      }
    } catch (err) {
      console.warn('Could not fetch testimonial data before deletion:', err);
    }
    
    const deleteUrl = `${base}/api/testimonials/${id}`;



    let response;
    try {
      response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader // Forward the auth header
        }
      });
    } catch (err) {
      console.error(`Failed to reach backend at ${deleteUrl}:`, err);
      return NextResponse.json(
        { success: false, message: 'Backend service unavailable' },
        { status: 503 }
      );
    }



    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, message: 'Testimonial not found' },
          { status: 404 }
        );
      }

      const errorText = await response.text();
      console.error('Backend API error:', errorText);
      return NextResponse.json(
        { success: false, message: `Failed to delete testimonial: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Delete the image file if it exists
    if (testimonialData && testimonialData.image_url) {
      try {
        const { unlink } = await import('fs/promises');
        const { join } = await import('path');
        
        // Extract the relative path from image_url
        let imagePath = testimonialData.image_url;
        
        // Remove leading slash if present
        if (imagePath.startsWith('/')) {
          imagePath = imagePath.substring(1);
        }
        
        // Construct the full file path
        const fullPath = join(process.cwd(), imagePath);
        
        // Delete the file
        await unlink(fullPath);
      } catch (fileErr) {
        // Log error but don't fail the deletion if file doesn't exist
        console.warn('Could not delete image file:', fileErr);
      }
    }

    // Check if the response indicates success
    if (data && data.success) {
      return NextResponse.json(
        {
          success: true,
          message: data.message || 'Testimonial deleted'
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || 'Delete failed'
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error(`DELETE /api/testimonials/[id] - Error:`, error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
