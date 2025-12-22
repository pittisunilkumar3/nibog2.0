"use client"

import { useState, useEffect } from "react"
import { getRefundPolicy } from "@/services/refundPolicyService"

export default function RefundPolicyPage() {
  const [refundContent, setRefundContent] = useState<string>("")
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRefundPolicy = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await getRefundPolicy()

        if (data && data.success && data.policy) {
          // API returns html_content, not policy_text
          setRefundContent(data.policy.html_content || data.policy.policy_text)
          setLastUpdated(data.policy.updated_at || data.policy.created_at)
        } else {
          throw new Error('No refund policy content found')
        }
      } catch (error) {
        console.error("Failed to load refund policy:", error)
        setError("Failed to load refund policy content. Please try again later.")
        // Fallback content
        setRefundContent(`
          <h2>1. Refund Policy Overview</h2>
          <p>At NIBOG (New India Baby Olympic Games), we strive to provide the best experience for all participants. This Refund Policy outlines the conditions under which refunds may be requested and processed.</p>
          <p>Please read this policy carefully before registering for any events. By registering, you acknowledge and agree to these terms.</p>
          
          <h2>2. Cancellation & Refund Eligibility</h2>
          <p>Refund eligibility depends on when the cancellation request is made:</p>
          <ul>
            <li><strong>More than 7 days before event:</strong> Full refund (100% of registration fee)</li>
            <li><strong>3-7 days before event:</strong> Partial refund (50% of registration fee)</li>
            <li><strong>Less than 3 days before event:</strong> No refund available</li>
            <li><strong>Event day or after:</strong> No refund available</li>
          </ul>
          
          <h2>3. Contact Information</h2>
          <p>For refund requests or questions, please contact us:</p>
          <ul>
            <li>Email: newindiababyolympics@gmail.com</li>
            <li>Phone: +91-8977939614/15</li>
          </ul>
        `)
        setLastUpdated(new Date().toISOString())
      } finally {
        setIsLoading(false)
      }
    }

    fetchRefundPolicy()
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
            className="refund-policy-content"
            dangerouslySetInnerHTML={{
              __html: refundContent
            }}
          />
        </div>

        {/* Custom styles to match reference design */}
        <style jsx global>{`
          .refund-policy-content {
            line-height: 1.6;
          }

          .refund-policy-content h1,
          .refund-policy-content h2,
          .refund-policy-content h3,
          .refund-policy-content h4,
          .refund-policy-content h5,
          .refund-policy-content h6 {
            font-weight: 600;
            margin-top: 2rem;
            margin-bottom: 0.75rem;
            color: hsl(var(--foreground));
          }

          .refund-policy-content h1 {
            font-size: 2.25rem;
            line-height: 2.5rem;
          }

          .refund-policy-content h2 {
            font-size: 1.5rem;
            line-height: 2rem;
          }

          .refund-policy-content h3 {
            font-size: 1.25rem;
            line-height: 1.75rem;
          }

          .refund-policy-content p {
            margin-bottom: 0.75rem;
            color: hsl(var(--foreground));
          }

          .refund-policy-content ul,
          .refund-policy-content ol {
            margin: 0.75rem 0;
            padding-left: 1.5rem;
          }

          .refund-policy-content ul {
            list-style-type: disc;
          }

          .refund-policy-content ol {
            list-style-type: decimal;
          }

          .refund-policy-content li {
            margin: 0.5rem 0;
            color: hsl(var(--foreground));
          }

          .refund-policy-content section {
            margin: 1.5rem 0;
          }

          .refund-policy-content br {
            line-height: 1.6;
          }

          .refund-policy-content strong {
            font-weight: 600;
            color: hsl(var(--foreground));
          }

          /* Ensure proper spacing between sections */
          .refund-policy-content > * + * {
            margin-top: 1.5rem;
          }

          .refund-policy-content > h1:first-child,
          .refund-policy-content > h2:first-child,
          .refund-policy-content > h3:first-child {
            margin-top: 0;
          }
        `}</style>
      </div>
    </div>
  )
}
