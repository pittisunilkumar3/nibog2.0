"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { setSession, clearSession, isClientAuthenticated, getSession, isTokenExpired } from '@/lib/auth/session'

// Define the user type based on the API response
interface User {
  user_id: number
  full_name: string
  email: string
  email_verified: boolean
  phone: string
  phone_verified: boolean
  password_hash?: string // This is included in the response but shouldn't be used
  city_id: number
  accepted_terms: boolean
  terms_accepted_at: string | null
  is_active: boolean
  is_locked: boolean
  locked_until: string | null
  deactivated_at: string | null
  created_at: string
  updated_at: string
  last_login_at: string | null
  token?: string
}

// Define the auth context type
interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (userData: User, token: string) => void
  logout: () => void
  isAuthenticated: boolean
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => { },
  logout: () => { },
  isAuthenticated: false,
})

// Create a provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Login function
  const login = useCallback((userData: User, token: string) => {
    setUser(userData)
    setSession(token)
    // Store user data in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('nibog-user', JSON.stringify(userData))
    }
  }, [])

  // Logout function
  const logout = useCallback(async () => {

    // Try server-side logout (clears httpOnly cookies if any)
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.warn('Server logout failed (continuing client cleanup):', error)
    }

    // Clear client-side session and user data
    clearSession()
    try {
      localStorage.removeItem('nibog-user')
      localStorage.removeItem('user')
      localStorage.removeItem('adminToken')
      sessionStorage.removeItem('adminToken')
      localStorage.removeItem('superadmin')
      sessionStorage.removeItem('superadmin')
      sessionStorage.clear()
    } catch (e) {
      console.warn('Error clearing storage during logout:', e)
    }

    // Update in-memory state and redirect
    setUser(null)
    window.location.href = '/'
  }, []);

  // Periodic token expiry check (auto-logout)
  useEffect(() => {
    let interval: number | undefined

    const checkToken = async () => {
      try {
        const token = await getSession()
        if (!token) {
          // No token, skip check
          return
        }
        
        if (isTokenExpired(token)) {
          console.info('[AuthContext] Token expired - auto logging out')

          // Best-effort server-side logout to clear httpOnly cookies
          try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
          } catch (e) {
            console.warn('Server logout failed during expiry cleanup:', e)
          }

          // Clear client-side session and storage
          clearSession()
          try {
            localStorage.removeItem('nibog-user')
            localStorage.removeItem('user')
            localStorage.removeItem('adminToken')
            sessionStorage.removeItem('adminToken')
            localStorage.removeItem('superadmin')
            sessionStorage.removeItem('superadmin')
            sessionStorage.clear()
          } catch (e) {
            console.warn('Error clearing storage during expiry cleanup:', e)
          }

          setUser(null)

          // Define public pages that should never trigger login redirect
          const publicPages = [
            '/',
            '/login',
            '/register',
            '/forgot-password',
            '/reset-password',
            '/about',
            '/contact',
            '/events',
            '/baby-olympics',
            '/faq',
            '/privacy',
            '/terms',
            '/refund',
            '/payment-callback'
          ]
          const isPublicPage = publicPages.some(page => pathname === page || pathname.startsWith(page + '/'))
          
          // NEVER redirect from public pages - just clear session silently
          if (!isPublicPage && pathname !== '/login') {
            console.info('[AuthContext] Redirecting to login from protected page:', pathname)
            window.location.href = '/login?reason=expired&callbackUrl=' + encodeURIComponent(pathname)
          } else if (isPublicPage) {
            console.info('[AuthContext] On public page, session cleared but not redirecting:', pathname)
          }
        }
      } catch (e) {
        console.warn('Error checking token expiry:', e)
      }
    }

    // Only check token if user is actually logged in AND we have a user object
    // This prevents checks when user is null (not logged in)
    if (user && user.user_id) {
      checkToken()
    }

    // Check every 60s (increased from 30s to reduce frequency)
    // Only run interval if user is logged in
    if (user && user.user_id) {
      interval = window.setInterval(() => {
        if (user && user.user_id) {
          checkToken()
        }
      }, 60 * 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [user, pathname])

  // Listen for storage changes to sync logout across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'nibog-session' && !e.newValue) {
        // session removed in another tab
        setUser(null)
      }
      if ((e.key === 'superadmin' || e.key === 'adminToken') && !e.newValue) {
        setUser(null)
      }
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = isClientAuthenticated();

        if (authenticated && typeof window !== 'undefined') {
          // Verify token expiry before setting user
          const token = await getSession();
          if (!token) {
            console.info('[AuthContext] Entry check: No token found. Clearing session.');
            clearSession();
            setUser(null);
            setIsLoading(false);
            return;
          }
          
          if (isTokenExpired(token)) {
            console.info('[AuthContext] Entry check: Token expired. Clearing session.');
            clearSession();
            setUser(null);
            setIsLoading(false);
            return;
          }

          const storedUser = localStorage.getItem('nibog-user') || localStorage.getItem('user');

          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              setUser(userData);

              // Migrate old key to new key
              if (localStorage.getItem('user')) {
                localStorage.setItem('nibog-user', storedUser);
                localStorage.removeItem('user');
              }
            } catch (e) {
              console.error('[AuthContext] Error parsing user data:', e);
              setUser(null);
            }
          } else {
            // Session exists but no user data, clear session
            clearSession();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('[AuthContext] Error checking authentication:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Create a hook to use the auth context
export const useAuth = () => useContext(AuthContext)
