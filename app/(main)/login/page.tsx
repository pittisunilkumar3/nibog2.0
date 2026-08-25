/* eslint-disable react/no-unescaped-entities */
"use client"

import Link from "next/link"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { NibogLogo } from "@/components/nibog-logo"
import { GoogleLogin } from '@react-oauth/google'
import { Separator } from "@/components/ui/separator"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [error, setError] = useState("")
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState("")

  // Get the callback URL from the query parameters
  const requestedDestination = searchParams.get("callbackUrl") ?? searchParams.get("returnUrl")
  const destination = requestedDestination?.startsWith("/") && !requestedDestination.startsWith("//")
    ? requestedDestination
    : "/"
  const reason = searchParams.get("reason")

  // Show message if redirected due to expired session
  useEffect(() => {
    if (destination.startsWith('/register-event')) {
      setSessionExpiredMessage("Sign in to continue your child’s event registration.")
    } else if (reason === 'expired') {
      setSessionExpiredMessage("Please sign in again to continue securely.")
    }
  }, [destination, reason])

  // Handle Google login success
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true)
    setLoadingMessage("Authenticating with Google...")
    setError("")

    try {
      const response = await fetch('/api/auth/google/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Google authentication failed')
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Google authentication failed')
      }

      const userData = data.data
      const token = data.token

      // Store user data in localStorage
      const userDataForStorage = {
        user_id: userData.user_id,
        full_name: userData.full_name,
        email: userData.email,
        email_verified: userData.email_verified,
        phone: userData.phone,
        phone_verified: userData.phone_verified,
        city_id: userData.city_id,
        accepted_terms: userData.accepted_terms,
        terms_accepted_at: userData.terms_accepted_at,
        is_active: userData.is_active,
        is_locked: userData.is_locked,
        locked_until: userData.locked_until,
        deactivated_at: userData.deactivated_at,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        last_login_at: userData.last_login_at
      }
      localStorage.setItem('nibog-user', JSON.stringify(userDataForStorage))

      toast({
        title: "Login successful",
        description: "Welcome back " + userData.full_name,
      })

      setLoadingMessage("Redirecting...")
      login(userDataForStorage, token)
      await new Promise(resolve => setTimeout(resolve, 300))
      window.location.href = destination

    } catch (error: any) {
      setError(error.message || 'Google authentication failed')
      setLoadingMessage("")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Google login error
  const handleGoogleError = () => {
    setError('Google Sign-In was unsuccessful. Please try again.')
    toast({
      title: "Google Sign-In Failed",
      description: "Unable to sign in with Google. Please try again.",
      variant: "destructive"
    })
  }

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      // User is already logged in, redirect to callback URL or home
      router.push(destination)
    }
  }, [authLoading, destination, isAuthenticated, router])

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoadingMessage("Authenticating...")
    setError("")

    // Validate form
    if (!email || !password) {
      setError("Please enter both email and password")
      setIsLoading(false)
      setLoadingMessage("")
      return
    }

    try {
      // Get browser and device info
      const deviceInfo = {
        device_id: `web-${Math.random().toString(36).substring(2, 15)}`,
        os: navigator.userAgent.includes('Win') ? 'Windows' :
            navigator.userAgent.includes('Mac') ? 'MacOS' :
            navigator.userAgent.includes('Linux') ? 'Linux' :
            navigator.userAgent.includes('Android') ? 'Android' :
            navigator.userAgent.includes('iOS') ? 'iOS' : 'Unknown',
        os_version: navigator.userAgent,
        browser: navigator.userAgent.includes('Chrome') ? 'Chrome' :
                 navigator.userAgent.includes('Firefox') ? 'Firefox' :
                 navigator.userAgent.includes('Safari') ? 'Safari' :
                 navigator.userAgent.includes('Edge') ? 'Edge' : 'Unknown',
        ip_address: "0.0.0.0" // This will be set by the server
      }

      setLoadingMessage("Verifying credentials...")
      
      // Call our API route
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          device_info: deviceInfo
        }),
      })
      

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }
      
      // The data structure from our login API should be: { success: true, data: userData, token: jwtToken }
      if (!data || !data.success) {
        console.error('Login failed:', data?.error || 'Unknown error');
        throw new Error(data?.error || 'Login failed')
      }

      // Get user data and token from response
      const userData = data.data;
      const token = data.token;
      

      // Check if user is active
      if (!userData.is_active) {
        throw new Error('Account is deactivated');
      }

      // Check if user is locked
      if (userData.is_locked) {
        const lockedUntil = userData.locked_until ? new Date(userData.locked_until) : null;
        if (lockedUntil && lockedUntil > new Date()) {
          throw new Error(`Account is locked until ${lockedUntil.toLocaleString()}`);
        }
      }

      // Store user data in localStorage
      const userDataForStorage = {
        user_id: userData.user_id,
        full_name: userData.full_name,
        email: userData.email,
        email_verified: userData.email_verified,
        phone: userData.phone,
        phone_verified: userData.phone_verified,
        city_id: userData.city_id,
        accepted_terms: userData.accepted_terms,
        terms_accepted_at: userData.terms_accepted_at,
        is_active: userData.is_active,
        is_locked: userData.is_locked,
        locked_until: userData.locked_until,
        deactivated_at: userData.deactivated_at,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        last_login_at: userData.last_login_at
      };
      localStorage.setItem('nibog-user', JSON.stringify(userDataForStorage));

      // Login successful
      toast({
        title: "Login successful",
        description: "Welcome back " + userData.full_name,
      });

      setLoadingMessage("Redirecting...")

      // Store user data in auth context (this also calls setSession)
      login(userDataForStorage, token);

      // Small delay to ensure cookie is set before redirect
      await new Promise(resolve => setTimeout(resolve, 300));

      // Use window.location.href for hard navigation to ensure middleware runs fresh
      window.location.href = destination;

    } catch (error: any) {
      setError(error.message || 'An error occurred during login')
      setLoadingMessage("")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 dark:from-blue-800/70 dark:via-purple-800/70 dark:to-pink-800/70">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[calc(100svh-4.75rem)] w-full overflow-visible bg-[radial-gradient(circle_at_10%_10%,rgba(251,191,36,.22),transparent_30%),linear-gradient(145deg,#fffaf3,#f8f1ff)] px-4 py-8 dark:bg-none dark:bg-slate-950 md:px-6 md:py-10">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" role="status" aria-live="polite">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 border-2 border-pink-300 dark:border-pink-700">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="animate-pulse text-2xl">🚀</div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  Please Wait
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
                  {loadingMessage || "Processing..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add animated shapes in the background - visible only on mobile */}
      <div className="absolute inset-0 overflow-hidden -z-10 opacity-20 md:hidden pointer-events-none">
        <div className="animate-float absolute top-1/4 left-1/5 w-24 h-24 rounded-full bg-yellow-200 dark:bg-yellow-400"></div>
        <div className="animate-float-delayed absolute top-1/3 right-1/4 w-32 h-32 rounded-full bg-pink-200 dark:bg-pink-400"></div>
        <div className="animate-float-slow absolute bottom-1/4 left-1/3 w-40 h-40 rounded-full bg-blue-200 dark:bg-blue-400"></div>
        <div className="animate-spin-slow absolute top-1/2 right-1/3 w-16 h-16 bg-green-200 dark:bg-green-400 rotate-45"></div>
      </div>
      
      <div className="container relative z-10 mx-auto flex min-h-[calc(100svh-9rem)] max-w-6xl flex-col items-center justify-center">
        {/* Login card - centered on the page */}
        <div className="w-full max-w-md flex justify-center items-center py-8 md:py-0">
          <div className="w-full max-w-md rounded-3xl">
            <Card className="w-full overflow-hidden rounded-3xl border border-orange-100 bg-white/95 shadow-[0_24px_60px_-38px_rgba(55,34,20,.6)] dark:border-white/10 dark:bg-slate-900/95">
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>
            
            <CardHeader className="space-y-1 pb-4">
              <div className="flex justify-center">
                <NibogLogo className="h-16 w-auto transform transition-transform hover:scale-105" />
              </div>
              <h1 className="mt-3 text-center text-3xl font-black tracking-tight text-slate-950 dark:text-white">Welcome back</h1>
              <CardDescription className="text-center text-sm text-slate-600 dark:text-slate-300">Sign in to manage bookings and continue registration.</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 px-6">
              {sessionExpiredMessage && (
                <div className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{sessionExpiredMessage}</span>
                </div>
              )}
              {error && (
                <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800" role="alert" aria-live="assertive">
                  <span className="mr-2">⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-purple-700 dark:text-purple-300 font-medium">Your Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    aria-invalid={Boolean(error)}
                    className="h-12 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-purple-700 dark:text-purple-300 font-medium">Password</Label>
                    <Link href="/forgot-password" className="text-xs text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      aria-invalid={Boolean(error)}
                      className="h-12 rounded-xl border border-slate-200 pr-12 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-gray-500 hover:bg-slate-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-200 disabled:opacity-50"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  className="h-12 w-full rounded-full bg-[#ef5f52] px-4 font-black text-white hover:bg-[#dc4e43]"
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Entering the portal...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <span className="mr-2">🚀</span> Let's Go!
                    </span>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">Or continue with</span>
                </div>
              </div>

              {/* Google Sign-In Button */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  width="280"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-2 pb-6 border-t border-purple-100 dark:border-purple-900 pt-4">
              <div className="text-center text-sm text-purple-600 dark:text-purple-400">
                Don&apos;t have an account?{" "}
                <Link href={`/register?returnUrl=${encodeURIComponent(destination)}`} className="inline-flex min-h-11 items-center px-1 text-pink-600 dark:text-pink-400 font-medium underline-offset-4 hover:underline hover:text-pink-700 dark:hover:text-pink-300 transition-colors">
                  Sign up
                </Link>
              </div>

              {destination !== "/" && (
                <div className="mt-2 text-center text-xs text-blue-600 dark:text-blue-400">
                  You'll be redirected back to complete your journey after login.
                </div>
              )}
            </CardFooter>
          </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading login...</div>}>
      <LoginContent />
    </Suspense>
  )
}
