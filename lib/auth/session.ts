// Client-side session utilities
export const SESSION_COOKIE_NAME = 'nibog-session';

// Get session token (works in both server and client components)
export async function getSession(): Promise<string | null> {
  if (typeof window === 'undefined') {
    // Server-side: For Next.js 14, we need to handle this differently
    return null;
  }

  // Client-side: Robust token retrieval from multiple sources
  try {
    // 1. Try standard nibog-session from localStorage
    let token = localStorage.getItem(SESSION_COOKIE_NAME);
    if (token) return token;

    // 2. Try adminToken from localStorage or sessionStorage
    token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    if (token) return token;

    // 3. Try cookies
    const cookies = document.cookie.split('; ');

    // 3a. Try nibog-session cookie
    const sessionCookie = cookies.find(row => row.startsWith(`${SESSION_COOKIE_NAME}=`));
    if (sessionCookie) return sessionCookie.split('=')[1];

    // 3b. Try auth-token cookie
    const authTokenCookie = cookies.find(row => row.startsWith('auth-token='));
    if (authTokenCookie) return authTokenCookie.split('=')[1];

    // 3c. Try superadmin-token cookie (usually a JSON string containing the token)
    const superadminCookie = cookies.find(row => row.startsWith('superadmin-token='));
    if (superadminCookie) {
      try {
        const cookieValue = decodeURIComponent(superadminCookie.split('=')[1]);
        const userData = JSON.parse(cookieValue);
        if (userData && userData.token) {
          return userData.token;
        }
      } catch (e) {
        console.warn('Failed to parse superadmin-token cookie in getSession:', e);
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

// Client-side authentication check
export const isClientAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return !!localStorage.getItem(SESSION_COOKIE_NAME);
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return false;
  }
};

// Check if a JWT token is expired. Returns false for non-JWT / opaque tokens.
export function isTokenExpired(token?: string | null): boolean {
  if (!token) return true; // missing token -> treat as expired

  try {
    // JWTs have three parts separated by dots
    const parts = token.split('.')
    if (parts.length !== 3) {
      // Not a JWT; we cannot reliably determine expiration
      return false
    }

    // Decode payload (base64url)
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(payloadBase64)
    const payload = JSON.parse(decoded)
    if (payload && typeof payload.exp === 'number') {
      const now = Math.floor(Date.now() / 1000)
      return payload.exp <= now
    }

    // No exp claim - assume not expired
    return false
  } catch (error) {
    console.warn('Failed to parse token for expiry check:', error)
    return false
  }
} 

// Server-side authentication check
export async function isServerAuthenticated() {
  if (typeof window !== 'undefined') {
    return isClientAuthenticated();
  }

  try {
    // For Next.js 14, we'll handle authentication in server components
    // using cookies().get() directly in the server component
    return false; // Default to false, actual check will be in server component
  } catch (error) {
    console.error('Error checking server authentication:', error);
    return false;
  }
}

// Combined check that works in both server and client components
export async function isAuthenticated() {
  try {
    if (typeof window === 'undefined') {
      return await isServerAuthenticated();
    }
    return isClientAuthenticated();
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
}

// Set session (client-side only)
export function setSession(token: string) {
  if (typeof window === 'undefined') {
    console.warn('setSession called on server side - this should only be called on the client');
    return;
  }
  try {
    console.log('[Session] Setting session token');
    localStorage.setItem(SESSION_COOKIE_NAME, token);
    
    // Sync with cookies for server-side access - set with proper expiry
    const maxAge = 60 * 60 * 24 * 7; // 7 days in seconds
    // Ensure Secure flag only when the page is served over HTTPS (otherwise cookie won't be sent)
    const secure = (typeof window !== 'undefined' && window.location && window.location.protocol === 'https:') ? 'Secure; ' : '';
    document.cookie = `${SESSION_COOKIE_NAME}=${token}; path=/; max-age=${maxAge}; ${secure}SameSite=Lax`;
    
    // Verify cookie was set
    const cookieSet = document.cookie.split(';').some(c => c.trim().startsWith(`${SESSION_COOKIE_NAME}=`));
    console.log('[Session] Cookie set successfully:', cookieSet);
  } catch (error) {
    console.error('Error setting session:', error);
  }
}


// Clear session (client-side only)
export function clearSession() {
  if (typeof window === 'undefined') {
    console.warn('clearSession called on server side - this should only be called on the client');
    return;
  }
  try {
    // Remove from localStorage
    localStorage.removeItem(SESSION_COOKIE_NAME);

    // Get all cookies
    const allCookies = document.cookie.split(';');

    // Clear the session cookie with all possible domain/path combinations
    const domains = ['', `.${window.location.hostname}`, window.location.hostname];
    const paths = ['/', ''];

    domains.forEach(domain => {
      paths.forEach(path => {
        // Clear with different combinations
        document.cookie = `${SESSION_COOKIE_NAME}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT${domain ? `; domain=${domain}` : ''}`;
        document.cookie = `${SESSION_COOKIE_NAME}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${domain ? `; domain=${domain}` : ''}`;
        document.cookie = `${SESSION_COOKIE_NAME}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=Lax${domain ? `; domain=${domain}` : ''}`;
      });
    });

    // Verify cookie was cleared
    const stillExists = document.cookie.split(';').some(c => c.trim().startsWith(`${SESSION_COOKIE_NAME}=`));
    if (stillExists) {
      console.warn('Warning: Cookie may not have been fully cleared');
    } else {

    }
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}
