"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { MapPin } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { getFooterSettingWithFallback, type FooterSetting } from "@/services/footerSettingService"

export default function Footer() {
  const [footerData, setFooterData] = useState<FooterSetting | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        setIsLoading(true)
        const data = await getFooterSettingWithFallback()
        setFooterData(data)
      } catch (error) {
        console.error('❌ Failed to fetch footer data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFooterData()
  }, [])

  // Use footer data or fallback values
  const companyName = footerData?.company_name || "NIBOG"
  const companyDescription = footerData?.company_description || "India's biggest baby Olympic games platform, executing in 21 cities across India. NIBOG is focused exclusively on conducting baby games for children aged 5-84 months."
    const address = footerData?.address || "NIBOG, P.No:18, H.NO 33-30/4, Officers Colony,\nR.K Puram, Hyderabad - 500056."
  const phone = footerData?.phone || "+91-8977939614/15"
  const email = footerData?.email || "newindiababyolympics@gmail.com"
  const newsletterEnabled = footerData?.newsletter_enabled ?? true
  const copyrightText = footerData?.copyright_text || "© {year} NIBOG. All rights reserved. India's Biggest Baby Olympic Games Platform."
  const facebookUrl = footerData?.facebook_url || "https://www.facebook.com/share/1K8H6SPtR5/"
  const instagramUrl = footerData?.instagram_url || "https://www.instagram.com/nibog_100?igsh=MWlnYXBiNDFydGQxYg%3D%3D&utm_source=qr"
  const linkedinUrl = footerData?.linkedin_url || "https://www.linkedin.com/in/new-india-baby-olympicgames?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
  const youtubeUrl = footerData?.youtube_url || "https://youtube.com/@newindiababyolympics?si=gdXw5mGsXA93brxB"
  const decathlonUrl = "https://www.decathlon.in"

  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('🏢 Footer Component State:', {
      isLoading,
      hasData: !!footerData,
      companyName,
    })
  }

  // Show loading state for debugging
  if (isLoading) {
    return (
      <footer className="border-t bg-background">
        <div className="container py-8 md:py-12">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading footer...</div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="relative bg-gradient-to-br from-sunshine-100 via-coral-100 to-mint-100 dark:from-sunshine-900/20 dark:via-coral-900/20 dark:to-mint-900/20 border-t-4 border-sunshine-300 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-sunshine-300 rounded-full opacity-10 animate-float"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-coral-300 rounded-full opacity-10 animate-float-delayed"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-mint-300 rounded-full opacity-10 animate-bounce-gentle"></div>

      <div className="container relative z-10 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sunshine-600 via-coral-600 to-mint-600 animate-rainbow-shift">
                🏆 {companyName}
              </h3>
              <p className="text-lg text-neutral-charcoal/70 dark:text-white/70 leading-relaxed">
                {companyDescription}
              </p>
            </div>
            <div className="flex space-x-4">
              {facebookUrl && (
                <Link href={facebookUrl} className="bg-gradient-to-br from-sunshine-400 to-sunshine-600 rounded-full p-3 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 animate-medal-shine" target="_blank" rel="noopener noreferrer">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="sr-only">Facebook</span>
                </Link>
              )}
              {instagramUrl && (
                <Link href={instagramUrl} className="bg-gradient-to-br from-coral-400 to-coral-600 rounded-full p-3 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 animate-medal-shine" target="_blank" rel="noopener noreferrer">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span className="sr-only">Instagram</span>
                </Link>
              )}
              {linkedinUrl && (
                <Link href={linkedinUrl} className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-full p-3 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 animate-medal-shine" target="_blank" rel="noopener noreferrer">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="sr-only">LinkedIn</span>
                </Link>
              )}
              {youtubeUrl && (
                <Link href={youtubeUrl} className="bg-gradient-to-br from-lavender-400 to-lavender-600 rounded-full p-3 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 animate-medal-shine" target="_blank" rel="noopener noreferrer">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span className="sr-only">YouTube</span>
                </Link>
              )}
              {decathlonUrl && (
                <Link href={decathlonUrl} className="bg-[#0082C3] hover:bg-[#006BA6] rounded-lg px-4 py-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center" target="_blank" rel="noopener noreferrer">
                  <img 
                    src="/decathlon-play-logo.png" 
                    alt="Decathlon Play" 
                    className="h-6 w-auto"
                  />
                  <span className="sr-only">Decathlon Play</span>
                </Link>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/events" className="text-muted-foreground hover:text-foreground">
                  All Events
                </Link>
              </li>
              <li>
                <Link href="/baby-olympics" className="text-muted-foreground hover:text-foreground">
                  NIBOG Games
                </Link>
              </li>
              <li>
                <Link href="/baby-olympics" className="text-muted-foreground hover:text-foreground">
                  Baby Crawling
                </Link>
              </li>
              <li>
                <Link href="/baby-olympics" className="text-muted-foreground hover:text-foreground">
                  Running Race
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-muted-foreground hover:text-foreground">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span className="text-muted-foreground whitespace-pre-line">
                  {address}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-muted-foreground">{phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-muted-foreground">{email}</span>
              </li>
            </ul>
            {newsletterEnabled && (
              <div className="pt-2">
                <h4 className="text-sm font-medium mb-2">Subscribe to our newsletter</h4>
                <div className="flex gap-2">
                  <Input type="email" placeholder="Your email" className="h-9" />
                  <Button size="sm" className="h-9">
                    Subscribe
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>{copyrightText.replace('{year}', new Date().getFullYear().toString())}</p>
        </div>
      </div>
    </footer>
  )
}