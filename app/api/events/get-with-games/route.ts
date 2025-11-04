import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const data = await request.json();
    const eventId = data.eventId || data.id;
    
    if (!eventId || isNaN(Number(eventId)) || Number(eventId) <= 0) {
      return NextResponse.json(
        { error: "Invalid event ID. ID must be a positive number." },
        { status: 400 }
      );
    }
    
    console.log(`Server API route: Fetching event with games for ID: ${eventId}`);

    // Fetch data from multiple endpoints to get complete information
    const [eventsResponse, gameSlotsResponse, citiesResponse, venuesResponse] = await Promise.all([
      fetch("https://ai.nibog.in/webhook/v1/nibog/event/get-all", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }),
      fetch("https://ai.nibog.in/webhook/v1/nibog/event-game-slot/get-all", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }),
      fetch("https://ai.nibog.in/webhook/v1/nibog/city/get-all", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }),
      fetch("https://ai.nibog.in/webhook/v1/nibog/venues/get-all", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })
    ]);

    // Check if all requests were successful
    if (!eventsResponse.ok || !gameSlotsResponse.ok || !citiesResponse.ok || !venuesResponse.ok) {
      console.error("One or more API calls failed");
      return NextResponse.json(
        { error: "Failed to fetch complete event data" },
        { status: 500 }
      );
    }

    // Parse all responses
    const [events, gameSlots, cities, venues] = await Promise.all([
      eventsResponse.json(),
      gameSlotsResponse.json(),
      citiesResponse.json(),
      venuesResponse.json()
    ]);

    console.log(`Retrieved ${events.length} events, ${gameSlots.length} game slots, ${cities.length} cities, ${venues.length} venues`);

    // Find the specific event
    const event = events.find((e: any) => e.id === Number(eventId));
    
    if (!event) {
      return NextResponse.json(
        { error: `Event with ID ${eventId} not found` },
        { status: 404 }
      );
    }

    // Create lookup maps for efficient joining
    const cityMap = new Map(cities.map((city: any) => [city.id, city]));
    const venueMap = new Map(venues.map((venue: any) => [venue.id, venue]));

    // Filter game slots for this specific event
    const eventGameSlots = gameSlots.filter((slot: any) => slot.event_id === Number(eventId));

    // Join all data together for the specific event
    const city = cityMap.get(event.city_id) || { id: null, city_name: "Unknown City", state: "Unknown", is_active: false };
    const venue = venueMap.get(event.venue_id) || { id: null, venue_name: "Unknown Venue", address: "Unknown", capacity: 0, is_active: false };

    const transformedEvent = {
      event_id: event.id,
      event_title: event.title,
      event_description: event.description,
      event_date: event.event_date,
      event_status: event.status,
      city: {
        city_id: city.id,
        city_name: city.city_name,
        state: city.state,
        is_active: city.is_active
      },
      venue: {
        venue_id: venue.id,
        venue_name: venue.venue_name,
        address: venue.address,
        capacity: venue.capacity,
        is_active: venue.is_active
      },
      games: eventGameSlots.map((slot: any) => ({
        slot_id: slot.id,
        game_id: slot.game_id,
        custom_title: slot.custom_title,
        custom_description: slot.custom_description,
        custom_price: slot.custom_price,
        start_time: slot.start_time,
        end_time: slot.end_time,
        slot_price: slot.slot_price,
        max_participants: slot.max_participants,
        status: slot.status || 'active', // Add status field with default value
        created_at: slot.created_at,
        updated_at: slot.updated_at
      }))
    };

    console.log("Server API route: Retrieved event with games:", transformedEvent);

    return NextResponse.json(transformedEvent, { status: 200 });
  } catch (error: any) {
    console.error("Server API route: Error fetching event with games:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch event with games" },
      { status: 500 }
    );
  }
}
