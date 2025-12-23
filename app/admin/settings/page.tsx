"use client"

import { useState, useEffect, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import { updateSocialMedia, getSocialMedia } from "@/services/socialMediaService"
import { updateEmailSetting, getEmailSetting } from "@/services/emailSettingService"
import { updateGeneralSetting, getGeneralSetting, fileToBase64 } from "@/services/generalSettingService"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Save, Upload, Mail, Edit, X } from "lucide-react"

export default function SettingsPage() {
  const { toast } = useToast()

  // General settings
  const [siteName, setSiteName] = useState("NIBOG - New India Baby Olympics Games")
  const [siteTagline, setSiteTagline] = useState("India's Biggest Baby Games")
  const [contactEmail, setContactEmail] = useState("newindiababyolympics@gmail.com")
  const [contactPhone, setContactPhone] = useState("+91-8977939614/15")
  const [address, setAddress] = useState("NIBOG, P.No:18, H.NO 33-30/4, Officers Colony, R.K Puram, Hyderabad - 500056.")
  const [logo, setLogo] = useState<string | null>(null)
  const [favicon, setFavicon] = useState<string | null>(null)
  const [generalSettingId, setGeneralSettingId] = useState<number | undefined>(undefined)
  const [isSavingGeneralSetting, setIsSavingGeneralSetting] = useState(false)
  const [isLoadingGeneralSetting, setIsLoadingGeneralSetting] = useState(true)
  const [isEditingGeneral, setIsEditingGeneral] = useState(false)
  const [generalSettingsExist, setGeneralSettingsExist] = useState(false)

  // Refs for file inputs
  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0]
        const base64 = await fileToBase64(file)
        setLogo(base64)
        toast({
          title: "Logo uploaded",
          description: "Logo has been uploaded successfully. Don't forget to save your changes.",
        })
      } catch (error) {
        console.error("Error uploading logo:", error)
        toast({
          title: "Error",
          description: "Failed to upload logo",
          variant: "destructive",
        })
      }
    }
  }

  // Handle favicon upload
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0]
        const base64 = await fileToBase64(file)
        setFavicon(base64)
        toast({
          title: "Favicon uploaded",
          description: "Favicon has been uploaded successfully. Don't forget to save your changes.",
        })
      } catch (error) {
        console.error("Error uploading favicon:", error)
        toast({
          title: "Error",
          description: "Failed to upload favicon",
          variant: "destructive",
        })
      }
    }
  }

  // Fetch general settings when component mounts
  useEffect(() => {
    const fetchGeneralSetting = async () => {
      try {
        setIsLoadingGeneralSetting(true)
        const data = await getGeneralSetting()

        if (data) {
          setSiteName(data.site_name)
          setSiteTagline(data.site_tagline)
          setContactEmail(data.contact_email)
          setContactPhone(data.contact_phone)
          setAddress(data.address)
          setLogo(data.logo_path || data.logo || null)
          setFavicon(data.favicon_path || data.favicon || null)
          setGeneralSettingId(data.id)
          setGeneralSettingsExist(true)
          setIsEditingGeneral(false)
        } else {
          setGeneralSettingsExist(false)
          setIsEditingGeneral(true)
        }
      } catch (error: any) {
        console.error("❌ Failed to fetch general settings:", error)
        toast({
          title: "Error",
          description: "Failed to load general settings",
          variant: "destructive",
        })
      } finally {
        setIsLoadingGeneralSetting(false)
      }
    }

    fetchGeneralSetting()
  }, [])

  // Handle edit general settings
  const handleEditGeneralSettings = () => {
    setIsEditingGeneral(true)
  }

  // Handle cancel general editing
  const handleCancelGeneralEdit = async () => {
    setIsEditingGeneral(false)

    // Reset form to original values
    if (generalSettingsExist) {
      try {
        const data = await getGeneralSetting()
        if (data) {
          setSiteName(data.site_name)
          setSiteTagline(data.site_tagline)
          setContactEmail(data.contact_email)
          setContactPhone(data.contact_phone)
          setAddress(data.address)
          setLogo(data.logo_path || data.logo || null)
          setFavicon(data.favicon_path || data.favicon || null)
        }
      } catch (error) {
        console.error("Failed to reset general settings:", error)
      }
    } else {
      // Reset to default values if no settings exist
      setSiteName("NIBOG - New India Baby Olympics Games")
      setSiteTagline("India's Biggest Baby Games")
      setContactEmail("newindiababyolympics@gmail.com")
      setContactPhone("+91-8977939614/15")
      setAddress("NIBOG, P.No:18, H.NO 33-30/4, Officers Colony, R.K Puram, Hyderabad - 500056.")
      setLogo(null)
      setFavicon(null)
    }
  }

  // Social media settings
  const [facebook, setFacebook] = useState("https://www.facebook.com/share/1K8H6SPtR5/")
  const [instagram, setInstagram] = useState("https://www.instagram.com/nibog_100?igsh=MWlnYXBiNDFydGQxYg%3D%3D&utm_source=qr")
  const [linkedin, setLinkedin] = useState("https://www.linkedin.com/in/new-india-baby-olympicgames?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app")
  const [youtube, setYoutube] = useState("https://youtube.com/@newindiababyolympics?si=gdXw5mGsXA93brxB")
  const [socialMediaId, setSocialMediaId] = useState<number | undefined>(undefined)
  const [isSavingSocialMedia, setIsSavingSocialMedia] = useState(false)
  const [isLoadingSocialMedia, setIsLoadingSocialMedia] = useState(true)
  const [isEditingSocialMedia, setIsEditingSocialMedia] = useState(false)
  const [socialMediaSettingsExist, setSocialMediaSettingsExist] = useState(false)

  // Fetch social media settings when component mounts
  useEffect(() => {
    const fetchSocialMedia = async () => {
      try {
        setIsLoadingSocialMedia(true)
        const data = await getSocialMedia()

        if (data) {
          setFacebook(data.facebook_url)
          setInstagram(data.instagram_url)
          setLinkedin(data.linkedin_url)
          setYoutube(data.youtube_url)
          setSocialMediaId(data.id)
          setSocialMediaSettingsExist(true)
          setIsEditingSocialMedia(false)
        } else {
          setSocialMediaSettingsExist(false)
          setIsEditingSocialMedia(true)
        }
      } catch (error: any) {
        console.error("Failed to fetch social media:", error)
        toast({
          title: "Error",
          description: "Failed to load social media settings",
          variant: "destructive",
        })
      } finally {
        setIsLoadingSocialMedia(false)
      }
    }

    fetchSocialMedia()
  }, [])

  // Handle edit social media settings
  const handleEditSocialMediaSettings = () => {
    setIsEditingSocialMedia(true)
  }

  // Handle cancel social media editing
  const handleCancelSocialMediaEdit = async () => {
    setIsEditingSocialMedia(false)

    // Reset form to original values
    if (socialMediaSettingsExist) {
      try {
        const data = await getSocialMedia()
        if (data) {
          setFacebook(data.facebook_url)
          setInstagram(data.instagram_url)
          setLinkedin(data.linkedin_url)
          setYoutube(data.youtube_url)
        }
      } catch (error) {
        console.error("Failed to reset social media settings:", error)
      }
    } else {
      // Reset to default values if no settings exist
      setFacebook("https://www.facebook.com/share/1K8H6SPtR5/")
      setInstagram("https://www.instagram.com/nibog_100?igsh=MWlnYXBiNDFydGQxYg%3D%3D&utm_source=qr")
      setLinkedin("https://www.linkedin.com/in/new-india-baby-olympicgames?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app")
      setYoutube("https://youtube.com/@newindiababyolympics?si=gdXw5mGsXA93brxB")
    }
  }

  // Email settings
  const [smtpHost, setSmtpHost] = useState("")
  const [smtpPort, setSmtpPort] = useState("587")
  const [smtpUser, setSmtpUser] = useState("")
  const [smtpPassword, setSmtpPassword] = useState("")
  const [senderName, setSenderName] = useState("")
  const [senderEmail, setSenderEmail] = useState("")
  const [emailSettingId, setEmailSettingId] = useState<number | undefined>(undefined)
  const [isSavingEmailSetting, setIsSavingEmailSetting] = useState(false)
  const [isLoadingEmailSetting, setIsLoadingEmailSetting] = useState(true)
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [emailSettingsExist, setEmailSettingsExist] = useState(false)
  const [emailLoadError, setEmailLoadError] = useState<string | null>(null)

  // Fetch email settings when component mounts
  useEffect(() => {
    const fetchEmailSetting = async () => {
      try {
        setIsLoadingEmailSetting(true)
        setEmailLoadError(null)
        const data = await getEmailSetting()

        if (data) {
          setSmtpHost(data.smtp_host || "")
          setSmtpPort(data.smtp_port ? data.smtp_port.toString() : "587")
          setSmtpUser(data.smtp_username || "")
          setSmtpPassword(data.smtp_password || "")
          setSenderName(data.sender_name || "")
          setSenderEmail(data.sender_email || "")
          setEmailSettingId(data.id)
          setEmailSettingsExist(true)
        } else {
          setEmailSettingsExist(false)
        }
      } catch (error: any) {
        console.error("💥 Failed to fetch email settings:", error)
        setEmailSettingsExist(false)

        // Handle 404 gracefully (no settings configured yet)
        if (error.message?.includes('404')) {
          setEmailLoadError("No email settings configured yet")
        } else {
          setEmailLoadError(error.message || "Failed to load email settings")
          toast({
            title: "Error",
            description: "Failed to load email settings",
            variant: "destructive",
          })
        }
      } finally {
        setIsLoadingEmailSetting(false)
      }
    }

    fetchEmailSetting()
  }, [])

  // Handle edit email settings
  const handleEditEmailSettings = () => {
    setIsEditingEmail(true)
  }

  // Handle cancel email editing
  const handleCancelEmailEdit = async () => {
    setIsEditingEmail(false)

    // Reset form to original values
    if (emailSettingsExist) {
      try {
        const data = await getEmailSetting()
        if (data) {
          setSmtpHost(data.smtp_host || "")
          setSmtpPort(data.smtp_port ? data.smtp_port.toString() : "587")
          setSmtpUser(data.smtp_username || "")
          setSmtpPassword(data.smtp_password || "")
          setSenderName(data.sender_name || "")
          setSenderEmail(data.sender_email || "")
        }
      } catch (error) {
        console.error("Failed to reset email settings:", error)
      }
    } else {
      // Reset to empty values if no settings exist
      setSmtpHost("")
      setSmtpPort("587")
      setSmtpUser("")
      setSmtpPassword("")
      setSenderName("")
      setSenderEmail("")
    }
  }

  // Notification settings
  const [bookingConfirmation, setBookingConfirmation] = useState(true)
  const [paymentConfirmation, setPaymentConfirmation] = useState(true)
  const [bookingReminder, setBookingReminder] = useState(true)
  const [eventUpdates, setEventUpdates] = useState(true)
  const [adminNewBooking, setAdminNewBooking] = useState(true)
  const [adminNewPayment, setAdminNewPayment] = useState(true)

  // Payment settings
  const [currency, setCurrency] = useState("INR")
  const [razorpayKey, setRazorpayKey] = useState("rzp_test_*************")
  const [razorpaySecret, setRazorpaySecret] = useState("*************************")
  const [testMode, setTestMode] = useState(true)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Manage your NIBOG platform settings</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto sm:h-10">
          <TabsTrigger value="general" className="text-xs sm:text-sm px-2 sm:px-3 py-2">General</TabsTrigger>
          <TabsTrigger value="social" className="text-xs sm:text-sm px-2 sm:px-3 py-2">Social</TabsTrigger>
          <TabsTrigger value="email" className="text-xs sm:text-sm px-2 sm:px-3 py-2">Email</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm px-2 sm:px-3 py-2">Notifications</TabsTrigger>
          <TabsTrigger value="payment" className="text-xs sm:text-sm px-2 sm:px-3 py-2">Payment</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">General Settings</CardTitle>
              <CardDescription>
                Configure the basic information for your NIBOG platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              {isLoadingGeneralSetting ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-sm text-muted-foreground">Loading general settings...</p>
                </div>
              ) : !isEditingGeneral ? (
                /* Display Mode */
                <>
                  {generalSettingsExist ? (
                    <div className="space-y-6">
                      {/* Basic Information Display */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Site Name</Label>
                            <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md">{siteName || "Not configured"}</p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Site Tagline</Label>
                            <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md">{siteTagline || "Not configured"}</p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Contact Email</Label>
                            <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md">{contactEmail || "Not configured"}</p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Contact Phone</Label>
                            <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md">{contactPhone || "Not configured"}</p>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                          <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md">{address || "Not configured"}</p>
                        </div>
                      </div>

                      <Separator />

                      {/* Media Assets Display */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Media Assets</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Logo</Label>
                            <div className="bg-muted px-3 py-2 rounded-md">
                              <img
                                src={logo || "/placeholder.svg?height=50&width=200&text=NIBOG+Logo"}
                                alt="NIBOG Logo"
                                className="h-12 w-auto object-contain"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Favicon</Label>
                            <div className="bg-muted px-3 py-2 rounded-md">
                              <img
                                src={favicon || "/placeholder.svg?height=32&width=32&text=N"}
                                alt="NIBOG Favicon"
                                className="h-8 w-8 object-contain"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Edit Button */}
                      <div className="flex justify-end pt-4">
                        <Button onClick={handleEditGeneralSettings} variant="outline">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit General Settings
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* No Settings Configured */
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                          <Edit className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">No General Settings Configured</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Configure your basic platform settings to get started
                          </p>
                        </div>
                        <Button onClick={handleEditGeneralSettings} variant="outline">
                          <Edit className="mr-2 h-4 w-4" />
                          Configure General Settings
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Edit Mode */
                <>
                  <div className="space-y-2">
                    <Label htmlFor="site-name">Site Name</Label>
                    <Input
                      id="site-name"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site-tagline">Site Tagline</Label>
                    <Input
                      id="site-tagline"
                      value={siteTagline}
                      onChange={(e) => setSiteTagline(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Contact Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">Contact Phone</Label>
                    <Input
                      id="contact-phone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo</Label>
                    <div className="flex items-center gap-4">
                      <img
                        src={logo || "/placeholder.svg?height=50&width=200&text=NIBOG+Logo"}
                        alt="NIBOG Logo"
                        className="h-12 w-auto object-contain"
                      />
                      <input
                        type="file"
                        id="logo-upload"
                        ref={logoInputRef}
                        onChange={handleLogoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload New Logo
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="favicon">Favicon</Label>
                    <div className="flex items-center gap-4">
                      <img
                        src={favicon || "/placeholder.svg?height=32&width=32&text=N"}
                        alt="NIBOG Favicon"
                        className="h-8 w-8 object-contain"
                      />
                      <input
                        type="file"
                        id="favicon-upload"
                        ref={faviconInputRef}
                        onChange={handleFaviconUpload}
                        accept="image/x-icon,image/png,image/jpeg"
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => faviconInputRef.current?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload New Favicon
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          {isEditingGeneral && (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancelGeneralEdit}
                disabled={isSavingGeneralSetting}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    setIsSavingGeneralSetting(true)

                    const generalSettingData = {
                      site_name: siteName,
                      site_tagline: siteTagline,
                      contact_email: contactEmail,
                      contact_phone: contactPhone,
                      address: address,
                      logo_path: logo || undefined,
                      favicon_path: favicon || undefined
                    }

                    const result = await updateGeneralSetting(generalSettingData)

                    setGeneralSettingsExist(true)
                    setIsEditingGeneral(false)
                    toast({
                      title: "Success",
                      description: "General settings saved successfully",
                    })
                    
                    // Reload the data to ensure we have the latest from the server
                    const updatedData = await getGeneralSetting()
                    if (updatedData) {
                      setSiteName(updatedData.site_name)
                      setSiteTagline(updatedData.site_tagline)
                      setContactEmail(updatedData.contact_email)
                      setContactPhone(updatedData.contact_phone)
                      setAddress(updatedData.address)
                      setLogo(updatedData.logo_path || updatedData.logo || null)
                      setFavicon(updatedData.favicon_path || updatedData.favicon || null)
                      setGeneralSettingId(updatedData.id)
                    }
                  } catch (error: any) {
                    console.error("❌ Failed to save general settings:", error)
                    toast({
                      title: "Error",
                      description: error.message || "Failed to save general settings",
                      variant: "destructive",
                    })
                  } finally {
                    setIsSavingGeneralSetting(false)
                  }
                }}
                disabled={isSavingGeneralSetting}
              >
                {isSavingGeneralSetting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
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
          )}
        </TabsContent>

        {/* Social Media Settings */}
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Settings</CardTitle>
              <CardDescription>
                Configure your NIBOG social media accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingSocialMedia ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-sm text-muted-foreground">Loading social media settings...</p>
                </div>
              ) : !isEditingSocialMedia ? (
                /* Display Mode */
                <>
                  {socialMediaSettingsExist ? (
                    <div className="space-y-6">
                      {/* Social Media Links Display */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Social Media Links</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Facebook</Label>
                            <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md break-all">{facebook || "Not configured"}</p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Instagram</Label>
                            <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md break-all">{instagram || "Not configured"}</p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">LinkedIn</Label>
                            <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md break-all">{linkedin || "Not configured"}</p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">YouTube</Label>
                            <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md break-all">{youtube || "Not configured"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Edit Button */}
                      <div className="flex justify-end pt-4">
                        <Button onClick={handleEditSocialMediaSettings} variant="outline">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Social Media Settings
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* No Settings Configured */
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                          <Edit className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">No Social Media Settings Configured</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Configure your social media links to connect with your audience
                          </p>
                        </div>
                        <Button onClick={handleEditSocialMediaSettings} variant="outline">
                          <Edit className="mr-2 h-4 w-4" />
                          Configure Social Media Settings
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Edit Mode */
                <>
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      value={youtube}
                      onChange={(e) => setYoutube(e.target.value)}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          {isEditingSocialMedia && (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancelSocialMediaEdit}
                disabled={isSavingSocialMedia}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    setIsSavingSocialMedia(true)

                    const socialMediaData = {
                      facebook_url: facebook,
                      instagram_url: instagram,
                      linkedin_url: linkedin,
                      youtube_url: youtube
                    }

                    const result = await updateSocialMedia(socialMediaData)

                    if (result) {
                      // Backend returns message or the object; just refetch to sync
                      try {
                        const updated = await getSocialMedia()
                        if (updated) {
                          setSocialMediaId(updated.id)
                          setFacebook(updated.facebook_url)
                          setInstagram(updated.instagram_url)
                          setLinkedin(updated.linkedin_url)
                          setYoutube(updated.youtube_url)
                        }
                      } catch (e) { /* ignore refetch error */ }

                      setSocialMediaSettingsExist(true)
                      setIsEditingSocialMedia(false)
                      toast({
                        title: "Success",
                        description: "Social media settings saved successfully",
                      })
                    }
                  } catch (error: any) {
                    console.error("Failed to save social media:", error)
                    toast({
                      title: "Error",
                      description: error.message || "Failed to save social media settings",
                      variant: "destructive",
                    })
                  } finally {
                    setIsSavingSocialMedia(false)
                  }
                }}
                disabled={isSavingSocialMedia}
              >
                {isSavingSocialMedia ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
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
          )}
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure your NIBOG email settings for notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingEmailSetting ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-sm text-muted-foreground">Loading email settings...</p>
                </div>
              ) : !isEditingEmail ? (
                /* Display Mode */
                <>
                  {emailSettingsExist ? (
                    <div className="space-y-6">
                      {/* SMTP Configuration Display */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">SMTP Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">SMTP Host</Label>
                            <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md">{smtpHost || "Not configured"}</p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">SMTP Port</Label>
                            <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md">{smtpPort || "Not configured"}</p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">SMTP Username</Label>
                            <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md">{smtpUser || "Not configured"}</p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">SMTP Password</Label>
                            <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md">
                              {smtpPassword ? "••••••••••••" : "Not configured"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Sender Information Display */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Sender Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Sender Name</Label>
                            <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md">{senderName || "Not configured"}</p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Sender Email</Label>
                            <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md">{senderEmail || "Not configured"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Edit Button */}
                      <div className="flex justify-end pt-4">
                        <Button onClick={handleEditEmailSettings} variant="outline">
                          <Save className="mr-2 h-4 w-4" />
                          Edit Email Settings
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* No Settings Configured */
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                          <Mail className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">No Email Settings Configured</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {emailLoadError || "Configure your SMTP settings to enable email notifications"}
                          </p>
                        </div>
                        <Button onClick={handleEditEmailSettings} className="mt-4">
                          <Save className="mr-2 h-4 w-4" />
                          Configure Email Settings
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Edit Mode - Form */
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-host">SMTP Host</Label>
                      <Input
                        id="smtp-host"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        placeholder="smtp.example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-port">SMTP Port</Label>
                      <Input
                        id="smtp-port"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(e.target.value)}
                        placeholder="587"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-user">SMTP Username</Label>
                      <Input
                        id="smtp-user"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        placeholder="your-email@domain.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-password">SMTP Password</Label>
                      <Input
                        id="smtp-password"
                        type="password"
                        value={smtpPassword}
                        onChange={(e) => setSmtpPassword(e.target.value)}
                        placeholder="Your SMTP password"
                      />
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <Label htmlFor="sender-name">Sender Name</Label>
                      <Input
                        id="sender-name"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="NIBOG Team"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sender-email">Sender Email</Label>
                      <Input
                        id="sender-email"
                        type="email"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="newindiababyolympics@gmail.com"
                      />
                    </div>
                  </div>

                  {/* Form Action Buttons */}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={handleCancelEmailEdit}
                      disabled={isSavingEmailSetting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          setIsSavingEmailSetting(true)

                          const emailSettingData = {
                            smtp_host: smtpHost,
                            smtp_port: parseInt(smtpPort),
                            smtp_username: smtpUser,
                            smtp_password: smtpPassword,
                            sender_name: senderName,
                            sender_email: senderEmail
                          }

                          const result = await updateEmailSetting(emailSettingData)

                          if (result) {
                            // Refetch the email settings to get the latest data from database
                            try {
                              const updatedData = await getEmailSetting()

                              if (updatedData) {
                                setEmailSettingId(updatedData.id)
                                setSmtpHost(updatedData.smtp_host || "")
                                setSmtpPort(updatedData.smtp_port ? updatedData.smtp_port.toString() : "587")
                                setSmtpUser(updatedData.smtp_username || "")
                                setSmtpPassword(updatedData.smtp_password || "")
                                setSenderName(updatedData.sender_name || "")
                                setSenderEmail(updatedData.sender_email || "")
                              }
                            } catch (refetchError) {
                              console.error("Failed to refetch email settings:", refetchError)
                              // Still show success message even if refetch fails
                            }

                            // Switch back to display mode and update state
                            setIsEditingEmail(false)
                            setEmailSettingsExist(true)
                            setEmailLoadError(null)

                            toast({
                              title: "Success",
                              description: "Email settings saved successfully",
                            })
                          }
                        } catch (error: any) {
                          console.error("Failed to save email settings:", error)
                          toast({
                            title: "Error",
                            description: error.message || "Failed to save email settings",
                            variant: "destructive",
                          })
                        } finally {
                          setIsSavingEmailSetting(false)
                        }
                      }}
                      disabled={isSavingEmailSetting}
                    >
                      {isSavingEmailSetting ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
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
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure which notifications are sent to users and administrators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">User Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="booking-confirmation">Booking Confirmation</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email when a booking is confirmed
                    </p>
                  </div>
                  <Switch
                    id="booking-confirmation"
                    checked={bookingConfirmation}
                    onCheckedChange={setBookingConfirmation}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="payment-confirmation">Payment Confirmation</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email when a payment is processed
                    </p>
                  </div>
                  <Switch
                    id="payment-confirmation"
                    checked={paymentConfirmation}
                    onCheckedChange={setPaymentConfirmation}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="booking-reminder">Booking Reminder</Label>
                    <p className="text-sm text-muted-foreground">
                      Send reminder email 24 hours before the event
                    </p>
                  </div>
                  <Switch
                    id="booking-reminder"
                    checked={bookingReminder}
                    onCheckedChange={setBookingReminder}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="event-updates">Event Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email when there are updates to a booked event
                    </p>
                  </div>
                  <Switch
                    id="event-updates"
                    checked={eventUpdates}
                    onCheckedChange={setEventUpdates}
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <h3 className="text-lg font-medium">Admin Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="admin-new-booking">New Booking</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email to admin when a new booking is made
                    </p>
                  </div>
                  <Switch
                    id="admin-new-booking"
                    checked={adminNewBooking}
                    onCheckedChange={setAdminNewBooking}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="admin-new-payment">New Payment</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email to admin when a new payment is received
                    </p>
                  </div>
                  <Switch
                    id="admin-new-payment"
                    checked={adminNewPayment}
                    onCheckedChange={setAdminNewPayment}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Configure your NIBOG payment gateway settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="razorpay-key">Razorpay API Key</Label>
                <Input
                  id="razorpay-key"
                  value={razorpayKey}
                  onChange={(e) => setRazorpayKey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="razorpay-secret">Razorpay Secret Key</Label>
                <Input
                  id="razorpay-secret"
                  type="password"
                  value={razorpaySecret}
                  onChange={(e) => setRazorpaySecret(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2 pt-4">
                <Switch id="test-mode" checked={testMode} onCheckedChange={setTestMode} />
                <Label htmlFor="test-mode">Enable Test Mode</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                When test mode is enabled, payments will be processed through the Razorpay test
                environment. No real transactions will occur.
              </p>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
