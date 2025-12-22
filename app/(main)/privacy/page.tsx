"use client"

import { useState, useEffect } from "react"
import { getPrivacyPolicy } from "@/services/privacyPolicyService"

export default function PrivacyPolicyPage() {
  const [privacyContent, setPrivacyContent] = useState<string>("")
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await getPrivacyPolicy()
       

        if (data && data.success && data.policy) {
          // API returns html_content, not policy_text
          setPrivacyContent(data.policy.html_content || data.policy.policy_text)
          setLastUpdated(data.policy.updated_at || data.policy.created_at)
        } else {
          throw new Error('No privacy policy content found')
        }
      } catch (error) {
        console.error("Failed to load privacy policy:", error)
        setError("Failed to load privacy policy content. Please try again later.")
        // Fallback content
        setPrivacyContent(`
          <h2>1. Introduction</h2>
          <p>NIBOG (New India Baby Olympic Games) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or participate in our events.</p>
          <p>Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site or register for our events.</p>
        `)
        setLastUpdated(new Date().toISOString())
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrivacyPolicy()
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
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm text-yellow-800 mt-4">
              {error}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div
            className="privacy-policy-content"
            dangerouslySetInnerHTML={{
              __html: privacyContent
            }}
          />
        </div>

        {/* Custom styles to match reference design */}
        <style jsx global>{`
          .privacy-policy-content {
            line-height: 1.6;
          }

          .privacy-policy-content h1,
          .privacy-policy-content h2,
          .privacy-policy-content h3,
          .privacy-policy-content h4,
          .privacy-policy-content h5,
          .privacy-policy-content h6 {
            font-weight: 600;
            margin-top: 2rem;
            margin-bottom: 0.75rem;
            color: hsl(var(--foreground));
          }

          .privacy-policy-content h1 {
            font-size: 2.25rem;
            line-height: 2.5rem;
          }

          .privacy-policy-content h2 {
            font-size: 1.5rem;
            line-height: 2rem;
          }

          .privacy-policy-content h3 {
            font-size: 1.25rem;
            line-height: 1.75rem;
          }

          .privacy-policy-content p {
            margin-bottom: 0.75rem;
            color: hsl(var(--foreground));
          }

          .privacy-policy-content ul,
          .privacy-policy-content ol {
            margin: 0.75rem 0;
            padding-left: 1.5rem;
          }

          .privacy-policy-content ul {
            list-style-type: disc;
          }

          .privacy-policy-content ol {
            list-style-type: decimal;
          }

          .privacy-policy-content li {
            margin: 0.5rem 0;
            color: hsl(var(--foreground));
          }

          .privacy-policy-content section {
            margin: 1.5rem 0;
          }

          .privacy-policy-content br {
            line-height: 1.6;
          }

          /* Ensure proper spacing between sections */
          .privacy-policy-content > * + * {
            margin-top: 1.5rem;
          }

          .privacy-policy-content > h1:first-child,
          .privacy-policy-content > h2:first-child,
          .privacy-policy-content > h3:first-child {
            margin-top: 0;
          }
        `}</style>
      </div>
    </div>
  )
}
