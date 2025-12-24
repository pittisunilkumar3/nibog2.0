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
  console.log(`[findApiIdForEvent] Searching for API ID for event ${targetEventId}`);

  // Check cache first
  const cached = mappingCache.get(targetEventId);
  if (cached !== undefined) {
    console.log(`[findApiIdForEvent] Found cached mapping: ${targetEventId} -> ${cached === -1 ? 'null' : cached}`);
    return cached === -1 ? null : cached;
  }

  // Search through a reasonable range of API IDs by calling external API directly
  const searchRange = Array.from({ length: 20 }, (_, i) => i + 1); // Test IDs 1-20
  console.log(`[findApiIdForEvent] Testing API IDs: ${searchRange.join(', ')}`);

  for (const apiId of searchRange) {
    try {
      console.log(`[findApiIdForEvent] Testing API ID: ${apiId}`);
      
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
        console.log(`[findApiIdForEvent] API ID ${apiId} returned:`, data);

        if (Array.isArray(data) && data.length > 0) {
          const validImages = data.filter(img =>
            img &&
            typeof img === 'object' &&
            img.id !== undefined &&
            img.image_url !== undefined &&
            img.event_id === targetEventId
          );
          
          if (validImages.length > 0) {
            console.log(`[findApiIdForEvent] ✅ Found match! Event ${targetEventId} maps to API ID ${apiId}`);
            mappingCache.set(targetEventId, apiId);
            return apiId;
          }
        }
      } else {
        console.log(`[findApiIdForEvent] API ID ${apiId} returned status ${response.status}`);
      }
    } catch (error) {
      console.warn(`[findApiIdForEvent] Error testing API ID ${apiId}:`, error);
    }
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  console.warn(`[findApiIdForEvent] ❌ No mapping found for event ${targetEventId}`);
  mappingCache.set(targetEventId, -1); // Cache negative result
  return null;
}

/**
 * Fetch event images with automatic API ID mapping
 * @param eventId The frontend event ID
 * @returns Promise<any[]> Array of images for this event
 */
export async function fetchEventImagesWithMapping(eventId: number): Promise<any[]> {
  console.log(`[fetchEventImagesWithMapping] Fetching images for event ID: ${eventId}`);

  // First, try the direct approach (event ID matches API ID) by calling external API
  try {
    const directResponse = await fetch('https://ai.nibog.in/webhook/nibog/geteventwithimages/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_id: eventId }),
    });

    console.log(`[fetchEventImagesWithMapping] Direct API response status: ${directResponse.status}`);

    if (directResponse.ok) {
      const directData = await directResponse.json();
      console.log(`[fetchEventImagesWithMapping] Direct API returned:`, directData);

      if (Array.isArray(directData) && directData.length > 0) {
        const validImages = directData.filter(img =>
          img &&
          typeof img === 'object' &&
          img.id !== undefined &&
          img.image_url !== undefined
        );

        console.log(`[fetchEventImagesWithMapping] Found ${validImages.length} valid images (direct)`);
        if (validImages.length > 0) {
          return validImages;
        }
      } else {
        console.log(`[fetchEventImagesWithMapping] No images found in direct response`);
      }
    } else {
      const errorText = await directResponse.text();
      console.warn(`[fetchEventImagesWithMapping] Direct API failed: ${directResponse.status} - ${errorText}`);
    }
  } catch (error) {
    console.error(`[fetchEventImagesWithMapping] Direct fetch error for Event ${eventId}:`, error);
  }

  console.log(`[fetchEventImagesWithMapping] Direct approach failed, trying mapping system...`);

  // If direct approach failed, try to find the correct API ID
  const correctApiId = await findApiIdForEvent(eventId);
  
  if (correctApiId === null) {
    console.warn(`[fetchEventImagesWithMapping] No mapping found for event ${eventId}`);
    return [];
  }

  console.log(`[fetchEventImagesWithMapping] Found mapping: Event ${eventId} -> API ID ${correctApiId}`);

  // Fetch using the correct API ID by calling external API directly
  try {
    const mappedResponse = await fetch('https://ai.nibog.in/webhook/nibog/geteventwithimages/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_id: correctApiId }),
    });

    console.log(`[fetchEventImagesWithMapping] Mapped API response status: ${mappedResponse.status}`);

    if (mappedResponse.ok) {
      const mappedData = await mappedResponse.json();
      console.log(`[fetchEventImagesWithMapping] Mapped API returned:`, mappedData);

      if (Array.isArray(mappedData) && mappedData.length > 0) {
        const validImages = mappedData.filter(img =>
          img &&
          typeof img === 'object' &&
          img.id !== undefined &&
          img.image_url !== undefined &&
          img.event_id === eventId
        );

        console.log(`[fetchEventImagesWithMapping] Found ${validImages.length} valid images (mapped)`);
        return validImages;
      }
    }
  } catch (error) {
    console.error(`[fetchEventImagesWithMapping] Mapped fetch failed for Event ${eventId}:`, error);
  }

  console.log(`[fetchEventImagesWithMapping] No images found for event ${eventId}`);
  return [];
}

/**
 * Clear the mapping cache (useful for testing or when mappings change)
 */
export function clearMappingCache(): void {
  mappingCache.clear();
}

/**
 * Get current mapping cache for debugging
 */
export function getMappingCache(): Map<number, number> {
  return new Map(mappingCache);
}
