// Define the general settings interface
export interface GeneralSetting {
  id?: number;
  site_name: string;
  site_tagline: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  logo_path?: string;
  favicon_path?: string;
  logo?: string;
  favicon?: string;
  created_at?: string;
  updated_at?: string;
}

import { apiUrl } from './apiClient';

/**
 * Get general settings from backend API
 * @returns The general settings data
 */
export async function getGeneralSetting(): Promise<GeneralSetting | null> {
  console.log("📥 Fetching general settings from backend...");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(apiUrl('/api/general-settings'), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log(`Get general settings response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);

      // If 404, return null instead of throwing an error
      if (response.status === 404) {
        console.log('⚠️ No general settings found (404)');
        return null;
      }

      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Retrieved general settings:", data);

    return data;
  } catch (error) {
    console.error("❌ Error fetching general settings:", error);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
}

/**
 * Update general settings on backend API
 * @param generalSettingData The general settings data to update
 * @returns The response message
 */
export async function updateGeneralSetting(generalSettingData: Partial<GeneralSetting>): Promise<any> {
  console.log("📤 Updating general settings:", generalSettingData);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    // Get auth token from localStorage or sessionStorage
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      
      // If not in storage, try to get from auth-token cookie
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
      console.log('✅ Using authentication token for general settings update');
    } else {
      console.warn('⚠️ No authentication token found for general settings update');
    }

    const response = await fetch(apiUrl('/api/general-settings'), {
      method: "PUT",
      headers,
      body: JSON.stringify(generalSettingData),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log(`Update general settings response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ General settings updated successfully:", data);
    return data;
  } catch (error) {
    console.error("❌ Error updating general settings:", error);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
}

/**
 * @deprecated Use updateGeneralSetting instead
 * Create or update general settings (legacy function for backward compatibility)
 */
export async function saveGeneralSetting(generalSettingData: GeneralSetting): Promise<GeneralSetting> {
  console.warn('⚠️ saveGeneralSetting is deprecated, use updateGeneralSetting instead');
  const result = await updateGeneralSetting(generalSettingData);
  return result;
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
