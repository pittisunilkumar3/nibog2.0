'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { isClientAuthenticated } from '@/lib/auth/session';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string; // Optional role requirement
}

function ProtectedRouteContent({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a user in context
        if (isAuthenticated && user) {
          // If a role is required, check if the user has it
          if (requiredRole) {
            // TODO: Implement role-based access control
            // For now, just check if user has any role
            const hasRequiredRole = true; // Replace with actual role check
            setIsAuthorized(hasRequiredRole);
            if (!hasRequiredRole) {
              router.push('/unauthorized');
              return;
            }
          } else {
            setIsAuthorized(true);
          }
        } else {
          // Fallback to cookie check if context is not loaded yet
          const authenticated = await isClientAuthenticated();
          if (!authenticated) {
            // Store the current URL for redirecting back after login
            const redirectUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
            router.push(`/login?callbackUrl=${encodeURIComponent(redirectUrl)}`);
            return;
          }
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router, searchParams, isAuthenticated, user, requiredRole]);

  if (isLoading) {
    // Show a loading spinner or skeleton while checking auth
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    // Don't render anything if not authorized - the useEffect will handle the redirect
    return null;
  }

  return <>{children}</>;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <ProtectedRouteContent requiredRole={requiredRole}>
        {children}
      </ProtectedRouteContent>
    </Suspense>
  );
}
