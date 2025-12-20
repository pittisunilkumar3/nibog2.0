// Event service for managing events

// Define the event interface for creating events
export interface Event {
  id?: number;
  title: string;
  description: string;
  city_id: number;
  venue_id: number;
  event_date: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  games: EventGame[];
}

// Define the event game interface for creating events
export interface EventGame {
  game_id: number;
  custom_title?: string;
  custom_description?: string;
  custom_price?: number;
  note?: string;
  start_time: string;
  end_time: string;
  slot_price: number;
  max_participants: number;
  created_at?: string;
  updated_at?: string;
}

// Define the event interface for fetching events
export interface EventListItem {
  event_id: number;
  event_title: string;
  event_description: string;
  event_date: string;
  event_status: string;
  event_created_at: string;
  event_updated_at: string;
  city_id: number;
  city_name: string;
  state: string;
  city_is_active: boolean;
  city_created_at: string;
  city_updated_at: string;
  venue_id: number;
  venue_name: string;
  venue_address: string;
  venue_capacity: number;
  venue_is_active: boolean;
  venue_created_at: string;
  venue_updated_at: string;
  games: EventGameListItem[];
}

// Define the event game interface for fetching events
export interface EventGameListItem {
  game_id: number;
  game_title: string;
  game_description: string;
  min_age: number;
  max_age: number;
  game_duration_minutes: number;
  categories: string[];
  custom_title: string;
  custom_description: string;
  custom_price: number;
  start_time: string;
  end_time: string;
  slot_price: number;
  max_participants: number;
}

/**
 * Create a new event
 * @param eventData The event data to create
 * @returns The created event
 */
export async function createEvent(eventData: Event): Promise<Event> {
  console.log("Creating event:", eventData);

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/events/create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });

    console.log(`Create event response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Created event:", data);

    // Return the first item if it's an array, otherwise return the data
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
}

/**
 * Format event data from the form to the API format
 * @param formData The form data
 * @returns The formatted event data for the API
 */
export function formatEventDataForAPI(formData: {
  title: string;
  description: string;
  venueId: string;
  date: string;
  status: string;
  games: Array<{
    templateId: string;
    customTitle?: string;
    customDescription?: string;
    customPrice?: number;
    note?: string;
    slots: Array<{
      id: string;
      startTime: string;
      endTime: string;
      price: number;
      maxParticipants: number;
    }>;
  }>;
  cityId?: number;
}): Event {
  // Get current date and time for created_at and updated_at
  const now = new Date();
  const formattedNow = now.toISOString();

  // Format games data
  const formattedGames: EventGame[] = [];

  // Process each game and its slots
  formData.games.forEach(game => {
    game.slots.forEach(slot => {
      formattedGames.push({
        game_id: parseInt(game.templateId),
        custom_title: game.customTitle,
        custom_description: game.customDescription,
        custom_price: game.customPrice,
        note: game.note,
        start_time: slot.startTime + ":00", // Add seconds
        end_time: slot.endTime + ":00", // Add seconds
        slot_price: slot.price,
        max_participants: slot.maxParticipants,
        created_at: formattedNow,
        updated_at: formattedNow
      });
    });
  });

  // Create the formatted event data
  const formattedEvent: Event = {
    title: formData.title,
    description: formData.description,
    city_id: formData.cityId || 0, // This will need to be set correctly
    venue_id: parseInt(formData.venueId),
    event_date: formData.date,
    status: formData.status === "draft" ? "Draft" : "Published",
    created_at: formattedNow,
    updated_at: formattedNow,
    games: formattedGames
  };

  return formattedEvent;
}

// Cache for events data
const eventsCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Get all events with caching
 * @param forceRefresh Force a cache refresh
 * @returns A list of all events
 */
export async function getAllEvents(forceRefresh: boolean = false): Promise<EventListItem[]> {
  try {
    const cacheKey = 'all-events';
    const now = Date.now();

    // Return cached data if available and not expired
    const cached = eventsCache.get(cacheKey);
    if (!forceRefresh && cached && (now - cached.timestamp < CACHE_TTL)) {
      console.log('Returning cached events data');
      return cached.data;
    }
    
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/events/get-all', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Add cache control headers
      cache: 'no-store',
      next: { 
        revalidate: 300 // Revalidate every 5 minutes (Next.js data cache)
      }
    });

    if (!response.ok) {
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    
    // Update cache with new data
    eventsCache.set(cacheKey, { data, timestamp: now });

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get an event by ID
 * @param id Event ID to retrieve
 * @returns Promise with the event data
 */
export async function getEventById(id: number): Promise<EventListItem> {
  console.log(`Fetching event with ID: ${id}`);

  if (!id || isNaN(Number(id)) || Number(id) <= 0) {
    throw new Error("Invalid event ID. ID must be a positive number.");
  }

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/events/get', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: Number(id) }),
    });

    console.log(`Get event response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Retrieved event:", data);
    console.log("Event games structure:", data.games || (Array.isArray(data) && data[0] ? data[0].games : 'No games found'));

    // The API returns an array with a single event, so we need to extract it
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    } else if (!Array.isArray(data)) {
      return data;
    }

    throw new Error("Event not found");
  } catch (error) {
    console.error(`Error fetching event with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Get a single event with complete games/slots information by ID
 * @param id The event ID
 * @returns The event data with games and slots
 */
export async function getEventWithGames(id: string | number): Promise<any> {
  console.log(`Getting event with games for ID: ${id}`);

  if (!id || (typeof id === 'string' && id.trim() === '')) {
    throw new Error("Event ID is required");
  }

  try {
    // Use our internal API route to get event with complete games information
    // Add cache busting to ensure fresh data
    const response = await fetch('/api/events/get-with-games', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: Number(id) }),
      cache: "no-store", // Disable caching to get fresh data
    });

    console.log(`Get event with games response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Retrieved event with games:", data);

    return data;
  } catch (error) {
    console.error("Error getting event with games:", error);
    throw error;
  }
}

/**
 * Create a new event game slot
 * @param slotData The slot data to create
 * @returns Promise with the created slot data
 */
export async function createEventGameSlot(slotData: {
  event_id: number;
  game_id: number;
  custom_title?: string;
  custom_description?: string;
  custom_price?: number;
  start_time: string;
  end_time: string;
  slot_price?: number;
  max_participants: number;
}): Promise<any> {
  console.log(`Creating event game slot:`, slotData);

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/event-game-slots/create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slotData),
    });

    console.log(`Create event game slot response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Created event game slot:", data);

    return data;
  } catch (error) {
    console.error("Error creating event game slot:", error);
    throw error;
  }
}

/**
 * Update an existing event game slot
 * @param slotData The slot data to update
 * @returns Promise with the updated slot data
 */
export async function updateEventGameSlot(slotData: {
  id: number;
  event_id: number;
  game_id: number;
  custom_title?: string;
  custom_description?: string;
  custom_price?: number;
  start_time: string;
  end_time: string;
  slot_price?: number;
  max_participants: number;
  status?: string;
}): Promise<any> {
  console.log(`Updating event game slot:`, slotData);

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/event-game-slots/update', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slotData),
    });

    console.log(`Update event game slot response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Updated event game slot:", data);

    return data;
  } catch (error) {
    console.error("Error updating event game slot:", error);
    throw error;
  }
}

/**
 * Delete an event game slot
 * @param id The slot ID to delete
 * @returns Promise with the deletion result
 */
export async function deleteEventGameSlot(id: number): Promise<any> {
  console.log(`Deleting event game slot with ID: ${id}`);

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/event-game-slots/delete', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    console.log(`Delete event game slot response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Deleted event game slot:", data);

    return data;
  } catch (error) {
    console.error("Error deleting event game slot:", error);
    throw error;
  }
}

/**
 * Get slot status
 * @param slotId The slot ID to get status for
 * @returns Promise with the slot status
 */
export async function getSlotStatus(slotId: string): Promise<string> {
  console.log(`Getting status for slot: ${slotId}`);

  try {
    const response = await fetch(`/api/event-game-slots/status?slotId=${slotId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn(`Failed to get slot status, defaulting to active`);
      return 'active';
    }

    const data = await response.json();
    return data.status || 'active';
  } catch (error) {
    console.error("Error getting slot status:", error);
    return 'active'; // Default to active on error
  }
}

/**
 * Update slot status
 * @param slotId The slot ID to update
 * @param status The new status
 * @returns Promise with the update result
 */
export async function updateSlotStatus(slotId: string, status: string): Promise<any> {
  console.log(`Updating slot ${slotId} status to: ${status}`);

  try {
    const response = await fetch('/api/event-game-slots/status', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slotId, status }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Slot status updated:", data);

    return data;
  } catch (error) {
    console.error("Error updating slot status:", error);
    throw error;
  }
}

/**
 * Get all slot statuses for an event
 * @returns Promise with all slot statuses
 */
export async function getAllSlotStatuses(): Promise<Record<string, string>> {
  console.log("Getting all slot statuses");

  try {
    const response = await fetch('/api/event-game-slots/status', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn("Failed to get slot statuses, returning empty object");
      return {};
    }

    const data = await response.json();
    return data || {};
  } catch (error) {
    console.error("Error getting slot statuses:", error);
    return {}; // Return empty object on error
  }
}

/**
 * Update an existing event
 * @param eventData The event data to update
 * @returns Promise with the updated event or success status
 */
export async function updateEvent(eventData: Event): Promise<Event | { success: boolean }> {
  console.log("Updating event:", eventData);

  // Ensure the event has an ID
  if (!eventData.id) {
    console.error("Cannot update event without an ID");
    throw new Error("Event ID is required for updates");
  }

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/events/update', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });

    console.log(`Update event response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Updated event response:", data);

    // The API might return a success object or the updated event
    if (Array.isArray(data) && data[0]?.success === true) {
      return { success: true };
    } else if (data?.success === true) {
      return { success: true };
    }

    // If it's the updated event data, return it
    return eventData;
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
}

/**
 * Format event data for updating
 * @param eventId The event ID to update
 * @param formData The form data
 * @returns The formatted event data for the API
 */
export function formatEventDataForUpdate(
  eventId: number,
  formData: {
    title: string;
    description: string;
    venueId: string;
    date: string;
    status: string;
    games: Array<{
      templateId: string;
      customTitle?: string;
      customDescription?: string;
      customPrice?: number;
      note?: string;
      slots: Array<{
        id: string;
        startTime: string;
        endTime: string;
        price: number;
        maxParticipants: number;
      }>;
    }>;
    cityId?: number;
  }
): Event {
  // Get current date and time for updated_at
  const now = new Date();
  const formattedNow = now.toISOString();

  // Format games data
  const formattedGames: EventGame[] = [];

  // Process each game and its slots
  formData.games.forEach(game => {
    game.slots.forEach(slot => {
      formattedGames.push({
        game_id: parseInt(game.templateId),
        custom_title: game.customTitle || "",
        custom_description: game.customDescription || "",
        custom_price: typeof game.customPrice === 'number' ? game.customPrice : 0,
        note: game.note,
        start_time: slot.startTime + ":00", // Add seconds
        end_time: slot.endTime + ":00", // Add seconds
        slot_price: typeof slot.price === 'number' ? slot.price : 0,
        max_participants: typeof slot.maxParticipants === 'number' ? slot.maxParticipants : 10,
        updated_at: formattedNow
      });
    });
  });

  // Create the formatted event data
  const formattedEvent: Event = {
    id: eventId,
    title: formData.title,
    description: formData.description,
    city_id: formData.cityId || 0,
    venue_id: parseInt(formData.venueId),
    event_date: formData.date,
    status: formData.status === "draft" ? "Draft" : "Published",
    updated_at: formattedNow,
    games: formattedGames
  };

  return formattedEvent;
}

/**
 * Get upcoming events by city ID with automatic retry logic (Direct external API call)
 * @param cityId City ID to retrieve events for
 * @param maxRetries Maximum number of retry attempts (default: 3)
 * @param retryDelay Delay between retries in milliseconds (default: 1000)
 * @returns Promise with array of upcoming events for the specified city
 */
export async function getUpcomingEventsByCityId(
  cityId: number,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<EventListItem[]> {
  if (!cityId || isNaN(Number(cityId)) || Number(cityId) <= 0) {
    throw new Error("Invalid city ID. ID must be a positive number.");
  }

  let lastError: Error | null = null;

  // Retry loop
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Events API] Attempt ${attempt}/${maxRetries} to fetch events for city ID: ${cityId}`);

      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      // Use the upcoming events API endpoint
      const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/events/upcoming-events-by-cityid', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ city_id: Number(cityId) }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Events API] Error response from upcoming events API:', errorText);
        throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
      }

      const events = await response.json();

      if (!Array.isArray(events)) {
        console.error('[Events API] Unexpected API response format:', events);
        throw new Error('Invalid response format: expected an array of events');
      }

      console.log(`[Events API] Successfully fetched ${events.length} upcoming events for city ${cityId} on attempt ${attempt}`);

      if (events.length > 0) {
        const firstEvent = events[0];
        console.log(`[Events API] First event venue fields: venue_name="${firstEvent.venue_name}", venue="${firstEvent.venue}", venue_id="${firstEvent.venue_id}"`);
      }

      // Helper function to fetch venue name by venue_id
      const fetchVenueName = async (venueId: number): Promise<string> => {
        try {
          if (!venueId) return 'Event Venue';

          const response = await fetch('/api/venues/get', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: venueId }),
          });

          if (response.ok) {
            const venueData = await response.json();
            const venueName = venueData.venue_name || venueData.name || 'Event Venue';
            if (venueName !== 'Event Venue') {
              console.log(`[Events API] Fetched venue ${venueId}: "${venueName}"`);
            }
            return venueName;
          }
        } catch (error) {
          console.error('[Events API] Error fetching venue:', error);
        }
        return 'Event Venue';
      };

      // Convert the raw API response to match the expected EventListItem format
      // First, try to get venue names for events that don't have them
      const formattedEvents: EventListItem[] = await Promise.all(events.map(async (event: any) => {

        let venueName = event.venue_name || event.venue || event.location || event.address || event.place || event.site || event.event_venue;

        // If no venue name found but we have a venue_id, try to fetch it
        if (!venueName && event.venue_id) {
          venueName = await fetchVenueName(event.venue_id);
        }

        // Final fallback
        if (!venueName) {
          venueName = 'Event Venue';
        }

        if (venueName !== 'Event Venue') {
          console.log(`[Events API] Event ${event.id}: Found venue "${venueName}"`);
        }

        return {
          event_id: event.id,
          event_title: event.title,
          event_description: event.description || '',
          event_date: event.event_date,
          event_status: event.status || 'Published',
          event_created_at: event.created_at || new Date().toISOString(),
          event_updated_at: event.updated_at || new Date().toISOString(),
          city_id: event.city_id,
          city_name: '', // Will be filled in if needed by UI
          state: '',
          city_is_active: true,
          city_created_at: new Date().toISOString(),
          city_updated_at: new Date().toISOString(),
          venue_id: event.venue_id || 0,
          venue_name: venueName,
          venue_address: '',
          venue_capacity: 0,
          venue_is_active: true,
          venue_created_at: new Date().toISOString(),
          venue_updated_at: new Date().toISOString(),
          games: [] // Initialize with empty games array, will be populated separately if needed
        };
      }));

      return formattedEvents;
    } catch (error: any) {
      lastError = error;
      console.error(`[Events API] Attempt ${attempt}/${maxRetries} failed:`, error.message);

      if (attempt < maxRetries) {
        console.log(`[Events API] Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  console.error("[Events API] All retry attempts failed. Last error:", lastError?.message);
  throw lastError || new Error("Failed to fetch events after multiple attempts");
}

/**
 * Get games by child's age and event ID
 * @param eventId The event ID to fetch games for
 * @param childAge The child's age in months
 * @returns Promise with array of games suitable for the child's age in the specified event
 */
export async function getGamesByAgeAndEvent(eventId: number, childAge: number): Promise<any[]> {
  if (!eventId || isNaN(Number(eventId)) || Number(eventId) <= 0) {
    throw new Error("Invalid event ID. ID must be a positive number.");
  }

  if (childAge === null || childAge === undefined || isNaN(Number(childAge)) || Number(childAge) < 0) {
    throw new Error("Invalid child age. Age must be a non-negative number.");
  }

  try {
    console.log(`Fetching games for event ID: ${eventId} and child age: ${childAge} months`);
    
    // Use the new games by age and event API endpoint with slot grouping
    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/events/get-games-by-ageandevent-new', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_id: Number(eventId),
        child_age: Number(childAge)
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from games API:', errorText);
      throw new Error(`Failed to fetch games: ${response.status} ${response.statusText}`);
    }

    const games = await response.json();
    
    if (!Array.isArray(games)) {
      console.error('Unexpected API response format:', games);
      throw new Error('Invalid response format: expected an array of games');
    }

    console.log(`Found ${games.length} games for event ${eventId} and age ${childAge} months`);

    if (games.length > 0) {
      const firstGame = games[0];
      console.log(`Games API venue fields: venue_name="${firstGame.venue_name}", venue="${firstGame.venue}", venue_id="${firstGame.venue_id}"`);
    }

    return games;
  } catch (error) {
    console.error('Error in getGamesByAgeAndEvent:', error);
    throw error;
  }
}

/**
 * Get event with participants data for the admin participants view
 * @param id The event ID to fetch participants for
 * @returns Event with participants data
 */
export function getEventWithParticipants(id: string) {
  // In a production environment, this would make an API call to fetch real data
  // For now, we're using mock data for demonstration purposes
  
  // Mock data for event ID 11
  if (id === '11') {
    return {
      id: '11',
      title: 'Baby Sensory Play',
      description: 'A sensory play event for babies aged 6-18 months',
      date: '2025-07-15',
      venue: {
        name: 'Little Explorers Center',
        city: 'Mumbai'
      },
      slots: [
        { 
          id: 'S001', 
          startTime: '10:00 AM', 
          endTime: '11:30 AM', 
          price: 799, 
          maxParticipants: 12, 
          currentParticipants: 7, 
          bookings: [
            { 
              id: 'B001', 
              user: { 
                id: 'U001', 
                name: 'Priya Sharma', 
                email: 'priya@example.com', 
                phone: '+91 9876543210' 
              }, 
              child: { 
                id: 'C001', 
                name: 'Aryan', 
                dob: '2023-02-15', 
                ageAtEvent: '14 months' 
              }, 
              status: 'confirmed',
              paymentStatus: 'paid',
              bookingDate: '2025-06-10',
            },
            { 
              id: 'B002', 
              user: { 
                id: 'U002', 
                name: 'Rahul Verma', 
                email: 'rahul@example.com', 
                phone: '+91 9876543211' 
              }, 
              child: { 
                id: 'C002', 
                name: 'Zara', 
                dob: '2023-04-10', 
                ageAtEvent: '12 months' 
              }, 
              status: 'confirmed',
              paymentStatus: 'paid',
              bookingDate: '2025-06-12',
            },
            { 
              id: 'B003', 
              user: { 
                id: 'U003', 
                name: 'Ananya Patel', 
                email: 'ananya@example.com', 
                phone: '+91 9876543212' 
              }, 
              child: { 
                id: 'C003', 
                name: 'Vihaan', 
                dob: '2023-06-20', 
                ageAtEvent: '10 months' 
              }, 
              status: 'confirmed',
              paymentStatus: 'paid',
              bookingDate: '2025-06-15',
            }
          ]
        },
        { 
          id: 'S002', 
          startTime: '1:00 PM', 
          endTime: '2:30 PM', 
          price: 799, 
          maxParticipants: 12, 
          currentParticipants: 4, 
          bookings: [
            { 
              id: 'B004', 
              user: { 
                id: 'U004', 
                name: 'Vikram Singh', 
                email: 'vikram@example.com', 
                phone: '+91 9876543213' 
              }, 
              child: { 
                id: 'C004', 
                name: 'Aarav', 
                dob: '2022-12-10', 
                ageAtEvent: '16 months' 
              }, 
              status: 'confirmed',
              paymentStatus: 'paid',
              bookingDate: '2025-06-18',
            },
            { 
              id: 'B005', 
              user: { 
                id: 'U005', 
                name: 'Neha Gupta', 
                email: 'neha@example.com', 
                phone: '+91 9876543214' 
              }, 
              child: { 
                id: 'C005', 
                name: 'Ishaan', 
                dob: '2023-08-25', 
                ageAtEvent: '8 months' 
              }, 
              status: 'confirmed',
              paymentStatus: 'paid',
              bookingDate: '2025-06-20',
            },
            { 
              id: 'B006', 
              user: { 
                id: 'U006', 
                name: 'Kiran Reddy', 
                email: 'kiran@example.com', 
                phone: '+91 9876543215' 
              }, 
              child: { 
                id: 'C006', 
                name: 'Aanya', 
                dob: '2023-05-15', 
                ageAtEvent: '11 months' 
              }, 
              status: 'attended',
              paymentStatus: 'paid',
              bookingDate: '2025-06-22',
            },
            { 
              id: 'B007', 
              user: { 
                id: 'U007', 
                name: 'Deepak Sharma', 
                email: 'deepak@example.com', 
                phone: '+91 9876543216' 
              }, 
              child: { 
                id: 'C007', 
                name: 'Advika', 
                dob: '2023-01-20', 
                ageAtEvent: '15 months' 
              }, 
              status: 'no_show',
              paymentStatus: 'paid',
              bookingDate: '2025-06-25',
            },
          ]
        },
        { 
          id: 'S003', 
          startTime: '4:00 PM', 
          endTime: '5:30 PM', 
          price: 799, 
          maxParticipants: 12, 
          currentParticipants: 2, 
          bookings: [
            { 
              id: 'B008', 
              user: { 
                id: 'U008', 
                name: 'Arjun Kumar', 
                email: 'arjun@example.com', 
                phone: '+91 9876543217' 
              }, 
              child: { 
                id: 'C008', 
                name: 'Saisha', 
                dob: '2023-03-05', 
                ageAtEvent: '13 months' 
              }, 
              status: 'cancelled',
              paymentStatus: 'refunded',
              bookingDate: '2025-06-23',
            },
            { 
              id: 'B009', 
              user: { 
                id: 'U009', 
                name: 'Meera Joshi', 
                email: 'meera@example.com', 
                phone: '+91 9876543218' 
              }, 
              child: { 
                id: 'C009', 
                name: 'Kabir', 
                dob: '2023-07-12', 
                ageAtEvent: '9 months' 
              }, 
              status: 'confirmed',
              paymentStatus: 'paid',
              bookingDate: '2025-06-24',
            }
          ]
        }
      ]
    };
  }
  
  // Return null for events that don't exist or don't have mock data
  return null;
}

/**
 * Upload event image to the eventimages directory
 * @param file The image file to upload
 * @returns Promise with upload result containing path and filename
 */
export async function uploadEventImage(file: File): Promise<{
  success: boolean;
  path: string;
  filename: string;
  originalName: string;
  size: number;
}> {
  console.log("Uploading event image:", file.name);

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/eventimages/upload', {
      method: 'POST',
      body: formData,
    });

    console.log(`Upload event image response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Upload failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("Event image uploaded:", data);

    return data;
  } catch (error) {
    console.error("Error uploading event image:", error);
    throw error;
  }
}

export async function deleteEvent(id: number): Promise<{ success: boolean } | Array<{ success: boolean }>> {
  console.log(`Attempting to delete event with ID: ${id}`);

  // Ensure id is a number
  const numericId = Number(id);

  if (!numericId || isNaN(numericId) || numericId <= 0) {
    console.error(`Invalid event ID: ${id}, converted to: ${numericId}`);
    throw new Error("Invalid event ID. ID must be a positive number.");
  }

  try {
    // Use our internal API route to avoid CORS issues
    console.log(`Sending POST request to /api/events/delete with ID: ${numericId}`);
    const requestBody = { id: numericId };
    console.log(`Request body: ${JSON.stringify(requestBody)}`);

    const response = await fetch('/api/events/delete', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`Delete event response status: ${response.status}`);
    console.log(`Response headers: ${JSON.stringify(Object.fromEntries([...response.headers]))}`);
    console.log(`Response ok: ${response.ok}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);

      try {
        // Try to parse the error response as JSON
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `API returned error status: ${response.status}`);
      } catch (parseError) {
        // If parsing fails, throw a generic error
        throw new Error(`Failed to delete event. API returned status: ${response.status}`);
      }
    }

    // Try to parse the response
    try {
      const data = await response.json();
      console.log("Delete event response:", data);

      // If the response is an array with a success property, return it directly
      if (Array.isArray(data) && data[0]?.success === true) {
        return data;
      }

      // If the response has a success property, return it directly
      if (data && data.success === true) {
        return data;
      }

      // Default to success if we got a 200 response
      return { success: true };
    } catch (parseError) {
      console.error("Error parsing delete response:", parseError);
      // If we can't parse the response but got a 200 status, consider it a success
      return { success: true };
    }
  } catch (error) {
    console.error(`Error deleting event with ID ${id}:`, error);
    throw error;
  }
}



/**
 * Send event image data to external webhook
 * @param eventId The event ID
 * @param imageUrl The image URL/path
 * @param priority The priority of the image
 * @param isActive Whether the image is active
 * @returns Promise with webhook result
 */
export async function sendEventImageToWebhook(
  eventId: number,
  imageUrl: string,
  priority: number,
  isActive: boolean = true
): Promise<any> {
  console.log("Sending event image to webhook:", { eventId, imageUrl, priority, isActive });

  try {
    const response = await fetch('/api/eventimages/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_id: eventId,
        image_url: imageUrl,
        priority: priority,
        is_active: isActive,
      }),
    });

    console.log(`Event image webhook response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Webhook failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("Event image webhook success:", data);

    return data;
  } catch (error) {
    console.error("Error sending event image to webhook:", error);
    throw error;
  }
}

/**
 * Fetch event images by event ID with automatic mapping
 * @param eventId The event ID
 * @returns Promise with array of event images
 */
export async function fetchEventImages(eventId: number): Promise<any[]> {
  console.log("Fetching event images for event ID:", eventId);

  try {
    // Import the mapping function dynamically to avoid circular dependencies
    const { fetchEventImagesWithMapping } = await import('@/lib/eventImageMapping');

    const images = await fetchEventImagesWithMapping(eventId);
    console.log("Event images fetched with mapping:", images);

    return images;
  } catch (error) {
    console.error("Error fetching event images:", error);

    // Fallback to direct API call if mapping fails
    try {
      console.log("Falling back to direct API call...");

      const response = await fetch('/api/eventimages/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: eventId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API failed: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        const validImages = data.filter(img =>
          img &&
          typeof img === 'object' &&
          img.id !== undefined &&
          img.image_url !== undefined
        );
        console.log("Fallback fetch successful:", validImages);
        return validImages;
      }

      return [];
    } catch (fallbackError) {
      console.error("Fallback fetch also failed:", fallbackError);
      return [];
    }
  }
}

/**
 * Update event image
 * @param eventId The event ID
 * @param imageUrl The image URL/path
 * @param priority The priority of the image
 * @param isActive Whether the image is active
 * @returns Promise with update result
 */
export async function updateEventImage(
  eventId: number,
  imageUrl: string,
  priority: number,
  isActive: boolean = true
): Promise<any> {
  console.log("Updating event image:", { eventId, imageUrl, priority, isActive });

  try {
    const response = await fetch('/api/eventimages/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_id: eventId,
        image_url: imageUrl,
        priority: priority,
        is_active: isActive,
      }),
    });

    console.log(`Update event image response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Update failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("Event image update success:", data);

    return data;
  } catch (error) {
    console.error("Error updating event image:", error);
    throw error;
  }
}

/**
 * Get all events with details (new API structure)
 * Returns events with venue_name, city_name, and event_games_with_slots
 * @returns Promise with array of events with full details
 */
export async function getAllEventsWithDetails(): Promise<any[]> {
  try {
    console.log('Fetching all events with details from new API');

    const response = await fetch('/api/events/list', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching events:', errorText);
      throw new Error(`Failed to fetch events: ${response.status}`);
    }

    const events = await response.json();
    console.log(`Fetched ${events.length} events with details`);
    
    return events;
  } catch (error: any) {
    console.error('Error in getAllEventsWithDetails:', error);
    throw error;
  }
}

/**
 * Get event with details by ID (new API structure)
 * Returns event with venue_name, city_name, and event_games_with_slots
 * @param eventId Event ID
 * @returns Promise with event details
 */
export async function getEventWithDetails(eventId: number): Promise<any> {
  try {
    console.log(`Fetching event ${eventId} with details from new API`);

    const response = await fetch(`/api/events/${eventId}/details`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Event not found');
      }
      const errorText = await response.text();
      console.error('Error fetching event:', errorText);
      throw new Error(`Failed to fetch event: ${response.status}`);
    }

    const event = await response.json();
    console.log(`Fetched event ${eventId} with details`);
    
    return event;
  } catch (error: any) {
    console.error(`Error in getEventWithDetails(${eventId}):`, error);
    throw error;
  }
}

/**
 * Get all events for a specific city (simplified for forms/dropdowns)
 * Calls the local API endpoint /api/city/{cityId}/events
 * @param cityId City ID
 * @returns Promise with array of events for the city with id and title
 */
export async function getEventsByCityId(cityId: number): Promise<Array<{ id: number; title: string }>> {
  try {
    console.log(`Fetching events for city ${cityId}`);

    const response = await fetch(`/api/city/${cityId}/events`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching events for city:', errorText);
      throw new Error(`Failed to fetch events for city: ${response.status}`);
    }

    const result = await response.json();
    console.log(`Fetched ${result.data?.length || 0} events for city ${cityId}`);
    
    // Return the data array, ensuring it has id and title fields
    const events = result.success && result.data ? result.data : [];
    
    // Transform to consistent format with id and title
    return events.map((event: any) => ({
      id: event.id || event.event_id,
      title: event.title || event.event_title
    }));
  } catch (error: any) {
    console.error(`Error in getEventsByCityId(${cityId}):`, error);
    throw error;
  }
}
