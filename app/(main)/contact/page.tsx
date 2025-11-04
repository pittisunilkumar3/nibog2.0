"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { AnimatedBackground } from "@/components/animated-background"
import { useToast } from "@/hooks/use-toast"

interface FormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

export default function ContactPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
        toast({
          title: "Message Sent Successfully! ✅",
          description: result.message,
        })
      } else {
        throw new Error(result.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Contact form error:', error)
      toast({
        title: "Error Sending Message",
        description: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatedBackground variant="contact">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sunshine-100 via-coral-100 to-mint-100 dark:from-sunshine-900/20 dark:via-coral-900/20 dark:to-mint-900/20 py-16 sm:py-20 md:py-28">
        {/* Floating decorative elements - hidden on mobile for better performance */}
        <div className="hidden sm:block absolute top-10 left-10 w-16 sm:w-20 h-16 sm:h-20 bg-sunshine-300 rounded-full opacity-20 animate-float"></div>
        <div className="hidden sm:block absolute top-20 right-20 w-12 sm:w-16 h-12 sm:h-16 bg-coral-300 rounded-full opacity-20 animate-float-delayed"></div>
        <div className="hidden sm:block absolute bottom-20 left-20 w-20 sm:w-24 h-20 sm:h-24 bg-mint-300 rounded-full opacity-20 animate-bounce-gentle"></div>
        <div className="hidden sm:block absolute bottom-10 right-10 w-16 sm:w-18 h-16 sm:h-18 bg-lavender-300 rounded-full opacity-20 animate-float-slow"></div>

        <div className="container relative z-10 px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center space-y-6 sm:space-y-8">
            <Badge className="px-4 sm:px-8 py-3 sm:py-4 text-lg sm:text-xl font-bold bg-gradient-to-r from-sunshine-400 to-coral-400 text-neutral-charcoal rounded-full shadow-xl animate-bounce-gentle border-2 sm:border-4 border-white/50">
              📞 Contact NIBOG
            </Badge>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sunshine-500 via-coral-500 to-mint-500 bg-[length:200%_auto] animate-rainbow-shift">
                Contact Us
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-charcoal/80 dark:text-white/80 leading-relaxed max-w-3xl mx-auto px-4 sm:px-0">
              We'd love to hear from you! Reach out to the <span className="font-bold text-sunshine-600">NIBOG team</span> with any
              <span className="font-bold text-coral-600"> questions</span> or
              <span className="font-bold text-mint-600"> inquiries</span> 💬
            </p>

            {/* Fun emoji decorations */}
            <div className="flex justify-center gap-3 sm:gap-6 text-2xl sm:text-4xl">
              <span className="animate-bounce-gentle">📞</span>
              <span className="animate-bounce-gentle" style={{animationDelay: '0.5s'}}>💬</span>
              <span className="animate-bounce-gentle" style={{animationDelay: '1s'}}>📧</span>
              <span className="animate-bounce-gentle" style={{animationDelay: '1.5s'}}>🤝</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="relative py-12 sm:py-16 md:py-20 bg-gradient-to-br from-lavender-100 via-mint-50 to-coral-50 dark:from-lavender-900/20 dark:via-mint-900/20 dark:to-coral-900/20 overflow-hidden">
        {/* Decorative background elements - hidden on mobile */}
        <div className="hidden sm:block absolute top-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-sunshine-300 rounded-full opacity-10 animate-float"></div>
        <div className="hidden sm:block absolute bottom-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-coral-300 rounded-full opacity-10 animate-float-delayed"></div>
        <div className="hidden sm:block absolute top-1/2 left-1/4 w-20 sm:w-24 h-20 sm:h-24 bg-mint-300 rounded-full opacity-10 animate-bounce-gentle"></div>

        <div className="container relative z-10 px-4 sm:px-6">
          <div className="grid gap-8 sm:gap-12 md:gap-16 md:grid-cols-2">
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-3 sm:space-y-4">
                <Badge className="px-3 sm:px-4 py-2 text-sm font-bold bg-gradient-to-r from-sunshine-400 to-coral-400 text-neutral-charcoal rounded-full w-fit">
                  💬 Get in Touch
                </Badge>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-sunshine-600 via-coral-600 to-mint-600">
                    Get in Touch
                  </span>
                </h2>
                <p className="text-base sm:text-lg text-neutral-charcoal/70 dark:text-white/70 leading-relaxed">
                  Have questions about our events, registration process, or anything else? Our team is here to help!
                </p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="card-baby-gradient p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-white/50 hover:scale-105 transition-all duration-300 touch-manipulation">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="bg-gradient-to-br from-sunshine-400 to-sunshine-600 rounded-full p-3 sm:p-4 shadow-lg animate-medal-shine">
                      <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-neutral-charcoal dark:text-white">📞 Phone</h3>
                      <p className="text-base sm:text-lg font-semibold text-sunshine-700 mt-1 sm:mt-2 break-all">+91-8977939614/15</p>
                      <p className="text-neutral-charcoal/70 dark:text-white/70 text-xs sm:text-sm mt-1">Call us for immediate assistance</p>
                    </div>
                  </div>
                </div>

                <div className="card-baby-gradient p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-white/50 hover:scale-105 transition-all duration-300 touch-manipulation">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="bg-gradient-to-br from-coral-400 to-coral-600 rounded-full p-3 sm:p-4 shadow-lg animate-medal-shine">
                      <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-neutral-charcoal dark:text-white">📧 Email</h3>
                      <p className="text-base sm:text-lg font-semibold text-coral-700 mt-1 sm:mt-2 break-all">newindiababyolympics@gmail.com</p>
                      <p className="text-neutral-charcoal/70 dark:text-white/70 text-xs sm:text-sm mt-1">Send us your queries anytime</p>
                    </div>
                  </div>
                </div>

                <div className="card-baby-gradient p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-white/50 hover:scale-105 transition-all duration-300 touch-manipulation">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="bg-gradient-to-br from-mint-400 to-mint-600 rounded-full p-3 sm:p-4 shadow-lg animate-medal-shine">
                      <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-neutral-charcoal dark:text-white">🏢 Head Office</h3>
                      <p className="text-base sm:text-lg font-semibold text-mint-700 mt-1 sm:mt-2">
                        NIBOG, P.No:18, H.NO 33-30/4,<br />
                        Officers Colony, R.K Puram,<br />
                        Hyderabad - 500056
                      </p>
                      <p className="text-neutral-charcoal/70 dark:text-white/70 text-xs sm:text-sm mt-1">Visit us at our headquarters</p>
                    </div>
                  </div>
                </div>

                <div className="card-baby-gradient p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-white/50 hover:scale-105 transition-all duration-300 touch-manipulation">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="bg-gradient-to-br from-lavender-400 to-lavender-600 rounded-full p-3 sm:p-4 shadow-lg animate-medal-shine">
                      <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-neutral-charcoal dark:text-white">🕒 Office Hours</h3>
                      <p className="text-base sm:text-lg font-semibold text-lavender-700 mt-1 sm:mt-2">
                        Monday - Sunday<br />
                        10:00 AM - 6:00 PM
                      </p>
                      <p className="text-neutral-charcoal/70 dark:text-white/70 text-xs sm:text-sm mt-1">We're here to help every day!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Badge className="px-3 sm:px-4 py-2 text-sm font-bold bg-gradient-to-r from-lavender-400 to-mint-400 text-neutral-charcoal rounded-full w-fit">
                    🌐 Follow Us
                  </Badge>
                  <h3 className="text-xl sm:text-2xl font-bold text-neutral-charcoal dark:text-white">Connect With Us</h3>
                  <p className="text-neutral-charcoal/70 dark:text-white/70 text-sm sm:text-base">
                    Stay updated with our latest events and news on social media!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <a
                    href="https://www.facebook.com/share/1K8H6SPtR5/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-baby-gradient p-4 sm:p-5 rounded-2xl shadow-lg border-2 border-white/50 hover:scale-105 transition-all duration-300 touch-manipulation group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-full p-3 shadow-lg group-hover:shadow-xl transition-all">
                        <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base sm:text-lg font-bold text-neutral-charcoal dark:text-white">Facebook</h4>
                        <p className="text-xs sm:text-sm text-neutral-charcoal/70 dark:text-white/70">Follow our page</p>
                      </div>
                    </div>
                  </a>

                  <a
                    href="https://www.instagram.com/nibog_100?igsh=MWlnYXBiNDFydGQxYg%3D%3D&utm_source=qr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-baby-gradient p-4 sm:p-5 rounded-2xl shadow-lg border-2 border-white/50 hover:scale-105 transition-all duration-300 touch-manipulation group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 rounded-full p-3 shadow-lg group-hover:shadow-xl transition-all">
                        <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base sm:text-lg font-bold text-neutral-charcoal dark:text-white">Instagram</h4>
                        <p className="text-xs sm:text-sm text-neutral-charcoal/70 dark:text-white/70">@nibog_100</p>
                      </div>
                    </div>
                  </a>

                  <a
                    href="https://www.linkedin.com/in/new-india-baby-olympicgames?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-baby-gradient p-4 sm:p-5 rounded-2xl shadow-lg border-2 border-white/50 hover:scale-105 transition-all duration-300 touch-manipulation group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-full p-3 shadow-lg group-hover:shadow-xl transition-all">
                        <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base sm:text-lg font-bold text-neutral-charcoal dark:text-white">LinkedIn</h4>
                        <p className="text-xs sm:text-sm text-neutral-charcoal/70 dark:text-white/70">Connect with us</p>
                      </div>
                    </div>
                  </a>

                  <a
                    href="https://youtube.com/@newindiababyolympics?si=gdXw5mGsXA93brxB"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-baby-gradient p-4 sm:p-5 rounded-2xl shadow-lg border-2 border-white/50 hover:scale-105 transition-all duration-300 touch-manipulation group sm:col-span-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-full p-3 shadow-lg group-hover:shadow-xl transition-all">
                        <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base sm:text-lg font-bold text-neutral-charcoal dark:text-white">YouTube</h4>
                        <p className="text-xs sm:text-sm text-neutral-charcoal/70 dark:text-white/70">@newindiababyolympics</p>
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              
            </div>

            <div className="relative">
              <div className="absolute -inset-3 sm:-inset-6 bg-[radial-gradient(circle_at_70%_30%,rgba(180,180,255,0.2),transparent_70%),radial-gradient(circle_at_30%_70%,rgba(255,182,193,0.2),transparent_70%)] blur-xl rounded-2xl opacity-70 dark:opacity-30"></div>
              <Card className="bg-white dark:bg-slate-800/90 shadow-md relative z-10">
                <CardContent className="p-4 sm:p-6">
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                      <h3 className="text-xl font-semibold text-green-700 mb-2">Message Sent Successfully!</h3>
                      <p className="text-gray-600 mb-4">Thank you for contacting us. We'll get back to you soon.</p>
                      <Button
                        onClick={() => setIsSubmitted(false)}
                        variant="outline"
                        className="h-10"
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm sm:text-base">Your Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter your full name"
                          required
                          className={`h-11 sm:h-10 text-base sm:text-sm touch-manipulation ${
                            errors.name ? 'border-red-500 focus:border-red-500' : ''
                          }`}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.name}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm sm:text-base">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter your email address"
                          required
                          className={`h-11 sm:h-10 text-base sm:text-sm touch-manipulation ${
                            errors.email ? 'border-red-500 focus:border-red-500' : ''
                          }`}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm sm:text-base">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="Enter your phone number"
                          className="h-11 sm:h-10 text-base sm:text-sm touch-manipulation"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-sm sm:text-base">Subject</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => handleInputChange('subject', e.target.value)}
                          placeholder="What is your message about?"
                          className="h-11 sm:h-10 text-base sm:text-sm touch-manipulation"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm sm:text-base">Message *</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          placeholder="Please provide details about your inquiry"
                          rows={4}
                          required
                          className={`text-base sm:text-sm touch-manipulation resize-none ${
                            errors.message ? 'border-red-500 focus:border-red-500' : ''
                          }`}
                        />
                        {errors.message && (
                          <p className="text-red-500 text-sm flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.message}
                          </p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 sm:h-10 text-base sm:text-sm font-semibold touch-manipulation"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>



      {/* CTA */}
      <section className="bg-purple-600 py-12 sm:py-16 md:py-24 text-white dark:bg-purple-900">
        <div className="container px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
              Ready to Join the NIBOG Family?
            </h2>
            <p className="mt-4 text-base sm:text-lg md:text-xl text-purple-100">
              Register your child for our upcoming events and be part of India's biggest baby Olympic games
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col justify-center gap-3 sm:gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-purple-50 h-12 sm:h-10 text-base sm:text-sm font-semibold touch-manipulation"
                asChild
              >
                <Link href="/register-event">Register Now</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent text-white hover:bg-white/10 border-white h-12 sm:h-10 text-base sm:text-sm font-semibold touch-manipulation"
                asChild
              >
                <Link href="/events">Browse Events</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </AnimatedBackground>
  )
}
