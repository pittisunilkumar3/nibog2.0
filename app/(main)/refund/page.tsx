"use client"

import { useState, useEffect } from "react"
import { getRefundPolicy } from "@/services/refundPolicyService"
import Link from "next/link"

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
        setError("The official refund policy is temporarily unavailable.")
        setRefundContent("")
        setLastUpdated("")
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
          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">Booking support</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Refund Policy</h1>
          {lastUpdated && <p className="text-sm text-muted-foreground">Last updated {formatDate(lastUpdated)}</p>}
          {error && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
              <p className="font-bold">{error}</p>
              <p className="mt-1">Please <Link href="/contact" className="font-bold underline">contact NIBOG</Link> before cancelling or relying on any refund amount.</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {refundContent && <div
            className="refund-policy-content"
            dangerouslySetInnerHTML={{
              __html: refundContent
            }}
          />}
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
