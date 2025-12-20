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

    // Call external API to get all testimonials using configured BACKEND_URL
    const base = (BACKEND_URL || '').replace(/\/$/, '');
    const apiUrl = `${base}/api/testimonials?${queryParams.toString()}`;

    console.log(`GET /api/testimonials - Calling backend: ${apiUrl}`);

    // If the backend is down, fetch() will throw; catch it and return a clear 503 so
    // the frontend can gracefully fall back to sample data instead of failing.
    let response;
    try {
      response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
    } catch (err) {
      console.error(`Failed to reach backend at ${apiUrl}:`, err);
      return NextResponse.json(
        { success: false, message: 'Backend unreachable', data: [] },
        { status: 503 }
      );
    }

    // If primary returns 404, attempt configured fallback URL (optional)
    if (!response.ok && process.env.BACKEND_FALLBACK_URL) {
      const primaryBody = await response.text().catch(() => '<no-body>');
      console.warn(`Primary testimonials endpoint ${apiUrl} returned ${response.status}. Body: ${primaryBody}`);

      const fallback = process.env.BACKEND_FALLBACK_URL.replace(/\/$/, '') + `/testimonials/get-all`;
      console.log(`Attempting fallback testimonials endpoint: ${fallback}`);
      try {
        response = await fetch(fallback, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });
      } catch (err) {
        console.error('Fallback fetch failed:', err);
      }
    }

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

    // Enrich testimonials with city_name and event_name when missing
    try {
      // Fetch cities and events from backend
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

      // Apply enrichment and add backward-compatible display fields
      for (const t of testimonials) {
        if (t.city_id && !t.city_name) {
          const name = cityMap.get(Number(t.city_id));
          if (name) t.city_name = name;
        }

        // Backwards compatibility: many UI components expect `city` (string)
        if (!t.city) {
          if (t.city_name) {
            t.city = t.city_name;
          } else if (t.city_id) {
            const name = cityMap.get(Number(t.city_id));
            if (name) t.city = name;
          }
        }

        if (t.event_id && !t.event_name) {
          const en = eventMap.get(Number(t.event_id));
          if (en) t.event_name = en;
        }

        // Backwards compatibility: expose `event_title` for list rendering
        if (!t.event_title) {
          if (t.event_name) {
            t.event_title = t.event_name;
          } else if (t.event_id) {
            const en = eventMap.get(Number(t.event_id));
            if (en) t.event_title = en;
          }
        }
      }
    } catch (enrichErr) {
      console.warn('Failed to enrich testimonials with city/event names:', enrichErr);
    }

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
      submitted_at: body.submitted_at || body.date || new Date().toISOString().split('T')[0],
      status: body.status || 'Pending',
      image_url: body.image_url || null,
      priority: body.priority || 0,
      is_active: body.is_active !== undefined ? body.is_active : 1
    };

    // Call external backend API to create testimonial
    const base = (BACKEND_URL || '').replace(/\/$/, '');
    const createUrl = `${base}/api/testimonials`;

    let response;
    try {
      response = await fetch(createUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader // forwarded from client
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error(`Failed to reach backend at ${createUrl}:`, err);
      return NextResponse.json(
        { success: false, message: 'Backend service unavailable' },
        { status: 503 }
      );
    }

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
