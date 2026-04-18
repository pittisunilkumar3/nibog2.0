import { EventListItem } from '@/types';
import { EVENT_DETAILS_API } from '@/config/api';
import { apiUrl } from './apiClient';

// Interface for the new API response structure
export interface EventDetailsWithImage {
  event_id: number;
  event_title: string;
  event_description: string;
  event_date: string;
  event_status: string;
  event_image_url: string;
  image_priority: number;
  venue_id: number;
  venue_name: string;
  venue_address: string;
  city_id: number;
  city_name: string;
  city_state: string;
  game_custom_title: string;
  game_custom_description: string;
  game_custom_price: string;
  slot_price: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  baby_game_name: string;
  min_age: number;
  max_age: number;
  duration_minutes: number;
}

/**
 * Fetch events from the backend API /api/events/list
 * @returns Promise with array of events from backend
 */
export async function getEventsFromBackend(): Promise<any[]> {
  try {

  const response = await fetch(apiUrl('/api/events/list'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch events from backend: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    console.log('[EventDetailsService] Raw backend API response:', {
      count: Array.isArray(data) ? data.length : 0,
      firstEvent: Array.isArray(data) && data.length > 0 ? {
        id: data[0].id,
        title: data[0].title,
        event_date: data[0].event_date,
        event_date_type: typeof data[0].event_date,
        event_date_constructor: data[0].event_date?.constructor?.name,
        venue_name: data[0].venue_name,
        city_name: data[0].city_name,
        slots_count: data[0].event_games_with_slots?.length || 0
      } : null
    });

    return Array.isArray(data) ? data : []; 
  } catch (error) {
    console.error('Error fetching events from backend:', error);
    throw error;
  }
}

/**
 * Fetch events with images from the new API endpoint
 * @returns Promise with array of event details including images
 */
export async function getEventDetailsWithImages(): Promise<EventDetailsWithImage[]> {
  try {

    // Use apiUrl() for proxy routing instead of direct backend URL to avoid CORS
    const response = await fetch(apiUrl('/api/events/list'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch events with images: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return Array.isArray(data) ? data : []; 
  } catch (error) {
    console.error('Error fetching events with images:', error);
    throw error;
  }
}

/**
 * Transform event details with images to EventListItem format
 * @param eventDetails Array of event details from the new API
 * @returns Array of EventListItem objects
 */
export function transformEventDetailsToListItems(eventDetails: EventDetailsWithImage[]): EventListItem[] {
  // Group events by event_id to handle multiple games per event
  const eventGroups = eventDetails.reduce((groups, detail) => {
    const eventId = detail.event_id.toString();
    if (!groups[eventId]) {
      groups[eventId] = [];
    }
    groups[eventId].push(detail);
    return groups;
  }, {} as Record<string, EventDetailsWithImage[]>);

  // Transform each event group to EventListItem
  return Object.entries(eventGroups).map(([eventId, details]) => {
    const firstDetail = details[0]; // Use first detail for common event info
    
    // Format date - with dateStrings: true in MySQL config, dates come as 'YYYY-MM-DD' strings
    // event_date is typed as string, so just use it directly or handle edge cases
    const formattedDate: string = firstDetail.event_date || '';
    
    // Format time from start_time and end_time
    const formatTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };
    
    const startTime = formatTime(firstDetail.start_time);
    const endTime = formatTime(firstDetail.end_time);
    const timeRange = `${startTime} - ${endTime}`;
    
    // Calculate age range across all games for this event
    const validMinAges = details.map(d => d.min_age).filter((a: number) => a != null && a > 0);
    const validMaxAges = details.map(d => d.max_age).filter((a: number) => a != null && a > 0);
    const minAge = validMinAges.length > 0 ? Math.min(...validMinAges) : 6;
    const maxAge = validMaxAges.length > 0 ? Math.max(...validMaxAges) : 84;
    
    // Build venue string - handle various placeholder messages
    const venueName = firstDetail.venue_name || 'Venue TBD';
    const isVenueTBD = /^(venue\s+will\s+be|tbd)$/i.test(venueName.trim());
    const venue = isVenueTBD ? 'Venue TBD' : venueName;
    
    // Build description with game information
    const gameNames = [...new Set(details.map(d => d.baby_game_name))];
    const gamesDescription = gameNames.length > 1 
      ? `Multiple games including ${gameNames.slice(0, 2).join(', ')}${gameNames.length > 2 ? ` and ${gameNames.length - 2} more` : ''}`
      : gameNames[0] || '';
    
    const description = `${firstDetail.event_description}${gamesDescription ? ` Features: ${gamesDescription}.` : ''}`;
    
    // Handle image URL - convert to local serving API
    let imageUrl = firstDetail.event_image_url;
    if (imageUrl) {
      // Convert relative paths to use local image serving API
      if (imageUrl.startsWith('./')) {
        // Remove the './' prefix and use local serving API
        imageUrl = `/api/serve-image/${imageUrl.substring(2)}`;
      } else if (imageUrl.startsWith('upload/')) {
        // If it starts with 'upload/', use it directly with local serving API
        imageUrl = `/api/serve-image/${imageUrl}`;
      } else if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
        // If it's a relative path without './', assume it's in upload directory
        imageUrl = `/api/serve-image/upload/eventimages/${imageUrl}`;
      }
      // If it already starts with http or /, leave it as is
    }
    
    // Calculate total spots and price
    const totalSpots = Math.max(...details.map(d => d.max_participants));
    const price = parseFloat(firstDetail.game_custom_price || firstDetail.slot_price || '0');

    return {
      id: eventId,
      title: firstDetail.event_title,
      description: description,
      minAgeMonths: minAge,
      maxAgeMonths: maxAge,
      date: formattedDate,
      time: timeRange,
      venue: venue,
      city: firstDetail.city_name,
      price: price,
      image: imageUrl || '/images/baby-crawling.jpg', // Fallback image
      spotsLeft: totalSpots, // We don't have actual spots left, so use total
      totalSpots: totalSpots,
      isOlympics: true, // Assume all events are Olympics events
    };
  });
}

/**
 * Transform backend event data to EventListItem format
 * @param events Array of events from backend /api/events/list
 * @returns Array of EventListItem objects
 */
export function transformBackendEventsToListItems(events: any[]): EventListItem[] {
  console.log('[EventDetailsService] Transforming events:', events.length);
  
  return events.map((event) => {
    // Extract time range - ONLY use event-level time
    // Do NOT fall back to slot times - if event has no time set, show "Time will be updated soon"
    const slots = event.event_games_with_slots || [];
    let timeRange: string | null = null;
    
    // Only use event-level time
    if (event.start_time && event.end_time) {
      const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
      };
      timeRange = `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`;
    }
    // If no event-level time, leave null — the UI will show "Time will be updated soon"

    // Get min/max ages from ACTIVE slots only (is_active === 1)
    let minAge: number | null = null;
    let maxAge: number | null = null;
    
    const activeSlots = slots.filter((s: any) => s.is_active === 1);
    if (activeSlots.length > 0) {
      const validMinAges = activeSlots.map((s: any) => s.min_age).filter((a: any) => a != null && a > 0);
      const validMaxAges = activeSlots.map((s: any) => s.max_age).filter((a: any) => a != null && a > 0);
      if (validMinAges.length > 0) minAge = Math.min(...validMinAges);
      if (validMaxAges.length > 0) maxAge = Math.max(...validMaxAges);
    }
    
    // Use computed ages or fallback defaults
    const finalMinAge = minAge ?? 6;
    const finalMaxAge = maxAge ?? 84;

    // Handle image URL
    let imageUrl = event.image_url;
    if (imageUrl) {
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        // Full URL, use as is
        imageUrl = imageUrl;
      } else if (imageUrl.startsWith('./')) {
        // Relative path with ./
        imageUrl = `/api/serve-image/${imageUrl.substring(2)}`;
      } else if (imageUrl.startsWith('upload/')) {
        // Already has upload/ prefix
        imageUrl = `/api/serve-image/${imageUrl}`;
      } else if (imageUrl.startsWith('/')) {
        // Absolute path from root
        imageUrl = imageUrl;
      } else if (imageUrl && imageUrl.trim() !== '') {
        // Just a filename - assume it's in upload/eventimages/
        imageUrl = `/api/serve-image/upload/eventimages/${imageUrl}`;
      } else {
        // Empty or invalid, use fallback
        imageUrl = '/images/baby-crawling.jpg';
      }
    } else {
      // No image URL provided
      imageUrl = '/images/baby-crawling.jpg';
    }

    // Format date - with dateStrings: true in MySQL config, dates come as 'YYYY-MM-DD' strings
    const dateStr = event.event_date;
    let formattedDate: string;
    
    if (!dateStr) {
      // No date provided, use a placeholder - use local date to avoid timezone issues
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      formattedDate = `${year}-${month}-${day}`;
    } else if (typeof dateStr === 'string') {
      // String date from MySQL (with dateStrings: true config)
      if (dateStr.includes('T') || dateStr.includes(' ')) {
        // ISO or MySQL datetime format - extract date part only
        formattedDate = dateStr.split(/[T ]/)[0];
      } else {
        // Already in YYYY-MM-DD format
        formattedDate = dateStr;
      }
    } else if (dateStr instanceof Date) {
      // Date object (fallback if dateStrings config is not working)
      // Use UTC methods to avoid timezone shift
      const year = dateStr.getUTCFullYear();
      const month = String(dateStr.getUTCMonth() + 1).padStart(2, '0');
      const day = String(dateStr.getUTCDate()).padStart(2, '0');
      formattedDate = `${year}-${month}-${day}`;
    } else {
      // Unknown format, try converting
      const parsed = new Date(dateStr);
      const year = parsed.getUTCFullYear();
      const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
      const day = String(parsed.getUTCDate()).padStart(2, '0');
      formattedDate = `${year}-${month}-${day}`;
    }

    const result = {
      id: event.id.toString(),
      title: event.title,
      description: event.description || '',
      minAgeMonths: finalMinAge,
      maxAgeMonths: finalMaxAge,
      date: formattedDate,
      time: timeRange,
      venue: event.venue_name || 'Venue',
      city: event.city_name || 'City',
      price: 0, // Not used in display
      image: imageUrl,
      spotsLeft: 0, // Not used in display
      totalSpots: 0, // Not used in display
      isOlympics: true,
      eventStatus: event.status,
      venueAddress: event.venue_address || null,
    };

    console.log('[EventDetailsService] Transformed event:', {
      id: result.id,
      title: result.title,
      originalDate: event.event_date,
      formattedDate: result.date,
      time: result.time,
      venue: result.venue,
      city: result.city,
      minAge: result.minAgeMonths,
      maxAge: result.maxAgeMonths,
      slotsCount: slots.length,
      rawSlots: slots.slice(0, 2).map((s: any) => ({ min_age: s.min_age, max_age: s.max_age }))
    });

    return result;
  });
}

/**
 * Get all events with images and transform to EventListItem format
 * Uses backend API /api/events/list
 * @returns Promise with array of EventListItem objects
 */
export async function getAllEventsWithImagesFormatted(): Promise<EventListItem[]> {
  try {
    // Use the backend API endpoint
    const events = await getEventsFromBackend();
    return transformBackendEventsToListItems(events);
  } catch (error) {
    console.error('Error getting formatted events from backend:', error);
    // Fallback to old API if backend fails
    try {
      const eventDetails = await getEventDetailsWithImages();
      return transformEventDetailsToListItems(eventDetails);
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      throw error;
    }
  }
}
