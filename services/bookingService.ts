// Booking service for handling booking-related API calls

export interface Booking {
  booking_id: number;
  booking_ref: string;
  booking_status: string;
  total_amount: string;
  payment_method: string;
  payment_status: string;
  terms_accepted: boolean;
  booking_is_active: boolean;
  booking_created_at: string;
  booking_updated_at: string;
  cancelled_at: string | null;
  completed_at: string | null;
  parent_id: number;
  parent_name: string;
  parent_email: string;
  parent_additional_phone: string;
  parent_is_active: boolean;
  parent_created_at: string;
  parent_updated_at: string;
  child_id: number;
  child_full_name: string;
  child_date_of_birth: string;
  child_school_name: string;
  child_gender: string;
  child_age?: string; // Add the new child_age field (optional since it might not be present in all responses)
  child_is_active: boolean;
  child_created_at: string;
  child_updated_at: string;
  game_name: string;
  game_description: string;
  game_min_age: number;
  game_max_age: number;
  game_duration_minutes: number;
  game_categories: string[];
  game_is_active: boolean;
  game_created_at: string;
  game_updated_at: string;
  event_id?: number;
  event?: any;
  event_title: string;
  event_description: string;
  event_event_date: string;
  event_status: string;
  event_created_at: string;
  event_updated_at: string;
  user_full_name: string;
  user_email: string;
  user_phone: string;
  user_city_id: number;
  user_accepted_terms: boolean;
  user_terms_accepted_at: string | null;
  user_is_active: boolean;
  user_is_locked: boolean;
  user_locked_until: string | null;
  user_deactivated_at: string | null;
  user_created_at: string;
  user_updated_at: string;
  user_last_login_at: string | null;
  city_name: string;
  city_state: string;
  city_is_active: boolean;
  city_created_at: string;
  city_updated_at: string;
  venue_name: string;
  venue_address: string;
  venue_capacity: number;
  venue_is_active: boolean;
  venue_created_at: string;
  venue_updated_at: string;
}

// Pagination interface
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedBookingsResponse {
  data: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Get all bookings with error handling and timeout
 * @returns Promise with array of bookings
 */
export async function getAllBookings(): Promise<Booking[]> {
  try {
    // Use our internal API route to avoid CORS issues
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch('/api/bookings/get-all', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API returned error status: ${response.status}`);
      }

      const data = await response.json();

      // Handle both old format (array) and new paginated format
      if (Array.isArray(data)) {
        return data;
      } else if (data.data && Array.isArray(data.data)) {
        return data.data;
      }

      return [];
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error("Request timed out. The server took too long to respond.");
      }
      throw fetchError;
    }
  } catch (error: any) {
    throw error;
  }
}

/**
 * Get paginated bookings with error handling and timeout
 * @param params Pagination parameters
 * @returns Promise with paginated bookings response
 */
export async function getPaginatedBookings(params: PaginationParams = {}): Promise<PaginatedBookingsResponse> {
  try {
    const { page = 1, limit = 100 } = params;

    // Use our internal API route to avoid CORS issues
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const url = new URL('/api/bookings/get-all', window.location.origin);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('limit', limit.toString());

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API returned error status: ${response.status}`);
      }

      const data = await response.json();

      // Ensure we have the expected paginated format
      if (data.data && data.pagination) {
        return data;
      }

      // Fallback for old format
      if (Array.isArray(data)) {
        return {
          data,
          pagination: {
            page: 1,
            limit: data.length,
            total: data.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false
          }
        };
      }

      throw new Error("Invalid response format");
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error("Request timed out. The server took too long to respond.");
      }
      throw fetchError;
    }
  } catch (error: any) {
    throw error;
  }
}

// Interface for status update request
export interface UpdateStatusRequest {
  booking_id: number;
  status: string;
}

// Interface for status update response
export interface UpdateStatusResponse {
  booking_id: number;
  booking_ref: string;
  user_id: number;
  parent_id: number;
  event_id: number;
  status: string;
  total_amount: string;
  payment_method: string;
  payment_status: string;
  terms_accepted: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  cancelled_at: string | null;
  completed_at: string | null;
}

/**
 * Update booking status
 * @param bookingId Booking ID
 * @param status New status
 * @returns Promise with updated booking data
 */
export async function updateBookingStatus(bookingId: number, status: string): Promise<UpdateStatusResponse> {
  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/bookings/update-status', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingId,
        status
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API returned error status: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If we can't parse the error as JSON, use the status code
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    // The API returns an array with a single booking object
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    } else if (!Array.isArray(data)) {
      return data;
    }

    throw new Error("Invalid response format from status update API");
  } catch (error: any) {
    throw error;
  }
}

/**
 * Get booking by ID
 * @param bookingId Booking ID
 * @returns Promise with booking data
 */
export async function getBookingById(bookingId: string | number): Promise<Booking> {
  try {
    // Backwards compatible convenience method that returns a normalized summary Booking (first child flattened)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Booking with ID ${bookingId} not found`);
      }
      const text = await response.text();
      throw new Error(`Failed to fetch booking: ${response.status} - ${text}`);
    }

    const payload = await response.json();
    const source = payload && payload.data ? payload.data : payload;

    // Keep the existing normalization (summary with first child)
    const child = (Array.isArray(source.children) && source.children.length > 0) ? source.children[0] : undefined;
    const payment = (Array.isArray(source.payments) && source.payments.length > 0) ? source.payments[0] : undefined;
    const venue = source.event && source.event.venue ? source.event.venue : undefined;

    const booking: Booking = {
      booking_id: source.booking_id || source.id || 0,
      booking_ref: source.booking_ref || source.bookingRef || "",
      booking_status: source.booking_status || source.status || "",
      total_amount: source.total_amount || source.totalAmount || source.total || "",
      payment_method: source.payment_method || source.paymentMethod || (payment?.payment_method ?? ""),
      payment_status: source.payment_status || source.paymentStatus || (payment?.payment_status ?? ""),
      terms_accepted: !!source.terms_accepted,
      booking_is_active: source.booking_is_active ?? true,
      booking_created_at: source.booking_date || source.created_at || source.booking_created_at || "",
      booking_updated_at: source.updated_at || source.booking_updated_at || "",
      cancelled_at: source.cancelled_at ?? null,
      completed_at: source.completed_at ?? null,
      parent_id: source.parent?.id ?? source.parent_id ?? 0,
      parent_name: source.parent?.name || source.parent_name || source.parent_name || "",
      parent_email: source.parent?.email || source.parent_email || "",
      parent_additional_phone: source.parent?.phone || source.parent_additional_phone || "",
      parent_is_active: source.parent?.is_active ?? true,
      parent_created_at: source.parent?.created_at || "",
      parent_updated_at: source.parent?.updated_at || "",
      child_id: child?.child_id ?? child?.id ?? source.child_id ?? 0,
      child_full_name: child?.full_name || child?.child_full_name || source.child_full_name || "",
      child_date_of_birth: child?.date_of_birth || child?.child_date_of_birth || source.child_date_of_birth || "",
      child_school_name: child?.school_name || source.child_school_name || "",
      child_gender: child?.gender || child?.child_gender || source.child_gender || "",
      child_age: child?.age || child?.child_age || source.child_age || "",
      child_is_active: child?.is_active ?? true,
      child_created_at: child?.created_at || child?.child_created_at || "",
      child_updated_at: child?.updated_at || child?.child_updated_at || "",
      game_name: (child && Array.isArray(child.booking_games) && child.booking_games.length > 0)
        ? child.booking_games[0].game_name || child.booking_games[0].game_name
        : source.game_name || "",
      game_description: source.game_description || "",
      game_min_age: source.min_age ?? 0,
      game_max_age: source.max_age ?? 0,
      game_duration_minutes: source.duration_minutes ?? 0,
      game_categories: source.game_categories || [],
      game_is_active: true,
      game_created_at: "",
      game_updated_at: "",
      event_id: source.event?.id ?? source.event_id ?? 0,
      event: source.event ?? null,
      event_title: source.event?.name || source.event_title || "",
      event_description: source.event?.description || source.event_description || "",
      event_event_date: source.event?.date || source.event_date || source.event_event_date || "",
      event_status: source.event?.status || source.event_status || "",
      event_created_at: source.event?.created_at || "",
      event_updated_at: source.event?.updated_at || "",
      user_full_name: source.user?.full_name || source.user_full_name || "",
      user_email: source.user?.email || source.user_email || "",
      user_phone: source.user?.phone || source.user_phone || "",
      user_city_id: source.user?.city_id ?? source.user_city_id ?? 0,
      user_accepted_terms: !!source.user?.accepted_terms,
      user_terms_accepted_at: source.user?.terms_accepted_at || null,
      user_is_active: source.user?.is_active ?? true,
      user_is_locked: source.user?.is_locked ?? false,
      user_locked_until: source.user?.locked_until || null,
      user_deactivated_at: source.user?.deactivated_at || null,
      user_created_at: source.user?.created_at || "",
      user_updated_at: source.user?.updated_at || "",
      user_last_login_at: source.user?.last_login_at || null,
      city_name: venue?.city || source.city_name || "",
      city_state: venue?.state || source.city_state || "",
      city_is_active: true,
      city_created_at: "",
      city_updated_at: "",
      venue_name: venue?.name || source.venue_name || "",
      venue_address: venue?.address || source.venue_address || "",
      venue_capacity: venue?.capacity ?? source.venue_capacity ?? 0,
      venue_is_active: true,
      venue_created_at: "",
      venue_updated_at: "",
    };

    return booking;
  } catch (error: any) {
    // Handle timeout errors
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - the booking service is taking too long to respond');
    }

    // Re-throw the error without fallback to prevent infinite loops
    throw error;
  }
}

// New: fetch the full booking object (raw structure including children/booking_games/payments)
export async function getBookingDetail(bookingId: string | number): Promise<any> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) throw new Error(`Booking with ID ${bookingId} not found`);
      const text = await response.text();
      throw new Error(`Failed to fetch booking detail: ${response.status} - ${text}`);
    }

    const payload = await response.json();
    return payload && payload.data ? payload.data : payload;
  } catch (error: any) {
    if (error.name === 'AbortError') throw new Error('Request timeout - the booking service is taking too long to respond');
    throw error;
  }
}

// Interface for comprehensive ticket details based on the new API format
export interface TicketDetails {
  booking_id: number;
  booking_ref: string;
  booking_status: string;
  total_amount: string;
  payment_method: string;
  payment_status: string;
  terms_accepted: boolean;
  booking_active: boolean;
  booking_created_at: string;
  booking_updated_at: string;
  cancelled_at: string | null;
  completed_at: string | null;
  parent_id: number;
  parent_name: string;
  parent_email: string;
  additional_phone: string;
  parent_active: boolean;
  user_id: number;
  user_full_name: string;
  user_email: string;
  phone: string;
  email_verified: boolean;
  phone_verified: boolean;
  user_city_id: number;
  accepted_terms: boolean;
  terms_accepted_at: string | null;
  user_active: boolean;
  is_locked: boolean;
  locked_until: string | null;
  deactivated_at: string | null;
  user_created_at: string;
  user_updated_at: string;
  last_login_at: string | null;
  child_id: number;
  child_name: string;
  date_of_birth: string;
  gender: string;
  school_name: string;
  child_active: boolean;
  event_id: number;
  event_title: string;
  event_description: string;
  event_date: string;
  event_status: string;
  event_created_at: string;
  // Event Game Slot Info (from event_games_with_slots)
  event_game_slot_id: number;
  custom_title: string;
  custom_description: string;
  custom_price: string;
  start_time: string;
  end_time: string;
  slot_price: string;
  max_participants: number;
  slot_created_at: string;
  slot_updated_at: string;

  // Slot details from the new API response
  slot_id: number;
  slot_title: string;
  slot_description: string;

  // Legacy game fields (for backward compatibility)
  game_id?: number;
  game_name?: string;
  game_description?: string;
  min_age?: number;
  max_age?: number;
  duration_minutes?: number;
  categories?: string[];
  game_active?: boolean;
  booking_game_id: number;
  game_price: string;
  attendance_status: string;
  game_booking_created_at: string;

  // Additional fields that might be useful for slot identification
  // slot_id is now defined above in the slot details section

  // Venue-related fields returned by the API
  venue_id: number;
  venue_name: string;
  venue_address: string;
  venue_capacity: number;
  venue_active: boolean;
  venue_created_at: string;
  venue_updated_at: string;
  event_city_id: number;
  city_name: string;
  state: string;
}

/**
 * Get event details with venue information by event ID
 * @param eventId Event ID
 * @returns Promise with event details including venue information
 */
export async function getEventWithVenueDetails(eventId: number) {
  try {

    const response = await fetch(`/api/events/get-with-games`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ eventId })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch event details: ${response.status}`);
    }

    const eventData = await response.json();

    return eventData;
  } catch (error) {
    console.error('Error fetching event details with venue information:', error);
    throw error;
  }
}

/**
 * Converts booking references between formats
 * @param ref The booking reference to convert
 * @param targetFormat The target format for the conversion ('B' or 'PPT')
 * @returns The converted booking reference
 */
export function convertBookingRefFormat(ref: string, targetFormat: 'B' | 'PPT' = 'PPT'): string {
  if (!ref) return '';

  // Remove quotes if it's a JSON string
  let cleanRef = ref;
  if (cleanRef.startsWith('"') && cleanRef.endsWith('"')) {
    cleanRef = cleanRef.slice(1, -1);
  }

  // Extract numeric parts based on current format
  let numericPart = '';
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString().slice(-2);
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const day = currentDate.getDate().toString().padStart(2, '0');

  if (cleanRef.startsWith('B')) {
    // Extract from B format (B0000123)
    numericPart = cleanRef.replace(/^B(\d+)$/, '$1');

    if (targetFormat === 'B') {
      // Already in B format, just normalize
      return `B${numericPart.padStart(7, '0')}`;
    } else {
      // Convert B -> PPT format
      // Use current date + numeric part as the identifier
      return `PPT${year}${month}${day}${numericPart.slice(-3).padStart(3, '0')}`;
    }
  } else if (cleanRef.startsWith('PPT')) {
    // Extract from PPT format (PPTYYMMDDxxx)
    // PPT format typically has date embedded in it

    // More flexible regex that handles various PPT formats
    const pptMatch = cleanRef.match(/^PPT(\d{6})(\d+)$/);

    if (pptMatch) {
      const dateStr = pptMatch[1]; // YYMMDD part
      const idPart = pptMatch[2];  // xxx part (numeric ID)

      if (targetFormat === 'PPT') {
        // Already in PPT format, return as-is to preserve original date
        return cleanRef; 
      } else {
        // Convert PPT -> B format
        // Use the numeric part as is, pad to 7 digits
        return `B${idPart.padStart(7, '0')}`;
      }
    } else {
      // Try alternative patterns for PPT references

      // Check if it's a valid PPT format with any number of digits after the date
      const altMatch = cleanRef.match(/^PPT(\d+)$/);
      if (altMatch && altMatch[1].length >= 9) { // At least YYMMDD + 3 digits
        const fullNumber = altMatch[1];
        const dateStr = fullNumber.substring(0, 6); // First 6 digits as date
        const idPart = fullNumber.substring(6);     // Rest as ID

        if (targetFormat === 'PPT') {
          // Already in PPT format, return as-is to preserve original date
          return cleanRef;
        } else {
          // Convert PPT -> B format
          return `B${idPart.padStart(7, '0')}`;
        }
      }

      // Last resort - if target format is PPT and input is already PPT, preserve it
      if (targetFormat === 'PPT') {
        return cleanRef; // Preserve original PPT reference to avoid date changes
      } else {
        // Only convert to B format if explicitly requested
        numericPart = cleanRef.replace(/\D/g, '');
        const fallbackResult = `B${numericPart.slice(-7).padStart(7, '0')}`;
        return fallbackResult; 
      }
    }
  } else if (cleanRef.startsWith('MAN')) {
    // Handle MAN format (MANYYMMDDxxx) - manual booking references

    const manMatch = cleanRef.match(/^MAN(\d{6})(\d+)$/);
    if (manMatch) {
      const dateStr = manMatch[1]; // YYMMDD part
      const idPart = manMatch[2];  // xxx part (numeric ID)

      if (targetFormat === 'PPT') {
        // Convert MAN -> PPT format, preserving the original date
        const result = `PPT${dateStr}${idPart.padStart(3, '0')}`;
        return result; 
      } else {
        // Convert MAN -> B format
        const result = `B${idPart.padStart(7, '0')}`;
        return result; 
      }
    } else {
      // Fallback for malformed MAN references
      numericPart = cleanRef.replace(/\D/g, '');
      return targetFormat === 'B' ?
        `B${numericPart.slice(-7).padStart(7, '0')}` :
        `PPT${year}${month}${day}${numericPart.slice(-3).padStart(3, '0')}`;
    }
  } else {
    // Unknown format, extract any numeric parts
    numericPart = cleanRef.replace(/\D/g, '');
    return targetFormat === 'B' ?
      `B${numericPart.slice(-7).padStart(7, '0')}` :
      `PPT${year}${month}${day}${numericPart.slice(-3).padStart(3, '0')}`;
  }
}

// New function to fetch detailed ticket information using booking reference
export async function getTicketDetails(bookingRef: string): Promise<TicketDetails[]> {
  try {

    // Use booking reference as-is - DO NOT convert MAN references
    // The API should handle different reference formats directly
    let formattedRef = bookingRef;

    if (bookingRef.startsWith('MAN')) {
      // Keep MAN references unchanged
    } else if (bookingRef.startsWith('PPT')) {
      // Keep PPT references unchanged
    } else if (!bookingRef.startsWith('PPT') && !bookingRef.startsWith('MAN')) {
      // Only convert B format references to PPT
      formattedRef = convertBookingRefFormat(bookingRef, 'PPT');
    }

    // Strip any JSON formatting if it was stored as JSON string
    if (formattedRef.startsWith('"') && formattedRef.endsWith('"')) {
      formattedRef = formattedRef.slice(1, -1);
    }

    // Use backend URL from environment variable
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:3004';
    const response = await fetch(`${backendUrl}/api/bookings/check?booking_ref=${formattedRef}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`API returned error status: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      throw new Error(`Failed to fetch ticket details: ${response.status}`);
    }

    const data = await response.json();
    // Convert single booking object to array format for compatibility
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    throw error;
  }
}

/**
 * Get event game slot details by slot ID (preferred method)
 * @param slotId Slot ID
 * @returns Promise with slot details or null
 */
export async function getEventGameSlotDetailsBySlotId(slotId: number) {
  try {
    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/event-game-slot/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: slotId })
    });

    if (response.ok) {
      const slotDataArray = await response.json();

      // The API returns an array, get the first item
      if (slotDataArray && Array.isArray(slotDataArray) && slotDataArray.length > 0) {
        const slotData = slotDataArray[0];
        return {
          slot_id: slotData.id,
          custom_title: slotData.custom_title,
          custom_description: slotData.custom_description,
          custom_price: slotData.custom_price,
          slot_price: slotData.slot_price,
          start_time: slotData.start_time,
          end_time: slotData.end_time,
          max_participants: slotData.max_participants,
        };
      }
    }
  } catch (error) {
    console.error('Error fetching slot details by slot ID:', error);
  }
  return null;
}

/**
 * Find the most likely slot for a booking based on event and game details
 * This is a workaround for when booking_games data is not available
 * @param booking Booking data
 * @returns Promise with slot details or null
 */
export async function findMostLikelySlotForBooking(booking: any) {
  try {

    // Get all slots first with timeout protection
    const slotsController = new AbortController();
    const slotsTimeout = setTimeout(() => slotsController.abort(), 10000); // 10 second timeout

    const slotsResponse = await fetch('https://ai.nibog.in/webhook/v1/nibog/event-game-slot/get-all', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: slotsController.signal
    });

    clearTimeout(slotsTimeout);

    if (!slotsResponse.ok) {
      console.error('❌ Failed to fetch slots:', slotsResponse.status);
      return null;
    }

    const allSlots = await slotsResponse.json();

    // Get all events to find the matching event ID with timeout protection
    const eventsController = new AbortController();
    const eventsTimeout = setTimeout(() => eventsController.abort(), 10000); // 10 second timeout

    const eventsResponse = await fetch('https://ai.nibog.in/webhook/v1/nibog/event/get-all', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: eventsController.signal
    });

    clearTimeout(eventsTimeout);

    if (!eventsResponse.ok) {
      console.error('❌ Failed to fetch events:', eventsResponse.status);
      return null;
    }

    const allEvents = await eventsResponse.json();

    // Find the event that matches the booking
    const matchingEvent = allEvents.find((event: any) => {
      const eventDate = new Date(event.event_date).toDateString();
      const bookingDate = new Date(booking.event_event_date).toDateString();
      return event.title === booking.event_title && eventDate === bookingDate;
    });

    if (!matchingEvent) {
      return null;
    }

    // Get all games to find the matching game ID with timeout protection
    const gamesController = new AbortController();
    const gamesTimeout = setTimeout(() => gamesController.abort(), 10000); // 10 second timeout

    const gamesResponse = await fetch('https://ai.nibog.in/webhook/v1/nibog/baby-games/get-all', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: gamesController.signal
    });

    clearTimeout(gamesTimeout);

    if (!gamesResponse.ok) {
      console.error('❌ Failed to fetch games:', gamesResponse.status);
      return null;
    }

    const allGames = await gamesResponse.json();

    // Find the game that matches the booking
    const matchingGame = allGames.find((game: any) =>
      game.game_title === booking.game_name ||
      game.name === booking.game_name ||
      game.title === booking.game_name
    );

    if (!matchingGame) {
      return null;
    }

    // Find slots that match both event and game
    const matchingSlots = allSlots.filter((slot: any) =>
      slot.event_id === matchingEvent.id && slot.game_id === matchingGame.id
    );

    if (matchingSlots.length === 0) {
      return null;
    }

    // Log all matching slots for debugging
    matchingSlots.forEach((slot: any, index: number) => {
    });

    // If there's only one slot, use it
    if (matchingSlots.length === 1) {
      const slot = matchingSlots[0];
      return await getEventGameSlotDetailsBySlotId(slot.id);
    }

    // IMPROVED MATCHING LOGIC for multiple slots:

    // 1. Try to match by price (booking total_amount should match slot_price + any addons)
    const bookingAmount = parseFloat(booking.total_amount);
    const priceMatchingSlots = matchingSlots.filter((slot: any) => {
      const slotPrice = parseFloat(slot.slot_price || slot.custom_price || '0');
      // Allow for small differences due to addons, taxes, etc.
      return Math.abs(bookingAmount - slotPrice) <= 2; // Within $2 difference
    });

    if (priceMatchingSlots.length === 1) {
      const slot = priceMatchingSlots[0];
      return await getEventGameSlotDetailsBySlotId(slot.id);
    }

    // 2. Try to match by custom title (slots with custom titles are more likely to be the booked ones)
    const customSlots = matchingSlots.filter((slot: any) =>
      slot.custom_title &&
      slot.custom_title.trim() !== '' &&
      slot.custom_title !== booking.game_name
    );

    if (customSlots.length === 1) {
      const slot = customSlots[0];
      return await getEventGameSlotDetailsBySlotId(slot.id);
    }

    // 3. Try to match by creation time (slots created around the same time as booking)
    if (booking.booking_created_at) {
      const bookingTime = new Date(booking.booking_created_at);
      const timeMatchingSlots = matchingSlots.filter((slot: any) => {
        if (!slot.created_at) return false;
        const slotTime = new Date(slot.created_at);
        const timeDiff = Math.abs(bookingTime.getTime() - slotTime.getTime());
        // Within 24 hours
        return timeDiff <= 24 * 60 * 60 * 1000;
      });

      if (timeMatchingSlots.length === 1) {
        const slot = timeMatchingSlots[0];
        return await getEventGameSlotDetailsBySlotId(slot.id);
      }
    }

    // 4. Fallback: Use the slot with the most recent creation time
    const sortedSlots = matchingSlots.sort((a: any, b: any) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      return timeB - timeA; // Most recent first
    });

    const slot = sortedSlots[0];
    return await getEventGameSlotDetailsBySlotId(slot.id);

  } catch (error) {
    console.error('❌ Error finding most likely slot:', error);
    return null;
  }
}

/**
 * Get event game slot details by event and game IDs (fallback method)
 * @param eventId Event ID
 * @param gameId Game ID
 * @returns Promise with slot details or null
 */
export async function getEventGameSlotDetails(eventId: number, gameId: number) {
  try {
    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/event-game-slot/get-all', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const allSlots = await response.json();
      const matchingSlot = allSlots.find((slot: any) =>
        slot.event_id === eventId && slot.game_id === gameId
      );

      if (matchingSlot) {
        return {
          slot_id: matchingSlot.id,
          custom_title: matchingSlot.custom_title,
          custom_description: matchingSlot.custom_description,
          custom_price: matchingSlot.custom_price,
          slot_price: matchingSlot.slot_price,
          start_time: matchingSlot.start_time,
          end_time: matchingSlot.end_time,
          max_participants: matchingSlot.max_participants,
        };
      }
    }
  } catch (error) {
    console.error('Error fetching slot details:', error);
  }
  return null;
}

/**
 * Get payment details for a booking
 * @param bookingId Booking ID
 * @returns Promise with payment details or null
 */
export async function getBookingPaymentDetails(bookingId: number) {
  try {
    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/payments/get-all', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const allPayments = await response.json();
      const payment = allPayments.find((p: any) => p.booking_id === bookingId);

      if (payment) {
        return {
          payment_id: payment.payment_id,
          actual_payment_status: payment.payment_status,
          transaction_id: payment.transaction_id,
          payment_date: payment.payment_date,
          payment_method: payment.payment_method,
        };
      }
    }
  } catch (error) {
    console.error('Error fetching payment details:', error);
  }
  return null;
}

/**
 * Get booking add-ons by booking ID
 * @param bookingId Booking ID
 * @returns Promise with booking add-ons data
 */
export async function getBookingAddons(bookingId: number): Promise<any> {
  try {

    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/getting/add-on/by-bookingid', { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        booking_id: bookingId
      }),
    });

    if (!response.ok) {
      console.error(`Failed to fetch booking add-ons: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching booking add-ons:', error);
    return null;
  }
}

/**
 * Update booking payment status
 * @param bookingId Booking ID
 * @param paymentStatus New payment status
 * @returns Promise with updated booking data
 */
export async function updateBookingPaymentStatus(bookingId: number, paymentStatus: string): Promise<any> {
  try {

    // Use our internal API route that handles both payment status and booking status updates
    const response = await fetch('/api/bookings/update-payment-status', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingId,
        paymentStatus
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update booking payment status: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error updating booking payment status:', error);
    throw error;
  }
}

/**
 * Create a new booking
 * @param bookingData The booking data to create
 * @returns Promise with the created booking data
 */
export async function createBooking(bookingData: {
  parent: {
    user_id: number;
    parent_name: string;
    email: string;
    additional_phone: string;
  };
  children: {
    full_name: string;
    date_of_birth: string;
    school_name: string;
    gender: string;
  };
  booking: {
    user_id: number;
    event_id: number;
    total_amount: number;
    payment_method: string;
    payment_status: string;
    terms_accepted: boolean;
  };
  booking_games: {
    game_id: number;
    child_index: number;
    game_price: number;
  };
}): Promise<any> {
  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/bookings/create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw error;
  }
}

/**
 * Delete a booking
 * @param bookingId The booking ID to delete
 * @returns Promise with success response
 */
export async function deleteBooking(bookingId: number): Promise<{ success: boolean; message?: string }> {
  try {
    // Use the new REST API endpoint: DELETE /api/bookings/:id
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to delete booking: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If we can't parse the error as JSON, use the status code
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    // The API returns { "success": true, "message": "Booking deleted successfully" }
    return {
      success: data.success || true,
      message: data.message || "Booking deleted successfully"
    };

    throw new Error("Invalid response format from delete booking API");
  } catch (error: any) {
    throw error;
  }
}


