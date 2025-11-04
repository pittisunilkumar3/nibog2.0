import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server-auth';

/**
 * A utility function to protect API routes
 * @param handler The route handler function
 * @returns A protected route handler
 */
export function withApiAuth(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      // Check if the user is authenticated
      const session = getServerSession();
      
      if (!session) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Call the original handler if authenticated
      return handler(req);
    } catch (error) {
      console.error('API route error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}

/**
 * A middleware function to protect API routes with role-based access control
 * @param handler The route handler function
 * @param allowedRoles Array of allowed roles
 * @returns A protected route handler with role checking
 */
export function withRoleAuth(
  handler: (req: NextRequest) => Promise<NextResponse>,
  allowedRoles: string[]
) {
  return async (req: NextRequest) => {
    try {
      // First check authentication
      const session = getServerSession();
      
      if (!session) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // TODO: Implement role checking logic here
      // For now, we'll just check if the user has any role
      const hasRequiredRole = true; // Replace with actual role check
      
      if (!hasRequiredRole) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }

      // Call the original handler if authorized
      return handler(req);
    } catch (error) {
      console.error('API route error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}

/**
 * A middleware function to protect API routes with custom authorization logic
 * @param handler The route handler function
 * @param authorize A function that determines if the request is authorized
 * @returns A protected route handler with custom authorization
 */
export function withCustomAuth<T = any>(
  handler: (req: NextRequest) => Promise<NextResponse>,
  authorize: (req: NextRequest) => Promise<boolean> | boolean
) {
  return async (req: NextRequest) => {
    try {
      const isAuthorized = await authorize(req);
      
      if (!isAuthorized) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }

      // Call the original handler if authorized
      return handler(req);
    } catch (error) {
      console.error('API route error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}
