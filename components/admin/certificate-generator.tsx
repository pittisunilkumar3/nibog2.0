"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Send, Download, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface CertificateGeneratorProps {
  eventId: string
  eventTitle: string
  participantCount: number
}

// Mock certificate template data - in a real app, this would come from an API
const certificateTemplates = [
  { id: "cert-1", name: "Baby Crawling Champion" },
  { id: "cert-2", name: "Participation Certificate" },
  { id: "cert-3", name: "Baby Walker Award" },
]

export default function CertificateGenerator({ eventId, eventTitle, participantCount }: CertificateGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [includeNoShows, setIncludeNoShows] = useState<boolean>(false)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [isSending, setIsSending] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [generationComplete, setGenerationComplete] = useState<boolean>(false)
  const [sendingComplete, setSendingComplete] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleGenerateCertificates = async () => {
    if (!selectedTemplate) {
      setError("Please select a certificate template")
      return
    }
    
    setError(null)
    setIsGenerating(true)
    setProgress(0)
    setGenerationComplete(false)
    
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/admin/events/${eventId}/generate-certificates`, {
      //   method: "POST",
      //   body: JSON.stringify({ templateId: selectedTemplate, includeNoShows }),
      // })
      
      // Simulate progress updates
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 300)
      
      // Simulate completion after progress reaches 100%
      setTimeout(() => {
        clearInterval(interval)
        setProgress(100)
        setIsGenerating(false)
        setGenerationComplete(true)
      }, 3500)
    } catch (error) {
      console.error("Error generating certificates:", error)
      setError("Failed to generate certificates. Please try again.")
      setIsGenerating(false)
    }
  }
  
  const handleSendCertificates = async () => {
    if (!generationComplete) {
      setError("Please generate certificates first")
      return
    }
    
    setError(null)
    setIsSending(true)
    setProgress(0)
    setSendingComplete(false)
    
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/admin/events/${eventId}/send-certificates`, {
      //   method: "POST",
      // })
      
      // Simulate progress updates
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 5
        })
      }, 200)
      
      // Simulate completion after progress reaches 100%
      setTimeout(() => {
        clearInterval(interval)
        setProgress(100)
        setIsSending(false)
        setSendingComplete(true)
      }, 4500)
    } catch (error) {
      console.error("Error sending certificates:", error)
      setError("Failed to send certificates. Please try again.")
      setIsSending(false)
    }
  }
  
  const handleDownloadCertificates = () => {
    // In a real app, this would trigger a download
    console.log("Downloading certificates for event:", eventId)
    
    // Simulate download by opening a new window
    window.open(`/api/admin/events/${eventId}/certificates/download`, "_blank")
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Certificate Management</CardTitle>
        <CardDescription>
          Generate and send certificates to participants of {eventTitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="certificate-template">Certificate Template</Label>
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger id="certificate-template">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {certificateTemplates.map(template => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox 
            id="include-no-shows" 
            checked={includeNoShows} 
            onCheckedChange={(checked) => setIncludeNoShows(checked as boolean)} 
          />
          <Label htmlFor="include-no-shows" className="text-sm font-normal">
            Include no-show participants
          </Label>
        </div>
        
        {(isGenerating || isSending) && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-sm">
              <span>{isGenerating ? "Generating certificates..." : "Sending certificates..."}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {generationComplete && !isSending && !sendingComplete && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Certificates Generated</AlertTitle>
            <AlertDescription>
              Successfully generated {participantCount} certificates. You can now send them to participants or download them.
            </AlertDescription>
          </Alert>
        )}
        
        {sendingComplete && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Certificates Sent</AlertTitle>
            <AlertDescription>
              Successfully sent certificates to {participantCount} participants.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-x-2 sm:space-y-0">
        <Button 
          onClick={handleGenerateCertificates} 
          disabled={!selectedTemplate || isGenerating || isSending}
          className="w-full sm:w-auto"
        >
          <FileText className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Certificates"}
        </Button>
        
        <div className="flex w-full flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <Button 
            onClick={handleSendCertificates} 
            disabled={!generationComplete || isSending || sendingComplete}
            className="w-full sm:w-auto"
            variant={sendingComplete ? "outline" : "default"}
          >
            <Send className="mr-2 h-4 w-4" />
            {isSending ? "Sending..." : sendingComplete ? "Sent" : "Send to Participants"}
          </Button>
          
          <Button 
            onClick={handleDownloadCertificates} 
            disabled={!generationComplete}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Download All
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
