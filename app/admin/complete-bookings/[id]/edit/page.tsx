"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Booking, updateBookingStatus } from "@/services/bookingService"
import { SkeletonCard } from "@/components/ui/skeleton-loader"
import { EmptyError } from "@/components/ui/empty-state"

// Status options
const statusOptions = [
  { value: "Pending", label: "Pending" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "Completed", label: "Completed" },
]

export default function EditCompleteBookingPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    booking_status: "",
    parent_name: "",
    parent_email: "",
    parent_additional_phone: "",
    child_full_name: "",
    child_school_name: "",
    total_amount: "",
  })

  const bookingId = params.id as string

  // Fetch booking details
  const fetchBooking = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/complete-bookings/get/${bookingId}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Complete booking not found")
        }
        throw new Error(`Failed to fetch complete booking: ${response.status}`)
      }

      const data = await response.json()
      setBooking(data)
      
      // Initialize form data
      setFormData({
        booking_status: data.booking_status || "",
        parent_name: data.parent_name || "",
        parent_email: data.parent_email || "",
        parent_additional_phone: data.parent_additional_phone || "",
        child_full_name: data.child_full_name || "",
        child_school_name: data.child_school_name || "",
        total_amount: data.total_amount || "",
      })
    } catch (error: any) {
      console.error("Failed to fetch complete booking:", error)
      setError(error.message || "Failed to load complete booking details.")
      toast({
        title: "Error",
        description: "Failed to load complete booking details.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (bookingId) {
      fetchBooking()
    }
  }, [bookingId])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!booking) return

    try {
      setIsSaving(true)

      // For now, we can only update the booking status through the API
      // Other fields would require additional API endpoints
      if (formData.booking_status !== booking.booking_status) {
        await updateBookingStatus(booking.booking_id, formData.booking_status)
      }

      toast({
        title: "Success",
        description: "Complete booking updated successfully.",
      })

      // Redirect back to the booking detail page
      router.push(`/admin/complete-bookings/${bookingId}`)
    } catch (error: any) {
      console.error("Failed to update complete booking:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update complete booking.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="grid gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <EmptyError
          title="Complete booking not found"
          description={error || "The complete booking you're trying to edit doesn't exist."}
          action={
            <Button onClick={fetchBooking} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Complete Booking #{booking.booking_id}</h1>
          <p className="text-muted-foreground">
            {booking.booking_ref && `Reference: ${booking.booking_ref}`}
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Booking Information */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="booking_status">Booking Status</Label>
                <Select
                  value={formData.booking_status}
                  onValueChange={(value) => handleInputChange("booking_status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_amount">Total Amount (₹)</Label>
                <Input
                  id="total_amount"
                  type="number"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) => handleInputChange("total_amount", e.target.value)}
                  placeholder="Enter amount"
                  disabled // Amount updates would require additional API support
                />
                <p className="text-xs text-muted-foreground">
                  Amount updates require additional API support
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Parent Information */}
          <Card>
            <CardHeader>
              <CardTitle>Parent Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parent_name">Parent Name</Label>
                <Input
                  id="parent_name"
                  value={formData.parent_name}
                  onChange={(e) => handleInputChange("parent_name", e.target.value)}
                  placeholder="Enter parent name"
                  disabled // Parent info updates would require additional API support
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent_email">Parent Email</Label>
                <Input
                  id="parent_email"
                  type="email"
                  value={formData.parent_email}
                  onChange={(e) => handleInputChange("parent_email", e.target.value)}
                  placeholder="Enter parent email"
                  disabled // Parent info updates would require additional API support
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent_additional_phone">Phone Number</Label>
                <Input
                  id="parent_additional_phone"
                  value={formData.parent_additional_phone}
                  onChange={(e) => handleInputChange("parent_additional_phone", e.target.value)}
                  placeholder="Enter phone number"
                  disabled // Parent info updates would require additional API support
                />
              </div>
              
              <p className="text-xs text-muted-foreground">
                Parent information updates require additional API support
              </p>
            </CardContent>
          </Card>

          {/* Child Information */}
          <Card>
            <CardHeader>
              <CardTitle>Child Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="child_full_name">Child Name</Label>
                <Input
                  id="child_full_name"
                  value={formData.child_full_name}
                  onChange={(e) => handleInputChange("child_full_name", e.target.value)}
                  placeholder="Enter child name"
                  disabled // Child info updates would require additional API support
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="child_school_name">School Name</Label>
                <Input
                  id="child_school_name"
                  value={formData.child_school_name}
                  onChange={(e) => handleInputChange("child_school_name", e.target.value)}
                  placeholder="Enter school name"
                  disabled // Child info updates would require additional API support
                />
              </div>
              
              <p className="text-xs text-muted-foreground">
                Child information updates require additional API support
              </p>
            </CardContent>
          </Card>

          {/* Event Information (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Event Title</Label>
                <Input value={booking.event_title} disabled />
              </div>

              <div className="space-y-2">
                <Label>Game</Label>
                <Input value={booking.game_name} disabled />
              </div>

              <div className="space-y-2">
                <Label>Venue</Label>
                <Input value={`${booking.venue_name}, ${booking.city_name}`} disabled />
              </div>
              
              <p className="text-xs text-muted-foreground">
                Event information is read-only
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
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
      </form>
    </div>
  )
}
