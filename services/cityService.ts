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
    throw error;
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
