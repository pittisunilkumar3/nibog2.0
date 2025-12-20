// Testimonial type definition based on API documentation
export interface Testimonial {
  id: number;
  name: string;
  city_id?: number;
  city_name?: string; // Name of the city (if city_id is set)
  event_id?: number;
  event_name?: string; // Name of the event (if event_id is set)
  rating: number;
  testimonial: string;
  submitted_at: string;
  status: string;
  image_url?: string;
  priority?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Extended testimonial interface for testimonials with images
export interface TestimonialWithImage extends Testimonial {
  // Additional fields for backward compatibility
  testimonial_id?: number;
  testimonial_name?: string;
  city?: string; // Deprecated: use city_name instead
  image_id?: number;
  image_priority?: number;
  image_is_active?: boolean;
  image_created_at?: string;
  image_updated_at?: string;
}

// Create testimonial payload interface
export interface CreateTestimonialPayload {
  name: string;
  city_id?: number;
  event_id?: number;
  rating?: number;
  testimonial?: string;
  submitted_at?: string;
  status?: string;
  image_url?: string;
  priority?: number;
  is_active?: number;
}

// Update testimonial payload interface
export interface UpdateTestimonialPayload {
  name?: string;
  city_id?: number;
  event_id?: number;
  rating?: number;
  testimonial?: string;
  submitted_at?: string;
  status?: string;
  image_url?: string;
  priority?: number;
  is_active?: number;
}

// Helper to read auth token from multiple storage locations
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  // Prefer adminToken keys used across the app, fallback to generic 'token'
  return (
    (localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken')) ||
    (localStorage.getItem('token') || sessionStorage.getItem('token')) ||
    null
  );
}

/**
 * Get all testimonials with images
 * @returns Promise with array of testimonials including image data
 */
export async function getAllTestimonials(): Promise<TestimonialWithImage[]> {
  try {
    console.log("Fetching all testimonials from API");

    // Use the new RESTful API endpoint
    const response = await fetch('/api/testimonials', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    console.log(`Get all testimonials response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      
      // If backend is unreachable (503), return empty array for graceful fallback
      if (response.status === 503) {
        console.warn('Backend service is unavailable. Returning empty testimonials array.');
        return [];
      }
      
      throw new Error(`Failed to fetch testimonials: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Testimonials retrieved successfully:", result);

    // New API returns { success, data, meta }
    if (result.success && Array.isArray(result.data)) {
      return result.data;
    }

    // Fallback for backward compatibility
    if (Array.isArray(result)) {
      return result;
    }

    console.warn("API returned unexpected data format:", result);
    return [];
  } catch (error: any) {
    console.error("Error fetching testimonials:", error);
    // Return empty array instead of throwing to allow UI to continue with fallback data
    console.warn('Returning empty testimonials array due to error.');
    return [];
  }
}

/**
 * Get testimonial by ID
 * @param testimonialId Testimonial ID
 * @returns Promise with testimonial data
 */
export async function getTestimonialById(testimonialId: string | number): Promise<Testimonial> {
  try {
    console.log(`Fetching testimonial with ID: ${testimonialId}`);

    // Use the new RESTful API endpoint
    const response = await fetch(`/api/testimonials/${testimonialId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    console.log(`Get testimonial by ID response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Testimonial retrieved successfully:", result);

    // New API returns { success, data }
    if (result.success && result.data) {
      return result.data;
    }

    // Fallback for backward compatibility
    return Array.isArray(result) ? result[0] : result;
  } catch (error: any) {
    console.error(`Error fetching testimonial ${testimonialId}:`, error);
    throw error;
  }
}

/**
 * Create a new testimonial
 * @param testimonialData The testimonial data to create
 * @returns Promise with the created testimonial data
 */
export async function createTestimonial(testimonialData: CreateTestimonialPayload): Promise<Testimonial> {
  try {
    console.log("Creating testimonial with data:", testimonialData);

    // Get auth token (check localStorage for adminToken, then fallback to generic token)
    const token = getAuthToken();

    // Use the new RESTful API endpoint
    const response = await fetch('/api/testimonials', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
      },
      body: JSON.stringify(testimonialData),
    });

    console.log(`Create testimonial response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      
      // Parse the error response to get the message
      let errorMessage = `Failed to create testimonial: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If can't parse JSON, use default message
      }
      
      // If backend requires authentication (401), throw a clear error
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in to create testimonials.');
      }
      
      // If backend is unreachable (503), throw a user-friendly error
      if (response.status === 503) {
        throw new Error('Backend service is unavailable. Please ensure the backend is running or try again later.');
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("Testimonial created successfully:", result);

    // New API returns { success, message, id, data }
    if (result.success && result.data) {
      return result.data;
    }

    // Fallback for backward compatibility
    return Array.isArray(result) ? result[0] : result;
  } catch (error: any) {
    console.error("Error creating testimonial:", error);
    throw error;
  }
}

/**
 * Update a testimonial
 * @param testimonialId The testimonial ID to update
 * @param testimonialData The testimonial data to update
 * @returns Promise with the updated testimonial data
 */
export async function updateTestimonial(testimonialId: number, testimonialData: UpdateTestimonialPayload): Promise<Testimonial> {
  try {
    console.log("Updating testimonial with data:", testimonialData);

    // Get auth token (check localStorage for adminToken, then fallback to generic token)
    const token = getAuthToken();

    // Use the new RESTful API endpoint
    const response = await fetch(`/api/testimonials/${testimonialId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
      },
      body: JSON.stringify(testimonialData),
    });

    console.log(`Update testimonial response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      
      // Parse the error response to get the message
      let errorMessage = `Failed to update testimonial: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If can't parse JSON, use default message
      }
      
      // If backend requires authentication (401), throw a clear error
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in to update testimonials.');
      }
      
      // If backend is unreachable (503), throw a user-friendly error
      if (response.status === 503) {
        throw new Error('Backend service is unavailable. Please ensure the backend is running or try again later.');
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("Testimonial updated successfully:", result);

    // New API returns { success, message }
    // Fetch updated testimonial to return complete data
    if (result.success) {
      return await getTestimonialById(testimonialId);
    }

    // Fallback for backward compatibility
    return Array.isArray(result) ? result[0] : result;
  } catch (error: any) {
    console.error("Error updating testimonial:", error);
    throw error;
  }
}

/**
 * Delete a testimonial
 * @param testimonialId Testimonial ID to delete
 * @returns Promise with deletion result
 */
export async function deleteTestimonial(testimonialId: number): Promise<{ success: boolean }> {
  try {
    console.log(`Deleting testimonial with ID: ${testimonialId}`);

    // Get auth token (check localStorage for adminToken, then fallback to generic token)
    const token = getAuthToken();

    // Use the new RESTful API endpoint
    const response = await fetch(`/api/testimonials/${testimonialId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
      },
    });

    console.log(`Delete testimonial response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      
      // Parse the error response to get the message
      let errorMessage = `Failed to delete testimonial: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If can't parse JSON, use default message
      }
      
      // If backend requires authentication (401), throw a clear error
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in to delete testimonials.');
      }
      
      // If backend is unreachable (503), throw a user-friendly error
      if (response.status === 503) {
        throw new Error('Backend service is unavailable. Please ensure the backend is running or try again later.');
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("Testimonial deleted successfully:", result);

    // New API returns { success, message }
    return { success: result.success || true };
  } catch (error: any) {
    console.error(`Error deleting testimonial ${testimonialId}:`, error);
    throw error;
  }
}

/**
 * Update testimonial status (approve/reject)
 * @param testimonialId Testimonial ID
 * @param status New status
 * @returns Promise with updated testimonial data
 */
export async function updateTestimonialStatus(testimonialId: number, status: string): Promise<Testimonial> {
  try {
    console.log(`Updating testimonial ${testimonialId} status to ${status}`);

    // Get auth token (check localStorage for adminToken, then fallback to generic token)
    const token = getAuthToken();

    // Update with new status
    const updatedData: UpdateTestimonialPayload = {
      status: status
    };

    // Use the new RESTful API endpoint
    const response = await fetch(`/api/testimonials/${testimonialId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
      },
      body: JSON.stringify(updatedData),
    });

    console.log(`Update testimonial status response: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Testimonial status updated successfully:", result);

    // Fetch updated testimonial to return complete data
    if (result.success) {
      return await getTestimonialById(testimonialId);
    }

    throw new Error("Failed to update testimonial status");
  } catch (error: any) {
    console.error(`Error updating testimonial ${testimonialId} status:`, error);
    throw error;
  }
}
