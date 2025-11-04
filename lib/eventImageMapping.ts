/**
 * Event Image Mapping Utilities
 * 
 * This module handles the mapping between frontend event IDs and the API event IDs
 * for image fetching. The external API uses different IDs than the frontend URLs.
 */

// Cache for discovered mappings to avoid repeated API calls
const mappingCache = new Map<number, number>();

/**
 * Find the correct API ID that returns images for a given event ID
 * @param targetEventId The event ID we want to find images for
 * @returns Promise<number | null> The API ID that returns images for this event, or null if not found
 */
export async function findApiIdForEvent(targetEventId: number): Promise<number | null> {
  // Check cache first
  const cached = mappingCache.get(targetEventId);
  if (cached !== undefined) {
    console.log(`Using cached mapping: Event ${targetEventId} → API ID ${cached}`);
    return cached;
  }

  console.log(`Searching for API ID that returns images for Event ${targetEventId}...`);

  // Search through a reasonable range of API IDs by calling external API directly
  const searchRange = Array.from({ length: 20 }, (_, i) => i + 1); // Test IDs 1-20

  for (const apiId of searchRange) {
    try {
      // Call external API directly to avoid infinite recursion
      const response = await fetch('https://ai.nibog.in/webhook/nibog/geteventwithimages/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_id: apiId }),
      });

      if (response.ok) {
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          const validImages = data.filter(img =>
            img &&
            typeof img === 'object' &&
            img.id !== undefined &&
            img.image_url !== undefined &&
            img.event_id === targetEventId
          );
          
          if (validImages.length > 0) {
            console.log(`✅ Found mapping: Event ${targetEventId} → API ID ${apiId}`);
            mappingCache.set(targetEventId, apiId);
            return apiId;
          }
        }
      }
    } catch (error) {
      console.warn(`Error testing API ID ${apiId}:`, error);
    }
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  console.log(`❌ No API ID found for Event ${targetEventId}`);
  mappingCache.set(targetEventId, -1); // Cache negative result
  return null;
}

/**
 * Fetch event images with automatic API ID mapping
 * @param eventId The frontend event ID
 * @returns Promise<any[]> Array of images for this event
 */
export async function fetchEventImagesWithMapping(eventId: number): Promise<any[]> {
  console.log(`Fetching images for Event ${eventId} with mapping...`);

  // First, try the direct approach (event ID matches API ID) by calling external API
  try {
    const directResponse = await fetch('https://ai.nibog.in/webhook/nibog/geteventwithimages/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_id: eventId }),
    });

    if (directResponse.ok) {
      const directData = await directResponse.json();

      if (Array.isArray(directData) && directData.length > 0) {
        const validImages = directData.filter(img =>
          img &&
          typeof img === 'object' &&
          img.id !== undefined &&
          img.image_url !== undefined
        );

        if (validImages.length > 0) {
          console.log(`✅ Direct mapping worked for Event ${eventId} (found ${validImages.length} images)`);
          return validImages;
        }
      }
    }
  } catch (error) {
    console.warn(`Direct fetch failed for Event ${eventId}:`, error);
  }

  // If direct approach failed, try to find the correct API ID
  const correctApiId = await findApiIdForEvent(eventId);
  
  if (correctApiId === null) {
    console.log(`No images found for Event ${eventId}`);
    return [];
  }

  // Fetch using the correct API ID by calling external API directly
  try {
    const mappedResponse = await fetch('https://ai.nibog.in/webhook/nibog/geteventwithimages/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_id: correctApiId }),
    });

    if (mappedResponse.ok) {
      const mappedData = await mappedResponse.json();

      if (Array.isArray(mappedData) && mappedData.length > 0) {
        const validImages = mappedData.filter(img =>
          img &&
          typeof img === 'object' &&
          img.id !== undefined &&
          img.image_url !== undefined &&
          img.event_id === eventId
        );

        console.log(`✅ Mapped fetch successful for Event ${eventId} (via API ID ${correctApiId}, found ${validImages.length} images)`);
        return validImages;
      }
    }
  } catch (error) {
    console.error(`Mapped fetch failed for Event ${eventId}:`, error);
  }

  return [];
}

/**
 * Clear the mapping cache (useful for testing or when mappings change)
 */
export function clearMappingCache(): void {
  mappingCache.clear();
  console.log('Event image mapping cache cleared');
}

/**
 * Get current mapping cache for debugging
 */
export function getMappingCache(): Map<number, number> {
  return new Map(mappingCache);
}
