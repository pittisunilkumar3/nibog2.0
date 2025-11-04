// Define the social media interface
export interface SocialMedia {
  id?: number;
  facebook_url: string;
  instagram_url: string;
  linkedin_url: string;
  youtube_url: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Create or update social media links
 * @param socialMediaData The social media data to save
 * @returns The saved social media data
 */
export async function saveSocialMedia(socialMediaData: SocialMedia): Promise<SocialMedia> {
  console.log("Saving social media:", socialMediaData);

  try {
    // Use the external API directly
    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/socialmedia/create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(socialMediaData),
    });

    console.log(`Save social media response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Saved social media:", data);

    // Return the first item if it's an array, otherwise return the data
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error("Error saving social media:", error);
    throw error;
  }
}

/**
 * Get social media links
 * @returns The social media data
 */
export async function getSocialMedia(): Promise<SocialMedia | null> {
  console.log("Fetching social media");

  try {
    // Use the external API directly
    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/socialmedia/get', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`Get social media response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      
      // If 404, return null instead of throwing an error
      if (response.status === 404) {
        return null;
      }
      
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Retrieved social media:", data);

    // Return the first item if it's an array, otherwise return the data
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error("Error fetching social media:", error);
    throw error;
  }
}
