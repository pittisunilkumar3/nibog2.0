"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createManualPayment, ManualPaymentData } from "@/services/paymentService"

interface ManualPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookingId: number | null
  bookingAmount: number
  onPaymentRecorded?: () => void
}

export function ManualPaymentDialog({
  open,
  onOpenChange,
  bookingId,
  bookingAmount,
  onPaymentRecorded
}: ManualPaymentDialogProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Manual payment recording states
  const [manualTransactionId, setManualTransactionId] = useState("")
  const [manualPaymentMethod, setManualPaymentMethod] = useState("Cash")
  const [manualPaymentNotes, setManualPaymentNotes] = useState("")
  const [manualReferenceNumber, setManualReferenceNumber] = useState("")
  const [isRecordingPayment, setIsRecordingPayment] = useState(false)

  // Reset form when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setManualTransactionId("")
      setManualPaymentMethod("Cash")
      setManualPaymentNotes("")
      setManualReferenceNumber("")
      setIsRecordingPayment(false)
    }
    onOpenChange(newOpen)
  }

  // Handle manual payment recording
  const handleRecordManualPayment = async () => {
    if (!bookingId || !bookingAmount) {
      toast({
        title: "Error",
        description: "No booking ID or amount available for payment recording",
        variant: "destructive"
      })
      return
    }

    if (!manualPaymentMethod) {
      toast({
        title: "Error",
        description: "Please select a payment method",
        variant: "destructive"
      })
      return
    }

    setIsRecordingPayment(true)

    try {
      const manualPaymentData: ManualPaymentData = {
        booking_id: bookingId,
        amount: bookingAmount,
        payment_method: manualPaymentMethod,
        payment_status: "successful",
        payment_date: new Date().toISOString(),
        transaction_id: manualTransactionId || undefined,
        admin_notes: manualPaymentNotes || `Manual payment recorded by admin - ${manualPaymentMethod}${manualReferenceNumber ? ` (Ref: ${manualReferenceNumber})` : ''}`,
        reference_number: manualReferenceNumber || undefined
      }

      const result = await createManualPayment(manualPaymentData)

      if (result.success) {
        toast({
          title: "Success",
          description: `${result.message}. WhatsApp confirmation will be sent automatically.`,
        })

        // Close the dialog and call callback
        handleOpenChange(false)

        // Call the callback if provided
        if (onPaymentRecorded) {
          onPaymentRecorded()
        } else {
          // Default behavior: redirect back to booking detail page with success parameter
          setTimeout(() => {
            router.push(`/admin/bookings/${bookingId}?payment_success=true`)
          }, 1500)
        }
      } else {
        throw new Error(result.error || result.message)
      }

    } catch (error) {
      console.error("Error recording manual payment:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record payment",
        variant: "destructive"
      })
    } finally {
      setIsRecordingPayment(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Manual Payment</DialogTitle>
          <DialogDescription>
            Booking #{bookingId} - Amount: ₹{bookingAmount?.toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method *</Label>
            <Select value={manualPaymentMethod} onValueChange={setManualPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Card">Card (Offline)</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference-number">Reference Number</Label>
            <Input
              id="reference-number"
              placeholder="Cheque number, transaction ID, etc."
              value={manualReferenceNumber}
              onChange={(e) => setManualReferenceNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transaction-id">Custom Transaction ID (Optional)</Label>
            <Input
              id="transaction-id"
              placeholder="Leave empty to auto-generate"
              value={manualTransactionId}
              onChange={(e) => setManualTransactionId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-notes">Notes</Label>
            <Textarea
              id="payment-notes"
              placeholder="Additional notes about the payment..."
              value={manualPaymentNotes}
              onChange={(e) => setManualPaymentNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isRecordingPayment}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRecordManualPayment}
            disabled={isRecordingPayment || !manualPaymentMethod}
          >
            {isRecordingPayment ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Record Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
