'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { isClientAuthenticated } from '@/lib/auth/session';

interface UseProtectedNavigationOptions {
  /**
   * The URL to redirect to if the user is not authenticated
   * @default '/login'
   */
  loginPath?: string;
  
  /**
   * If true, the hook will not redirect but instead return the authentication status
   * @default false
   */
  noRedirect?: boolean;
  
  /**
   * A callback function that will be called if the user is not authenticated
   */
  onUnauthenticated?: () => void;
}

/**
 * A hook that provides protected navigation functionality
 * It checks if the user is authenticated before navigating to a protected route
 * If the user is not authenticated, it will redirect to the login page
 * @returns An object with navigation functions
 */
export function useProtectedNavigation(options: UseProtectedNavigationOptions = {}) {
  const {
    loginPath = '/login',
    noRedirect = false,
    onUnauthenticated,
  } = options;
  
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  /**
   * Navigate to a protected route
   * If the user is not authenticated, they will be redirected to the login page
   * @param path The path to navigate to
   * @param replace If true, replaces the current entry in the history stack
   */
  const navigate = useCallback(async (
    path: string,
    replace: boolean = false
  ): Promise<boolean> => {
    // Check authentication status
    const isAuth = isAuthenticated || (await isClientAuthenticated());
    
    if (!isAuth) {
      // Call the onUnauthenticated callback if provided
      if (onUnauthenticated) {
        onUnauthenticated();
        return false;
      }
      
      // If noRedirect is true, return false without redirecting
      if (noRedirect) {
        return false;
      }
      
      // Redirect to login with the intended URL
      const redirectUrl = encodeURIComponent(path);
      const loginUrl = `${loginPath}?callbackUrl=${redirectUrl}`;
      
      if (replace) {
        router.replace(loginUrl);
      } else {
        router.push(loginUrl);
      }
      
      return false;
    }
    
    // If authenticated, proceed with navigation
    if (replace) {
      router.replace(path);
    } else {
      router.push(path);
    }
    
    return true;
  }, [isAuthenticated, loginPath, noRedirect, onUnauthenticated, router]);
  
  /**
   * Check if the current user is authenticated
   * This is useful for conditional rendering
   */
  const checkAuth = useCallback(async (): Promise<boolean> => {
    return isAuthenticated || (await isClientAuthenticated());
  }, [isAuthenticated]);

  return {
    /**
     * Navigate to a protected route
     * @param path The path to navigate to
     * @param replace If true, replaces the current entry in the history stack
     */
    navigate,
    
    /**
     * Check if the current user is authenticated
     */
    checkAuth,
    
    /**
     * The current authentication status
     * Note: This is only reliable on the client side after the initial render
     * For server-side checks, use the server-auth utilities
     */
    isAuthenticated,
  };
}
