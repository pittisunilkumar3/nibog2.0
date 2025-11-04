'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { isClientAuthenticated } from '@/lib/auth/session';

type NavigationOptions = {
  replace?: boolean;
  requireAuth?: boolean;
  requiredRole?: string;
  onUnauthenticated?: () => void;
  onUnauthorized?: () => void;
};

export function useProtectedNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();

  const navigate = async (
    href: string, 
    options: NavigationOptions = {}
  ): Promise<boolean> => {
    const {
      replace = false,
      requireAuth = true,
      requiredRole,
      onUnauthenticated,
      onUnauthorized
    } = options;

    // If authentication is required
    if (requireAuth) {
      // First check the auth context
      if (!isAuthenticated) {
        // Fall back to checking the session cookie
        const hasSession = await isClientAuthenticated();
        
        if (!hasSession) {
          // Call the unauthenticated callback if provided
          if (onUnauthenticated) {
            onUnauthenticated();
            return false;
          }
          
          // Redirect to login with the intended URL
          const redirectUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
          const loginUrl = `/login?callbackUrl=${encodeURIComponent(redirectUrl)}`;
          
          if (replace) {
            router.replace(loginUrl);
          } else {
            router.push(loginUrl);
          }
          return false;
        }
      }


      // Check role if required
      if (requiredRole && user) {
        // TODO: Implement role-based access control
        // For now, just check if user has any role
        const hasRequiredRole = true; // Replace with actual role check
        
        if (!hasRequiredRole) {
          if (onUnauthorized) {
            onUnauthorized();
            return false;
          }
          
          // Redirect to unauthorized page or home
          if (replace) {
            router.replace('/unauthorized');
          } else {
            router.push('/unauthorized');
          }
          return false;
        }
      }
    }
    
    // If all checks pass, proceed with navigation
    if (replace) {
      router.replace(href);
    } else {
      router.push(href);
    }
    return true;
  };

  return { navigate };
}
