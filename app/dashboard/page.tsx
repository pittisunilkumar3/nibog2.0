"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Baby, CreditCard, MapPin, User, Mail, Phone, Edit, Eye, Loader2, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatAge } from "@/lib/age-calculation"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useCustomerProfile } from "@/lib/swr-hooks"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

const cities = [
  { id: "1", name: "Mumbai" },
  { id: "2", name: "Delhi" },
  { id: "3", name: "Bangalore" },
  { id: "4", name: "Chennai" },
  { id: "5", name: "Hyderabad" },
  { id: "6", name: "Pune" },
]

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { customerProfile, isLoading: profileLoading, isError } = useCustomerProfile(user?.user_id || null)

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [defaultCity, setDefaultCity] = useState("")

  // Update form fields when customer profile is loaded
  useEffect(() => {
    if (customerProfile) {
      setName(customerProfile.user_name || "")
      setEmail(customerProfile.email || "")
      setPhone(customerProfile.phone || "")
      setDefaultCity(customerProfile.city || "")
    }
  }, [customerProfile])

  // Get upcoming bookings (future events)
  const upcomingBookings = useMemo(() => {
    if (!customerProfile?.bookings) {
      return []
    }

    const now = new Date()
    now.setHours(0, 0, 0, 0) // Set to start of today for better comparison

    return customerProfile.bookings
      .filter((booking) => {
        const eventDate = new Date(booking.event_date)
        const isFuture = eventDate >= now
        const isNotCancelled = booking.status?.toLowerCase() !== "cancelled"
        return isFuture && isNotCancelled
      })
      .slice(0, 5) // Show only first 5
  }, [customerProfile])

  // Get past bookings (past events)
  const pastBookings = useMemo(() => {
    if (!customerProfile?.bookings) {
      return []
    }

    const now = new Date()
    now.setHours(0, 0, 0, 0) // Set to start of today for better comparison

    return customerProfile.bookings
      .filter((booking) => {
        const eventDate = new Date(booking.event_date)
        const isPast = eventDate < now
        const isNotCancelled = booking.status?.toLowerCase() !== "cancelled"
        return isPast && isNotCancelled
      })
      .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()) // Sort by date descending (most recent first)
      .slice(0, 5) // Show only first 5
  }, [customerProfile])

  // Get recent payments from bookings
  const recentPayments = useMemo(() => {
    if (!customerProfile?.bookings) {
      return []
    }

    // Extract all payments from all bookings
    const allPayments = customerProfile.bookings
      .filter(booking => booking.payments && booking.payments.length > 0)
      .flatMap(booking =>
        booking.payments.map(payment => ({
          ...payment,
          booking_ref: booking.booking_ref,
          event_name: booking.event_name,
          event_date: booking.event_date,
        }))
      )
      .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()) // Sort by date descending
      .slice(0, 5) // Show only 5 most recent payments

    return allPayments
  }, [customerProfile])

  // Get user initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Handle profile update
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, this would be an API call to update the profile
    console.log({
      user_id: customerProfile?.user_id,
      name,
      email,
      phone,
      defaultCity,
    })

    setIsEditing(false)
  }

  // Show loading state while checking authentication or loading profile
  if (authLoading || profileLoading) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-muted-foreground">Manage your profile and view your bookings</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading your dashboard...</span>
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

  // Show error state
  if (isError || !customerProfile) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-muted-foreground">Manage your profile and view your bookings</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unable to Load Dashboard</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We couldn't load your profile data. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground">Manage your profile and view your bookings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile</CardTitle>
                {!isEditing && (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleUpdateProfile}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultCity">Default City</Label>
                      <Select value={defaultCity} onValueChange={setDefaultCity}>
                        <SelectTrigger id="defaultCity">
                          <SelectValue placeholder="Select your city" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.id} value={city.name}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Avatar className="h-24 w-24">
                      <AvatarImage
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(customerProfile.user_name)}&background=random&color=fff&size=128`}
                        alt={customerProfile.user_name}
                      />
                      <AvatarFallback>{getInitials(customerProfile.user_name)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{customerProfile.user_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate">{customerProfile.email}</span>
                      {customerProfile.email_status === "Verified" && (
                        <Badge variant="outline" className="ml-auto text-xs text-green-500">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{customerProfile.phone}</span>
                      {customerProfile.phone_status === "Verified" && (
                        <Badge variant="outline" className="ml-auto text-xs text-green-500">
                          Verified
                        </Badge>
                      )}
                    </div>
                    {customerProfile.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{customerProfile.city}</span>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      <span>User ID: {customerProfile.user_id}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Children</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/children">
                    <Edit className="mr-2 h-4 w-4" />
                    Manage
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!customerProfile.children || customerProfile.children.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Baby className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No children added yet</p>
                  <Button className="mt-4" size="sm" asChild>
                    <Link href="/dashboard/children">Add Child</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerProfile.children.map((child) => (
                    <div key={child.child_id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{child.child_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {child.date_of_birth}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatAge(child.age_in_months)}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/children?edit=${child.child_id}`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/dashboard/children">
                  <Baby className="mr-2 h-4 w-4" />
                  {customerProfile.children && customerProfile.children.length > 0 ? "Manage Children" : "Add Child"}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming" className="pt-4">
                  {upcomingBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">No Upcoming Bookings</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {customerProfile?.bookings && customerProfile.bookings.length > 0
                          ? "All your bookings are in the past or cancelled."
                          : "You don't have any upcoming events booked."}
                      </p>
                      {customerProfile?.bookings && customerProfile.bookings.length > 0 && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Total bookings: {customerProfile.bookings.length}
                        </p>
                      )}
                      <Button className="mt-4" asChild>
                        <Link href="/events">Browse Events</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingBookings.map((booking) => (
                        <div key={booking.booking_id} className="rounded-lg border p-4">
                          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                              <h3 className="font-semibold">{booking.event_name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Booking Ref: {booking.booking_ref}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <Badge variant="outline">{format(new Date(booking.event_date), "PPP")}</Badge>
                              </div>
                              {booking.games && booking.games.length > 0 && (
                                <p className="mt-2 text-sm">
                                  <span className="font-medium">Games:</span> {booking.games.map(g => g.game_name).join(", ")}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {booking.status?.toLowerCase() === "confirmed" && (
                                <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>
                              )}
                              {booking.status?.toLowerCase() === "pending" && (
                                <Badge variant="outline">Pending</Badge>
                              )}
                              {booking.status?.toLowerCase() === "cancelled" && (
                                <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>
                              )}
                              {booking.status && !["confirmed", "pending", "cancelled"].includes(booking.status.toLowerCase()) && (
                                <Badge variant="outline">{booking.status}</Badge>
                              )}
                              <Badge variant="outline" className="text-base font-semibold">
                                ₹{booking.total_amount}
                              </Badge>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/dashboard/bookings/${booking.booking_ref}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="past" className="pt-4">
                  {pastBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">No Past Bookings</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        You don't have any past events.
                      </p>
                      <Button className="mt-4" asChild>
                        <Link href="/events">Browse Events</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pastBookings.map((booking) => (
                        <div key={booking.booking_id} className="rounded-lg border p-4">
                          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                              <h3 className="font-semibold">{booking.event_name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Booking Ref: {booking.booking_ref}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <Badge variant="outline">{format(new Date(booking.event_date), "PPP")}</Badge>
                              </div>
                              {booking.games && booking.games.length > 0 && (
                                <p className="mt-2 text-sm">
                                  <span className="font-medium">Games:</span> {booking.games.map(g => g.game_name).join(", ")}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {booking.status?.toLowerCase() === "confirmed" && (
                                <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>
                              )}
                              {booking.status?.toLowerCase() === "pending" && (
                                <Badge variant="outline">Pending</Badge>
                              )}
                              {booking.status?.toLowerCase() === "cancelled" && (
                                <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>
                              )}
                              {booking.status && !["confirmed", "pending", "cancelled"].includes(booking.status.toLowerCase()) && (
                                <Badge variant="outline">{booking.status}</Badge>
                              )}
                              <Badge variant="outline" className="text-base font-semibold">
                                ₹{booking.total_amount}
                              </Badge>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/dashboard/bookings/${booking.booking_ref}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/dashboard/bookings">
                  <Calendar className="mr-2 h-4 w-4" />
                  View All Bookings
                </Link>
              </Button>
              <Button asChild>
                <Link href="/events">
                  Browse Events
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>Your recent payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentPayments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Payment History</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You haven't made any payments yet.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href="/events">Browse Events</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPayments.map((payment) => (
                    <div key={payment.payment_id} className="rounded-lg border p-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{payment.event_name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              Booking: {payment.booking_ref}
                            </p>
                          </div>
                          <Badge
                            variant={payment.payment_status === "successful" ? "default" : "secondary"}
                            className={payment.payment_status === "successful" ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            {payment.payment_status === "successful" ? "Paid" : payment.payment_status}
                          </Badge>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Payment Method</p>
                            <p className="font-medium">{payment.payment_method}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Amount</p>
                            <p className="font-semibold text-base">₹{payment.amount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Transaction ID</p>
                            <p className="font-mono text-xs truncate" title={payment.transaction_id}>
                              {payment.transaction_id}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Payment Date</p>
                            <p className="text-xs">
                              {format(new Date(payment.payment_date), "PPp")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/payments">View All Payments</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
