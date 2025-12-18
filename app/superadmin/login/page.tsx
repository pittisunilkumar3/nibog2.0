"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { AUTH_API } from "@/config/api"
import { NibogLogo } from "@/components/nibog-logo"

export default function SuperAdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("") // State for error message
  const router = useRouter()
  const [redirectTo, setRedirectTo] = useState('/admin')

  // Get redirect parameter from URL and clear any stored credentials
  useEffect(() => {
    // Clear any stored credentials to prevent automatic login
    localStorage.removeItem('superadmin')
    sessionStorage.removeItem('superadmin')
    document.cookie = 'superadmin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;'

    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('redirect')
    if (redirect) {
      setRedirectTo(redirect)
    }
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("") // Clear any previous error messages

    try {
      console.log('Attempting login with:', { email })

      // Regular API-based authentication flow
      const response = await fetch('/api/auth/proxy/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })

      console.log('Login response status:', response.status)
      const data = await response.json()
      console.log('Login response data:', data)

      // Check if login was successful
      if (!data.success) {
        throw new Error(data.message || 'Login failed: Invalid email or password.')
      }

      // Double check that we have valid employee data
      if (!data.employee) {
        throw new Error('Access denied: Invalid response data.')
      }

      // Check superadmin privileges (redundant if API checks, but good for safety)
      if (data.employee.is_superadmin !== 1) {
        throw new Error('Access denied: This account does not have superadmin privileges.')
      }

      // Store user data and token in localStorage, sessionStorage and cookies
      const userData = data.employee
      const authToken = data.token
      console.log('Storing user data and token')
      localStorage.setItem('superadmin', JSON.stringify(userData))
      sessionStorage.setItem('superadmin', JSON.stringify(userData))
      // Store the authentication token for API calls
      if (authToken) {
        localStorage.setItem('adminToken', authToken)
        sessionStorage.setItem('adminToken', authToken)
      }
      // Cookie is already set by the API route (HttpOnly or not), but we can set a client-side readable one if needed
      // The API route sets 'superadmin-token'.
      // We'll set a simple flag or the data as well for client-side logic consistency if implied by previous code.
      document.cookie = `superadmin-token=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=${60 * 60 * 24 * 7}`


      console.log('Login successful, redirecting to', redirectTo)
      // Force a full page reload to ensure cookies are properly set
      window.location.href = redirectTo
    } catch (error) {
      console.error('Login error:', error)

      // Determine the appropriate error message
      let errorTitle = "Login Failed"
      let errorMessage = 'An error occurred during login. Please try again.'

      if (error instanceof Error) {
        if (error.message.includes('Invalid email or password')) {
          errorTitle = "Invalid Credentials"
          errorMessage = 'The email or password you entered is incorrect. Please try again.'
        } else if (error.message.includes('does not have superadmin privileges')) {
          errorTitle = "Access Denied"
          errorMessage = 'This account does not have superadmin access privileges.'
        } else if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
          errorTitle = "Connection Error"
          errorMessage = 'Unable to connect to the authentication server. Please check your internet connection and try again.'
        } else {
          errorMessage = error.message
        }
      }

      // Set the error message to display on the card
      setErrorMessage(`${errorTitle}: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Toaster />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <NibogLogo className="h-12 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Super Admin Portal
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the admin dashboard
          </CardDescription>
          {errorMessage && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {errorMessage}
            </div>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="text-center text-sm text-gray-500">
              <span>Regular admin? </span>
              <Link href="/admin/login" className="font-medium text-primary hover:underline">
                Go to Admin Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
