"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Helper function to get cookie by name
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [authState, setAuthState] = useState<'loading' | 'authorized' | 'unauthorized'>('loading')

  useEffect(() => {
    // This check only runs on client-side
    if (typeof window === 'undefined') return

    const checkAuth = () => {
      try {
        // First, check for the superadmin cookie
        const superadminToken = getCookie('superadmin-token')
        
        if (superadminToken) {
          try {
            const user = JSON.parse(decodeURIComponent(superadminToken))
            if (user.is_superadmin) {
              // Also store in localStorage for backward compatibility
              localStorage.setItem('superadmin', JSON.stringify(user))
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
