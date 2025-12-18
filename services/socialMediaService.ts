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
export async function updateSocialMedia(socialMediaData: Partial<SocialMedia>): Promise<any> {
  console.log("📤 Updating social media settings:", socialMediaData);

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    // Get auth token from storage/cookies
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

    const response = await fetch('/api/social-media-settings', {
      method: 'PUT',
      headers,
      body: JSON.stringify(socialMediaData),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log(`Update social media response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Social media updated:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to update social media:', error);
    if (error instanceof Error && error.name === 'AbortError') throw new Error('Request timeout - please try again');
    throw error;
  }
}

/**
 * Get social media links
 * @returns The social media data
 */
export async function getSocialMedia(): Promise<SocialMedia | null> {
  console.log("📥 Fetching social media from backend...");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch('/api/social-media-settings', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(`Get social media response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      if (response.status === 404) return null;
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Retrieved social media:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching social media:', error);
    if (error instanceof Error && error.name === 'AbortError') throw new Error('Request timeout - please try again');
    throw error;
  }
}
