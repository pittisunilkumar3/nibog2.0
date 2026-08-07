"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface TermsConditionsData {
  id: number
  html_content: string
  created_at: string
}

export default function TermsPage() {
  const [termsContent, setTermsContent] = useState<string>("")
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTermsConditions = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/terms', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        })

        if (!response.ok) {
          throw new Error(`API returned error status: ${response.status}`)
        }

        const data = await response.json()

        // Expected shape: { success: true, terms: { html_content, updated_at } }
        // Backend stores in html_content field
        if (data && data.success && data.terms && (data.terms.html_content || data.terms.terms_text)) {
          setTermsContent(data.terms.html_content || data.terms.terms_text)
          setLastUpdated(data.terms.updated_at || data.terms.created_at || new Date().toISOString())
        } else {
          throw new Error('No terms & conditions content found')
        }
      } catch (error) {
        console.error("Failed to load terms & conditions:", error)
        setError("The official terms are temporarily unavailable.")
        setTermsContent("")
        setLastUpdated("")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTermsConditions()
  }, [])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    } catch {
      return new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container py-12 md:py-16 lg:py-24">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="animate-pulse space-y-8">
            <div className="space-y-2">
              <div className="h-10 bg-gray-200 rounded w-80"></div>
              <div className="h-5 bg-gray-200 rounded w-60"></div>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="h-7 bg-gray-200 rounded w-48"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-7 bg-gray-200 rounded w-56"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12 md:py-16 lg:py-24">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">Legal information</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Terms & Conditions</h1>
          {lastUpdated && <p className="text-sm text-muted-foreground">Last updated {formatDate(lastUpdated)}</p>}
          {error && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
              <p className="font-bold">{error}</p>
              <p className="mt-1">Please try again later or <Link href="/contact" className="font-bold underline">contact NIBOG</Link> before completing a registration.</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {termsContent && <div
            className="terms-conditions-content"
            dangerouslySetInnerHTML={{
              __html: termsContent
            }}
          />}
        </div>

        {/* Custom styles to match reference design */}
        <style jsx global>{`
          .terms-conditions-content {
            line-height: 1.6;
          }

          .terms-conditions-content h1,
          .terms-conditions-content h2,
          .terms-conditions-content h3,
          .terms-conditions-content h4,
          .terms-conditions-content h5,
          .terms-conditions-content h6 {
            font-weight: 600;
            margin-top: 2rem;
            margin-bottom: 0.75rem;
            color: hsl(var(--foreground));
          }

          .terms-conditions-content h1 {
            font-size: 2.25rem;
            line-height: 2.5rem;
          }

          .terms-conditions-content h2 {
            font-size: 1.5rem;
            line-height: 2rem;
          }

          .terms-conditions-content h3 {
            font-size: 1.25rem;
            line-height: 1.75rem;
          }

          .terms-conditions-content p {
            margin-bottom: 0.75rem;
            color: hsl(var(--foreground));
          }

          .terms-conditions-content ul,
          .terms-conditions-content ol {
            margin: 0.75rem 0;
            padding-left: 1.5rem;
          }

          .terms-conditions-content ul {
            list-style-type: disc;
          }

          .terms-conditions-content ol {
            list-style-type: decimal;
          }

          .terms-conditions-content li {
            margin: 0.5rem 0;
            color: hsl(var(--foreground));
          }

          .terms-conditions-content section {
            margin: 1.5rem 0;
          }

          .terms-conditions-content br {
            line-height: 1.6;
          }

          /* Ensure proper spacing between sections */
          .terms-conditions-content > * + * {
            margin-top: 1.5rem;
          }

          .terms-conditions-content > h1:first-child,
          .terms-conditions-content > h2:first-child,
          .terms-conditions-content > h3:first-child {
            margin-top: 0;
          }
        `}</style>
      </div>
    </div>
  )
}
