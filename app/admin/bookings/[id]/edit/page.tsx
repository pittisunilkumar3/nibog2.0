"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Check, Loader2, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDateShort } from "@/lib/utils"
import { getBookingById, updateBookingStatus, type Booking } from "@/services/bookingService"

// Booking statuses that can be updated
const statuses = [
  { id: "1", name: "Pending", label: "Pending" },
  { id: "2", name: "Confirmed", label: "Confirmed" },
  { id: "3", name: "Cancelled", label: "Cancelled" },
  { id: "4", name: "Completed", label: "Completed" },
  { id: "5", name: "No Show", label: "No Show" },
  { id: "6", name: "Refunded", label: "Refunded" },
]

type Props = {
  params: { id: string }
}

export default function EditBookingPage({ params }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [status, setStatus] = useState("")

  // Extract booking ID from params
  const bookingId = params.id

  // Fetch booking data
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data = await getBookingById(bookingId)
        setBooking(data)
        setStatus(data.booking_status)
      } catch (error: any) {
        console.error("Failed to fetch booking:", error)
        setError(error.message || "Failed to load booking details")
        toast({
          title: "Error",
          description: "Failed to load booking details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (bookingId) {
      fetchBooking()
    }
  }, [bookingId, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!booking) return

    try {
      setIsSaving(true)

      // Only update the status if it has changed
      if (status !== booking.booking_status) {
        await updateBookingStatus(Number(bookingId), status)

        // Update local state
        setBooking({ ...booking, booking_status: status })

        toast({
          title: "Success",
          description: `Booking status updated to ${status}.`,
        })
      }

      setIsSaved(true)

      // Reset the saved state after 1.5 seconds and redirect
      setTimeout(() => {
        setIsSaved(false)
        router.push(`/admin/bookings/${bookingId}`)
      }, 1500)
    } catch (error: any) {
      console.error("Failed to update booking:", error)
      toast({
        title: "Error",
        description: "Failed to update booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading booking details...</h2>
          <p className="text-muted-foreground">Please wait while we fetch the booking information.</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-semibold">
            {error ? "Error loading booking" : "Booking not found"}
          </h2>
          <p className="text-muted-foreground">
            {error || "The booking you are looking for does not exist."}
          </p>
          <Button className="mt-4" onClick={() => router.push("/admin/bookings")}>
            Back to Bookings
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="outline" size="icon" asChild className="touch-manipulation flex-shrink-0">
            <Link href={`/admin/bookings/${bookingId}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">Edit Booking</h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">Update booking status for #{booking.booking_id}</p>
          </div>
        </div>
      </div>

      {/* Booking Information Display */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Information</CardTitle>
          <CardDescription>Current booking details (read-only)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Customer</Label>
              <p className="text-sm font-medium break-words">{booking.parent_name}</p>
              <p className="text-xs text-muted-foreground break-all">{booking.parent_email}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Child</Label>
              <p className="text-sm font-medium break-words">{booking.child_full_name}</p>
              <p className="text-xs text-muted-foreground">{booking.child_gender}, Born: {formatDateShort(booking.child_date_of_birth)}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Event</Label>
              <p className="text-sm font-medium break-words">{booking.event_title}</p>
              <p className="text-xs text-muted-foreground">{formatDateShort(booking.event_event_date)}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Venue</Label>
              <p className="text-sm font-medium break-words">{booking.venue_name}</p>
              <p className="text-xs text-muted-foreground">{booking.city_name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Update Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Update Booking Status</CardTitle>
            <CardDescription>
              Change the booking status. Note: Booking data is preserved for record-keeping purposes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
            <div className="space-y-2">
              <Label htmlFor="status">Booking Status</Label>
              <Select value={status} onValueChange={setStatus} required>
                <SelectTrigger id="status" className="touch-manipulation">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Current Status:</strong> {booking.booking_status}</p>
              <p><strong>Total Amount:</strong> ₹{booking.total_amount}</p>
              <p><strong>Payment Status:</strong> {booking.payment_status}</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-end p-4 sm:p-6">
            <Button variant="outline" type="button" asChild className="w-full sm:w-auto touch-manipulation">
              <Link href={`/admin/bookings/${bookingId}`}>
                Cancel
              </Link>
            </Button>
            <Button
              type="submit"
              disabled={isSaving || isSaved || status === booking.booking_status}
              className="w-full sm:w-auto touch-manipulation"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                  <span className="sm:hidden">Saving...</span>
                </>
              ) : isSaved ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Saved</span>
                  <span className="sm:hidden">Saved</span>
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Update Status</span>
                  <span className="sm:hidden">Update</span>
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
