/**
 * Terms service: fetch and update terms & conditions via internal API routes
 */

export async function getTerms(): Promise<any> {
  try {
    // First attempt
    let response = await fetch('/api/terms', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    // If network error or non-ok, retry once (helps transient dev server restarts)
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.warn('getTerms: initial fetch failed, retrying once. Status:', response.status, 'BodySample:', text.substring ? text.substring(0,120) : text);
      // small backoff
      await new Promise(r => setTimeout(r, 250));
      response = await fetch('/api/terms', { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`API returned error status: ${response.status} - ${text}`);
    }

    const payload = await response.json().catch(async () => {
      // If response isn't JSON, try to read as text and wrap
      const txt = await response.text().catch(() => '');
      return txt ? { success: true, terms: { html_content: txt } } : {};
    });

    // Normalize possible response shapes to { success: true, terms: { html_content, updated_at } }
    if (payload && payload.success && payload.terms) {
      return payload;
    }

    if (Array.isArray(payload) && payload.length > 0) {
      // e.g., [{ html_content, created_at }]
      return { success: true, terms: { html_content: payload[0].html_content || payload[0].terms_text || '', updated_at: payload[0].created_at || payload[0].updated_at } };
    }

    if (payload && (payload.html_content || payload.terms_text)) {
      return { success: true, terms: { html_content: payload.html_content || payload.terms_text, updated_at: payload.updated_at || payload.created_at } };
    }

    // If it doesn't match the expected shapes, return it so caller can inspect
    return payload;
  } catch (error) {
    console.error('Failed to fetch terms:', error);
    throw error;
  }
}

export async function updateTerms(termsText: string): Promise<any> {
  try {
    // Try to get admin auth token from storage/cookies like other services
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');

      if (!token) {
        const cookies = document.cookie.split(';');
        const authTokenCookie = cookies.find(c => c.trim().startsWith('auth-token='));
        if (authTokenCookie) {
          token = authTokenCookie.split('=')[1];
        }
      }

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
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ Using authentication token for terms update');
    } else {
      console.warn('⚠️ No authentication token found for terms update');
    }

    // Send terms_text to match backend API expectation (just like refund-policy sends policy_text)
    const payload = { terms_text: termsText };
    console.log('updateTerms: sending payload (truncated):', JSON.stringify(payload).substring(0,200));

    const response = await fetch('/api/terms', {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      let errorMessage = `API returned error status: ${response.status}`;
      try {
        const errJson = JSON.parse(text);
        errorMessage = errJson.message || errorMessage;
      } catch (e) {
        // not JSON
        errorMessage += ` - ${text.substring ? text.substring(0,250) : text}`;
      }
      throw new Error(errorMessage);
    }

    const resText = await response.text().catch(() => '');
    try {
      return JSON.parse(resText);
    } catch (e) {
      return { success: true, message: resText };
    }
  } catch (error) {
    console.error('Failed to update terms:', error);
    throw error;
  }
}
