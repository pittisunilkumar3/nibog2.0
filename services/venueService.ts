import { getSession } from "@/lib/auth/session";

export interface Venue {
  id?: number;
  venue_name: string;
  city_id: number;
  address: string;
  capacity: number;
  is_active: boolean | number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get authentication headers with Bearer token
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getSession();
  return {
    "Content-Type": "application/json",
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

/**
 * Get all venues
 * @returns Promise with array of venues
 */
export const getAllVenues = async (): Promise<Venue[]> => {
  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/venues/get-all', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Error fetching venues: ${response.status}`;

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

    if (!Array.isArray(data)) {
      return [];
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get venue by ID
 * @param id Venue ID
 * @returns Promise with venue data
 */
export const getVenueById = async (id: number): Promise<Venue> => {
  try {
    if (!id || isNaN(id) || id <= 0) {
      throw new Error(`Invalid venue ID: ${id}. ID must be a positive number.`);
    }

    console.log(`Fetching venue with ID: ${id}`);

    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/venues/get', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    console.log(`Get venue response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Error fetching venue: ${response.status}`;

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
    console.log("Venue data retrieved:", data);

    // The API route already handles the array vs object response format
    return data;
  } catch (error) {
    console.error(`Error fetching venue with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new venue
 * @param venueData Venue data to create
 * @returns Promise with created venue data
 */
export const createVenue = async (venueData: Omit<Venue, "id" | "created_at" | "updated_at">): Promise<Venue> => {
  try {
    console.log("Creating venue with data:", venueData);

    const authHeaders = await getAuthHeaders();
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/venues/create', {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(venueData),
    });

    console.log(`Create venue response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Error creating venue: ${response.status}`;

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
    console.log("Venue created successfully:", data);

    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    } else if (data && typeof data === 'object' && !Array.isArray(data)) {
      return data;
    }

    throw new Error("Failed to create venue: Invalid response format");
  } catch (error) {
    console.error("Error creating venue:", error);
    throw error;
  }
};

/**
 * Update an existing venue
 * @param venueData Venue data to update
 * @returns Promise with updated venue data
 */
export const updateVenue = async (venueData: Venue): Promise<Venue> => {
  try {
    if (!venueData || !venueData.id || isNaN(Number(venueData.id)) || Number(venueData.id) <= 0) {
      throw new Error(`Invalid venue data: Missing or invalid ID. ID must be a positive number.`);
    }

    console.log("Updating venue with data:", venueData);
    console.log("Venue service: Sending data to API:", JSON.stringify(venueData, null, 2));

    const authHeaders = await getAuthHeaders();
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/venues/update', {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(venueData),
    });

    console.log(`Update venue response status: ${response.status}`);
    console.log(`Update venue response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Venue service: Error response text:`, errorText);

      let errorMessage = `Error updating venue: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        console.error(`Venue service: Parsed error data:`, errorData);
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        console.error(`Venue service: Could not parse error response as JSON:`, e);
        // If we can't parse the error as JSON, use the raw text
        errorMessage = `Error updating venue: ${response.status} - ${errorText}`;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Venue updated successfully:", data);

    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    } else if (data && typeof data === 'object' && !Array.isArray(data)) {
      return data;
    }

    throw new Error("Failed to update venue: Invalid response format");
  } catch (error) {
    console.error("Error updating venue:", error);
    throw error;
  }
};

/**
 * Delete a venue by ID
 * @param id Venue ID to delete
 * @returns Promise with success status
 */
export const deleteVenue = async (id: number): Promise<{ success: boolean }> => {
  try {
    if (!id || isNaN(id) || id <= 0) {
      throw new Error(`Invalid venue ID: ${id}. ID must be a positive number.`);
    }

    console.log(`Attempting to delete venue with ID: ${id}`);

    const authHeaders = await getAuthHeaders();
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/venues/delete', {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ id }),
    });

    console.log(`Delete venue response status: ${response.status}`);
    console.log(`Delete venue response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Venue service: Delete error response text:`, errorText);

      let errorMessage = `Error deleting venue: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        console.error(`Venue service: Parsed delete error data:`, errorData);
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        console.error(`Venue service: Could not parse delete error response as JSON:`, e);
        // If we can't parse the error as JSON, use the raw text
        errorMessage = `Error deleting venue: ${response.status} - ${errorText}`;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Venue deleted successfully:", data);

    // Handle different response formats
    if (Array.isArray(data) && data.length > 0 && data[0].success) {
      return { success: true };
    } else if (data && data.success) {
      return { success: true };
    } else if (data && typeof data === 'object') {
      // If we get any object response from a successful API call, consider it successful
      console.log("Delete operation completed, assuming success based on 200 response");
      return { success: true };
    }

    console.warn("Delete response format unexpected:", data);
    return { success: false };
  } catch (error) {
    console.error(`Error deleting venue with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get venues by city ID
 * @param cityId City ID
 * @returns Promise with array of venues
 */
export const getVenuesByCity = async (cityId: number): Promise<Venue[]> => {
  try {
    if (!cityId || isNaN(cityId) || cityId <= 0) {
      throw new Error(`Invalid city ID: ${cityId}. ID must be a positive number.`);
    }

    // Use our internal API route to avoid CORS issues
    // Use POST method with request body as specified in the API documentation
    const response = await fetch('/api/venues/get-by-city', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ city_id: cityId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Error fetching venues by city: ${response.status}`;

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

    if (!Array.isArray(data)) {
      return [];
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all venues with city details
 * @returns Promise with array of venues with city details
 */
export const getAllVenuesWithCity = async (): Promise<any[]> => {
  try {
    console.log("Fetching all venues with city details from internal proxy...");

    const response = await fetch('/api/venues/getall-with-city', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`Get all venues with city response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Error fetching venues with city: ${response.status}`;

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
    console.log(`Retrieved ${data.length} venues with city details from API`);

    if (!Array.isArray(data)) {
      console.warn("API did not return an array for venues with city:", data);
      return [];
    }

    // Map API response to local Venue + City structure
    return data.map((item: any) => ({
      id: item.venue_id,
      venue_name: item.venue_name,
      address: item.address,
      capacity: item.capacity,
      is_active: item.venue_is_active,
      created_at: item.venue_created_at,
      updated_at: item.venue_updated_at,
      city_id: item.city_id,
      city_name: item.city_name,
      state: item.state,
      city_is_active: item.city_is_active,
      city_created_at: item.city_created_at,
      city_updated_at: item.city_updated_at,
      event_count: Number(item.event_count) || 0,
    }));
  } catch (error) {
    console.error("Error fetching venues with city:", error);
    throw error;
  }
};
