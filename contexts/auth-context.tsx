"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { setSession, clearSession, isClientAuthenticated } from '@/lib/auth/session'

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
  const logout = () => {
    console.log('Logout initiated - redirecting to logout page');
    // Redirect to logout page which will handle all cleanup
    window.location.href = '/logout';
  };

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await isClientAuthenticated()
        if (isAuthenticated && typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('nibog-user') || localStorage.getItem('user')
          if (storedUser) {
            setUser(JSON.parse(storedUser))
            // Migrate old key to new key
            if (localStorage.getItem('user')) {
              localStorage.setItem('nibog-user', storedUser)
              localStorage.removeItem('user')
            }
          } else {
            // Session exists but no user data, clear session
            clearSession()
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
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
