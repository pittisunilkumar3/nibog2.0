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
  '/baby-olympics',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
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
interface JwtPayload {
  email: string;
  role: string;
  // Add other fields as needed
}

// Verify superadmin from session cookie
const verifySuperadmin = async (token: string | undefined): Promise<SuperadminUser | null> => {
  if (!token) return null;
  
  try {
    // Parse the session data from the cookie
    const sessionData = JSON.parse(token);
    
    // Verify if the user is a superadmin
    if (sessionData?.is_superadmin) {
      return {
        id: sessionData.id,
        email: sessionData.email,
        is_superadmin: sessionData.is_superadmin,
        role: 'superadmin',
      };
    }
    return null;
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
};

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const cookieStore = cookies();
  const superadminToken = request.cookies.get('superadmin-token')?.value;
  const userSession = request.cookies.get('nibog-session')?.value;

  // Debug logging for protected paths
  if (pathname.startsWith('/register-event') || pathname.startsWith('/dashboard') || pathname.startsWith('/checkout')) {
    console.log(`\n[Middleware Debug] ==================`);
    console.log(`[Middleware] Pathname: ${pathname}`);
    console.log(`[Middleware] All cookies:`, request.cookies.getAll().map(c => `${c.name}=${c.value.substring(0, 20)}...`));
    console.log(`[Middleware] nibog-session exists:`, !!userSession);
    console.log(`[Middleware] superadmin-token exists:`, !!superadminToken);
    console.log(`[Middleware Debug] ==================\n`);
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
    '/api/auth/superadmin/login',
    '/about',
    '/contact',
    '/events',
    '/baby-olympics',
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
      // If already logged in, redirect to admin or the specified redirect URL
      if (superadminToken) {
        const redirectPath = searchParams.get('redirect') || '/admin';
        const redirect = NextResponse.redirect(new URL(redirectPath, request.url));
        redirect.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
        redirect.headers.set('Pragma', 'no-cache');
        redirect.headers.set('Expires', '0');
        return redirect;
      }
      return response;
    }

    // For all other admin routes, verify superadmin
    const user = await verifySuperadmin(superadminToken);
    if (!user) {
      // Redirect to superadmin login if not authenticated
      const loginUrl = new URL('/superadmin/login', request.url);
      // Preserve the original intended URL for redirect after login
      loginUrl.searchParams.set('redirect', pathname);
      const redirect = NextResponse.redirect(loginUrl);
      redirect.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      redirect.headers.set('Pragma', 'no-cache');
      redirect.headers.set('Expires', '0');
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

  // Handle user protected routes (dashboard, checkout, register-event, etc.)
  if (isUserProtectedPath) {
    console.log(`[Middleware] Protected path accessed: ${pathname}`);
    console.log(`[Middleware] userSession exists:`, !!userSession);
    console.log(`[Middleware] userSession value (first 20 chars):`, userSession?.substring(0, 20));
    
    // If user is not authenticated, redirect to login
    if (!userSession) {
      console.log(`[Middleware] No user session found, redirecting to login`);
      const loginUrl = new URL('/login', request.url);
      // Preserve the original intended URL for redirect after login
      loginUrl.searchParams.set('callbackUrl', pathname);
      const redirect = NextResponse.redirect(loginUrl);
      redirect.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      redirect.headers.set('Pragma', 'no-cache');
      redirect.headers.set('Expires', '0');
      return redirect;
    }
    console.log(`[Middleware] User authenticated, allowing access to ${pathname}`);
    // User is authenticated, allow access
    return response;
  }

  // Handle login page - redirect if already authenticated
  if (pathname === '/login') {
    if (userSession) {
      // Regular user is logged in, redirect to home or callback URL
      const callbackUrl = searchParams.get('callbackUrl') || '/';
      const redirect = NextResponse.redirect(new URL(callbackUrl, request.url));
      redirect.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      redirect.headers.set('Pragma', 'no-cache');
      redirect.headers.set('Expires', '0');
      return redirect;
    }
    if (superadminToken) {
      // Superadmin is logged in, redirect to admin
      const redirectPath = searchParams.get('redirect') || '/admin';
      const redirect = NextResponse.redirect(new URL(redirectPath, request.url));
      redirect.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      redirect.headers.set('Pragma', 'no-cache');
      redirect.headers.set('Expires', '0');
      return redirect;
    }
    // Not logged in, allow access to login page
    return response;
  }

  // Handle public paths
  if (isPublicPath) {
    return response;
  }

  // If it's a protected API route and no session, return 401
  if (isProtectedApiRoute && !userSession && !superadminToken) {
    const errorResponse = NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    errorResponse.headers.set('Pragma', 'no-cache');
    errorResponse.headers.set('Expires', '0');
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
