"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Calendar, Search, Eye, Download, AlertTriangle, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/contexts/auth-context"
import { useUserProfileWithBookings } from "@/lib/swr-hooks"
import { useRouter } from "next/navigation"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [searchQuery, setSearchQuery] = useState("")
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Fetch customer profile with bookings
  const { userProfile, isLoading: profileLoading, isError } = useUserProfileWithBookings(user?.user_id || null)

  // Process and categorize bookings
  const { upcomingBookings, pastBookings } = useMemo(() => {
    if (!userProfile?.bookings || !Array.isArray(userProfile.bookings)) {
      return { upcomingBookings: [], pastBookings: [] }
    }

    const now = new Date()
    const upcoming: any[] = []
    const past: any[] = []

    userProfile.bookings.forEach((booking) => {
      const eventDate = new Date(booking.event?.event_date || '')
      if (eventDate >= now) {
        upcoming.push(booking)
      } else {
        past.push(booking)
      }
    })

    return { upcomingBookings: upcoming, pastBookings: past }
  }, [userProfile])

  // Filter bookings based on search query
  const filteredUpcomingBookings = upcomingBookings.filter((booking) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      (booking.event?.event_name || '').toLowerCase().includes(query) ||
      booking.booking_ref.toLowerCase().includes(query) ||
      (booking.booking_games && booking.booking_games.some((game: any) => (game.game?.game_name || '').toLowerCase().includes(query)))
    )
  })

  const filteredPastBookings = pastBookings.filter((booking) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      (booking.event?.event_name || '').toLowerCase().includes(query) ||
      booking.booking_ref.toLowerCase().includes(query) ||
      (booking.booking_games && booking.booking_games.some((game: any) => (game.game?.game_name || '').toLowerCase().includes(query)))
    )
  })

  // Handle booking cancellation
  const handleCancelBooking = (bookingId: number) => {
    // In a real app, this would be an API call to cancel the booking

  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Show loading state while checking authentication or loading profile
  if (authLoading || profileLoading) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground">View and manage your event bookings</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading your bookings...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Redirect to login if not authenticated (after loading is complete)
  if (!user) {
    router.push('/login')
    return null
  }

  if (isError) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground">View and manage your event bookings</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Bookings</h3>
            <p className="text-muted-foreground mb-4">
              We couldn't load your bookings. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground">View and manage your event bookings</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <CardTitle>Bookings</CardTitle>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming" className="pt-6">
              {filteredUpcomingBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Upcoming Bookings</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {searchQuery
                      ? "No bookings match your search criteria."
                      : "You don't have any upcoming events booked."}
                  </p>
                  {!searchQuery && (
                    <Button className="mt-4" asChild>
                      <Link href="/events">Browse Events</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredUpcomingBookings.map((booking) => (
                    <div key={booking.booking_id} className="rounded-lg border p-6">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold">{booking.event?.event_name || 'Unknown Event'}</h3>
                            {booking.booking_status === "Confirmed" && (
                              <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>
                            )}
                            {booking.booking_status === "Pending" && (
                              <Badge variant="outline">Pending</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{formatDate(booking.event?.event_date || '')}</Badge>
                            <Badge variant="outline">₹{booking.total_amount}</Badge>
                          </div>

                          {/* Display Games */}
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Games:</p>
                            {booking.booking_games && booking.booking_games.length > 0 ? (
                              booking.booking_games.map((bookingGame: any, index: number) => (
                                <div key={index} className="ml-4 space-y-1">
                                  <p className="text-sm font-medium">{bookingGame.game?.game_name || 'Unknown Game'}</p>
                                  <div className="flex gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      ₹{bookingGame.game_price}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {bookingGame.attendance_status}
                                    </Badge>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="ml-4 text-xs text-muted-foreground">No games available</p>
                            )}
                          </div>

                          {/* Display Payments */}
                          {booking.payments && booking.payments.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Payments:</p>
                              {booking.payments.map((payment: any, index: number) => (
                                <div key={index} className="ml-4 space-y-1">
                                  <p className="text-sm">
                                    {payment.payment_method} - ₹{payment.amount}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Transaction ID: {payment.transaction_id}
                                  </p>
                                  <div className="flex gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {payment.payment_status}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {formatDate(payment.payment_date)}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <p className="text-sm">
                            <span className="font-medium">Booking Reference:</span> {booking.booking_ref}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Payment:</span>{" "}
                            {booking.payments && booking.payments.length > 0 ? (
                              booking.payments[0].payment_status === "Paid" || booking.payments[0].payment_status === "successful" ? (
                                <span className="text-green-600">Paid</span>
                              ) : booking.payments[0].payment_status === "Pending" ? (
                                <span className="text-amber-600">Pending</span>
                              ) : (
                                <span className="text-gray-600">{booking.payments[0].payment_status}</span>
                              )
                            ) : (
                              <span className="text-gray-600">No Payment</span>
                            )}
                          </p>
                        </div>
                        <div className="flex flex-row gap-2 sm:flex-col">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/bookings/${booking.booking_ref}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/bookings/${booking.booking_id}/ticket`}>
                              <Download className="mr-2 h-4 w-4" />
                              Download Ticket
                            </Link>
                          </Button>

                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="past" className="pt-6">
              {filteredPastBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Past Bookings</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {searchQuery
                      ? "No bookings match your search criteria."
                      : "You don't have any past events."}
                  </p>
                  {!searchQuery && (
                    <Button className="mt-4" asChild>
                      <Link href="/events">Browse Events</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredPastBookings.map((booking) => (
                    <div key={booking.booking_id} className="rounded-lg border p-6">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold">{booking.event?.event_name || 'Unknown Event'}</h3>
                            {booking.booking_status === "Confirmed" && (
                              <Badge className="bg-blue-500 hover:bg-blue-600">Completed</Badge>
                            )}
                            {booking.booking_status === "Cancelled" && (
                              <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{formatDate(booking.event?.event_date || '')}</Badge>
                            <Badge variant="outline">₹{booking.total_amount}</Badge>
                          </div>

                          {/* Display Games */}
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Games:</p>
                            {booking.booking_games && booking.booking_games.length > 0 ? (
                              booking.booking_games.map((bookingGame: any, index: number) => (
                                <div key={index} className="ml-4 space-y-1">
                                  <p className="text-sm font-medium">{bookingGame.game?.game_name || 'Unknown Game'}</p>
                                  <div className="flex gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      ₹{bookingGame.game_price}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {bookingGame.attendance_status}
                                    </Badge>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="ml-4 text-xs text-muted-foreground">No games available</p>
                            )}
                          </div>

                          {/* Display Payments */}
                          {booking.payments && booking.payments.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Payments:</p>
                              {booking.payments.map((payment: any, index: number) => (
                                <div key={index} className="ml-4 space-y-1">
                                  <p className="text-sm">
                                    {payment.payment_method} - ₹{payment.amount}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Transaction ID: {payment.transaction_id}
                                  </p>
                                  <div className="flex gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {payment.payment_status}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {formatDate(payment.payment_date)}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <p className="text-sm">
                            <span className="font-medium">Booking Reference:</span> {booking.booking_ref}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Payment:</span>{" "}
                            {booking.payments && booking.payments.length > 0 ? (
                              booking.payments[0].payment_status === "Paid" || booking.payments[0].payment_status === "successful" ? (
                                <span className="text-green-600">Paid</span>
                              ) : booking.payments[0].payment_status === "Refunded" ? (
                                <span className="text-blue-600">Refunded</span>
                              ) : booking.payments[0].payment_status === "Pending" ? (
                                <span className="text-amber-600">Pending</span>
                              ) : (
                                <span className="text-gray-600">{booking.payments[0].payment_status}</span>
                              )
                            ) : (
                              <span className="text-gray-600">No Payment</span>
                            )}
                          </p>
                        </div>
                        <div className="flex flex-row gap-2 sm:flex-col">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/bookings/${booking.booking_ref}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </Button>
                          {booking.booking_status === "Confirmed" && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/bookings/${booking.booking_ref}/review`}>
                                Write Review
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
