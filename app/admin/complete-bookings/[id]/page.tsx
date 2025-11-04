"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, RefreshCw, Calendar, MapPin, User, Baby, CreditCard, Phone, Mail, Building2, Trophy, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Booking } from "@/services/bookingService"
import { SkeletonCard } from "@/components/ui/skeleton-loader"
import { EmptyError } from "@/components/ui/empty-state"

// Status badge component
const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>
    case 'pending':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
    case 'cancelled':
      return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
    case 'completed':
      return <Badge className="bg-blue-500 hover:bg-blue-600"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
    default:
      return <Badge variant="outline"><AlertTriangle className="h-3 w-3 mr-1" />{status}</Badge>
  }
}

// Payment status badge
const getPaymentStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'paid':
      return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>
    case 'pending':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
    case 'failed':
      return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
    default:
      return <Badge variant="outline"><AlertTriangle className="h-3 w-3 mr-1" />{status}</Badge>
  }
}

export default function CompleteBookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
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
          description={error || "The complete booking you're looking for doesn't exist."}
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Complete Booking #{booking.booking_id}</h1>
            <p className="text-muted-foreground">
              {booking.booking_ref && `Reference: ${booking.booking_ref}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchBooking} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button asChild size="sm">
            <Link href={`/admin/complete-bookings/${booking.booking_id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Booking Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getStatusBadge(booking.booking_status)}
              <p className="text-xs text-muted-foreground">
                Created: {new Date(booking.booking_created_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">₹{booking.total_amount}</div>
              {getPaymentStatusBadge(booking.payment_status)}
              <p className="text-xs text-muted-foreground">
                Method: {booking.payment_method}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Event</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium break-words">{booking.event_title}</p>
              <p className="text-sm text-muted-foreground">
                {booking.event_event_date && new Date(booking.event_event_date).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Game</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium break-words">{booking.game_name}</p>
              <p className="text-xs text-muted-foreground">
                Registration game
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Parent Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Parent Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Contact Details</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="break-words">{booking.parent_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="break-words">{booking.parent_email}</span>
                </div>
                {booking.parent_additional_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{booking.parent_additional_phone}</span>
                  </div>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">User Account</h4>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Name:</span> {booking.user_full_name}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {booking.user_email}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Phone:</span> {booking.user_phone}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Account Status:</span>{" "}
                  <Badge variant={booking.user_is_active ? "default" : "secondary"}>
                    {booking.user_is_active ? "Active" : "Inactive"}
                  </Badge>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Child Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Baby className="h-5 w-5" />
              Child Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Personal Details</h4>
              <div className="space-y-2">
                <p className="font-medium break-words">{booking.child_full_name}</p>
                <p className="text-sm text-muted-foreground">
                  Born: {new Date(booking.child_date_of_birth).toLocaleDateString()}, {booking.child_gender}
                </p>
                {booking.child_age && (
                  <p className="text-sm text-muted-foreground">Age: {booking.child_age}</p>
                )}
                {booking.child_school_name && (
                  <p className="text-sm text-muted-foreground break-words">School: {booking.child_school_name}</p>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">Registration Status</h4>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Status:</span>{" "}
                  <Badge variant={booking.child_is_active ? "default" : "secondary"}>
                    {booking.child_is_active ? "Active" : "Inactive"}
                  </Badge>
                </p>
                <p className="text-sm text-muted-foreground">
                  Registered: {new Date(booking.child_created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
