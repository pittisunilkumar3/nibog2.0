"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Clock, MapPin, User, Baby, CreditCard, Loader2, AlertTriangle, RefreshCw, Mail, Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useUserProfileWithBookings } from "@/lib/swr-hooks"
import { formatDateShort } from "@/lib/utils"

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>
    case "pending":
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
    case "cancelled":
      return <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>
    case "completed":
      return <Badge className="bg-blue-500 hover:bg-blue-600">Completed</Badge>
    case "no show":
      return <Badge className="bg-gray-500 hover:bg-gray-600">No Show</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

type Props = {
  params: { bookingId: string }
}

export default function BookingDetailPage({ params }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()
  const { userProfile, isLoading: profileLoading, isError } = useUserProfileWithBookings(user?.user_id || null)

  const bookingRef = params.bookingId

  // Find the booking from user profile
  const booking = useMemo(() => {
    if (!userProfile?.bookings) return null

    const found = userProfile.bookings.find(b => b.booking_ref === bookingRef)
    if (!found) return null

    // Get child information
    const child = found.children?.[0]

    // Get parent information
    const parent = found.parent

    // Get payment information
    const payment = found.payments?.[0]

    // Get games info
    const games = child?.booking_games || []

    return {
      booking_id: found.booking_id,
      booking_ref: found.booking_ref,
      booking_status: found.status,
      total_amount: found.total_amount.toString(),
      payment_method: payment?.payment_method || 'N/A',
      payment_status: payment?.payment_status || 'Pending',
      booking_created_at: found.created_at,
      parent_name: parent?.parent_name || userProfile.user?.full_name || 'N/A',
      parent_email: parent?.email || userProfile.user?.email || 'N/A',
      additional_phone: parent?.phone || 'N/A',
      child_name: child?.full_name || 'N/A',
      date_of_birth: child?.date_of_birth || 'N/A',
      school_name: child?.school_name || '',
      gender: child?.gender || 'N/A',
      event_title: found.event?.event_name || 'Unknown Event',
      event_date: found.event?.event_date || '',
      event_description: found.event?.event_description || '',
      venue_name: found.event?.venue?.venue_name || 'N/A',
      city_name: found.event?.venue?.city || 'N/A',
      game_price: games?.[0]?.game_price?.toString() || '',
      start_time: found.event?.start_time || '',
      end_time: found.event?.end_time || '',
      slot_price: games?.[0]?.game_price?.toString() || '',
      games: games,
      payments: found.payments || []
    }
  }, [userProfile, bookingRef])

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    router.push('/login')
    return null
  }

  // Loading state
  if (authLoading || profileLoading) {
    return (
      <div className="container py-8">
        <div className="flex h-[400px] items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <h2 className="text-xl font-semibold">Loading booking details...</h2>
            <p className="text-muted-foreground">Please wait while we fetch your booking information.</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (isError || !booking) {
    return (
      <div className="container py-8">
        <div className="flex h-[400px] items-center justify-center">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
            <h2 className="text-2xl font-bold">Booking Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The booking you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard/bookings">Back to Bookings</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/bookings">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Booking Details</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {booking.booking_ref} | {booking.event_title}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Booking Information</CardTitle>
                {getStatusBadge(booking.booking_status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-3 font-medium">Event Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium">{booking.event_title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateShort(booking.event_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium">{booking.venue_name}</p>
                        <p className="text-sm text-muted-foreground">{booking.city_name}</p>
                      </div>
                    </div>
                    {booking.start_time && booking.end_time && (
                      <div className="flex items-start gap-3">
                        <Clock className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="font-medium">Time Slot</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.start_time} - {booking.end_time}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-medium">Child Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Baby className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium">{booking.child_name}</p>
                        <p className="text-sm text-muted-foreground">
                          DOB: {formatDateShort(booking.date_of_birth)}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{booking.gender}</p>
                      </div>
                    </div>
                    {booking.school_name && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">School:</span>{" "}
                        <span className="font-medium">{booking.school_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {booking.event_description && (
                <div className="rounded-md bg-muted p-4">
                  <h3 className="mb-2 font-medium">About the Event</h3>
                  <p className="text-sm text-muted-foreground">{booking.event_description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Payment Status</p>
                  <p className="text-sm">
                    {booking.payment_status === "Paid" && (
                      <span className="text-green-600 font-medium">Paid</span>
                    )}
                    {booking.payment_status === "Pending" && (
                      <span className="text-amber-600 font-medium">Pending</span>
                    )}
                    {booking.payment_status === "Refunded" && (
                      <span className="text-blue-600 font-medium">Refunded</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Payment Method</p>
                  <p className="text-sm text-muted-foreground">{booking.payment_method || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Booking Date</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateShort(booking.booking_created_at)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                {booking.games && booking.games.length > 0 && (
                  <>
                    <h3 className="font-medium mb-2">Games Booked</h3>
                    {booking.games.map((bookingGame: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{bookingGame.game?.game_name || 'Unknown Game'}</span>
                        <span>₹{bookingGame.game_price}</span>
                      </div>
                    ))}
                    <Separator className="my-2" />
                  </>
                )}
                <div className="flex justify-between font-medium text-lg">
                  <p>Total Amount</p>
                  <p>₹{booking.total_amount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Booking Reference</span>
                  <span className="font-medium break-all">{booking.booking_ref}</span>
                </div>
              </div>
              {booking.games && booking.games.length > 0 && (
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium mb-2">Booked Games</h3>
                  <div className="space-y-2">
                    {booking.games.map((bookingGame: any, index: number) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{bookingGame.game?.game_name || 'Unknown Game'}</span>
                        <Badge variant="outline">₹{bookingGame.game_price}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {getStatusBadge(booking.booking_status)}
                </div>
              </div>

              {booking.payments && booking.payments.length > 0 && (
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium mb-2">Payment Details</h3>
                  <div className="space-y-2">
                    {booking.payments.map((payment: any, index: number) => (
                      <div key={index} className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Method:</span>
                          <span>{payment.payment_method}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Transaction ID:</span>
                          <span className="break-all">{payment.transaction_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount:</span>
                          <span>₹{payment.amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <Button className="w-full" variant="outline" asChild>
                <Link href="/events">Browse More Events</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

