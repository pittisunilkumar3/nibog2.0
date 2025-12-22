import { NextResponse } from 'next/server';

// Helper function for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Maximum number of retry attempts
const MAX_RETRIES = 3;

export async function POST(request: Request) {
  let retries = 0;
  let requestBody;
  let data: any = null;

  try {
    // Parse the request body (outside the retry loop to avoid parsing multiple times)
    requestBody = await request.json();
    const { id } = requestBody;


    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      return NextResponse.json(
        { error: "Invalid testimonial ID. ID must be a positive number." },
        { status: 400 }
      );
    }

    // Start retry loop
    while (retries < MAX_RETRIES) {
      try {

        // Try GET by ID on configured BACKEND_URL first
        const base = (process.env.BACKEND_URL || '').replace(/\/$/, '') || null;
        if (base) {
          try {
            const getByIdUrl = `${base}/api/testimonials/${id}`;

            const getResp = await fetch(getByIdUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });
            if (getResp.ok) {
              const payload = await getResp.json();
              const candidate = payload.data || payload;
              if (candidate && ((Array.isArray(candidate) && candidate.length > 0) || (!Array.isArray(candidate)))) {
                const out = Array.isArray(candidate) ? candidate : [candidate];

                return NextResponse.json(out, { status: 200 });
              }
            }
          } catch (err) {
            console.warn('Server API route: backend GET by ID failed:', err);
          }
        }

        // No external webhook is used here — all data comes from the local backend (BACKEND_URL).
        // If the backend GET by ID above failed to find a testimonial, we will fall back to the backend list search below.

        // If data is empty, try fallback: search backend list
        const isEmpty = (!data) || (Array.isArray(data) && data.length === 0);
        if (isEmpty && base) {
          try {

            const listUrl = `${base}/api/testimonials?limit=1000&offset=0`;
            const listResp = await fetch(listUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });
            if (listResp.ok) {
              const listData = await listResp.json();
              const items = listData.data || listData || [];
              const found = Array.isArray(items) ? items.find((it: any) => Number(it.id) === Number(id)) : null;
              if (found) {
                return NextResponse.json([found], { status: 200 });
              }
            }
          } catch (err) {
            console.warn('Server API route: backend list fallback failed:', err);
          }
        }

        if (!data || (Array.isArray(data) && data.length === 0)) {
          return NextResponse.json(
            { error: "No testimonial found with the specified ID" },
            { status: 404 }
          );
        }

        // Enrich testimonial(s) with city/event names when possible
        try {
          const base = (process.env.BACKEND_URL || '').replace(/\/$/, '');
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

          const items = Array.isArray(data) ? data : [data];
          for (const item of items) {
            if (item.city_id && !item.city_name && cityMap.has(Number(item.city_id))) {
              item.city_name = cityMap.get(Number(item.city_id));
            }
            // Some webhooks return 'city' as string
            if (!item.city && item.city_name) item.city = item.city_name;

            if (item.event_id && !item.event_name && eventMap.has(Number(item.event_id))) {
              item.event_name = eventMap.get(Number(item.event_id));
            }

            // Backwards compatibility: expose `event_title` if available
            if (!item.event_title) {
              if (item.event_name) {
                item.event_title = item.event_name;
              } else if (item.event_id && eventMap.has(Number(item.event_id))) {
                item.event_title = eventMap.get(Number(item.event_id));
              }
            }
          }

          // If original was object, return object, else array
          const enriched = Array.isArray(data) ? items : [items[0]];
          return NextResponse.json(enriched, { status: 200 });
        } catch (enrichErr) {
          console.warn('Failed to enrich testimonial with city/event names:', enrichErr);
          return NextResponse.json(data, { status: 200 });
        }

      } catch (error: any) {
        console.error(`Server API route: Error getting testimonial (attempt ${retries + 1}/${MAX_RETRIES}):`, error);

        // Retry on network errors
        if (retries < MAX_RETRIES - 1 &&
          (error.name === 'AbortError' || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND')) {
          retries++;
          await delay(1000 * retries); // Exponential backoff
          continue;
        }

        // If we've exhausted retries or it's not a retriable error, throw to be caught by outer try/catch
        throw error;
      }
    }

    // If we've exhausted all retries and haven't returned or thrown
    return NextResponse.json(
      { error: "Failed to get testimonial after multiple attempts" },
      { status: 503 }
    );

  } catch (error: any) {
    console.error("Server API route: Error getting testimonial:", error);

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
      { error: error.message || "Failed to get testimonial" },
      { status: 500 }
    );
  }
}
