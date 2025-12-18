"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Check as Save,
  RefreshCw,
  Plus,
  Trash,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Globe,
  Link as LinkIcon,
  FileText
} from "lucide-react"
import { PageTransition, FadeIn } from "@/components/ui/animated-components"
import { getFooterSettingWithSocial, updateFooterSetting, type FooterSetting, type FooterSettingPayload } from "@/services/footerSettingService"
import { cn } from "@/lib/utils"
import { MobileTestHelper } from "@/components/admin/mobile-test-helper"

// Types for footer content
interface SocialMediaLink {
  id: string
  platform: string
  url: string
  enabled: boolean
}

interface QuickLink {
  id: string
  label: string
  url: string
  enabled: boolean
}

interface LegalLink {
  id: string
  label: string
  url: string
  enabled: boolean
}

interface ContactInfo {
  address: string
  phone: string
  email: string
}

interface FooterContent {
  companyName: string
  companyDescription: string
  socialMediaLinks: SocialMediaLink[]
  quickLinks: QuickLink[]
  legalLinks: LegalLink[]
  contactInfo: ContactInfo
  newsletterEnabled: boolean
  copyrightText: string
}

// Default footer content based on current footer
const defaultFooterContent: FooterContent = {
  companyName: "NIBOG",
  companyDescription: "India's biggest baby Olympic games platform, executing in 21 cities across India. NIBOG is focused exclusively on conducting baby games for children aged 5-84 months.",
  socialMediaLinks: [
    { id: "1", platform: "Facebook", url: "https://www.facebook.com/share/1K8H6SPtR5/", enabled: true },
    { id: "2", platform: "Instagram", url: "https://www.instagram.com/nibog_100?igsh=MWlnYXBiNDFydGQxYg%3D%3D&utm_source=qr", enabled: true },
    { id: "3", platform: "LinkedIn", url: "https://www.linkedin.com/in/new-india-baby-olympicgames?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app", enabled: true },
    { id: "4", platform: "YouTube", url: "https://youtube.com/@newindiababyolympics?si=gdXw5mGsXA93brxB", enabled: true },
  ],
  quickLinks: [
    { id: "1", label: "All Events", url: "/events", enabled: true },
    { id: "2", label: "NIBOG Games", url: "/baby-olympics", enabled: true },
    { id: "3", label: "Baby Crawling", url: "/baby-olympics", enabled: true },
    { id: "4", label: "Running Race", url: "/baby-olympics", enabled: true },
    { id: "5", label: "About Us", url: "/about", enabled: true },
    { id: "6", label: "Contact", url: "/contact", enabled: true },
  ],
  legalLinks: [
    { id: "1", label: "Terms & Conditions", url: "/terms", enabled: true },
    { id: "2", label: "Privacy Policy", url: "/privacy", enabled: true },
    { id: "3", label: "FAQ", url: "/faq", enabled: true },
  ],
    contactInfo: {
    address: "NIBOG, P.No:18, H.NO 33-30/4, Officers Colony, R.K Puram, Hyderabad - 500056.",
    phone: "+91-8977939614/15",
    email: "newindiababyolympics@gmail.com"
  },
  newsletterEnabled: true,
  copyrightText: "© {year} NIBOG. All rights reserved. India's Biggest Baby Olympic Games Platform."
}

export default function FooterManagement() {
  const { toast } = useToast()
  const [footerContent, setFooterContent] = useState<FooterContent>(defaultFooterContent)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Load footer content on component mount
  useEffect(() => {
    loadFooterContent()
  }, [])

  const loadFooterContent = async () => {
    setIsLoading(true)
    try {
      // Fetch footer settings with social links from the new API
      const footerSettings = await getFooterSettingWithSocial()

      if (footerSettings) {
        // Convert API data to FooterContent format
        const convertedContent: FooterContent = {
          companyName: footerSettings.company_name,
          companyDescription: footerSettings.company_description,
          socialMediaLinks: [
            { id: "1", platform: "Facebook", url: footerSettings.facebook_url || "", enabled: !!footerSettings.facebook_url },
            { id: "2", platform: "Instagram", url: footerSettings.instagram_url || "", enabled: !!footerSettings.instagram_url },
            { id: "3", platform: "LinkedIn", url: footerSettings.linkedin_url || "", enabled: !!footerSettings.linkedin_url },
            { id: "4", platform: "YouTube", url: footerSettings.youtube_url || "", enabled: !!footerSettings.youtube_url },
          ],
          quickLinks: defaultFooterContent.quickLinks, // Keep existing quick links
          legalLinks: defaultFooterContent.legalLinks, // Keep existing legal links
          contactInfo: {
            address: footerSettings.address,
            phone: footerSettings.phone,
            email: footerSettings.email
          },
          newsletterEnabled: footerSettings.newsletter_enabled === 1 || footerSettings.newsletter_enabled === true,
          copyrightText: footerSettings.copyright_text
        }
        setFooterContent(convertedContent)
        console.log('✅ Footer settings loaded successfully:', footerSettings)
      } else {
        // Use default content if no settings found
        setFooterContent(defaultFooterContent)
        console.log('⚠️ No footer settings found, using defaults')
      }
      setHasChanges(false)
    } catch (error) {
      console.error("❌ Failed to load footer content:", error)
      toast({
        title: "Error",
        description: "Failed to load footer content. Using default values.",
        variant: "destructive",
      })
      setFooterContent(defaultFooterContent)
    } finally {
      setIsLoading(false)
    }
  }

  // Validation function
  const validateFooterContent = (): boolean => {
    const errors: Record<string, string> = {}

    // Validate company name
    if (!footerContent.companyName.trim()) {
      errors.companyName = "Company name is required"
    }

    // Validate company description
    if (!footerContent.companyDescription.trim()) {
      errors.companyDescription = "Company description is required"
    }

    // Validate social media URLs
    footerContent.socialMediaLinks.forEach((link, index) => {
      if (link.enabled && link.url && !isValidUrl(link.url)) {
        errors[`socialMedia_${index}`] = `Invalid URL for ${link.platform}`
      }
    })

    // Validate quick links
    footerContent.quickLinks.forEach((link, index) => {
      if (link.enabled) {
        if (!link.label.trim()) {
          errors[`quickLink_label_${index}`] = "Link label is required"
        }
        if (!link.url.trim()) {
          errors[`quickLink_url_${index}`] = "Link URL is required"
        } else if (!isValidUrl(link.url) && !link.url.startsWith('/')) {
          errors[`quickLink_url_${index}`] = "Invalid URL format"
        }
      }
    })

    // Validate legal links
    footerContent.legalLinks.forEach((link, index) => {
      if (link.enabled) {
        if (!link.label.trim()) {
          errors[`legalLink_label_${index}`] = "Link label is required"
        }
        if (!link.url.trim()) {
          errors[`legalLink_url_${index}`] = "Link URL is required"
        } else if (!isValidUrl(link.url) && !link.url.startsWith('/')) {
          errors[`legalLink_url_${index}`] = "Invalid URL format"
        }
      }
    })

    // Validate contact info
    if (!footerContent.contactInfo.address.trim()) {
      errors.address = "Address is required"
    }
    if (!footerContent.contactInfo.phone.trim()) {
      errors.phone = "Phone number is required"
    }
    if (!footerContent.contactInfo.email.trim()) {
      errors.email = "Email address is required"
    } else if (!isValidEmail(footerContent.contactInfo.email)) {
      errors.email = "Invalid email format"
    }

    // Validate copyright text
    if (!footerContent.copyrightText.trim()) {
      errors.copyrightText = "Copyright text is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Helper functions for validation
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const saveFooterContent = async () => {
    // Validate before saving
    if (!validateFooterContent()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      // Convert FooterContent to FooterSettingPayload format
      // NOTE: Social media URLs are read-only from the backend (stored in separate table)
      // Only update basic footer settings fields
      const payload: FooterSettingPayload = {
        company_name: footerContent.companyName,
        company_description: footerContent.companyDescription,
        address: footerContent.contactInfo.address,
        phone: footerContent.contactInfo.phone,
        email: footerContent.contactInfo.email,
        newsletter_enabled: footerContent.newsletterEnabled,
        copyright_text: footerContent.copyrightText
      }

      console.log('📤 Sending footer update:', payload)
      const result = await updateFooterSetting(payload)
      console.log('✅ Footer update result:', result)

      toast({
        title: "Success",
        description: "Footer content saved successfully!",
      })
      setHasChanges(false)
      setValidationErrors({})
      
      // Reload the data to ensure we have the latest from the server
      await loadFooterContent()
    } catch (error) {
      console.error("❌ Failed to save footer content:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save footer content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updateFooterContent = (updates: Partial<FooterContent>) => {
    setFooterContent(prev => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  // Social media platform icons
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return <Globe className="h-4 w-4" />
      case 'instagram': return <Globe className="h-4 w-4" />
      case 'linkedin': return <Globe className="h-4 w-4" />
      case 'youtube': return <Globe className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading footer content...</span>
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Footer Management</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your website footer content, links, and contact information
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button
              variant="outline"
              onClick={loadFooterContent}
              disabled={isLoading}
              className="w-full sm:w-auto touch-manipulation h-10"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={saveFooterContent}
              disabled={isSaving || !hasChanges}
              className="w-full sm:w-auto touch-manipulation h-10"
            >
              <Save className={`mr-2 h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {hasChanges && (
          <FadeIn>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-yellow-800">
                  You have unsaved changes
                </span>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Main Content */}
        <Tabs defaultValue="company" className="space-y-4">
          <TabsList className="grid w-full mobile-tabs grid-cols-1 sm:grid-cols-3">
            <TabsTrigger value="company" className="mobile-tab-trigger">Company Info</TabsTrigger>
            <TabsTrigger value="contact" className="mobile-tab-trigger">Contact Info</TabsTrigger>
            <TabsTrigger value="settings" className="mobile-tab-trigger">Settings</TabsTrigger>
          </TabsList>

          {/* Company Information Tab */}
          <TabsContent value="company" className="space-y-4">
            <Card>
              <CardHeader className="mobile-card-header">
                <CardTitle className="mobile-text-lg">Company Information</CardTitle>
                <CardDescription className="mobile-text-sm">
                  Manage your company name, description, and branding in the footer
                </CardDescription>
              </CardHeader>
              <CardContent className="mobile-card-content">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="mobile-text-sm font-medium">Company Name</Label>
                  <Input
                    id="companyName"
                    value={footerContent.companyName}
                    onChange={(e) => {
                      updateFooterContent({ companyName: e.target.value })
                      if (validationErrors.companyName) {
                        setValidationErrors(prev => ({ ...prev, companyName: '' }))
                      }
                    }}
                    placeholder="Enter company name"
                    className={cn(
                      "mobile-input",
                      validationErrors.companyName ? "border-red-500" : ""
                    )}
                  />
                  {validationErrors.companyName && (
                    <p className="text-xs sm:text-sm text-red-500">{validationErrors.companyName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyDescription" className="mobile-text-sm font-medium">Company Description</Label>
                  <Textarea
                    id="companyDescription"
                    value={footerContent.companyDescription}
                    onChange={(e) => {
                      updateFooterContent({ companyDescription: e.target.value })
                      if (validationErrors.companyDescription) {
                        setValidationErrors(prev => ({ ...prev, companyDescription: '' }))
                      }
                    }}
                    placeholder="Enter company description"
                    rows={3}
                    className={cn(
                      "mobile-input touch-manipulation min-h-[80px] sm:min-h-[100px]",
                      validationErrors.companyDescription ? "border-red-500" : ""
                    )}
                  />
                  {validationErrors.companyDescription && (
                    <p className="text-xs sm:text-sm text-red-500">{validationErrors.companyDescription}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    This description will appear in the footer to describe your company
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* Contact Information Tab */}
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Phone className="h-4 w-4" />
                  Contact Information
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Manage contact details displayed in the footer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2 text-sm sm:text-base font-medium">
                    <MapPin className="h-4 w-4" />
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    value={footerContent.contactInfo.address}
                    onChange={(e) => {
                      updateFooterContent({
                        contactInfo: { ...footerContent.contactInfo, address: e.target.value }
                      })
                      if (validationErrors.address) {
                        setValidationErrors(prev => ({ ...prev, address: '' }))
                      }
                    }}
                    placeholder="Enter company address"
                    rows={3}
                    className={cn(
                      "mobile-input touch-manipulation min-h-[80px]",
                      validationErrors.address ? "border-red-500" : ""
                    )}
                  />
                  {validationErrors.address && (
                    <p className="text-xs sm:text-sm text-red-500">{validationErrors.address}</p>
                  )}
                </div>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2 text-sm sm:text-base font-medium">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={footerContent.contactInfo.phone}
                      onChange={(e) => {
                        updateFooterContent({
                          contactInfo: { ...footerContent.contactInfo, phone: e.target.value }
                        })
                        if (validationErrors.phone) {
                          setValidationErrors(prev => ({ ...prev, phone: '' }))
                        }
                      }}
                      placeholder="Enter phone number"
                      className={cn(
                        "mobile-input touch-manipulation",
                        validationErrors.phone ? "border-red-500" : ""
                      )}
                    />
                    {validationErrors.phone && (
                      <p className="text-xs sm:text-sm text-red-500">{validationErrors.phone}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-sm sm:text-base font-medium">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={footerContent.contactInfo.email}
                      onChange={(e) => {
                        updateFooterContent({
                          contactInfo: { ...footerContent.contactInfo, email: e.target.value }
                        })
                        if (validationErrors.email) {
                          setValidationErrors(prev => ({ ...prev, email: '' }))
                        }
                      }}
                      placeholder="Enter email address"
                      className={cn(
                        "mobile-input touch-manipulation",
                        validationErrors.email ? "border-red-500" : ""
                      )}
                    />
                    {validationErrors.email && (
                      <p className="text-xs sm:text-sm text-red-500">{validationErrors.email}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Newsletter Settings</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Configure newsletter subscription in footer
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6">
                  <div className="mobile-switch-container">
                    <div className="space-y-1 flex-1">
                      <Label className="mobile-text-sm font-medium">Enable Newsletter Subscription</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Show newsletter signup form in footer
                      </p>
                    </div>
                    <Switch
                      checked={footerContent.newsletterEnabled}
                      onCheckedChange={(checked) => updateFooterContent({ newsletterEnabled: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Copyright Settings</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Customize copyright text in footer
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6">
                  <div className="space-y-2">
                    <Label htmlFor="copyright" className="text-sm sm:text-base font-medium">Copyright Text</Label>
                    <Textarea
                      id="copyright"
                      value={footerContent.copyrightText}
                      onChange={(e) => {
                        updateFooterContent({ copyrightText: e.target.value })
                        if (validationErrors.copyrightText) {
                          setValidationErrors(prev => ({ ...prev, copyrightText: '' }))
                        }
                      }}
                      placeholder="Enter copyright text"
                      rows={2}
                      className={cn(
                        "mobile-input touch-manipulation min-h-[60px] sm:min-h-[80px]",
                        validationErrors.copyrightText ? "border-red-500" : ""
                      )}
                    />
                    {validationErrors.copyrightText && (
                      <p className="text-xs sm:text-sm text-red-500">{validationErrors.copyrightText}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Use {"{year}"} to automatically insert the current year
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview Section */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Footer Preview</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Preview how your footer will look with current settings
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="border rounded-lg p-4 sm:p-6 bg-muted/30">
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                    {/* Company Info */}
                    <div className="space-y-3 sm:col-span-2 lg:col-span-2 xl:col-span-2">
                      <h3 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {footerContent.companyName}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {footerContent.companyDescription}
                      </p>
                      <div className="flex space-x-3 sm:space-x-4">
                        {footerContent.socialMediaLinks
                          .filter(link => link.enabled && link.url)
                          .map(link => (
                            <div key={link.id} className="text-muted-foreground">
                              {getSocialIcon(link.platform)}
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-3">
                      <h3 className="text-base sm:text-lg font-semibold">Quick Links</h3>
                      <ul className="space-y-2 text-xs sm:text-sm">
                        {footerContent.quickLinks
                          .filter(link => link.enabled && link.label)
                          .map(link => (
                            <li key={link.id}>
                              <span className="text-muted-foreground hover:text-foreground">
                                {link.label}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>

                    {/* Legal Links */}
                    <div className="space-y-3">
                      <h3 className="text-base sm:text-lg font-semibold">Legal</h3>
                      <ul className="space-y-2 text-xs sm:text-sm">
                        {footerContent.legalLinks
                          .filter(link => link.enabled && link.label)
                          .map(link => (
                            <li key={link.id}>
                              <span className="text-muted-foreground hover:text-foreground">
                                {link.label}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3 sm:col-span-2 lg:col-span-1">
                      <h3 className="text-base sm:text-lg font-semibold">Contact Us</h3>
                      <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                        {footerContent.contactInfo.address && (
                          <li className="flex items-start gap-2">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {footerContent.contactInfo.address.split('\n').map((line, i) => (
                                <span key={i}>
                                  {line}
                                  {i < footerContent.contactInfo.address.split('\n').length - 1 && <br />}
                                </span>
                              ))}
                            </span>
                          </li>
                        )}
                        {footerContent.contactInfo.phone && (
                          <li className="flex items-center gap-2">
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground">{footerContent.contactInfo.phone}</span>
                          </li>
                        )}
                        {footerContent.contactInfo.email && (
                          <li className="flex items-center gap-2">
                            <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground break-all">{footerContent.contactInfo.email}</span>
                          </li>
                        )}
                      </ul>
                      {footerContent.newsletterEnabled && (
                        <div className="pt-2">
                          <h4 className="text-xs sm:text-sm font-medium mb-2">Subscribe to our newsletter</h4>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Input type="email" placeholder="Your email" className="h-8 sm:h-9 text-xs sm:text-sm" disabled />
                            <Button size="sm" className="h-8 sm:h-9 text-xs sm:text-sm w-full sm:w-auto" disabled>
                              Subscribe
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 sm:mt-8 border-t pt-4 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
                    <p>{footerContent.copyrightText.replace('{year}', new Date().getFullYear().toString())}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <MobileTestHelper />
    </PageTransition>
  )
}
