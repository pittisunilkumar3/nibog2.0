'use client';

import { useEffect, ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface WithAuthOptions {
  /**
   * The URL to redirect to if the user is not authenticated.
   * Defaults to '/login'.
   */
  redirectTo?: string;
  
  /**
   * If true, the component will not redirect but instead render null when not authenticated.
   * Useful for conditionally rendering UI elements based on auth state.
   */
  noRedirect?: boolean;
  
  /**
   * A component to render while checking authentication status.
   */
  loadingComponent?: React.ComponentType;
  
  /**
   * A component to render when the user is not authenticated.
   * Only used when noRedirect is true.
   */
  unauthenticatedComponent?: React.ComponentType;
}

/**
 * A higher-order component that wraps a component with authentication checks.
 * 
 * @param WrappedComponent The component to protect
 * @param options Configuration options
 * @returns A new component with authentication checks
 */
export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    redirectTo = '/login',
    noRedirect = false,
    loadingComponent: LoadingComponent,
    unauthenticatedComponent: UnauthenticatedComponent,
  } = options;

  function WithAuthWrapper(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // Only redirect if we're not loading, not authenticated, and not in noRedirect mode
      if (!isLoading && !isAuthenticated && !noRedirect) {
        const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
        const loginUrl = `${redirectTo}${redirectTo.includes('?') ? '&' : '?'}callbackUrl=${redirectUrl}`;
        router.push(loginUrl);
      }
    }, [isAuthenticated, isLoading, router, redirectTo, noRedirect]);

    // Show loading state
    if (isLoading) {
      return LoadingComponent ? <LoadingComponent /> : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    // Handle unauthenticated state
    if (!isAuthenticated) {
      if (noRedirect && UnauthenticatedComponent) {
        return <UnauthenticatedComponent />;
      }
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
