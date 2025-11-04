"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Loader2, CheckCircle, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createManualPayment, ManualPaymentData } from "@/services/paymentService"
import { getAllBookings } from "@/services/bookingService"

// Booking interface for selection
interface BookingOption {
  booking_id: number
  booking_ref: string
  parent_name: string
  child_name: string
  event_title: string
  total_amount: number
  payment_status: string
  event_date: string
}

export default function RecordPaymentPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Form states
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [referenceNumber, setReferenceNumber] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [paymentNotes, setPaymentNotes] = useState("")
  const [paymentStatus, setPaymentStatus] = useState<"successful" | "pending">("successful")

  // Data states
  const [bookings, setBookings] = useState<BookingOption[]>([])
  const [filteredBookings, setFilteredBookings] = useState<BookingOption[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<BookingOption | null>(null)

  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingBookings, setIsLoadingBookings] = useState(true)

  // Load bookings on component mount
  useEffect(() => {
    loadBookings()
  }, [])

  // Filter bookings based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBookings(bookings)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = bookings.filter(booking =>
        booking.booking_ref.toLowerCase().includes(query) ||
        booking.parent_name.toLowerCase().includes(query) ||
        booking.child_name.toLowerCase().includes(query) ||
        booking.event_title.toLowerCase().includes(query) ||
        booking.booking_id.toString().includes(query)
      )
      setFilteredBookings(filtered)
    }
  }, [searchQuery, bookings])

  // Update payment amount when booking is selected
  useEffect(() => {
    if (selectedBooking) {
      setPaymentAmount(selectedBooking.total_amount)
    }
  }, [selectedBooking])

  const loadBookings = async () => {
    try {
      setIsLoadingBookings(true)
      const allBookings = await getAllBookings()
      
      // Filter bookings that might need payment recording (pending or failed payments)
      const bookingsNeedingPayment = allBookings
        .filter(booking => 
          booking.payment_status === 'pending' || 
          booking.payment_status === 'failed' ||
          !booking.payment_status
        )
        .map(booking => ({
          booking_id: booking.booking_id,
          booking_ref: booking.booking_ref || `B${booking.booking_id}`,
          parent_name: booking.parent_name || 'Unknown',
          child_name: booking.child_name || 'Unknown',
          event_title: booking.event_title || 'Unknown Event',
          total_amount: parseFloat(booking.total_amount?.toString() || '0'),
          payment_status: booking.payment_status || 'pending',
          event_date: booking.event_date || ''
        }))

      setBookings(bookingsNeedingPayment)
      setFilteredBookings(bookingsNeedingPayment)
    } catch (error) {
      console.error('Error loading bookings:', error)
      toast({
        title: "Error",
        description: "Failed to load bookings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoadingBookings(false)
    }
  }

  const handleBookingSelect = (bookingId: string) => {
    const booking = filteredBookings.find(b => b.booking_id.toString() === bookingId)
    setSelectedBooking(booking || null)
    setSelectedBookingId(booking?.booking_id || null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedBookingId || !paymentAmount || !paymentMethod) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const manualPaymentData: ManualPaymentData = {
        booking_id: selectedBookingId,
        amount: paymentAmount,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        payment_date: new Date().toISOString(),
        transaction_id: transactionId || undefined,
        admin_notes: paymentNotes || `Manual payment recorded by admin - ${paymentMethod}${referenceNumber ? ` (Ref: ${referenceNumber})` : ''}`,
        reference_number: referenceNumber || undefined
      }

      const result = await createManualPayment(manualPaymentData)

      if (result.success) {
        toast({
          title: "Success",
          description: `${result.message}. WhatsApp confirmation will be sent automatically.`,
        })

        // Redirect to payments page after successful recording
        setTimeout(() => {
          router.push("/admin/payments")
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
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/payments">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Record Manual Payment</h1>
            <p className="text-muted-foreground">Record a manual payment for an existing booking</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Booking</CardTitle>
            <CardDescription>Choose the booking for which you want to record a payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Bookings</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by booking ID, reference, name, or event..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking">Select Booking *</Label>
              <Select value={selectedBookingId?.toString() || ""} onValueChange={handleBookingSelect} required>
                <SelectTrigger id="booking">
                  <SelectValue placeholder={
                    isLoadingBookings
                      ? "Loading bookings..."
                      : filteredBookings.length === 0
                        ? "No bookings found"
                        : "Select a booking"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingBookings ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading bookings...
                    </div>
                  ) : filteredBookings.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No bookings found
                    </div>
                  ) : (
                    filteredBookings.map((booking) => (
                      <SelectItem key={booking.booking_id} value={booking.booking_id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {booking.booking_ref} - {booking.parent_name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {booking.child_name} • {booking.event_title} • ₹{booking.total_amount.toLocaleString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedBooking && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900">Selected Booking Details</h4>
                <div className="text-sm text-blue-800 mt-1 space-y-1">
                  <p><strong>Booking:</strong> {selectedBooking.booking_ref}</p>
                  <p><strong>Parent:</strong> {selectedBooking.parent_name}</p>
                  <p><strong>Child:</strong> {selectedBooking.child_name}</p>
                  <p><strong>Event:</strong> {selectedBooking.event_title}</p>
                  <p><strong>Amount:</strong> ₹{selectedBooking.total_amount.toLocaleString()}</p>
                  <p><strong>Current Status:</strong> {selectedBooking.payment_status}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Enter the payment information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                  <SelectTrigger id="payment-method">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Card">Card (Offline)</SelectItem>
                    <SelectItem value="NEFT/RTGS">NEFT/RTGS</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-status">Payment Status *</Label>
                <Select value={paymentStatus} onValueChange={(value: "successful" | "pending") => setPaymentStatus(value)} required>
                  <SelectTrigger id="payment-status">
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="successful">Successful</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={paymentAmount || ""}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  required
                />
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
              <Label htmlFor="notes">Payment Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about the payment..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" asChild>
            <Link href="/admin/payments">
              Cancel
            </Link>
          </Button>
          <Button type="submit" disabled={isLoading || !selectedBookingId || !paymentAmount || !paymentMethod}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recording Payment...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Record Payment
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
