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

    const response = await fetch(EVENT_DETAILS_API.GET_WITH_IMAGES, {
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
    
    // Format date
    const eventDate = new Date(firstDetail.event_date);
    const formattedDate = eventDate.toISOString().split('T')[0];
    
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
    const minAge = Math.min(...details.map(d => d.min_age));
    const maxAge = Math.max(...details.map(d => d.max_age));
    
    // Build venue string
    const venue = firstDetail.venue_name !== "Venue Will be updated soon" 
      ? firstDetail.venue_name 
      : "Venue TBD";
    
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
  return events.map((event) => {
    // Extract time range from event_games_with_slots
    const slots = event.event_games_with_slots || [];
    let timeRange = "9:00 AM - 8:00 PM"; // Default
    
    if (slots.length > 0) {
      const startTimes = slots.map((s: any) => s.start_time).filter(Boolean);
      const endTimes = slots.map((s: any) => s.end_time).filter(Boolean);
      
      if (startTimes.length > 0 && endTimes.length > 0) {
        // Convert 24h to 12h format
        const formatTime = (time: string) => {
          const [hours, minutes] = time.split(':');
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const hour12 = hour % 12 || 12;
          return `${hour12}:${minutes} ${ampm}`;
        };
        
        const earliestStart = startTimes.sort()[0];
        const latestEnd = endTimes.sort().reverse()[0];
        timeRange = `${formatTime(earliestStart)} - ${formatTime(latestEnd)}`;
      }
    }

    // Get min/max ages from slots
    let minAge = 5;
    let maxAge = 84;
    
    if (slots.length > 0) {
      const ages = slots.map((s: any) => ({
        min: s.min_age || 5,
        max: s.max_age || 84
      }));
      minAge = Math.min(...ages.map((a: { min: number; max: number }) => a.min));
      maxAge = Math.max(...ages.map((a: { min: number; max: number }) => a.max));
    }

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

    // Format date
    const eventDate = new Date(event.event_date);
    const formattedDate = eventDate.toISOString().split('T')[0];

    return {
      id: event.id.toString(),
      title: event.title,
      description: event.description || '',
      minAgeMonths: minAge,
      maxAgeMonths: maxAge,
      date: formattedDate,
      time: timeRange,
      venue: event.venue_name || 'Venue',
      city: event.city_name || 'City',
      price: 0, // Not used in display
      image: imageUrl,
      spotsLeft: 0, // Not used in display
      totalSpots: 0, // Not used in display
      isOlympics: true,
    };
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
