// City mapping utility for converting city IDs to human-readable names
// This helps display proper city names in testimonials even when the API stores city IDs

export interface CityMapping {
  id: number;
  name: string;
}

// Static city mapping based on the cities API
// This should be kept in sync with the cities from the API
export const CITY_MAPPINGS: CityMapping[] = [
  { id: 31, name: "Hyderabad" },
  { id: 32, name: "Pune" },
  { id: 33, name: "Mumbai" },
  { id: 34, name: "Bangalore" },
  { id: 35, name: "Chennai" },
  { id: 36, name: "Delhi" },
  { id: 37, name: "Kolkata" },
  { id: 38, name: "Ahmedabad" },
  { id: 39, name: "Surat" },
  { id: 40, name: "Jaipur" },
  { id: 41, name: "Lucknow" },
  { id: 42, name: "Kanpur" },
  { id: 43, name: "Nagpur" },
  { id: 44, name: "Indore" },
  { id: 45, name: "Thane" },
  { id: 46, name: "Bhopal" }
];

/**
 * Get city name from city ID
 * @param cityId - The city ID (can be string or number)
 * @returns Human-readable city name or the original value if not found
 */
export function getCityNameFromId(cityId: string | number | null): string {
  if (!cityId) return 'Unknown City';
  
  const id = typeof cityId === 'string' ? parseInt(cityId) : cityId;
  if (isNaN(id)) return String(cityId);
  
  const city = CITY_MAPPINGS.find(c => c.id === id);
  return city ? city.name : `City ID: ${id}`;
}

/**
 * Get city ID from city name
 * @param cityName - The city name
 * @returns City ID or null if not found
 */
export function getCityIdFromName(cityName: string): number | null {
  if (!cityName) return null;
  
  const city = CITY_MAPPINGS.find(c => 
    c.name.toLowerCase() === cityName.toLowerCase().trim()
  );
  return city ? city.id : null;
}

/**
 * Fetch and update city mappings from the API
 * This can be used to keep the mappings in sync with the server
 */
export async function fetchCityMappings(): Promise<CityMapping[]> {
  try {
    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/city/get-all');
    if (!response.ok) {
      throw new Error('Failed to fetch cities');
    }
    
    const cities = await response.json();
    return cities.map((city: any) => ({
      id: city.id,
      name: city.city_name?.trim() || `City ${city.id}`
    }));
  } catch (error) {
    console.error('Error fetching city mappings:', error);
    return CITY_MAPPINGS; // Fallback to static mappings
  }
}

/**
 * Format testimonial city for display
 * Handles the case where the API stores city_id as string in the city field
 * @param testimonial - Testimonial object with city field
 * @returns Human-readable city name
 */
export function formatTestimonialCity(testimonial: { city?: string | number | null }): string {
  if (!testimonial.city) return 'Unknown City';
  
  // If it's a numeric string (like "31"), convert to city name
  const cityId = parseInt(String(testimonial.city));
  if (!isNaN(cityId)) {
    return getCityNameFromId(cityId);
  }
  
  // If it's already a city name, return as is
  return String(testimonial.city);
}
