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
import { getRefundPolicy, updateRefundPolicy } from "@/services/refundPolicyService"

// Types for refund policy content
interface RefundPolicyContent {
  websiteContent: string
  mobileAppContent: string
  lastUpdated: string
  version: string
}

// Mock data
const mockRefundPolicyContent: RefundPolicyContent = {
  websiteContent: `
    <h2>1. Refund Policy Overview</h2>
    <p>At NIBOG (New India Baby Olympic Games), we strive to provide the best experience for all participants.</p>
  `,
  mobileAppContent: `
    <h2>Mobile App Refund Policy</h2>
    <p>This section covers refund practices specific to registrations made through our mobile application.</p>
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
    const loadRefundContent = async () => {
      setIsLoading(true)
      try {
        const data = await getRefundPolicy()
        console.log('Fetched refund policy data:', data)

        if (data && data.success && data.policy) {
          const fetchedContent = data.policy.html_content || data.policy.policy_text || ""
          setRefundContent({
            websiteContent: fetchedContent,
            mobileAppContent: fetchedContent,
            lastUpdated: data.policy.updated_at || data.policy.created_at || new Date().toISOString(),
            version: "1.0"
          })
        } else {
          setRefundContent(mockRefundPolicyContent)
        }
        setHasChanges(false)
      } catch (error) {
        console.error("Failed to load refund policy content:", error)
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
      const contentToSave = refundContent.websiteContent

      const result = await updateRefundPolicy(contentToSave)
      console.log('Refund policy saved successfully:', result)

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
        description: error instanceof Error ? error.message : "Failed to save refund policy content. Please try again.",
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
