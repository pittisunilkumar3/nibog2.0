export interface FooterSetting {
  id?: number;
  company_name: string;
  company_description: string;
  address: string;
  phone: string;
  email: string;
  newsletter_enabled: boolean | number;
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
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

    // The API returns an array, so we take the first item
    if (Array.isArray(data) && data.length > 0) {
      return data[0] as FooterSetting;
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
 * Get footer settings with social links from external API
 * @returns Promise with footer settings data including social links
 */
export async function getFooterSettingWithSocial(): Promise<FooterSetting | null> {

  try {
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    // Use Next.js API route to avoid CORS issues
    const response = await fetch('/api/footer-settings/with-social', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: controller.signal
    });

    clearTimeout(timeoutId);

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

    return data;
  } catch (error) {
    console.error("Failed to fetch footer settings with social:", error);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
}

/**
 * Update footer settings via external API
 * @param footerData - Footer settings data to update
 * @returns Promise with the updated footer settings
 */
export async function updateFooterSetting(footerData: FooterSettingPayload): Promise<any> {

  try {
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    // Get auth token from localStorage or sessionStorage
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      
      // If not in storage, try to get from auth-token cookie first
      if (!token) {
        const cookies = document.cookie.split(';');
        const authTokenCookie = cookies.find(c => c.trim().startsWith('auth-token='));
        if (authTokenCookie) {
          token = authTokenCookie.split('=')[1];
        }
      }
      
      // If still no token, try to get from superadmin-token cookie
      if (!token) {
        const cookies = document.cookie.split(';');
        const superadminCookie = cookies.find(c => c.trim().startsWith('superadmin-token='));
        if (superadminCookie) {
          try {
            const cookieValue = decodeURIComponent(superadminCookie.split('=')[1]);
            const userData = JSON.parse(cookieValue);
            // Check if the cookie contains the token field
            if (userData && userData.token) {
              token = userData.token;
            }
          } catch (e) {
            console.warn('Failed to parse superadmin-token cookie:', e);
          }
        }
      }
    }
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('⚠️ No authentication token found for footer update');
    }

    // Use Next.js API route to avoid CORS issues
    const response = await fetch('/api/footer-settings/update', {
      method: "PUT",
      headers,
      body: JSON.stringify(footerData),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to update footer settings:", error);
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
