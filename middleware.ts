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

  // Define public paths that don't require authentication
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/superadmin/login',
    '/api/auth/login',
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
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
      return NextResponse.next();
    }

    // For all other admin routes, verify superadmin
    const user = await verifySuperadmin(superadminToken);
    if (!user) {
      // Redirect to superadmin login if not authenticated
      const loginUrl = new URL('/superadmin/login', request.url);
      // Preserve the original intended URL for redirect after login
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Add user info to request headers for API routes
    if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/superadmin')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-email', user.email);
      requestHeaders.set('x-user-role', 'superadmin');

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return NextResponse.next();
  }

  // Handle user protected routes (dashboard, checkout, register-event, etc.)
  if (isUserProtectedPath) {
    // If user is not authenticated, redirect to login
    if (!userSession) {
      const loginUrl = new URL('/login', request.url);
      // Preserve the original intended URL for redirect after login
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // User is authenticated, allow access
    return NextResponse.next();
  }

  // Handle login page - redirect if already authenticated
  if (pathname === '/login') {
    if (userSession) {
      // Regular user is logged in, redirect to home or callback URL
      const callbackUrl = searchParams.get('callbackUrl') || '/';
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }
    if (superadminToken) {
      // Superadmin is logged in, redirect to admin
      const redirectPath = searchParams.get('redirect') || '/admin';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    // Not logged in, allow access to login page
    return NextResponse.next();
  }

  // Handle public paths
  if (isPublicPath) {
    return NextResponse.next();
  }

  // If it's a protected API route and no session, return 401
  if (isProtectedApiRoute && !userSession && !superadminToken) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Default: allow access
  return NextResponse.next();
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
