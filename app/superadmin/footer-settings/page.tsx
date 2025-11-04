"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import { getFooterSetting, saveFooterSetting, type FooterSetting, type FooterSettingPayload } from "@/services/footerSettingService"

export default function FooterSettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<FooterSettingPayload>({
    company_name: "",
    company_description: "",
    address: "",
    phone: "",
    email: "",
    newsletter_enabled: true,
    copyright_text: "",
    facebook_url: "",
    instagram_url: "",
    linkedin_url: "",
    youtube_url: ""
  })

  useEffect(() => {
    loadFooterSettings()
  }, [])

  const loadFooterSettings = async () => {
    try {
      setIsLoading(true)
      const settings = await getFooterSetting()
      
      if (settings) {
        setFormData({
          company_name: settings.company_name,
          company_description: settings.company_description,
          address: settings.address,
          phone: settings.phone,
          email: settings.email,
          newsletter_enabled: settings.newsletter_enabled,
          copyright_text: settings.copyright_text,
          facebook_url: settings.facebook_url || "",
          instagram_url: settings.instagram_url || "",
          linkedin_url: settings.linkedin_url || "",
          youtube_url: settings.youtube_url || ""
        })
      } else {
        // Set default values if no settings exist
        setFormData({
          company_name: "Nibog Pvt Ltd",
          company_description: "Nibog is a premium organizer of children's events like baby olympics, games, and fun educational activities.",
          address: "NIBOG, P.No:18, H.NO 33-30/4, Officers Colony, R.K Puram, Hyderabad - 500056.",
          phone: "+91-9876543210",
          email: "support@nibog.com",
          newsletter_enabled: true,
          copyright_text: "© 2025 Nibog. All rights reserved.",
          facebook_url: "",
          instagram_url: "",
          linkedin_url: "",
          youtube_url: ""
        })
      }
    } catch (error) {
      console.error("Failed to load footer settings:", error)
      toast({
        title: "Error",
        description: "Failed to load footer settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FooterSettingPayload, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSaving(true)
      await saveFooterSetting(formData)
      
      toast({
        title: "Success",
        description: "Footer settings saved successfully!",
      })
    } catch (error) {
      console.error("Failed to save footer settings:", error)
      toast({
        title: "Error",
        description: "Failed to save footer settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading footer settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Footer Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Basic company details displayed in the footer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    placeholder="Enter company name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company_description">Company Description</Label>
                <Textarea
                  id="company_description"
                  value={formData.company_description}
                  onChange={(e) => handleInputChange('company_description', e.target.value)}
                  placeholder="Enter company description"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter company address"
                    rows={2}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>
                Social media URLs for footer icons
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook_url">Facebook URL</Label>
                  <Input
                    id="facebook_url"
                    type="url"
                    value={formData.facebook_url}
                    onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                    placeholder="https://www.facebook.com/share/1K8H6SPtR5/"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram_url">Instagram URL</Label>
                  <Input
                    id="instagram_url"
                    type="url"
                    value={formData.instagram_url}
                    onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                    placeholder="https://www.instagram.com/nibog_100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input
                    id="linkedin_url"
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    placeholder="https://www.linkedin.com/in/new-india-baby-olympicgames"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube_url">YouTube URL</Label>
                  <Input
                    id="youtube_url"
                    type="url"
                    value={formData.youtube_url}
                    onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                    placeholder="https://youtube.com/@newindiababyolympics"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Footer Settings</CardTitle>
              <CardDescription>
                Additional footer configuration options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Newsletter Subscription</Label>
                  <p className="text-sm text-muted-foreground">
                    Show newsletter signup form in footer
                  </p>
                </div>
                <Switch
                  checked={formData.newsletter_enabled}
                  onCheckedChange={(checked) => handleInputChange('newsletter_enabled', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="copyright_text">Copyright Text</Label>
                <Textarea
                  id="copyright_text"
                  value={formData.copyright_text}
                  onChange={(e) => handleInputChange('copyright_text', e.target.value)}
                  placeholder="© 2025 Your Company. All rights reserved."
                  rows={2}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Use {"{year}"} to automatically insert the current year
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
