"use client"

import useSWR from 'swr'
import { EventListItem, TestimonialData, TestimonialListItem } from '@/types'
import { getAllEvents as fetchAllEvents } from '@/services/eventService'
import { getAllPayments as fetchAllPayments } from '@/services/paymentService'
import { getAllEventsWithGames } from '@/services/eventGameService'
import { getAllEventsWithImagesFormatted } from '@/services/eventDetailsService'

// Types for customer profile API
export interface CustomerProfileChild {
  child_id: number;
  child_name: string;
  age_in_months: number;
  date_of_birth: string;
}

export interface CustomerProfileGame {
  game_id: number;
  game_name: string;
  game_price: number;
  attendance_status: string;
}

export interface CustomerProfilePayment {
  amount: number;
  payment_id: number;
  payment_date: string;
  payment_method: string;
  payment_status: string;
  transaction_id: string;
}

export interface CustomerProfileBooking {
  games: CustomerProfileGame[];
  status: string;
  payments: CustomerProfilePayment[];
  venue_id: number;
  booking_id: number;
  event_date: string;
  event_name: string;
  booking_ref: string;
  total_amount: number;
  payment_status: string;
}

export interface CustomerProfile {
  user_id: number;
  user_name: string;
  email: string;
  email_status: string;
  phone: string;
  phone_status: string;
  city: string | null;
  parent_id: number;
  parent_name: string;
  parent_email: string;
  children: CustomerProfileChild[];
  bookings: CustomerProfileBooking[];
}

// Types for user bookings
export interface UserBookingGame {
  game_id: number;
  game_name: string;
  description: string;
  duration_minutes: number;
  child_id: number;
  attendance_status: string;
  slot_info: {
    slot_id: number;
    custom_title: string;
    custom_description: string;
    custom_price: number;
    slot_price: number;
    start_time: string;
    end_time: string;
    max_participants: number;
  } | null;
}

export interface UserBookingAddon {
  addon_id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  has_variants: boolean;
  quantity: number;
}

export interface UserBookingEvent {
  event_id: number;
  title: string;
  description: string;
  event_date: string;
  status: string;
}

export interface UserBooking {
  booking_id: number;
  booking_ref: string;
  status: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
  event: UserBookingEvent;
  games: UserBookingGame[] | null;
  addons: UserBookingAddon[] | null;
}

export interface UserBookingsResponse {
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  city_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  bookings: UserBooking[];
}

// Global fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url)
  
  // If the status code is not in the range 200-299, throw an error
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    throw error
  }
  
  return res.json()
}

// Transform API response to EventListItem format expected by UI
function transformEventsData(apiEvents: any[]): EventListItem[] {
  return apiEvents.map((event: any) => {
    // Calculate age range from games if available
    let minAgeMonths = 6; // default
    let maxAgeMonths = 84; // default

    // Extract age range information from games if available
    if (event.games && event.games.length > 0) {
      // Extract age ranges from games
      const minAges = event.games.map((game: any) => game.min_age || 6).filter(age => age > 0);
      const maxAges = event.games.map((game: any) => game.max_age || 84).filter(age => age > 0);

      if (minAges.length > 0) {
        minAgeMonths = Math.min(...minAges);
      }
      if (maxAges.length > 0) {
        maxAgeMonths = Math.max(...maxAges);
      }
    }

    // Format date and time
    const eventDate = new Date(event.event_date);
    const formattedDate = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Extract time from games if available, otherwise use default
    let formattedTime = "9:00 AM - 8:00 PM"; // Default time range
    if (event.games && event.games.length > 0) {
      const startTimes = event.games.map((game: any) => game.start_time).filter(t => t);
      const endTimes = event.games.map((game: any) => game.end_time).filter(t => t);

      if (startTimes.length > 0 && endTimes.length > 0) {
        const earliestStart = startTimes.sort()[0];
        const latestEnd = endTimes.sort().reverse()[0];

        // Format times to 12-hour format
        const formatTime = (time: string) => {
          try {
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            return `${displayHour}:${minutes} ${ampm}`;
          } catch {
            return time;
          }
        };

        formattedTime = `${formatTime(earliestStart)} - ${formatTime(latestEnd)}`;
      }
    }

    // Determine appropriate image based on age range and game types
    let image = '/images/baby-crawling.jpg'; // default
    if (event.games && event.games.length > 0) {
      const gameTitle = event.games[0].game_title || event.games[0].custom_title || '';
      const lowerTitle = gameTitle.toLowerCase();

      if (lowerTitle.includes('walker')) {
        image = '/images/baby-walker.jpg';
      } else if (lowerTitle.includes('running') || lowerTitle.includes('race')) {
        image = '/images/running-race.jpg';
      } else if (lowerTitle.includes('hurdle')) {
        image = '/images/hurdle-toddle.jpg';
      } else if (lowerTitle.includes('cycle')) {
        image = '/images/cycle-race.jpg';
      } else if (lowerTitle.includes('ring')) {
        image = '/images/ring-holding.jpg';
      } else if (lowerTitle.includes('ball') || lowerTitle.includes('throw')) {
        image = '/images/ball-throw.jpg';
      } else if (lowerTitle.includes('balance')) {
        image = '/images/balancing-beam.jpg';
      } else if (lowerTitle.includes('jump') || lowerTitle.includes('frog')) {
        image = '/images/frog-jump.jpg';
      }
    }

    return {
      id: event.event_id?.toString() || Math.random().toString(),
      title: event.event_title || 'Baby Game Event',
      description: event.event_description || 'Fun baby games event',
      minAgeMonths,
      maxAgeMonths,
      date: formattedDate,
      time: formattedTime,
      venue: event.venue?.venue_name || 'Indoor Stadium',
      city: event.city?.city_name || 'Unknown City',
      price: 0, // Not displayed but kept for compatibility
      image,
      spotsLeft: 0, // Not displayed but kept for compatibility
      totalSpots: 0, // Not displayed but kept for compatibility
      isOlympics: true, // Default to Olympics event
    };
  });
}

/**
 * Hook to fetch all events with SWR caching and revalidation
 * @param initialData Optional initial data
 * @returns Events data and loading/error states
 */
export function useEvents(initialData?: EventListItem[]) {
  const { data, error, isLoading, mutate } = useSWR<EventListItem[]>(
    'api/events',
    // Use the new events API with images as primary source
    async () => {
      try {
        console.log('Fetching events with images...');
        const eventsWithImages = await getAllEventsWithImagesFormatted();
        console.log(`Successfully fetched ${eventsWithImages.length} events with images`);
        return eventsWithImages;
      } catch (err) {
        console.error('Failed to fetch events with images, falling back to events with games:', err);
        try {
          const apiEvents = await getAllEventsWithGames();
          return transformEventsData(apiEvents);
        } catch (fallbackErr) {
          console.error('Failed to fetch events with games, falling back to basic events:', fallbackErr);
          // Final fallback to basic events API
          const basicEvents = await fetchAllEvents();
          // Transform basic events to expected format (they have different structure)
          return basicEvents.map((event: any) => ({
            id: event.event_id?.toString() || Math.random().toString(),
            title: event.event_title || 'Baby Game Event',
            description: event.event_description || 'Fun baby games event',
            minAgeMonths: 6,
            maxAgeMonths: 84,
            date: new Date(event.event_date).toISOString().split('T')[0],
            time: "9:00 AM - 8:00 PM",
            venue: event.venue_name || 'Indoor Stadium',
            city: event.city_name || 'Unknown City',
            price: 0, // Not displayed but kept for compatibility
            image: '/images/baby-crawling.jpg',
            spotsLeft: 0, // Not displayed but kept for compatibility
            totalSpots: 0, // Not displayed but kept for compatibility
            isOlympics: true,
          }));
        }
      }
    },
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    }
  )

  return {
    events: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

/**
 * Hook to fetch all payments with SWR caching and revalidation
 */
export function usePayments() {
  const { data, error, isLoading, mutate } = useSWR(
    'api/payments',
    // Use the existing getAllPayments function to maintain compatibility
    () => fetchAllPayments(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    }
  )

  return {
    payments: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

/**
 * Hook to fetch user bookings with SWR caching and revalidation
 * @param userId The user ID to fetch bookings for
 */
export function useUserBookings(userId: number | null) {
  const { data, error, isLoading, mutate } = useSWR<UserBookingsResponse>(
    userId ? `api/bookings/user/${userId}` : null,
    async () => {
      if (!userId) {
        return null;
      }

      const response = await fetch('/api/bookings/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user bookings: ${response.status}`);
      }

      const result = await response.json();

      // The API returns an array with one object containing user data and bookings
      if (Array.isArray(result) && result.length > 0) {
        return result[0];
      }

      return result;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    userBookings: data,
    isLoading,
    isError: !!error,
    mutate,
  };
}

/**
 * Generic hook to fetch data from any API endpoint with SWR
 * @param url API endpoint URL
 * @param options SWR options
 */
export function useApi<T>(url: string | null, options = {}) {
  const { data, error, isLoading, mutate } = useSWR<T>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
      ...options,
    }
  )

  return {
    data,
    isLoading,
    isError: !!error,
    mutate,
  }
}

/**
 * Fetch testimonials from the API
 */
async function fetchTestimonials(): Promise<TestimonialListItem[]> {
  const response = await fetch('https://ai.nibog.in/webhook/nibog/testmonialimages/get', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch testimonials: ${response.status}`);
  }

  const data: TestimonialData[] = await response.json();

  // Filter only published testimonials with active images and sort by priority
  const filteredTestimonials = data
    .filter((testimonial) =>
      testimonial.status === 'Published' &&
      testimonial.image_is_active === true
    )
    .sort((a, b) => a.image_priority - b.image_priority);

  // Transform to UI format
  return filteredTestimonials.map((testimonial) => {
    let imageUrl = testimonial.image_url;

    // Transform API paths to use local image serving with path correction
    if (imageUrl.startsWith('./upload/') || imageUrl.startsWith('/upload/')) {
      // Remove the './' or '/' prefix
      let cleanPath = imageUrl.replace(/^\.?\//, '');

      // Fix path mismatch: API returns 'upload/testimonial/' but files are in 'upload/testmonialimage/'
      if (cleanPath.startsWith('upload/testimonial/')) {
        cleanPath = cleanPath.replace('upload/testimonial/', 'upload/testmonialimage/');
      }

      imageUrl = `/api/serve-image/${cleanPath}`;
    } else if (imageUrl.startsWith('upload/')) {
      // If it starts with 'upload/', fix path and use local serving API
      let cleanPath = imageUrl;

      // Fix path mismatch: API returns 'upload/testimonial/' but files are in 'upload/testmonialimage/'
      if (cleanPath.startsWith('upload/testimonial/')) {
        cleanPath = cleanPath.replace('upload/testimonial/', 'upload/testmonialimage/');
      }

      imageUrl = `/api/serve-image/${cleanPath}`;
    } else if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/api/')) {
      // If it's a relative path, assume it's in upload/testmonialimage directory
      imageUrl = `/api/serve-image/upload/testmonialimage/${imageUrl}`;
    }

    return {
      id: testimonial.testimonial_id.toString(),
      name: testimonial.testimonial_name,
      city: testimonial.city,
      rating: testimonial.rating,
      testimonial: testimonial.testimonial,
      image: imageUrl,
      eventId: testimonial.event_id.toString(),
      submittedAt: testimonial.submitted_at,
    };
  });
}

/**
 * Hook to fetch testimonials with SWR caching and revalidation
 * @param initialData Optional initial data
 * @returns Testimonials data and loading/error states
 */
export function useTestimonials(initialData?: TestimonialListItem[]) {
  const { data, error, isLoading, mutate } = useSWR<TestimonialListItem[]>(
    'testimonials-with-images',
    fetchTestimonials,
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    }
  )

  return {
    testimonials: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

/**
 * Hook to fetch customer profile with SWR caching and revalidation
 * @param userId The user ID to fetch profile for
 * @returns Customer profile data and loading/error states
 */
export function useCustomerProfile(userId: number | null) {
  const { data, error, isLoading, mutate } = useSWR<CustomerProfile>(
    userId ? `api/customer/profile/${userId}` : null,
    async () => {
      if (!userId) {
        return null;
      }

      // Use the Next.js API proxy to avoid CORS issues
      const response = await fetch('/api/customer/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch customer profile:', response.status, errorData);
        throw new Error(`Failed to fetch customer profile: ${response.status}`);
      }

      const result = await response.json();

      // The API returns an array with one object containing user data
      if (Array.isArray(result) && result.length > 0) {
        return result[0];
      }

      return result;
    },
    {
      revalidateOnFocus: true, // Revalidate when window regains focus
      revalidateOnMount: true, // Always fetch fresh data on mount
      revalidateOnReconnect: true,
      dedupingInterval: 2000, // Reduced to 2 seconds to allow more frequent updates
      refreshInterval: 0, // Disable automatic polling
      shouldRetryOnError: true, // Retry on error
      errorRetryCount: 3, // Retry up to 3 times
      errorRetryInterval: 1000, // Wait 1 second between retries
    }
  );

  return {
    customerProfile: data,
    isLoading,
    isError: !!error,
    mutate,
  };
}
