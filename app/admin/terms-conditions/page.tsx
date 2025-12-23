"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Check,
  RefreshCw,
  FileText,
  Clock,
  AlertTriangle
} from "lucide-react"
import { PageTransition, FadeIn } from "@/components/ui/animated-components"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { MobileTestHelper } from "@/components/admin/mobile-test-helper"
import { getTerms, updateTerms } from "@/services/termsService"

// Types for terms & conditions content
interface TermsConditionsContent {
  websiteContent: string
  mobileAppContent: string
  lastUpdated: string
  version: string
}

// Mock data extracted from the existing terms page
const mockTermsContent: TermsConditionsContent = {
  websiteContent: `
    <h2>1. Acceptance of Terms</h2>
    <p>By accessing and using the NIBOG (New India Baby Olympic Games) website and services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our services.</p>

    <h2>2. Registration and Participation</h2>
    <p>2.1. All participants must be registered by their parent or legal guardian.</p>
    <p>2.2. The age of the child on the event date will be considered for determining eligibility for specific events.</p>
    <p>2.3. Registration is complete only after full payment of the registration fee.</p>
    <p>2.4. NIBOG reserves the right to refuse registration or participation without providing a reason.</p>

    <h2>3. Event Rules and Conduct</h2>
    <p>3.1. Participants and their guardians must follow all rules specific to each event.</p>
    <p>3.2. NIBOG reserves the right to disqualify any participant who does not follow the rules or whose behavior is deemed inappropriate.</p>
    <p>3.3. The decision of the judges and event officials is final.</p>
    <p>3.4. Parents/guardians are responsible for the safety and behavior of their children at all times during the event.</p>

    <h2>4. Photography and Media</h2>
    <p>4.1. By participating in NIBOG events, you grant NIBOG the right to take photographs and videos of participants and use them for promotional purposes.</p>
    <p>4.2. If you do not wish for your child to be photographed, you must notify the event organizers in writing before the event.</p>

    <h2>5. Health and Safety</h2>
    <p>5.1. Parents/guardians are responsible for ensuring their child is in good health to participate in the events.</p>
    <p>5.2. NIBOG will take reasonable precautions to ensure the safety of all participants, but is not responsible for any injuries that may occur during the events.</p>
    <p>5.3. In case of emergency, NIBOG staff may seek medical assistance for a child, and the parent/guardian will be responsible for any medical expenses.</p>

    <h2>6. Cancellation and Rescheduling</h2>
    <p>6.1. NIBOG reserves the right to cancel or reschedule events due to unforeseen circumstances, including but not limited to weather conditions, venue issues, or insufficient participation.</p>
    <p>6.2. In case of cancellation by NIBOG, participants will be offered a refund or the option to participate in a rescheduled event.</p>
    <p>6.3. Please refer to our Refund Policy for details on cancellations by participants.</p>

    <h2>7. Limitation of Liability</h2>
    <p>7.1. NIBOG, its employees, volunteers, and partners shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from participation in our events or use of our website.</p>
    <p>7.2. By registering for NIBOG events, parents/guardians acknowledge and accept these limitations of liability.</p>

    <h2>8. Changes to Terms</h2>
    <p>8.1. NIBOG reserves the right to modify these Terms and Conditions at any time.</p>
    <p>8.2. Changes will be effective immediately upon posting on our website.</p>
    <p>8.3. Continued use of our services after changes constitutes acceptance of the modified terms.</p>

    <h2>9. Governing Law</h2>
    <p>These Terms and Conditions shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.</p>

    <h2>10. Contact Information</h2>
    <p>For questions or concerns regarding these Terms and Conditions, please contact us at:</p>
    <p>Email: newindiababyolympics@gmail.com<br />
    Phone: +91-8977939614/15<br />
    Address: NIBOG, P.No:18, H.NO 33-30/4, Officers Colony, R.K Puram, Hyderabad - 500056.</p>
  `,
  mobileAppContent: `
    <h2>Mobile App Terms & Conditions</h2>
    <p>These terms apply specifically to the use of our mobile application in addition to the general terms above.</p>
    
    <h2>1. App Usage</h2>
    <p>1.1. The NIBOG mobile app is provided free of charge for event registration and participation management.</p>
    <p>1.2. You are responsible for any data charges incurred while using the app.</p>
    <p>1.3. The app requires certain permissions to function properly, including camera access for photos and location access for event discovery.</p>
    
    <h2>2. Account Security</h2>
    <p>2.1. You are responsible for maintaining the security of your account credentials.</p>
    <p>2.2. Notify us immediately if you suspect unauthorized access to your account.</p>
    <p>2.3. We are not liable for any losses resulting from unauthorized use of your account.</p>
    
    <h2>3. App Updates</h2>
    <p>3.1. We may release updates to improve functionality and security.</p>
    <p>3.2. Some updates may be required for continued use of the app.</p>
    <p>3.3. We reserve the right to discontinue support for older app versions.</p>
    
    <h2>4. Data Usage</h2>
    <p>4.1. The app may store certain data locally on your device for offline functionality.</p>
    <p>4.2. All personal data is handled according to our Privacy Policy.</p>
    <p>4.3. You can request deletion of your data by contacting our support team.</p>
  `,
  lastUpdated: new Date().toISOString(),
  version: "1.0"
}

export default function TermsConditionsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  
  const [termsContent, setTermsContent] = useState<TermsConditionsContent>(mockTermsContent)

  useEffect(() => {
    // Load terms & conditions content from internal API/service
    const loadTermsContent = async () => {
      setIsLoading(true)
      try {
        const data = await getTerms()

        // Normalize multiple possible shapes:
        // Backend returns { success: true, terms: { html_content, created_at } }
        if (data && data.success && data.terms) {
          const html = data.terms.html_content || data.terms.terms_text || data.terms.text || '';
          setTermsContent({ websiteContent: html, mobileAppContent: html, lastUpdated: data.terms.updated_at || data.terms.created_at || new Date().toISOString(), version: '1.0' })
        } else if (Array.isArray(data) && data.length > 0 && (data[0].html_content || data[0].terms_text)) {
          const html = data[0].html_content || data[0].terms_text || '';
          setTermsContent({ websiteContent: html, mobileAppContent: html, lastUpdated: data[0].created_at || data[0].updated_at || new Date().toISOString(), version: '1.0' })
        } else if (data && (data.html_content || data.terms_text)) {
          const html = data.html_content || data.terms_text || '';
          setTermsContent({ websiteContent: html, mobileAppContent: html, lastUpdated: data.updated_at || data.created_at || new Date().toISOString(), version: '1.0' })
        } else {
          console.warn('Terms: Unrecognized response shape, falling back to defaults', data)
          setTermsContent(mockTermsContent)
        }

        setHasChanges(false)
      } catch (error) {
        console.error('Failed to load terms & conditions content:', error)
        setTermsContent(mockTermsContent)
        toast({
          title: 'Warning',
          description: 'Failed to load saved terms & conditions content. Using default values.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadTermsContent()
  }, [toast])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Get the content to save
      const contentToSave = termsContent.websiteContent

      // Use internal updateTerms service which forwards auth header
      const result = await updateTerms(contentToSave)

      // Re-fetch the saved content from server to reflect any normalization/sanitization
      try {
        const fresh = await getTerms()
        if (fresh && fresh.success && fresh.terms) {
          const html = fresh.terms.html_content || fresh.terms.terms_text || ''
          setTermsContent(prev => ({ ...prev, websiteContent: html, mobileAppContent: html, lastUpdated: fresh.terms.updated_at || fresh.terms.created_at || new Date().toISOString() }))
        } else {
          setTermsContent(prev => ({ ...prev, lastUpdated: new Date().toISOString() }))
        }
      } catch (e) {
        console.warn('Failed to re-fetch terms after save:', e)
        setTermsContent(prev => ({ ...prev, lastUpdated: new Date().toISOString() }))
      }

      setHasChanges(false)
      toast({ title: 'Success', description: 'Terms & conditions content saved successfully!' })
    } catch (error) {
      console.error('Failed to save terms & conditions content:', error)
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to save terms & conditions content. Please try again.', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setTermsContent(mockTermsContent)
    setHasChanges(false)
    toast({
      title: "Reset",
      description: "Terms & conditions content has been reset to default values.",
    })
  }

  const handleWebsiteContentChange = (content: string) => {
    setTermsContent(prev => ({ ...prev, websiteContent: content }))
    setHasChanges(true)
  }



  if (isLoading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Loading terms & conditions content...</p>
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
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8" />
                Terms & Conditions Management
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Manage terms & conditions content for website and mobile app
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
                    <Check className="mr-2 h-4 w-4" />
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
                    {new Date(termsContent.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Version</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{termsContent.version}</p>
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
                <FileText className="h-5 w-5" />
                Terms & Conditions Content
              </CardTitle>
              <CardDescription>
                Terms & conditions content displayed on the website at /terms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Content</Label>
                <RichTextEditor
                  content={termsContent.websiteContent}
                  onChange={handleWebsiteContentChange}
                  placeholder="Enter terms & conditions content..."
                  className="min-h-[500px]"
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
