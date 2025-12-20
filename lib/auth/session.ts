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
    localStorage.setItem(SESSION_COOKIE_NAME, token);
    // Sync with cookies for server-side access
    document.cookie = `${SESSION_COOKIE_NAME}=${token}; path=/; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''
      }SameSite=Lax`;
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
      console.log('Session cleared successfully');
    }
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}
