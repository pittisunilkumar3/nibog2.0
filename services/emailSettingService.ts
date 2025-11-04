// Define the email settings interface
export interface EmailSetting {
  id?: number;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  sender_name: string;
  sender_email: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Create or update email settings
 * @param emailSettingData The email settings data to save
 * @returns The saved email settings data
 */
export async function saveEmailSetting(emailSettingData: EmailSetting): Promise<EmailSetting> {
  console.log("Saving email settings:", emailSettingData);

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/emailsetting/create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailSettingData),
    });

    console.log(`Save email settings response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();

    // Return the first item if it's an array, otherwise return the data
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error("Error saving email settings:", error);
    throw error;
  }
}

/**
 * Get email settings
 * @returns The email settings data
 */
export async function getEmailSetting(): Promise<EmailSetting | null> {
  console.log("Fetching email settings");

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/emailsetting/get', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`Get email settings response status: ${response.status}`);

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

    // Return the first item if it's an array, otherwise return the data
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error("Error fetching email settings:", error);
    throw error;
  }
}
