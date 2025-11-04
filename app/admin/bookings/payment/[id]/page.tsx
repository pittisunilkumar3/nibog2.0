"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createManualPayment, ManualPaymentData } from "@/services/paymentService"
import Link from "next/link"

export default function ManualPaymentPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const bookingId = params.id as string
  const amount = searchParams.get('amount')

  // Form states
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [referenceNumber, setReferenceNumber] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [notes, setNotes] = useState("")
  const [isRecording, setIsRecording] = useState(false)

  // Validation
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!paymentMethod) {
      newErrors.paymentMethod = "Payment method is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!bookingId || !amount) {
      toast({
        title: "Error",
        description: "Missing booking ID or amount",
        variant: "destructive"
      })
      return
    }

    setIsRecording(true)

    try {
      const manualPaymentData: ManualPaymentData = {
        booking_id: parseInt(bookingId),
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        payment_status: "successful",
        payment_date: new Date().toISOString(),
        transaction_id: transactionId || undefined,
        admin_notes: notes || `Manual payment recorded by admin - ${paymentMethod}${referenceNumber ? ` (Ref: ${referenceNumber})` : ''}`,
        reference_number: referenceNumber || undefined
      }

      const result = await createManualPayment(manualPaymentData)

      if (result.success) {
        toast({
          title: "Success",
          description: `${result.message}. WhatsApp confirmation will be sent automatically.`,
        })

        // Redirect back to booking detail page with success parameter
        setTimeout(() => {
          router.push(`/admin/bookings/${bookingId}?payment_success=true`)
        }, 1500)
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
      setIsRecording(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/bookings/new">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Record Manual Payment</h1>
            <p className="text-muted-foreground">Record a manual payment for booking #{bookingId}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>
            Booking #{bookingId} - Amount: ₹{amount ? parseFloat(amount).toLocaleString() : '0'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
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
              {errors.paymentMethod && (
                <p className="text-sm text-red-600">{errors.paymentMethod}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference-number">Reference Number</Label>
              <Input
                id="reference-number"
                placeholder="Cheque number, transaction ID, etc."
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction-id">Custom Transaction ID (Optional)</Label>
              <Input
                id="transaction-id"
                placeholder="Leave empty to auto-generate"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about the payment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/bookings/new")}
                disabled={isRecording}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isRecording}
              >
                {isRecording ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recording Payment...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Record Payment
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
