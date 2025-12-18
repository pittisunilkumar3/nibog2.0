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
export async function updateEmailSetting(emailSettingData: Partial<EmailSetting>): Promise<any> {
  console.log("📤 Updating email settings:", emailSettingData);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    // Get auth token (same logic as other services)
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      if (!token) {
        const cookies = document.cookie.split(';');
        const authTokenCookie = cookies.find(c => c.trim().startsWith('auth-token='));
        if (authTokenCookie) token = authTokenCookie.split('=')[1];
      }
      if (!token) {
        const cookies = document.cookie.split(';');
        const superadminCookie = cookies.find(c => c.trim().startsWith('superadmin-token='));
        if (superadminCookie) {
          try {
            const cookieValue = decodeURIComponent(superadminCookie.split('=')[1]);
            const userData = JSON.parse(cookieValue);
            if (userData && userData.token) token = userData.token;
          } catch (e) {
            console.warn('Failed to parse superadmin-token cookie:', e);
          }
        }
      }
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch('/api/email-settings', {
      method: 'PUT',
      headers,
      body: JSON.stringify(emailSettingData),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log(`Update email settings response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Email settings updated:', data);
    return data;
  } catch (error) {
    console.error('❌ Error updating email settings:', error);
    if (error instanceof Error && error.name === 'AbortError') throw new Error('Request timeout - please try again');
    throw error;
  }
}

/**
 * Get email settings
 * @returns The email settings data
 */
export async function getEmailSetting(): Promise<EmailSetting | null> {
  console.log("📥 Fetching email settings via /api/email-settings...");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch('/api/email-settings', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log(`Get email settings response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);

      if (response.status === 404) {
        console.log('⚠️ No email settings found (404)');
        return null;
      }

      throw new Error(`API returned error status: ${response.status}`);
    }

    const json = await response.json();

    // Backend returns { success: true, data: { ... } }
    if (json && typeof json === 'object') {
      if (json.success === false) {
        // Not found or other error
        return null;
      }
      if (json.data) {
        return json.data as EmailSetting;
      }
    }

    // Fallback: return the object directly
    return json as EmailSetting;
  } catch (error) {
    console.error('❌ Error fetching email settings:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
}
