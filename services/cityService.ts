import { CITY_API } from "@/config/api";

export interface City {
  id?: number;
  city_name: string;
  state: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  venues?: number;
  events?: number;
}

/**
 * Get all cities with retry logic
 * @param maxRetries Maximum number of retry attempts (default: 3)
 * @param retryDelay Delay between retries in milliseconds (default: 1000)
 * @returns Promise with array of cities
 */
export const getAllCities = async (maxRetries: number = 3, retryDelay: number = 1000): Promise<City[]> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Cities API] Attempt ${attempt}/${maxRetries} to fetch cities...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/city/get-all-city-event-count', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Error fetching cities: ${response.status}`;

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

      // Validate the data structure
      if (!Array.isArray(data)) {
        console.warn("[Cities API] API returned non-array data, returning empty array");
        return [];
      }

      console.log(`[Cities API] Successfully fetched ${data.length} cities on attempt ${attempt}`);

      // Map API response to local City interface
      return data.map((item: any) => ({
        id: item.city_id ?? item.id,
        city_name: item.city_name,
        state: item.state,
        is_active: item.is_active ?? true,
        created_at: item.created_at,
        updated_at: item.updated_at,
        venues: Number(item.venue_count) || 0,
        events: Number(item.event_count) || 0,
      }));
    } catch (error: any) {
      lastError = error;
      console.error(`[Cities API] Attempt ${attempt}/${maxRetries} failed:`, error.message);

      // If this is not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        console.log(`[Cities API] Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  // All retries failed
  console.error("[Cities API] All retry attempts failed. Last error:", lastError?.message);
  throw lastError || new Error("Failed to fetch cities after multiple attempts");
};

/**
 * Get city by ID
 * @param id City ID
 * @returns Promise with city data
 */
export const getCityById = async (id: number): Promise<City> => {
  try {
    // Validate the ID
    if (!id || isNaN(id) || id <= 0) {
      throw new Error(`Invalid city ID: ${id}. ID must be a positive number.`);
    }

    console.log(`Fetching city with ID: ${id}`);

    // First, try to get all cities and filter by ID
    // This is a more reliable approach since the GET_ALL endpoint is standard
    try {
      console.log("Fetching all cities and filtering by ID...");
      const allCities = await getAllCities();
      console.log(`Retrieved ${allCities.length} cities, searching for ID: ${id}`);

      const foundCity = allCities.find(city => city.id === id);

      if (foundCity) {
        console.log("Found city in all cities list:", foundCity);
        return foundCity;
      } else {
        console.log(`City with ID ${id} not found in all cities list`);
      }
    } catch (getAllError) {
      console.error("Error fetching all cities:", getAllError);
    }

    // If the above approach fails, try direct API calls

    // Approach 1: Try POST method (most reliable for sending data)
    try {
      console.log("Trying POST method to get city...");
      const postResponse = await fetch(CITY_API.GET, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      console.log(`POST response status: ${postResponse.status}`);

      if (postResponse.ok) {
        const data = await postResponse.json();
        console.log("POST response data:", data);

        if (data && Array.isArray(data) && data.length > 0) {
          console.log("City data retrieved with POST method:", data[0]);
          return data[0];
        } else if (data && typeof data === 'object' && !Array.isArray(data)) {
          console.log("City data retrieved with POST method (object format):", data);
          return data;
        }
      }
    } catch (postError) {
      console.error("Error with POST method:", postError);
    }

    // If we get here, all approaches failed
    // Create a mock city with the ID as a fallback
    console.warn(`Failed to fetch city with ID ${id}. Creating a placeholder city.`);

    // Return a placeholder city object
    return {
      id: id,
      city_name: "City not found",
      state: "Unknown",
      is_active: true,
      venues: 0,
      events: 0
    };
  } catch (error) {
    console.error(`Error fetching city with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new city
 * @param cityData City data to create
 * @returns Promise with created city data
 */
export const createCity = async (cityData: Omit<City, "id" | "created_at" | "updated_at">): Promise<City> => {
  try {
    console.log("Creating city with data:", cityData);

    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/cities/create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cityData),
    });

    // Log the response status for debugging
    console.log(`Create city response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Error creating city: ${response.status}`;

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
    console.log("Create city response data:", data);

    // Handle different response formats
    if (Array.isArray(data) && data.length > 0) {
      return data[0]; // API returns an array with the created city
    } else if (data && typeof data === 'object' && !Array.isArray(data)) {
      return data; // API returns an object with the created city
    } else {
      throw new Error("API returned invalid data format for city creation");
    }
  } catch (error) {
    console.error("Error creating city:", error);
    throw error;
  }
};

/**
 * Update an existing city
 * @param cityData City data to update
 * @returns Promise with updated city data
 */
export const updateCity = async (cityData: City): Promise<City> => {
  try {
    // Validate the city data
    if (!cityData || !cityData.id || isNaN(Number(cityData.id)) || Number(cityData.id) <= 0) {
      throw new Error(`Invalid city data: Missing or invalid ID. ID must be a positive number.`);
    }

    if (!cityData.city_name || cityData.city_name.trim() === '') {
      throw new Error('City name is required');
    }

    if (!cityData.state || cityData.state.trim() === '') {
      throw new Error('State is required');
    }

    // Ensure is_active is a boolean
    const normalizedCityData = {
      ...cityData,
      id: Number(cityData.id),
      is_active: Boolean(cityData.is_active)
    };

    console.log("Updating city with normalized data:", normalizedCityData);

    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/cities/update', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(normalizedCityData),
    });

    // Log the response status for debugging
    console.log(`Update city response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Error updating city: ${response.status}`;

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
    console.log("Update city response data:", data);

    // Handle different response formats
    if (data && Array.isArray(data) && data.length > 0) {
      console.log("City updated successfully (array format):", data[0]);
      return data[0]; // API returns an array with the updated city
    } else if (data && typeof data === 'object' && !Array.isArray(data)) {
      console.log("City updated successfully (object format):", data);
      return data; // API returns an object with the updated city
    } else {
      // If we can't determine the format, but the request was successful,
      // return the original data with updated values
      console.warn("API returned unexpected format for city update. Using provided data:", normalizedCityData);
      return normalizedCityData;
    }
  } catch (error) {
    console.error(`Error updating city with ID ${cityData.id}:`, error);
    throw error;
  }
};

/**
 * Delete a city by ID
 * @param id City ID to delete
 * @returns Promise with success status
 */
export const deleteCity = async (id: number): Promise<{ success: boolean }> => {
  try {
    console.log(`Attempting to delete city with ID: ${id}`);

    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/cities/delete', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    // Log the response status for debugging
    console.log(`Delete city response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Error deleting city: ${response.status}`;

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
    console.log("Delete city response data:", data);

    return { success: true };
  } catch (error) {
    console.error(`Error deleting city with ID ${id}:`, error);
    throw error;
  }
};
