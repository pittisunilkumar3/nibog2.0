"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { NibogLogo } from "@/components/nibog-logo"
import { GoogleLogin } from "@react-oauth/google"

// Image slideshow component
function ImageSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = [
    '/images/ball-throw.jpg',
    '/images/cycle-race.jpg',
    '/images/running-race.jpg',
    '/images/hurdle-toddle.jpg',
  ];
  
  // Auto advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); // Change slide every 4 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg">
      {images.map((image, index) => (
        <div 
          key={image}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <Image 
            src={image} 
            alt={`NIBOG Games Activity ${index + 1}`}
            fill
            priority={index === 0}
            className="object-cover object-center"
            sizes="(max-width: 768px) 0vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <h3 className="text-2xl font-bold mb-2 drop-shadow-md">
                {index === 0 && "Ball Throwing Competition"}
                {index === 1 && "Exciting Cycle Race"}
                {index === 2 && "Fun Running Race"}
                {index === 3 && "Hurdle Toddle Challenge"}
              </h3>
              <p className="text-sm md:text-base drop-shadow-md">
                Join us for exciting kids' events at NIBOG Games!
              </p>
            </div>
          </div>
        </div>
      ))}
      
      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-white w-6' : 'bg-white/50'}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Google Sign-In handlers
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true)
      setError("")

      console.log('Google credential received:', credentialResponse.credential?.substring(0, 20) + '...')

      // Send the Google credential to our backend via our API route
      const response = await fetch('/api/auth/google/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      })

      console.log('API response status:', response.status)
      const data = await response.json()
      console.log('API response data:', JSON.stringify(data, null, 2))

      if (!response.ok) {
        console.error('API error:', data)
        throw new Error(data.error || 'Google sign-in failed')
      }

      // Backend returns {success: true, token: "...", user: {...}}
      if (!data.success || !data.token || !data.user) {
        console.error('Invalid response structure:', data)
        console.error('Expected: {success, token, user}')
        console.error('Got - success:', data.success, 'token:', !!data.token, 'user:', !!data.user)
        throw new Error('Invalid response from server. Please try again.')
      }

      const userData = data.user
      const token = data.token

      console.log('User data received:', userData)
      console.log('Token received:', token.substring(0, 20) + '...')

      // Store user data in localStorage - use whatever fields the backend provides
      const userDataForStorage = {
        user_id: userData.user_id || userData.id,
        full_name: userData.full_name || userData.name,
        email: userData.email,
        email_verified: userData.email_verified ?? true,
        phone: userData.phone || '',
        phone_verified: userData.phone_verified ?? false,
        city_id: userData.city_id || null,
        accepted_terms: userData.accepted_terms ?? true,
        terms_accepted_at: userData.terms_accepted_at || null,
        is_active: userData.is_active ?? true,
        is_locked: userData.is_locked ?? false,
        locked_until: userData.locked_until || null,
        deactivated_at: userData.deactivated_at || null,
        created_at: userData.created_at || new Date().toISOString(),
        updated_at: userData.updated_at || new Date().toISOString(),
        last_login_at: userData.last_login_at || new Date().toISOString()
      }

      console.log('Normalized user data:', userDataForStorage)

      localStorage.setItem('user', JSON.stringify(userDataForStorage))
      localStorage.setItem('token', token)
      localStorage.setItem('authMethod', 'google')

      // Update auth context (if using AuthContext)
      // login(userDataForStorage, token)

      // Success notification
      toast({
        title: "✨ Welcome to NIBOG!",
        description: `Account created/signed in successfully as ${userData.full_name || userData.name}`,
      })

      // Redirect to home or dashboard
      setTimeout(() => {
        router.push('/')
      }, 500)

    } catch (error: any) {
      console.error('Google Sign-In Error:', error)
      setError(error.message || 'Failed to sign in with Google')
      toast({
        title: "Sign-in failed",
        description: error.message || 'Failed to sign in with Google',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleError = () => {
    console.error('Google Sign-In Error')
    setError('Failed to sign in with Google')
    toast({
      title: "Sign-in failed",
      description: 'Failed to sign in with Google. Please try again.',
      variant: "destructive",
    })
  }

  // Email validation function
  const isValidEmail = (email: string) => {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate form
    if (!fullName || !email || !phone || !password) {
      setError("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    // Validate email format
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    if (!termsAccepted) {
      setError("You must accept the terms and conditions")
      setIsLoading(false)
      return
    }

    try {
      // Call our API route
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          password,
          city_id: null,
          accept_terms: termsAccepted
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Registration successful
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      })

      // Redirect to login page
      router.push('/login')

    } catch (error: any) {
      setError(error.message || 'An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 dark:from-blue-800/70 dark:via-purple-800/70 dark:to-pink-800/70 py-0 md:py-8 px-0 md:px-4">
      {/* Add animated shapes in the background - visible only on mobile */}
      <div className="absolute inset-0 overflow-hidden z-0 opacity-20 md:hidden">
        <div className="animate-float absolute top-1/4 left-1/5 w-24 h-24 rounded-full bg-yellow-200 dark:bg-yellow-400"></div>
        <div className="animate-float-delayed absolute top-1/3 right-1/4 w-32 h-32 rounded-full bg-pink-200 dark:bg-pink-400"></div>
        <div className="animate-float-slow absolute bottom-1/4 left-1/3 w-40 h-40 rounded-full bg-blue-200 dark:bg-blue-400"></div>
        <div className="animate-spin-slow absolute top-1/2 right-1/3 w-16 h-16 bg-green-200 dark:bg-green-400 rotate-45"></div>
      </div>
      
      <div className="container relative z-10 mx-auto flex flex-col md:flex-row h-[calc(100vh-4rem)] items-center justify-center max-w-6xl">
        {/* Left side with slideshow - visible only on md and up */}
        <div className="hidden md:block md:w-1/2 relative h-full">
          <div className="absolute inset-0 rounded-2xl overflow-hidden m-4 bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700">
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,190,255,0.6),rgba(255,182,193,0.6))] rounded-2xl"></div>
            <div className="absolute inset-0 z-10">
              <ImageSlideshow />
            </div>
          </div>
        </div>
        
        {/* Right side with signup card */}
        <div className="w-full md:w-1/2 flex justify-center items-center py-8 md:py-0 md:px-8 md:h-full">
          <div className="w-full max-w-md p-2 rounded-2xl" style={{animation: 'pulse-slow 3s ease-in-out infinite'}}>
            <Card className="w-full rounded-xl shadow-xl bg-white/90 dark:bg-gray-900/90 border-2 border-pink-300 dark:border-pink-700 overflow-hidden transition-all hover:shadow-inner transform hover:-translate-y-1">
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>
        <CardHeader className="space-y-1 pb-4">
          <div className="flex justify-center">
            <NibogLogo className="h-16 w-auto transform transition-transform hover:scale-105" />
          </div>
          <CardDescription className="text-center text-blue-600 dark:text-blue-300 mt-4 text-2xl font-bold tracking-wider">
            Create an Account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-500 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-800 animate-pulse">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-purple-700 dark:text-purple-300 font-medium">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="rounded-xl border-2 border-blue-200 dark:border-blue-800 focus:border-purple-400 dark:focus:border-purple-600 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-purple-700 dark:text-purple-300 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl border-2 border-blue-200 dark:border-blue-800 focus:border-purple-400 dark:focus:border-purple-600 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-purple-700 dark:text-purple-300 font-medium">Mobile Number</Label>
              <Input
                id="phone"
                placeholder="Enter your 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="rounded-xl border-2 border-blue-200 dark:border-blue-800 focus:border-purple-400 dark:focus:border-purple-600 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-purple-700 dark:text-purple-300 font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-xl border-2 border-blue-200 dark:border-blue-800 focus:border-purple-400 dark:focus:border-purple-600 transition-all pr-10"
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
            <div className="flex items-start space-x-2 mt-4">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                required
                className="mt-1 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
              />
              <Label
                htmlFor="terms"
                className="text-sm font-normal leading-tight text-blue-700 dark:text-blue-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the{" "}
                <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
                  terms and conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
                  privacy policy
                </Link>
              </Label>
            </div>
            <Button 
              className="w-full mt-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium py-2 px-4 transition-all duration-300 transform hover:scale-105 hover:shadow-lg" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating your account...
                </span>
              ) : "Sign up"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-purple-200 dark:border-purple-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-900 px-2 text-purple-600 dark:text-purple-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign-In */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              theme="outline"
              size="large"
              text="signup_with"
              shape="rectangular"
              logo_alignment="left"
            />
          </div>
          {/* Commented out Google and Phone OTP login options
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full">
              Google
            </Button>
            <Button variant="outline" className="w-full">
              Phone OTP
            </Button>
          </div>
          */}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="text-center text-sm text-blue-700 dark:text-blue-300">
            Already have an account?{" "}
            <Link href="/login" className="text-pink-600 dark:text-pink-400 font-medium hover:underline">
              Login here
            </Link>
          </div>
        </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
