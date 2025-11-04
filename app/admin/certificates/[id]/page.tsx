"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Download, Mail, Loader2, Calendar, MapPin, User, Tag, Hash, Monitor } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getSingleCertificate } from "@/services/certificateGenerationService"
import { generateCertificatePDF } from "@/services/certificatePdfService"
import { CertificateListItem } from "@/types/certificate"
import { sendCertificateEmail } from "@/services/certificateEmailService"
import { useToast } from "@/hooks/use-toast"

export default function CertificateDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [certificate, setCertificate] = useState<CertificateListItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [emailing, setEmailing] = useState(false)

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true)
        const id = typeof params.id === 'string' ? parseInt(params.id) : Array.isArray(params.id) ? parseInt(params.id[0]) : 0
        
        if (id === 0) {
          throw new Error("Invalid certificate ID")
        }
        
        const data = await getSingleCertificate(id)
        setCertificate(data)
      } catch (error) {
        console.error("Error fetching certificate:", error)
        toast({
          title: "Error",
          description: "Failed to load certificate details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCertificate()
  }, [params.id, toast])

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'generated':
        return 'bg-green-100 text-green-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800' 
      case 'downloaded':
        return 'bg-purple-100 text-purple-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDownload = async () => {
    if (!certificate) return
    
    try {
      setDownloading(true)
      await generateCertificatePDF(certificate.id)
      toast({
        title: "Success",
        description: "Certificate downloaded successfully",
      })
    } catch (error) {
      console.error("Error downloading certificate:", error)
      toast({
        title: "Error",
        description: "Failed to download certificate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDownloading(false)
    }
  }

  const handleEmailCertificate = async () => {
    if (!certificate) return

    const recipientEmail = certificate.parent_email || certificate.user_email
    if (!recipientEmail) {
      toast({
        title: "Error",
        description: "No email address found for this certificate",
        variant: "destructive"
      })
      return
    }

    setEmailing(true)

    try {
      const result = await sendCertificateEmail(certificate)

      if (result.success) {
        toast({
          title: "Success",
          description: `Certificate sent successfully to ${recipientEmail}`
        })
      } else {
        toast({
          title: "Error",
          description: `Failed to send certificate: ${result.message}`,
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error("Error sending certificate email:", error)
      toast({
        title: "Error",
        description: `Failed to send certificate: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      })
    } finally {
      setEmailing(false)
    }
  }

  const handleBackToList = () => {
    router.push("/admin/certificates")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading certificate details...</span>
      </div>
    )
  }

  if (!certificate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold mb-2">Certificate Not Found</h2>
        <p className="text-muted-foreground mb-4">The certificate you requested does not exist or has been deleted.</p>
        <Button onClick={handleBackToList}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Certificate List
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8 mx-auto max-w-4xl">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={handleBackToList}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-semibold ml-4">Certificate Details</h1>
      </div>

      <div className="grid gap-6 mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Certificate #{certificate.id}</CardTitle>
                <CardDescription>
                  Generated on {new Date(certificate.generated_at).toLocaleString()}
                </CardDescription>
              </div>
              <Badge className={getStatusBadgeColor(certificate.status)}>
                {certificate.status.charAt(0).toUpperCase() + certificate.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Event Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Event Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Tag className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{certificate.event_title || 'Event Name Not Available'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                    <div>
                      <p>{certificate.event_date ? new Date(certificate.event_date).toLocaleDateString() : 'Date Not Available'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                    <div>
                      <p>
                        {certificate.venue_name || 'Venue Not Available'}
                        {certificate.city_name && certificate.venue_name 
                          ? `, ${certificate.city_name}` 
                          : certificate.city_name || ''}
                      </p>
                    </div>
                  </div>
                  
                  {certificate.certificate_number && (
                    <div className="flex items-start">
                      <Hash className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-mono text-sm">{certificate.certificate_number}</p>
                      </div>
                    </div>
                  )}
                  
                  {certificate.game_name && (
                    <div className="flex items-start">
                      <Monitor className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                      <div>
                        <p>{certificate.game_name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Recipient Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Recipient Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <User className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{certificate.child_name || 'Participant Name Not Available'}</p>
                      <p className="text-sm text-muted-foreground">Participant</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <User className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                    <div>
                      <p>{certificate.user_name || 'Parent Name Not Available'}</p>
                      <p className="text-sm text-muted-foreground">Parent</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                    <div>
                      <p>{certificate.user_email || 'Email Not Available'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex space-x-2 w-full justify-end">
              <Button
                variant="outline"
                onClick={handleEmailCertificate}
                disabled={emailing}
              >
                {emailing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" /> Email Certificate
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" /> Download Certificate
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

    </div>
  )
}
