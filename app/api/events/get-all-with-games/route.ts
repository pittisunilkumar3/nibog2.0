import { NextResponse } from 'next/server';

// Simple in-memory cache to prevent excessive API calls
let cachedData: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

export async function GET() {
  try {
    console.log("Server API route: Fetching all events with complete information...");

    // Check if we have cached data that's still valid
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log("Server API route: Returning cached events with games data");
      return NextResponse.json(cachedData, { status: 200 });
    }

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

    // Create lookup maps for efficient joining
    const cityMap = new Map(cities.map((city: any) => [city.id, city]));
    const venueMap = new Map(venues.map((venue: any) => [venue.id, venue]));

    // Group game slots by event_id
    const gameSlotsByEvent = gameSlots.reduce((acc: any, slot: any) => {
      const eventId = slot.event_id;
      if (!acc[eventId]) {
        acc[eventId] = [];
      }
      acc[eventId].push(slot);
      return acc;
    }, {});

    // Join all data together
    const transformedData = events.map((event: any) => {
      const city = cityMap.get(event.city_id) || { id: null, city_name: "Unknown City", state: "Unknown", is_active: false };
      const venue = venueMap.get(event.venue_id) || { id: null, venue_name: "Unknown Venue", address: "Unknown", capacity: 0, is_active: false };
      const eventGameSlots = gameSlotsByEvent[event.id] || [];

      return {
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
          game_id: slot.game_id,
          custom_title: slot.custom_title,
          custom_description: slot.custom_description,
          custom_price: slot.custom_price,
          start_time: slot.start_time,
          end_time: slot.end_time,
          slot_price: slot.slot_price,
          max_participants: slot.max_participants
        }))
      };
    });

    // Cache the successful response
    cachedData = transformedData;
    cacheTimestamp = Date.now();
    console.log("Server API route: Cached events with games data");

    return NextResponse.json(transformedData, { status: 200 });
  } catch (error: any) {
    console.error("Server API route: Error fetching events with games:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch events with games" },
      { status: 500 }
    );
  }
}
