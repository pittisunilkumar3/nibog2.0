import { EventListItem } from '@/types';
import { EVENT_DETAILS_API } from '@/config/api';

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
 * Fetch events with images from the new API endpoint
 * @returns Promise with array of event details including images
 */
export async function getEventDetailsWithImages(): Promise<EventDetailsWithImage[]> {
  try {
    console.log("Fetching events with images from API...");

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
    console.log(`Successfully fetched ${Array.isArray(data) ? data.length : 'unknown'} events with images`);

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
 * Get all events with images and transform to EventListItem format
 * @returns Promise with array of EventListItem objects
 */
export async function getAllEventsWithImagesFormatted(): Promise<EventListItem[]> {
  try {
    const eventDetails = await getEventDetailsWithImages();
    return transformEventDetailsToListItems(eventDetails);
  } catch (error) {
    console.error('Error getting formatted events with images:', error);
    throw error;
  }
}
