// Define the general settings interface
export interface GeneralSetting {
  id?: number;
  site_name: string;
  site_tagline: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  logo?: string;
  favicon?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Create or update general settings
 * @param generalSettingData The general settings data to save
 * @returns The saved general settings data
 */
export async function saveGeneralSetting(generalSettingData: GeneralSetting): Promise<GeneralSetting> {
  console.log("Saving general settings:", generalSettingData);

  try {
    // Use the external API directly
    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/generalsetting/create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(generalSettingData),
    });

    console.log(`Save general settings response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Saved general settings:", data);

    // Return the first item if it's an array, otherwise return the data
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error("Error saving general settings:", error);
    throw error;
  }
}

/**
 * Get general settings
 * @returns The general settings data
 */
export async function getGeneralSetting(): Promise<GeneralSetting | null> {
  console.log("Fetching general settings");

  try {
    // Use the external API directly
    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/generalsetting/get', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`Get general settings response status: ${response.status}`);

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
    console.log("Retrieved general settings:", data);

    // Return the first item if it's an array, otherwise return the data
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error("Error fetching general settings:", error);
    throw error;
  }
}

/**
 * Convert a file to a base64 string
 * @param file The file to convert
 * @returns A promise that resolves to the base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
