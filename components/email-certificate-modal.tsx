"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { sendCertificatesViaEmail } from "@/services/certificateEmailService"
import { CertificateListItem } from "@/types/certificate"

interface EmailCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificates: CertificateListItem[];
  onSuccess?: () => void;
}

export function EmailCertificateModal({
  isOpen,
  onClose,
  certificates,
  onSuccess
}: EmailCertificateModalProps) {
  const { toast } = useToast()

  // State
  const [customMessage, setCustomMessage] = useState("")
  const [replyTo, setReplyTo] = useState("")
  const [includePdf, setIncludePdf] = useState(true)
  const [sending, setSending] = useState(false)

  // Get recipient details for summary
  const recipientCount = certificates.length
  const recipientEmails = [...new Set(certificates.map(cert => cert.parent_email || cert.user_email))].filter(Boolean)
  const uniqueEmailCount = recipientEmails.length

  // Handle send
  const handleSend = async () => {
    if (certificates.length === 0) {
      toast({
        title: "No certificates selected",
        description: "Please select at least one certificate to email",
        variant: "destructive"
      })
      return
    }

    try {
      setSending(true)

      const result = await sendCertificatesViaEmail({
        certificateIds: certificates.map(cert => cert.id),
        customMessage: customMessage.trim(),
        includeLink: false, // Always false since we're only using PDF attachments
        includePdf,
        replyTo: replyTo.trim()
      })

      // Show success message
      toast({
        title: "Certificates sent",
        description: `Successfully sent ${result.sent} certificate${result.sent !== 1 ? 's' : ''} via email`
      })

      // Reset form
      setCustomMessage("")
      setReplyTo("")
      setIncludePdf(true)

      // Close modal and trigger success callback
      onClose()
      if (onSuccess) onSuccess()
      
    } catch (error) {
      console.error('Error sending certificate emails:', error)
      toast({
        title: "Failed to send emails",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Email Certificates</DialogTitle>
          <DialogDescription>
            Send selected certificates to participants via email
          </DialogDescription>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Recipients Summary */}
          <div className="rounded-md bg-muted p-4">
            <div className="text-sm font-medium">Recipients</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Sending to {recipientCount} certificate{recipientCount !== 1 ? 's' : ''} 
              ({uniqueEmailCount} unique email{uniqueEmailCount !== 1 ? 's' : ''})
            </div>
          </div>

          {/* Reply-To Email */}
          <div className="space-y-2">
            <Label htmlFor="replyTo">Reply-To Email (Optional)</Label>
            <Input
              id="replyTo"
              placeholder="Your email address"
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Recipients can reply to this email address if they have questions
            </p>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to include in the email"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={4}
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Options</div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includePdf"
                checked={includePdf}
                onCheckedChange={(checked) => setIncludePdf(checked as boolean)}
              />
              <Label htmlFor="includePdf">Include certificate as PDF attachment</Label>
            </div>

            <div className="text-xs text-gray-500 mt-2">
              Certificates will be sent as PDF attachments for easy download and printing.
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? (
              <>
                <span className="mr-2">Sending...</span>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </>
            ) : (
              'Send Certificates'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
