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
  is_active?: number;
  image_url?: string;
  priority?: number;
  created_at?: string;
  updated_at?: string;
  event_games_with_slots: EventGame[];
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
  min_age?: number;
  max_age?: number;
  is_active?: number;
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
  games_with_slots?: any[]; // Optional property for games with slot details
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

  try {
    // Get authentication token
    let token: string | null = null;
    
    if (typeof window !== 'undefined') {
      // Try localStorage and sessionStorage
      token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');

      // Try auth-token cookie
      if (!token) {
        const cookies = document.cookie.split(';');
        const authTokenCookie = cookies.find(c => c.trim().startsWith('auth-token='));
        if (authTokenCookie) {
          token = authTokenCookie.split('=')[1];
        }
      }

      // Try superadmin-token cookie
      if (!token) {
        const cookies = document.cookie.split(';');
        const superadminCookie = cookies.find(c => c.trim().startsWith('superadmin-token='));
        if (superadminCookie) {
          try {
            const cookieValue = decodeURIComponent(superadminCookie.split('=')[1]);
            const userData = JSON.parse(cookieValue);
            if (userData && userData.token) {
              token = userData.token;
            }
          } catch (e) {
            // Silently handle parse error
          }
        }
      }
    }

    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/events/create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || errorJson.error || `API returned error status: ${response.status}`);
      } catch (parseError) {
        throw new Error(`API returned error status: ${response.status} - ${errorText}`);
      }
    }

    const data = await response.json();

    // Return the data (the response should contain event_id)
    return data; 
  } catch (error) {
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
  isActive?: boolean;
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
      minAge?: number;
      maxAge?: number;
      isActive?: boolean;
    }>;
  }>;
  cityId?: number;
  imagePath?: string | null;
  imagePriority?: string;
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
        min_age: slot.minAge || 0,
        max_age: slot.maxAge || 12,
        is_active: slot.isActive !== false ? 1 : 0,
        created_at: formattedNow,
        updated_at: formattedNow
      });
    });
  });

  // Create the formatted event data
  const formattedEvent: Event = {
    title: formData.title,
    description: formData.description,
    city_id: formData.cityId || 0,
    venue_id: parseInt(formData.venueId),
    event_date: formData.date,
    status: formData.status === "draft" ? "Draft" : "Published",
    is_active: formData.isActive !== false ? 1 : 0,
    image_url: formData.imagePath || "",
    priority: parseInt(formData.imagePriority || "1"),
    created_at: formattedNow,
    updated_at: formattedNow,
    event_games_with_slots: formattedGames
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();

    // The API returns an array with a single event, so we need to extract it
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    } else if (!Array.isArray(data)) {
      return data;
    }

    throw new Error("Event not found");
  } catch (error) {
    throw error;
  }
}

/**
 * Get a single event with complete games/slots information by ID
 * @param id The event ID
 * @returns The event data with games and slots
 */
export async function getEventWithGames(id: string | number): Promise<any> {

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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
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

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/event-game-slots/create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slotData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();

    return data; 
  } catch (error) {
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

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/event-game-slots/update', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slotData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();

    return data; 
  } catch (error) {
    throw error;
  }
}

/**
 * Delete an event game slot
 * @param id The slot ID to delete
 * @returns Promise with the deletion result
 */
export async function deleteEventGameSlot(id: number): Promise<any> {

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/event-game-slots/delete', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();

    return data; 
  } catch (error) {
    throw error;
  }
}

/**
 * Get slot status
 * @param slotId The slot ID to get status for
 * @returns Promise with the slot status
 */
export async function getSlotStatus(slotId: string): Promise<string> {

  try {
    const response = await fetch(`/api/event-game-slots/status?slotId=${slotId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return 'active';
    }

    const data = await response.json();
    return data.status || 'active';
  } catch (error) {
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
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();

    return data; 
  } catch (error) {
    throw error;
  }
}

/**
 * Get all slot statuses for an event
 * @returns Promise with all slot statuses
 */
export async function getAllSlotStatuses(): Promise<Record<string, string>> {

  try {
    const response = await fetch('/api/event-game-slots/status', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return {};
    }

    const data = await response.json();
    return data || {};
  } catch (error) {
    return {}; // Return empty object on error
  }
}

/**
 * Update an existing event
 * @param eventData The event data to update
 * @returns Promise with the updated event or success status
 */
export async function updateEvent(eventData: any): Promise<{ success: boolean; event_id?: number }> {

  // Ensure the event has an ID
  if (!eventData.id) {
    throw new Error("Event ID is required for updates");
  }

  try {
    // Get the auth token from various sources
    let token: string | null = null;

    // Try to get token from localStorage
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token') || localStorage.getItem('auth-token');
    }

    // Try to get token from sessionStorage
    if (!token && typeof window !== 'undefined') {
      token = sessionStorage.getItem('token') || sessionStorage.getItem('auth-token');
    }

    // Try to get token from cookies
    if (!token && typeof document !== 'undefined') {
      const authTokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='));
      if (authTokenCookie) {
        token = authTokenCookie.split('=')[1];
      }

      // Try superadmin-token as fallback
      if (!token) {
        const superadminTokenCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('superadmin-token='));
        if (superadminTokenCookie) {
          token = superadminTokenCookie.split('=')[1];
        }
      }
    }

    if (!token) {
      throw new Error("Authentication required. Please log in.");
    }

    // Prepare headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };

    // Extract the event ID
    const eventId = eventData.id;
    delete eventData.id; // Remove id from body as it's in the URL

    // Use our internal API route to update the event
    const apiUrl = `/api/events/${eventId}/edit`; 

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();

    // Return success
    return {
      success: true,
      event_id: data.event_id || eventId
    };
  } catch (error: any) {
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
    isActive?: boolean;
    imagePath?: string | null;
    imagePriority?: string;
    games: Array<{
      templateId: string;
      customTitle?: string;
      customDescription?: string;
      customPrice?: number;
      note?: string;
      slots: Array<{
        id: string;
        originalId?: number; // Database ID for existing slots
        startTime: string;
        endTime: string;
        price: number;
        maxParticipants: number;
        minAge?: number;
        maxAge?: number;
        isActive?: boolean;
      }>;
    }>;
    cityId?: number;
    slotsToDelete?: number[]; // Array of slot IDs to delete
  }
): any {

  // Format games data using event_games_with_slots structure
  const eventGamesWithSlots: any[] = [];

  // Process each game and its slots
  formData.games.forEach(game => {
    game.slots.forEach(slot => {
      const slotData: any = {
        game_id: parseInt(game.templateId),
        custom_title: game.customTitle || "",
        custom_description: game.customDescription || "",
        custom_price: typeof game.customPrice === 'number' ? game.customPrice : 0,
        note: game.note || "",
        start_time: slot.startTime.includes(":") ? slot.startTime + ":00" : slot.startTime, // Add seconds if not present
        end_time: slot.endTime.includes(":") ? slot.endTime + ":00" : slot.endTime, // Add seconds if not present
        slot_price: typeof slot.price === 'number' ? slot.price : 0,
        max_participants: typeof slot.maxParticipants === 'number' ? slot.maxParticipants : 10,
        is_active: slot.isActive !== undefined ? (slot.isActive ? 1 : 0) : 1,
        min_age: typeof slot.minAge === 'number' ? slot.minAge : null,
        max_age: typeof slot.maxAge === 'number' ? slot.maxAge : null
      };

      // Include database ID if this is an existing slot
      if (slot.originalId) {
        slotData.id = slot.originalId;
      }

      eventGamesWithSlots.push(slotData);
    });
  });

  // Create the formatted event data
  const formattedEvent: any = {
    title: formData.title,
    description: formData.description,
    city_id: formData.cityId || 0,
    venue_id: parseInt(formData.venueId),
    event_date: formData.date,
    status: formData.status === "draft" ? "Draft" : "Published",
    is_active: formData.isActive !== undefined ? (formData.isActive ? 1 : 0) : 1,
    event_games_with_slots: eventGamesWithSlots
  };

  // Add optional fields
  if (formData.imagePath) {
    formattedEvent.image_url = formData.imagePath;
  }
  if (formData.imagePriority) {
    formattedEvent.priority = parseInt(formData.imagePriority);
  }

  // Add slots to delete if any
  if (formData.slotsToDelete && formData.slotsToDelete.length > 0) {
    formattedEvent.event_games_with_slots_to_delete = formData.slotsToDelete;
  }

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
        throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
      }

      const events = await response.json();

      if (!Array.isArray(events)) {
        throw new Error('Invalid response format: expected an array of events');
      }

      if (events.length > 0) {
        const firstEvent = events[0];
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
            return venueName;
          }
        } catch (error) {
          // Silent error handling
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

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

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
      throw new Error(`Failed to fetch games: ${response.status} ${response.statusText}`);
    }

    const games = await response.json();
    
    if (!Array.isArray(games)) {
      throw new Error('Invalid response format: expected an array of games');
    }

    if (games.length > 0) {
      const firstGame = games[0];
    }

    return games;
  } catch (error) {
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

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/eventimages/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status}`);
    }

    const data = await response.json();

    return data; 
  } catch (error) {
    throw error;
  }
}

export async function deleteEvent(id: number, imageUrl?: string): Promise<{ success: boolean } | Array<{ success: boolean }>> {

  // Ensure id is a number
  const numericId = Number(id);

  if (!numericId || isNaN(numericId) || numericId <= 0) {
    throw new Error("Invalid event ID. ID must be a positive number.");
  }

  try {
    // Get the auth token from various sources
    let token: string | null = null;

    // Try to get token from localStorage
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token') || localStorage.getItem('auth-token');
    }

    // Try to get token from sessionStorage
    if (!token && typeof window !== 'undefined') {
      token = sessionStorage.getItem('token') || sessionStorage.getItem('auth-token');
    }

    // Try to get token from cookies
    if (!token && typeof document !== 'undefined') {
      const authTokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='));
      if (authTokenCookie) {
        token = authTokenCookie.split('=')[1];
      }

      // Try superadmin-token as fallback
      if (!token) {
        const superadminTokenCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('superadmin-token='));
        if (superadminTokenCookie) {
          token = superadminTokenCookie.split('=')[1];
        }
      }
    }

    if (!token) {
      throw new Error("Authentication required. Please log in.");
    }

    // Prepare headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };

    // Use our internal API route to avoid CORS issues
    const requestBody: any = { id: numericId };
    if (imageUrl) {
      requestBody.image_url = imageUrl;
    }

    const response = await fetch('/api/events/delete', {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();

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
      // If we can't parse the response but got a 200 status, consider it a success
      return { success: true };
    }
  } catch (error) {
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Webhook failed: ${response.status}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Webhook failed: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch event images by event ID with automatic mapping
 * @param eventId The event ID
 * @returns Promise with array of event images
 */
import { buildServeImageUrl } from '@/lib/imageUtils'

export async function fetchEventImages(eventId: number): Promise<any[]> {
  try {
    // Import the mapping function dynamically to avoid circular dependencies
    const { fetchEventImagesWithMapping } = await import('@/lib/eventImageMapping');

    const images = await fetchEventImagesWithMapping(eventId);

    // Normalize image_url for UI previews
    const normalized = Array.isArray(images) ? images.map(img => {
      if (img && typeof img === 'object' && img.image_url) {
        // Convert image_url into a served URL usable in <img src>
        const servedUrl = buildServeImageUrl(img.image_url, 'upload/eventimages/');
        return { ...img, image_url: servedUrl }
      }
      return img
    }) : []

    return normalized;
  } catch (error) {
    // Fallback to direct API call if mapping fails
    try {
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
        const errorText = await response.text();
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

        // Convert to served URLs
        const normalized = validImages.map(img => ({ 
          ...img, 
          image_url: buildServeImageUrl(img.image_url, 'upload/eventimages/') 
        }));

        return normalized;
      }

      return [];
    } catch (fallbackError) {
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Update failed: ${response.status}`);
    }

    const data = await response.json();

    return data; 
  } catch (error) {
    throw error;
  }
}

/**
 * Get all events with details (new API structure)
 * Returns events with venue_name, city_name, and event_games_with_slots
 * @returns Promise with array of events with full details
 */
import { apiUrl } from './apiClient';

export async function getAllEventsWithDetails(): Promise<any[]> {
  try {

    const response = await fetch(apiUrl('/api/events/list'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch events: ${response.status}`);
    }

    const events = await response.json();
    
    return events;
  } catch (error: any) {
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
      throw new Error(`Failed to fetch event: ${response.status}`);
    }

    const event = await response.json();
    
    return event;
  } catch (error: any) {
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

    const response = await fetch(`/api/city/${cityId}/events`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch events for city: ${response.status}`);
    }

    const result = await response.json();
    
    const rawEvents = Array.isArray(result) ? result : (result.success && result.data ? result.data : []);
    
    return (rawEvents || []).map((event: any) => ({
      id: event.id || event.event_id,
      title: event.title || event.event_title
    }));
  } catch (error: any) {
    throw error;
  }
}

