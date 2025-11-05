export interface FooterSetting {
  id?: number;
  company_name: string;
  company_description: string;
  address: string;
  phone: string;
  email: string;
  newsletter_enabled: boolean;
  copyright_text: string;
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  youtube_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FooterSettingPayload {
  company_name: string;
  company_description: string;
  address: string;
  phone: string;
  email: string;
  newsletter_enabled: boolean;
  copyright_text: string;
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  youtube_url?: string;
}

/**
 * Save footer settings to external API
 * @param footerData - Footer settings data to save
 * @returns Promise with the saved footer settings
 */
export async function saveFooterSetting(footerData: FooterSettingPayload): Promise<FooterSetting[]> {
  console.log("Saving footer settings:", footerData);

  try {
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    // Use Next.js API route to avoid CORS issues
    const response = await fetch('/api/footer-settings/create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(footerData),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log(`Save footer settings response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Footer settings saved successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to save footer settings:", error);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
}

/**
 * Get footer settings from external API
 * @returns Promise with footer settings data or null if not found
 */
export async function getFooterSetting(): Promise<FooterSetting | null> {
  if (process.env.NODE_ENV === 'development') {
    console.log("Fetching footer settings...");
  }

  try {
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    // Use Next.js API route to avoid CORS issues
    const response = await fetch('/api/footer-settings/get', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Get footer settings response status: ${response.status}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      
      // If 404, return null instead of throwing an error
      if (response.status === 404) {
        if (process.env.NODE_ENV === 'development') {
          console.log("No footer settings found (404)");
        }
        return null;
      }
      
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    
    if (process.env.NODE_ENV === 'development') {
      console.log("Footer settings fetched successfully:", data);
    }

    // The API returns an array, so we take the first item
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch footer settings:", error);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
}

/**
 * Get footer settings with fallback values
 * @returns Promise with footer settings data with fallback values
 */
export async function getFooterSettingWithFallback(): Promise<FooterSetting> {
  try {
    const footerSetting = await getFooterSetting();
    
    if (footerSetting) {
      return footerSetting;
    }

    // Return fallback values if no settings found
    return {
      company_name: "NIBOG",
      company_description: "India's biggest baby Olympic games platform, executing in 21 cities across India. NIBOG is focused exclusively on conducting baby games for children aged 5-84 months.",
      address: "NIBOG, P.No:18, H.NO 33-30/4, Officers Colony,\nR.K Puram, Hyderabad - 500056.",
      phone: "+91-8977939614/15",
      email: "newindiababyolympics@gmail.com",
      newsletter_enabled: true,
      copyright_text: "© {year} NIBOG. All rights reserved. India's Biggest Baby Olympic Games Platform.",
      facebook_url: "https://www.facebook.com/share/1K8H6SPtR5/",
      instagram_url: "https://www.instagram.com/nibog_100?igsh=MWlnYXBiNDFydGQxYg%3D%3D&utm_source=qr",
      linkedin_url: "https://www.linkedin.com/in/new-india-baby-olympicgames?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
      youtube_url: "https://youtube.com/@newindiababyolympics?si=gdXw5mGsXA93brxB"
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching footer settings, using fallback:", error);
    }
    
    // Return fallback values on error
    return {
      company_name: "NIBOG",
      company_description: "India's biggest baby Olympic games platform, executing in 21 cities across India. NIBOG is focused exclusively on conducting baby games for children aged 5-84 months.",
      address: "NIBOG, P.No:18, H.NO 33-30/4, Officers Colony,\nR.K Puram, Hyderabad - 500056.",
      phone: "+91-8977939614/15",
      email: "newindiababyolympics@gmail.com",
      newsletter_enabled: true,
      copyright_text: "© {year} NIBOG. All rights reserved. India's Biggest Baby Olympic Games Platform.",
      facebook_url: "https://www.facebook.com/share/1K8H6SPtR5/",
      instagram_url: "https://www.instagram.com/nibog_100?igsh=MWlnYXBiNDFydGQxYg%3D%3D&utm_source=qr",
      linkedin_url: "https://www.linkedin.com/in/new-india-baby-olympicgames?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
      youtube_url: "https://youtube.com/@newindiababyolympics?si=gdXw5mGsXA93brxB"
    };
  }
}
