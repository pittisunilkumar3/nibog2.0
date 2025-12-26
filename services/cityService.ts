export interface City {
  id?: number;
  city_name: string;
  state: string;
  is_active: number | boolean;
  created_at?: string;
  updated_at?: string;
  venues?: number;
  events?: number;
}

/**
 * Helper to get authentication token from storage or cookies
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  // Try localStorage and sessionStorage
  let token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');

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
        console.warn('Failed to parse superadmin-token cookie:', e);
      }
    }
  }

  return token;
}

/**
 * Get all cities
 * @returns Promise with array of cities
 */
export const getAllCities = async (): Promise<City[]> => {
  try {
    const response = await fetch('/api/cities', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      // If backend is unreachable (503), return empty array for graceful fallback
      if (response.status === 503) {
        console.warn('[Cities API] Backend service is unavailable. Returning empty cities array.');
        return [];
      }
      throw new Error(`Error fetching cities: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      city_name: item.city_name,
      state: item.state,
      is_active: item.is_active,
      created_at: item.created_at,
      updated_at: item.updated_at,
      venues: Number(item.total_venues) || 0,
      events: Number(item.event_count) || 0,
    }));
  } catch (error: any) {
    console.error(`[Cities API] Fetch failed:`, error.message);
    // Return empty array instead of throwing to allow UI to continue
    console.warn('[Cities API] Returning empty cities array due to error.');
    return [];
  }
};

/**
 * Get city by ID
 * @param id City ID
 * @returns Promise with city data
 */
export const getCityById = async (id: number): Promise<City> => {
  try {
    const response = await fetch(`/api/cities/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Error fetching city: ${response.status}`);
    }

    const item = await response.json();
    return {
      id: item.id,
      city_name: item.city_name,
      state: item.state,
      is_active: item.is_active,
      created_at: item.created_at,
      updated_at: item.updated_at,
      venues: Number(item.total_venues) || 0,
      events: Number(item.event_count) || 0,
    };
  } catch (error: any) {
    console.error(`[Cities API] Fetch city ${id} failed:`, error.message);
    throw error;
  }
};

/**
 * Create a new city
 * @param cityData City data to create
 * @returns Promise with success status
 */
export const createCity = async (cityData: Omit<City, "id" | "created_at" | "updated_at">): Promise<{ success: boolean; message: string }> => {
  try {
    const token = getAuthToken();
    const response = await fetch('/api/cities', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(cityData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error creating city: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, message: data.message || "City created successfully" };
  } catch (error: any) {
    console.error("Error creating city:", error);
    throw error;
  }
};

/**
 * Update an existing city
 * @param id City ID to update
 * @param cityData City data to update
 * @returns Promise with success status
 */
export const updateCity = async (id: number, cityData: Partial<City>): Promise<{ success: boolean; message: string }> => {
  try {
    const token = getAuthToken();
    const response = await fetch(`/api/cities/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(cityData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error updating city: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, message: data.message || "City updated successfully" };
  } catch (error: any) {
    console.error(`Error updating city with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a city by ID
 * @param id City ID to delete
 * @returns Promise with success status
 */
export const deleteCity = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    const token = getAuthToken();
    const response = await fetch(`/api/cities/${id}`, {
      method: "DELETE",
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error deleting city: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, message: data.message || "City deleted successfully" };
  } catch (error: any) {
    console.error(`Error deleting city with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Interface for booking info with events and games
 */
export interface BookingCity {
  id: number;
  city_name: string;
  state: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  total_events: number;
  events: BookingEvent[];
}

export interface BookingEvent {
  id: number;
  title: string;
  description: string;
  city_id: number;
  venue_id: number;
  venue_name: string;
  venue_address: string;
  venue_capacity: number;
  event_date: string;
  status: string;
  is_active: number;
  image_url: string;
  priority: number;
  created_at: string;
  updated_at: string;
  games_with_slots: BookingGameSlot[];
}

export interface BookingGameSlot {
  slot_id: number;
  game_id: number;
  game_name: string;
  game_image: string;
  game_description: string;
  custom_title: string;
  custom_description: string;
  duration_minutes: number;
  categories: string;
  start_time: string;
  end_time: string;
  price: string;
  max_participants: number;
  booked_count: number;
  available_slots: number;
  is_available: boolean;
  min_age: number;
  max_age: number;
  note: string;
  is_active: number;
}

/**
 * Get all cities with booking information (events, games, slots, availability)
 * @returns Promise with array of cities with booking details
 */
export const getCitiesWithBookingInfo = async (): Promise<BookingCity[]> => {
  try {
    console.log('[cityService] Fetching cities with booking info from /api/city/booking-info/list');
    
    const response = await fetch('/api/city/booking-info/list', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store'
    });

    console.log('[cityService] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[cityService] Error response:', errorText);
      throw new Error(`Error fetching booking info: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('[cityService] Response data:', result);

    if (!result.success || !Array.isArray(result.data)) {
      console.error('[cityService] Invalid response format:', result);
      throw new Error('Invalid response format from booking info API');
    }

    console.log('[cityService] Successfully loaded', result.data.length, 'cities with booking info');
    return result.data;
  } catch (error: any) {
    console.error(`[cityService] Fetch failed:`, error);
    throw error;
  }
};
