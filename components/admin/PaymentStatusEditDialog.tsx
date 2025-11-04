"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"
import { Payment } from "@/services/paymentService"

interface PaymentStatusEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: Payment
  onStatusUpdate: (updatedPayment: Payment) => void
}

// Valid status transitions
const getValidStatusTransitions = (currentStatus: string): Array<{ value: string; label: string }> => {
  switch (currentStatus) {
    case 'successful':
      return [{ value: 'refunded', label: 'Refunded' }]
    case 'pending':
      return [
        { value: 'successful', label: 'Successful' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' }
      ]
    case 'failed':
    case 'refunded':
      return [] // No transitions allowed from final states
    default:
      return []
  }
}

// Refund reasons
const refundReasons = [
  "Event cancelled",
  "User didn't attend",
  "User request", 
  "Technical issue",
  "Duplicate payment",
  "Other"
]

export function PaymentStatusEditDialog({
  open,
  onOpenChange,
  payment,
  onStatusUpdate
}: PaymentStatusEditDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [refundReason, setRefundReason] = useState<string>("")
  const [adminNotes, setAdminNotes] = useState<string>("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const validTransitions = getValidStatusTransitions(payment.payment_status)
  const isRefund = selectedStatus === 'refunded'
  const paymentAmount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount

  // Reset form when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedStatus("")
      setRefundReason("")
      setAdminNotes("")
      setShowConfirmation(false)
    }
    onOpenChange(newOpen)
  }

  // Handle form submission
  const handleSubmit = () => {
    if (!selectedStatus) return
    
    // Show confirmation dialog
    setShowConfirmation(true)
  }

  // Handle confirmed status update
  const handleConfirmedUpdate = async () => {
    if (!selectedStatus) return

    try {
      setIsLoading(true)
      const { updatePaymentStatus } = await import("@/services/paymentService")
      const { toast } = await import("sonner")

      const refundData = isRefund ? {
        refund_amount: paymentAmount,
        refund_reason: refundReason,
        admin_notes: adminNotes || undefined
      } : undefined

      const result = await updatePaymentStatus(
        payment.payment_id,
        selectedStatus as 'successful' | 'pending' | 'failed' | 'refunded',
        refundData
      )

      if (result.is_valid_update) {
        // Create updated payment object
        const updatedPayment: Payment = {
          ...payment,
          payment_status: result.payment_status as 'successful' | 'pending' | 'failed' | 'refunded',
          updated_at: result.updated_at,
          ...(isRefund && {
            refund_amount: result.refund_amount,
            refund_date: result.refund_date,
            refund_reason: refundReason,
            admin_notes: adminNotes || undefined
          })
        }

        onStatusUpdate(updatedPayment)
        handleOpenChange(false)
      } else {
        throw new Error(result.message || 'Failed to update payment status')
      }
    } catch (error: any) {
      console.error('Error updating payment status:', error)
      const { toast } = await import("sonner")
      toast.error("Failed to update payment status", {
        description: error.message || "Please try again later"
      })
    } finally {
      setIsLoading(false)
      setShowConfirmation(false)
    }
  }

  // Validation
  const isFormValid = selectedStatus && (!isRefund || refundReason)

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Payment Status</DialogTitle>
            <DialogDescription>
              Change the payment status for Payment #{payment.payment_id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-status">Current Status</Label>
              <div className="p-2 bg-muted rounded-md text-sm capitalize">
                {payment.payment_status}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-status">New Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {validTransitions.map((transition) => (
                    <SelectItem key={transition.value} value={transition.value}>
                      {transition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validTransitions.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No status changes available for {payment.payment_status} payments.
                </p>
              )}
            </div>

            {isRefund && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="refund-amount">Refund Amount</Label>
                  <div className="p-2 bg-muted rounded-md text-sm">
                    ₹{paymentAmount.toFixed(2)} (Full Amount)
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refund-reason">Refund Reason *</Label>
                  <Select value={refundReason} onValueChange={setRefundReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select refund reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {refundReasons.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
                  <Textarea
                    id="admin-notes"
                    placeholder="Additional notes about the refund..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!isFormValid || isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isRefund ? 'Process Refund' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isRefund ? 'Confirm Refund' : 'Confirm Status Change'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isRefund ? (
                <>
                  Are you sure you want to process a refund of ₹{paymentAmount.toFixed(2)} for this payment?
                  <br /><br />
                  <strong>Reason:</strong> {refundReason}
                  {adminNotes && (
                    <>
                      <br />
                      <strong>Notes:</strong> {adminNotes}
                    </>
                  )}
                </>
              ) : (
                `Are you sure you want to change the payment status from "${payment.payment_status}" to "${selectedStatus}"?`
              )}
              <br /><br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedUpdate} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isRefund ? 'Process Refund' : 'Update Status'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
