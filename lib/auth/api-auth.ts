import { NextRequest, NextResponse } from 'next/server';
import { isTokenExpired } from './session';

/**
 * Verify authentication token from request headers or cookies
 * Returns the token if valid, or null if expired/missing
 */
export function verifyApiAuth(request: NextRequest): string | null {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (!isTokenExpired(token)) {
      return token;
    }
  }

  // Try to get token from cookie
  const cookieToken = request.cookies.get('nibog-session')?.value;
  if (cookieToken && !isTokenExpired(cookieToken)) {
    return cookieToken;
  }

  return null;
}

/**
 * Returns a 401 Unauthorized response with expired token message
 */
export function unauthorizedResponse(message: string = 'Token expired or invalid. Please login again.'): NextResponse {
  return NextResponse.json(
    { 
      error: 'Unauthorized', 
      message,
      code: 'TOKEN_EXPIRED'
    },
    { status: 401 }
  );
}

/**
 * Middleware function to verify authentication for API routes
 * Usage: const token = await requireAuth(request); if (!token) return unauthorizedResponse();
 */
export function requireAuth(request: NextRequest): string | NextResponse {
  const token = verifyApiAuth(request);
  if (!token) {
    return unauthorizedResponse();
  }
  return token;
}
