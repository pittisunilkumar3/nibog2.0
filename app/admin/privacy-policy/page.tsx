"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Save,
  RefreshCw,
  Globe,
  FileText,
  Clock,
  AlertTriangle
} from "lucide-react"
import { PageTransition, FadeIn } from "@/components/ui/animated-components"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { MobileTestHelper } from "@/components/admin/mobile-test-helper"
import { getPrivacyPolicy, updatePrivacyPolicy } from "@/services/privacyPolicyService"

// Types for privacy policy content
interface PrivacyPolicyContent {
  websiteContent: string
  mobileAppContent: string
  lastUpdated: string
  version: string
}

// Mock data - will be replaced with API integration later
const mockPrivacyPolicyContent: PrivacyPolicyContent = {
  websiteContent: `
    <h2>1. Introduction</h2>
    <p>NIBOG (New India Baby Olympic Games) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or participate in our events.</p>
    <p>Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site or register for our events.</p>
    
    <h2>2. Information We Collect</h2>
    <p>We collect information about you in various ways when you use our services:</p>
    <ul>
      <li>Personal information (name, email, phone number)</li>
      <li>Child information (name, age, date of birth for event registration)</li>
      <li>Payment information for event bookings</li>
      <li>Communication records when you contact our customer service</li>
    </ul>
  `,
  mobileAppContent: `
    <h2>Mobile App Privacy Policy</h2>
    <p>This section covers privacy practices specific to our mobile application.</p>
    
    <h2>1. App Permissions</h2>
    <p>Our mobile app may request the following permissions:</p>
    <ul>
      <li>Camera access for profile photos and event photos</li>
      <li>Location access to find nearby events</li>
      <li>Push notifications for event updates</li>
      <li>Storage access for saving certificates and photos</li>
    </ul>
    
    <h2>2. Data Storage</h2>
    <p>The app stores minimal data locally on your device for offline functionality. All sensitive data is encrypted and stored securely on our servers.</p>
  `,
  lastUpdated: new Date().toISOString(),
  version: "1.0"
}

export default function PrivacyPolicyPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)


  const [privacyContent, setPrivacyContent] = useState<PrivacyPolicyContent>(mockPrivacyPolicyContent)

  useEffect(() => {
    // Load privacy policy content from API
    const loadPrivacyContent = async () => {
      setIsLoading(true)
      try {
        // Use the privacy policy service
        const data = await getPrivacyPolicy()

        // Check if data exists and has content
        if (data && data.success && data.policy) {
          // API returns html_content, not policy_text
          const fetchedContent = data.policy.html_content || data.policy.policy_text || ""
          setPrivacyContent({
            websiteContent: fetchedContent,
            mobileAppContent: fetchedContent, // Use same content for both tabs initially
            lastUpdated: data.policy.updated_at || data.policy.created_at || new Date().toISOString(),
            version: "1.0"
          })
        } else {
          // Fallback to mock data if no content found
          setPrivacyContent(mockPrivacyPolicyContent)
        }

        setHasChanges(false)
      } catch (error) {
        console.error("Failed to load privacy policy content:", error)
        // Fallback to mock data on error
        setPrivacyContent(mockPrivacyPolicyContent)
        toast({
          title: "Warning",
          description: "Failed to load saved privacy policy content. Using default values.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPrivacyContent()
  }, [toast])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Get the content to save
      const contentToSave = privacyContent.websiteContent

      // Use the privacy policy service which handles authentication
      const result = await updatePrivacyPolicy(contentToSave)

      // Update last updated timestamp
      setPrivacyContent(prev => ({
        ...prev,
        lastUpdated: new Date().toISOString()
      }))

      setHasChanges(false)
      toast({
        title: "Success",
        description: "Privacy policy content saved successfully!",
      })
    } catch (error) {
      console.error("Failed to save privacy policy content:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save privacy policy content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setPrivacyContent(mockPrivacyPolicyContent)
    setHasChanges(false)
    toast({
      title: "Reset",
      description: "Privacy policy content has been reset to default values.",
    })
  }

  const handleWebsiteContentChange = (content: string) => {
    setPrivacyContent(prev => ({ ...prev, websiteContent: content }))
    setHasChanges(true)
  }



  if (isLoading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Loading privacy policy content...</p>
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
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Privacy Policy Management</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Manage privacy policy content for website and mobile app
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
                    {new Date(privacyContent.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Version</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{privacyContent.version}</p>
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
                <Globe className="h-5 w-5" />
                Privacy Policy Content
              </CardTitle>
              <CardDescription>
                Privacy policy content displayed on the website at /privacy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Content</Label>
                <RichTextEditor
                  content={privacyContent.websiteContent}
                  onChange={handleWebsiteContentChange}
                  placeholder="Enter privacy policy content..."
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
