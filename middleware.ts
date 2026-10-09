import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_API } from '@/config/api';

type SuperadminUser = {
  email: string;
  role: string;
  is_superadmin: boolean;
  [key: string]: any;
};

// Define public paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/about',
  '/contact',
  '/events',
  '/baby-one',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-reset-token',
  '/api/auth/superadmin/login',
  '/api/cities',
  '/api/cities/get-all',
  '/_next',
  '/favicon.ico',
  '/images',
  '/assets',
  '/public',
  '/_vercel',
  '/api/health',
  '/superadmin/login',  // Add superadmin login page to public paths
  '/payment-callback'    // Add payment callback page to public paths
];

// Admin and superadmin paths that require admin/superadmin authentication
const adminPaths = [
  '/admin',
  '/admin/*',
  '/superadmin',
  '/superadmin/dashboard',
  '/api/superadmin',
  '/api/admin'
];

// Define protected API routes that require authentication
const protectedApiRoutes = [
  '/api/user',
  '/api/events',
  '/api/bookings',
];

// Define JWT payload interface
// Helper to check if a JWT is expired
function isTokenExpired(token?: string | null): boolean {
  if (!token || token === 'undefined' || token === 'null' || token === '') return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false; // Not a JWT

    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload && typeof payload.exp === 'number') {
      const now = Math.floor(Date.now() / 1000);
      return payload.exp <= (now + 5); // 5s buffer
    }
    return false;
  } catch (error) {
    // If we can't parse the token, assume it's not expired to avoid false positives
    // The server will validate it properly
    return false;
  }
}

// Verify superadmin from session cookie.
// Returns:
//   { user }            - session is valid (server-verified)
//   { user: null, invalid: true }  - explicitly rejected (stale epoch / bad token / not superadmin)
//   { user: null }                 - unknown (backend unreachable) -> caller decides fallback
const verifySuperadmin = async (token: string | undefined): Promise<{ user: SuperadminUser | null; invalid?: boolean }> => {
  if (!token) return { user: null, invalid: true };

  let localUser: SuperadminUser | null = null;

  try {
    // Check expiry
    if (isTokenExpired(token)) return { user: null, invalid: true };

    // Try parsing as JSON first (legacy format)
    try {
      const sessionData = JSON.parse(decodeURIComponent(token));
      if (sessionData && typeof sessionData === 'object' && (sessionData.is_superadmin || sessionData.role === 'superadmin')) {
        localUser = {
          id: sessionData.id || sessionData.user_id,
          email: sessionData.email,
          is_superadmin: true,
          role: 'superadmin',
        };
      }
    } catch (e) {
      // Not JSON, check if it's a JWT
      if (token.includes('.')) {
        const parts = token.split('.');
        if (parts.length === 3) {
          try {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            if (payload && (payload.is_superadmin || payload.role === 'superadmin' || payload.role === 'admin')) {
              localUser = {
                id: payload.id || payload.user_id || 0,
                email: payload.email,
                is_superadmin: true,
                role: 'superadmin',
              };
            }
          } catch (e2) { }
        }
      }
    }
    if (!localUser) return { user: null, invalid: true };

    // Server-side validation: rejects stale superadmin sessions (e.g. after a
    // password change). Backend compares the token's session_epoch with the DB.
    try {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3004';
      const res = await fetch(`${backendUrl}/api/employee/validate-superadmin`, {
        method: 'GET',
        headers: { 'x-superadmin-token': token },
        signal: AbortSignal.timeout(8000),
        cache: 'no-store',
      });
      if (!res.ok) return { user: null, invalid: true }; // explicitly rejected -> force logout
    } catch (fetchError) {
      // Backend unreachable: 'unknown' state. Fail-closed for admin pages
      // (redirect to login) but never wipe cookies in that case.
      return { user: null };
    }

    return { user: localUser };
  } catch (error) {
    return { user: null, invalid: true };
  }
};

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const cookieStore = await cookies();
  const superadminToken = cookieStore.get('superadmin-token')?.value || request.cookies.get('superadmin-token')?.value;
  const userSession = cookieStore.get('nibog-session')?.value || request.cookies.get('nibog-session')?.value;

  // Debug logging for protected paths
  if (pathname.startsWith('/register-event') || pathname.startsWith('/dashboard') || pathname.startsWith('/checkout')) {
    // Debug logs removed for production readiness
  }

  // Create response with no-cache headers by default
  const response = NextResponse.next();

  // Add no-cache headers to all responses to prevent local caching
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  // Define public paths that don't require authentication
  const publicPaths = [
    '/',
    '/login',
    '/logout',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/superadmin/login',
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/verify-reset-token',
    '/api/auth/superadmin/login',
    '/about',
    '/contact',
    '/events',
    '/baby-one',
    '/faq',
    '/privacy',
    '/terms',
    '/refund',
    '/api/cities',
    '/api/cities/get-all',
    '/_next',
    '/favicon.ico',
    '/images',
    '/assets',
    '/public',
    '/_vercel',
    '/api/health',
    '/payment-callback',
  ];

  // Define admin paths that require admin/superadmin role
  const adminPaths = [
    '/admin',
    '/superadmin',
  ];

  // Define user protected paths that require regular user authentication
  const userProtectedPaths = [
    '/dashboard',
    '/checkout',
    '/register-event',
  ];

  // Define protected API routes that require authentication
  const protectedApiRoutes = [
    '/api/user',
    '/api/bookings',
  ];

  // Check if current path is public
  const isPublicPath = publicPaths.some(path =>
    pathname === path || pathname.startsWith(path)
  );

  // Check if current path is an admin path
  const isAdminPath = adminPaths.some(path =>
    pathname === path || pathname.startsWith(path + '/')
  );

  // Check if current path is a user protected path
  const isUserProtectedPath = userProtectedPaths.some(path =>
    pathname === path || pathname.startsWith(path + '/')
  );

  // Check if the path is a protected API route
  const isProtectedApiRoute = protectedApiRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Handle admin routes
  if (isAdminPath) {
    // For login pages
    if (pathname === '/superadmin/login' || pathname === '/admin/login') {
      // Only redirect if the session is server-verified as valid
      // (prevents redirect loops with stale cookies, e.g. after password change)
      const existing = await verifySuperadmin(superadminToken);
      if (existing.user) {
        const redirectPath = searchParams.get('redirect') || '/admin';
        const redirect = NextResponse.redirect(new URL(redirectPath, request.url));
        redirect.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
        return redirect;
      }
      // Explicitly invalid session: clear cookies so a fresh login can proceed.
      // ('unknown' = backend unreachable: show login but keep cookies intact)
      if (superadminToken && existing.invalid) {
        response.cookies.set('superadmin-token', '', { maxAge: 0, path: '/' });
        response.cookies.set('auth-token', '', { maxAge: 0, path: '/' });
      }
      return response;
    }

    // For all other admin routes, verify superadmin (fail-closed: any non-valid
    // state -> redirect to login; cookies are preserved so retrying after a
    // backend hiccup restores the session automatically)
    const { user } = await verifySuperadmin(superadminToken);
    
    // Check if token exists but is expired
    const isExpired = superadminToken && isTokenExpired(superadminToken);
    
    if (!user) {
      // Redirect to superadmin login if not authenticated
      const loginUrl = new URL('/superadmin/login', request.url);
      // Preserve the original intended URL for redirect after login
      loginUrl.searchParams.set('redirect', pathname);
      // Add reason if token was expired
      if (isExpired) {
        loginUrl.searchParams.set('reason', 'expired');
      }
      const redirect = NextResponse.redirect(loginUrl);
      redirect.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      redirect.headers.set('Pragma', 'no-cache');
      redirect.headers.set('Expires', '0');
      // Clear expired token cookie
      if (isExpired) {
        redirect.cookies.set('superadmin-token', '', { maxAge: 0, path: '/' });
      }
      return redirect;
    }

    // Add user info to request headers for API routes
    if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/superadmin')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-email', user.email);
      requestHeaders.set('x-user-role', 'superadmin');

      const apiResponse = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      apiResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      apiResponse.headers.set('Pragma', 'no-cache');
      apiResponse.headers.set('Expires', '0');
      return apiResponse;
    }

    return response;
  }

  // Handle user protected routes (dashboard, checkout, etc.)
  if (isUserProtectedPath) {
    // Debug logs removed for production readiness

    // If user is not authenticated OR EXPIRED, redirect to login and clear expired cookie
    if (!userSession || isTokenExpired(userSession)) {
      const loginUrl = new URL('/login', request.url);
      // Preserve the original intended URL for redirect after login
      loginUrl.searchParams.set('callbackUrl', pathname + (request.nextUrl.search || ''));
      loginUrl.searchParams.set('reason', 'expired');
      const redirect = NextResponse.redirect(loginUrl);
      redirect.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      // Clear expired session cookie
      redirect.cookies.set('nibog-session', '', { maxAge: 0, path: '/' });
      return redirect;
    }

    return response;
  }

  // Handle login page - redirect if already authenticated
  if (pathname === '/login') {
    if (userSession && !isTokenExpired(userSession)) {
      // Regular user is logged in, redirect to home or callback URL
      const callbackUrl = searchParams.get('callbackUrl') || '/';
      const redirect = NextResponse.redirect(new URL(callbackUrl, request.url));
      redirect.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      return redirect;
    }
    if (superadminToken && !isTokenExpired(superadminToken)) {
      // Superadmin is logged in, redirect to admin
      const redirectPath = searchParams.get('redirect') || '/admin';
      const redirect = NextResponse.redirect(new URL(redirectPath, request.url));
      redirect.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      return redirect;
    }
    // Clear expired session cookies if present
    if (userSession && isTokenExpired(userSession)) {
      response.cookies.set('nibog-session', '', { maxAge: 0, path: '/' });
    }
    if (superadminToken && isTokenExpired(superadminToken)) {
      response.cookies.set('superadmin-token', '', { maxAge: 0, path: '/' });
    }
    // Not logged in, allow access to login page
    return response;
  }

  // Handle register page - redirect if already authenticated
  if (pathname === '/register') {
    if (userSession && !isTokenExpired(userSession)) {
      // Regular user is logged in, redirect to home
      const redirect = NextResponse.redirect(new URL('/', request.url));
      redirect.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      return redirect;
    }
    if (superadminToken && !isTokenExpired(superadminToken)) {
      // Superadmin is logged in, redirect to admin
      const redirect = NextResponse.redirect(new URL('/admin', request.url));
      redirect.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      return redirect;
    }
    // Clear expired session cookies if present
    if (userSession && isTokenExpired(userSession)) {
      response.cookies.set('nibog-session', '', { maxAge: 0, path: '/' });
    }
    if (superadminToken && isTokenExpired(superadminToken)) {
      response.cookies.set('superadmin-token', '', { maxAge: 0, path: '/' });
    }
    // Not logged in, allow access to register page
    return response;
  }

  // Handle public paths
  if (isPublicPath) {
    // Clear expired session cookies if present on public paths
    if (userSession && isTokenExpired(userSession)) {
      response.cookies.set('nibog-session', '', { maxAge: 0, path: '/' });
    }
    if (superadminToken && isTokenExpired(superadminToken)) {
      response.cookies.set('superadmin-token', '', { maxAge: 0, path: '/' });
    }
    return response;
  }

  // If it's a protected API route and no valid session, return 401
  if (isProtectedApiRoute && (!userSession || isTokenExpired(userSession)) && (!superadminToken || isTokenExpired(superadminToken))) {
    const errorResponse = NextResponse.json(
      { message: 'Unauthorized', error: 'Token expired or invalid' },
      { status: 401 }
    );
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    // Clear expired session cookies
    if (userSession && isTokenExpired(userSession)) {
      errorResponse.cookies.set('nibog-session', '', { maxAge: 0, path: '/' });
    }
    if (superadminToken && isTokenExpired(superadminToken)) {
      errorResponse.cookies.set('superadmin-token', '', { maxAge: 0, path: '/' });
    }
    return errorResponse;
  }

  // Default: allow access
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes are handled separately)
     * - images/ (image files)
     * - assets/ (static assets)
     * - public/ (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|images/|assets/|public/|_vercel/|health|payment-callback).*)',
    // Explicitly include admin paths to ensure they're handled
    '/admin/:path*',
    '/superadmin/:path*',
  ],
}
