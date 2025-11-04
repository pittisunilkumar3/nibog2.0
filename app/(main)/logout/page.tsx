'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call logout API to clear server-side cookies
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        // Clear all client-side storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('nibog-user')
          localStorage.removeItem('user')
          localStorage.removeItem('nibog-session')
          sessionStorage.clear()
        }

        // Clear cookies client-side
        const cookiesToClear = ['nibog-session', 'superadmin-token', 'user-token', 'user']
        cookiesToClear.forEach(cookieName => {
          document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
          document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
          document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=Lax`
        })

        // Wait a moment then redirect with full page reload
        setTimeout(() => {
          window.location.href = '/'
        }, 100)
      } catch (error) {
        console.error('Logout error:', error)
        // Even if there's an error, redirect to home
        window.location.href = '/'
      }
    }

    performLogout()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Logging out...</h1>
        <p className="text-gray-600">Please wait while we log you out.</p>
      </div>
    </div>
  )
}
