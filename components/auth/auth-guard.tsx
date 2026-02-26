"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { isTokenExpired } from '@/lib/auth/session'

// Helper function to get cookie by name
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Clear all admin/superadmin session data
function clearAdminSession() {
  if (typeof window === 'undefined') return
  
  // Clear localStorage
  localStorage.removeItem('superadmin')
  localStorage.removeItem('adminToken')
  
  // Clear sessionStorage
  sessionStorage.removeItem('superadmin')
  sessionStorage.removeItem('adminToken')
  sessionStorage.clear()
  
  // Clear cookies
  const domains = ['', `.${window.location.hostname}`, window.location.hostname]
  const paths = ['/', '']
  
  domains.forEach(domain => {
    paths.forEach(path => {
      document.cookie = `superadmin-token=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT${domain ? `; domain=${domain}` : ''}`
      document.cookie = `superadmin-token=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${domain ? `; domain=${domain}` : ''}`
    })
  })
}

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [authState, setAuthState] = useState<'loading' | 'authorized' | 'unauthorized'>('loading')

  // Function to check if admin token is expired
  const checkTokenExpiry = useCallback(() => {
    if (typeof window === 'undefined') return false
    
    try {
      const adminToken = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken')
      
      if (adminToken && isTokenExpired(adminToken)) {
        console.info('[AuthGuard] SuperAdmin token expired - auto logging out')
        
        // Clear all session data
        clearAdminSession()
        
        // Update state
        setAuthState('unauthorized')
        
        // Redirect to superadmin login with reason
        const loginUrl = `/superadmin/login?reason=expired`
        window.location.href = loginUrl
        
        return true // Token was expired
      }
      
      return false // Token is valid or not present
    } catch (e) {
      console.warn('[AuthGuard] Error checking token expiry:', e)
      return false
    }
  }, [])

  useEffect(() => {
    // This check only runs on client-side
    if (typeof window === 'undefined') return

    const checkAuth = () => {
      try {
        // First, check for the superadmin cookie
        const superadminToken = getCookie('superadmin-token')
        
        if (superadminToken) {
          try {
            // Try to parse as JSON first (legacy format)
            let user
            try {
              user = JSON.parse(decodeURIComponent(superadminToken))
            } catch (e) {
              // If not JSON, might be a JWT token - check cookie expiry separately
              // The cookie itself has max-age, so if it exists and is valid, allow access
              user = { is_superadmin: true }
            }
            
            if (user.is_superadmin) {
              // Check token expiry before authorizing
              const adminToken = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken')
              if (adminToken && isTokenExpired(adminToken)) {
                // Token expired - clear and redirect
                clearAdminSession()
                setAuthState('unauthorized')
                window.location.href = '/superadmin/login?reason=expired'
                return
              }
              
              // Also store in localStorage for backward compatibility
              if (user.email) {
                localStorage.setItem('superadmin', JSON.stringify(user))
              }
              setAuthState('authorized')
              return
            }
          } catch (e) {
            console.error('Error parsing superadmin token:', e)
          }
        }

        // Fall back to localStorage check for backward compatibility
        const superadminData = localStorage.getItem('superadmin')
        if (superadminData) {
          const user = JSON.parse(superadminData)

          // If we have a stored admin token, check its expiry
          const adminToken = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken')
          if (adminToken && isTokenExpired(adminToken)) {
            // Token expired - clear stored data and redirect to login
            clearAdminSession()
            setAuthState('unauthorized')
            window.location.href = '/superadmin/login?reason=expired'
            return
          }

          if (user.is_superadmin) {
            setAuthState('authorized')
            return
          }
        }

        // If we get here, user is not authenticated
        setAuthState('unauthorized')
        // Force a hard redirect instead of using Next.js router
        window.location.href = '/superadmin/login'
      } catch (error) {
        console.error('Auth check error:', error)
        setAuthState('unauthorized')
        // Use window.location for consistent redirect behavior
        window.location.href = '/superadmin/login'
      }
    }

    checkAuth()
  }, [router])
  
  // Periodic token expiry check (every 60 seconds)
  useEffect(() => {
    // Only run if authorized
    if (authState !== 'authorized') return
    
    // Don't run on login page
    if (pathname === '/superadmin/login' || pathname === '/admin/login') return
    
    // Check immediately
    checkTokenExpiry()
    
    // Set up interval for periodic checks
    const interval = setInterval(() => {
      checkTokenExpiry()
    }, 60 * 1000) // Check every 60 seconds
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [authState, pathname, checkTokenExpiry])
  
  // Listen for storage changes to sync logout across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if ((e.key === 'superadmin' || e.key === 'adminToken') && !e.newValue) {
        // Session removed in another tab
        setAuthState('unauthorized')
        window.location.href = '/superadmin/login'
      }
    }
    
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Show loading state while checking authentication
  if (authState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If unauthorized but still here, redirect to login
  if (authState === 'unauthorized') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <p>Redirecting to login page...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Only render children if authorized
  return <>{children}</>
}
