"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
})

// Create a provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

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
    console.log('Logout initiated - performing cleanup');

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
        if (token && isTokenExpired(token)) {
          console.info('Token expired - auto logging out and reloading')

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

          // Force full reload so the app/middleware re-evaluates auth state
          window.location.reload()
        }
      } catch (e) {
        console.warn('Error checking token expiry:', e)
      }
    }

    // Initial check
    checkToken()

    // Check every 60s
    interval = window.setInterval(checkToken, 60 * 1000)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [logout])

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
        console.log('[AuthContext] Checking authentication...');
        const authenticated = isClientAuthenticated();
        console.log('[AuthContext] Is authenticated:', authenticated);
        
        if (authenticated && typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('nibog-user') || localStorage.getItem('user');
          console.log('[AuthContext] Stored user found:', !!storedUser);
          
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            console.log('[AuthContext] User set:', userData.email);
            
            // Migrate old key to new key
            if (localStorage.getItem('user')) {
              localStorage.setItem('nibog-user', storedUser);
              localStorage.removeItem('user');
            }
          } else {
            // Session exists but no user data, clear session
            console.log('[AuthContext] Session exists but no user data, clearing');
            clearSession();
            setUser(null);
          }
        } else {
          console.log('[AuthContext] Not authenticated');
          setUser(null);
        }
      } catch (error) {
        console.error('[AuthContext] Error checking authentication:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
        console.log('[AuthContext] Auth check complete');
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
