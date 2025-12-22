"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { getAllFAQs, type FAQ } from "@/services/faqService"

// Interface matching API response
interface FAQItem {
  id: number
  question: string
  answer: string
  category: string
  display_priority: number
  status: string
  created_at: string
  updated_at: string
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true)
       
        
        const data = await getAllFAQs()
       
        
        // Transform FAQ to FAQItem format and filter only Active FAQs
        const transformedData: FAQItem[] = data
          .filter(faq => faq.status === 'Active' || faq.is_active !== false)
          .map(faq => ({
            id: faq.id || 0,
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            display_priority: faq.display_priority || faq.display_order || 0,
            status: faq.status || (faq.is_active !== false ? 'Active' : 'Inactive'),
            created_at: faq.created_at || new Date().toISOString(),
            updated_at: faq.updated_at || new Date().toISOString(),
          }))
          .sort((a, b) => a.display_priority - b.display_priority)
        
        setFaqs(transformedData)
        setError(transformedData.length === 0)
      } catch (err) {
        console.error('❌ Error fetching FAQs:', err)
        setError(true)
        setFaqs([])
      } finally {
        setLoading(false)
      }
    }

    fetchFAQs()
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="container py-12 md:py-16 lg:py-24">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading FAQs...</p>
        </div>
      </div>
    )
  }

  // Error or no FAQs state
  if (error || faqs.length === 0) {
    return (
      <div className="container py-12 md:py-16 lg:py-24">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about NIBOG events
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No FAQs available at the moment. Please check back later.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12 md:py-16 lg:py-24">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about NIBOG events
          </p>
        </div>

        {/* All FAQs in vertical layout without category headings */}
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="rounded-lg border p-4">
              <h3 className="font-medium">{faq.question}</h3>
              <div 
                className="mt-1 text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            </div>
          ))}
        </div>

        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold text-center">Still have questions?</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-medium">Contact Our Support Team</h3>
                  <p className="text-muted-foreground">
                    Our customer support team is available to answer any questions you may have about NIBOG events.
                  </p>
                  <Button className="w-full" asChild>
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-medium">Read Our Policies</h3>
                  <p className="text-muted-foreground">
                    For detailed information about our terms, privacy, and refund policies.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/terms">Terms & Conditions</Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/refund">Refund Policy</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
