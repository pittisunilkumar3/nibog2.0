"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Save,
  RefreshCw,
  Globe,
  FileText,
  Clock,
  AlertTriangle,
  DollarSign
} from "lucide-react"
import { PageTransition, FadeIn } from "@/components/ui/animated-components"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { MobileTestHelper } from "@/components/admin/mobile-test-helper"

// Types for refund policy content
interface RefundPolicyContent {
  websiteContent: string
  mobileAppContent: string
  lastUpdated: string
  version: string
}

// Mock data - will be replaced with API integration later
const mockRefundPolicyContent: RefundPolicyContent = {
  websiteContent: `
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
    
    <h2>3. Refund Process</h2>
    <p>To request a refund:</p>
    <ol>
      <li>Contact our support team via email or phone</li>
      <li>Provide your booking reference number and reason for cancellation</li>
      <li>Wait for confirmation email with refund details</li>
      <li>Refund will be processed within 7-10 business days</li>
    </ol>
    
    <h2>4. Non-Refundable Situations</h2>
    <p>Refunds will not be provided in the following cases:</p>
    <ul>
      <li>No-show on event day without prior cancellation</li>
      <li>Violation of event rules or code of conduct</li>
      <li>Event cancellation due to natural disasters or force majeure (may offer event credit instead)</li>
      <li>Processing fees and transaction charges are non-refundable</li>
    </ul>
    
    <h2>5. Event Postponement or Cancellation</h2>
    <p>If NIBOG cancels or significantly changes an event:</p>
    <ul>
      <li>You will be notified via email and phone</li>
      <li>Option to transfer registration to a new date</li>
      <li>Option to receive a full refund if you cannot attend the new date</li>
      <li>Event credits valid for 12 months may be offered</li>
    </ul>
    
    <h2>6. Refund Method</h2>
    <p>All refunds will be processed using the original payment method:</p>
    <ul>
      <li>Credit/Debit card refunds: 5-7 business days</li>
      <li>UPI/Net Banking: 3-5 business days</li>
      <li>Digital Wallets: 2-3 business days</li>
    </ul>
    
    <h2>7. Contact Information</h2>
    <p>For refund requests or questions, please contact us:</p>
    <ul>
      <li>Email: support@nibog.in</li>
      <li>Phone: +91-XXXX-XXXXXX</li>
      <li>Customer service hours: Monday-Saturday, 10 AM - 6 PM IST</li>
    </ul>
  `,
  mobileAppContent: `
    <h2>Mobile App Refund Policy</h2>
    <p>This section covers refund practices specific to registrations made through our mobile application.</p>
    
    <h2>1. In-App Purchases</h2>
    <p>All event registrations made through the mobile app follow the same refund policy as website registrations.</p>
    
    <h2>2. Quick Refund Requests</h2>
    <p>Mobile app users can request refunds directly through the app:</p>
    <ul>
      <li>Navigate to "My Bookings" section</li>
      <li>Select the event you wish to cancel</li>
      <li>Tap "Request Refund" button</li>
      <li>Provide cancellation reason</li>
      <li>Receive instant confirmation</li>
    </ul>
    
    <h2>3. Refund Status Tracking</h2>
    <p>Track your refund status in real-time through the app:</p>
    <ul>
      <li>Push notifications for each refund stage</li>
      <li>View refund timeline in app</li>
      <li>Download refund receipt</li>
    </ul>
    
    <h2>4. App-Specific Terms</h2>
    <p>Additional terms for mobile app users:</p>
    <ul>
      <li>Processing fees may apply based on payment gateway</li>
      <li>Instant refund options available for eligible cancellations</li>
      <li>NIBOG wallet credit may be offered as alternative</li>
    </ul>
  `,
  lastUpdated: new Date().toISOString(),
  version: "1.0"
}

export default function RefundPolicyPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  
  const [refundContent, setRefundContent] = useState<RefundPolicyContent>(mockRefundPolicyContent)

  useEffect(() => {
    // Load refund policy content from API
    const loadRefundContent = async () => {
      setIsLoading(true)
      try {
        // Fetch existing refund policy content from API
        const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/refundpolicyget', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        if (!response.ok) {
          throw new Error(`API returned error status: ${response.status}`)
        }

        const data = await response.json()
        console.log('Fetched refund policy data:', data)

        // Check if data exists and has content
        if (data && Array.isArray(data) && data.length > 0 && data[0].html_content) {
          const fetchedContent = data[0].html_content
          setRefundContent({
            websiteContent: fetchedContent,
            mobileAppContent: fetchedContent, // Use same content for both tabs initially
            lastUpdated: data[0].created_at || new Date().toISOString(),
            version: "1.0"
          })
        } else {
          // Fallback to mock data if no content found
          setRefundContent(mockRefundPolicyContent)
        }

        setHasChanges(false)
      } catch (error) {
        console.error("Failed to load refund policy content:", error)
        // Fallback to mock data on error
        setRefundContent(mockRefundPolicyContent)
        toast({
          title: "Warning",
          description: "Failed to load saved refund policy content. Using default values.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadRefundContent()
  }, [toast])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Get the content to save
      const contentToSave = refundContent.websiteContent

      // Call the external API
      const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/refundpolicy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: contentToSave
        })
      })

      if (!response.ok) {
        throw new Error(`API returned error status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Refund policy saved successfully:', result)

      // Update last updated timestamp
      setRefundContent(prev => ({
        ...prev,
        lastUpdated: new Date().toISOString()
      }))

      setHasChanges(false)
      toast({
        title: "Success",
        description: "Refund policy content saved successfully!",
      })
    } catch (error) {
      console.error("Failed to save refund policy content:", error)
      toast({
        title: "Error",
        description: "Failed to save refund policy content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setRefundContent(mockRefundPolicyContent)
    setHasChanges(false)
    toast({
      title: "Reset",
      description: "Refund policy content has been reset to default values.",
    })
  }

  const handleWebsiteContentChange = (content: string) => {
    setRefundContent(prev => ({ ...prev, websiteContent: content }))
    setHasChanges(true)
  }



  if (isLoading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Loading refund policy content...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="container py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <FadeIn delay={0.1}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Refund Policy Management</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Manage refund policy content for website and mobile app
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isSaving || !hasChanges}
                className="touch-manipulation"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="touch-manipulation"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </FadeIn>

        {/* Status Info */}
        <FadeIn delay={0.2}>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Last Updated</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(refundContent.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Version</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{refundContent.version}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Status</span>
                  </div>
                  <Badge variant={hasChanges ? "destructive" : "secondary"} className="text-xs">
                    {hasChanges ? "Unsaved Changes" : "Saved"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Content */}
        <FadeIn delay={0.3}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Refund Policy Content
              </CardTitle>
              <CardDescription>
                Refund policy content displayed on the website at /refund-policy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Content</Label>
                <RichTextEditor
                  content={refundContent.websiteContent}
                  onChange={handleWebsiteContentChange}
                  placeholder="Enter refund policy content..."
                  className="min-h-[400px]"
                  disabled={isSaving}
                />
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Mobile Test Helper */}
        <MobileTestHelper />
      </div>
    </PageTransition>
  )
}
