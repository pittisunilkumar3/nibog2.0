import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Get the current session from cookies on the server side
 * @returns The session token if it exists, null otherwise
 */
export function getServerSession(): string | null {
  const cookieStore = cookies();
  return cookieStore.get('nibog-session')?.value || null;
}

/**
 * Check if the current user is authenticated on the server side
 * @returns A boolean indicating if the user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getServerSession();
}

/**
 * Require authentication for a server component
 * If the user is not authenticated, they will be redirected to the login page
 * @param redirectTo The URL to redirect to after login (defaults to current path)
 * @returns The session token if authenticated
 */
export function requireAuth(redirectTo?: string): string {
  const session = getServerSession();
  
  if (!session) {
    const loginUrl = new URL('/login', 'http://localhost:3000');
    loginUrl.searchParams.set('callbackUrl', redirectTo || window.location.pathname);
    redirect(loginUrl.toString());
  }
  
  return session;
}

/**
 * Redirect to a specific path if the user is already authenticated
 * Useful for login/register pages
 * @param redirectTo The URL to redirect to if the user is authenticated
 */
export function redirectIfAuthenticated(redirectTo: string = '/'): void {
  if (isAuthenticated()) {
    redirect(redirectTo);
  }
}
