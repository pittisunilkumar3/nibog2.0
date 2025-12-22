"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, MapPin, Users, ArrowLeft, Edit, Copy, Pause, Play, X, AlertTriangle, Eye, Plus, QrCode, FileText, Package, ClipboardList } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { getEventWithDetails, EventListItem } from "@/services/eventService"
import { useToast } from "@/components/ui/use-toast"

// Mock data - in a real app, this would come from an API
const events = [
  {
    id: "E001",
    title: "Baby Sensory Play",
    description: "Engage your baby's senses with various textures, sounds, and colors. This interactive session is designed to stimulate your baby's development through sensory exploration. Activities include tactile play, visual stimulation, and sound discovery. All materials used are baby-safe and age-appropriate.",
    gameTemplate: {
      id: "1",
      name: "Baby Sensory Play",
      minAgeMonths: 6,
      maxAgeMonths: 18,
      durationMinutes: 90,
      suggestedPrice: 799,
    },
    venue: {
      id: "1",
      name: "Little Explorers Center",
      address: "123 Play Street, Andheri West",
      city: "Mumbai",
    },
    date: "2025-04-15",
    slots: [
      {
        id: "S001",
        startTime: "10:00 AM",
        endTime: "11:30 AM",
        price: 799,
        maxParticipants: 12,
        currentParticipants: 7,
        status: "active",
        bookings: [
          { id: "B001", user: "Priya Sharma", childName: "Aryan", childAge: "14 months", status: "confirmed" },
          { id: "B002", user: "Rahul Verma", childName: "Zara", childAge: "12 months", status: "confirmed" },
          { id: "B003", user: "Ananya Patel", childName: "Vihaan", childAge: "10 months", status: "confirmed" },
          { id: "B004", user: "Vikram Singh", childName: "Aarav", childAge: "16 months", status: "confirmed" },
          { id: "B005", user: "Neha Gupta", childName: "Ishaan", childAge: "8 months", status: "confirmed" },
          { id: "B006", user: "Kiran Reddy", childName: "Aanya", childAge: "11 months", status: "confirmed" },
          { id: "B007", user: "Deepak Sharma", childName: "Advika", childAge: "15 months", status: "confirmed" },
        ]
      },
      {
        id: "S002",
        startTime: "02:00 PM",
        endTime: "03:30 PM",
        price: 799,
        maxParticipants: 12,
        currentParticipants: 4,
        status: "active",
        bookings: [
          { id: "B008", user: "Meera Joshi", childName: "Reyansh", childAge: "9 months", status: "confirmed" },
          { id: "B009", user: "Arjun Kumar", childName: "Saanvi", childAge: "13 months", status: "confirmed" },
          { id: "B010", user: "Pooja Mehta", childName: "Vivaan", childAge: "17 months", status: "confirmed" },
          { id: "B011", user: "Sanjay Patel", childName: "Anaya", childAge: "7 months", status: "confirmed" },
        ]
      },
    ],
    status: "scheduled",
    createdBy: "Admin User",
    createdAt: "2025-03-15",
    lastUpdatedBy: "Admin User",
    lastUpdatedAt: "2025-03-20",
  },
]

type Props = {
  params: { id: string }
}

export default function EventDetailPage({ params }: Props) {
  const router = useRouter()
  const { toast } = useToast()

  // In Next.js app router, params is already resolved
  const eventId = params.id

  const [event, setEvent] = useState<EventListItem | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("details")
  const [isLoading, setIsLoading] = useState({
    pause: false,
    resume: false,
    cancel: false,
    fetchingEvent: true
  })

  // Fetch event data when component mounts
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(prev => ({ ...prev, fetchingEvent: true }))
        setApiError(null)

        const eventData = await getEventWithDetails(Number(eventId))

        if (!eventData) {
          throw new Error("No event data returned from API")
        }

        setEvent(eventData)
      } catch (error: any) {
        console.error("Failed to fetch event data:", error)
        setApiError(error.message || "Failed to load event data. Please try again.")

        toast({
          title: "Error",
          description: error.message || "Failed to load event data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(prev => ({ ...prev, fetchingEvent: false }))
      }
    }

    fetchEventData()
  }, [eventId])

  // Handle pause event
  const handlePauseEvent = () => {
    setIsLoading({ ...isLoading, pause: true })

    // Simulate API call to pause the event
    setTimeout(() => {
      setIsLoading({ ...isLoading, pause: false })
      // In a real app, you would update the event status and refresh the page
      // For now, we'll just reload the page to simulate the change
      router.refresh()
    }, 1000)
  }

  // Handle resume event
  const handleResumeEvent = () => {
    setIsLoading({ ...isLoading, resume: true })

    // Simulate API call to resume the event
    setTimeout(() => {
      setIsLoading({ ...isLoading, resume: false })
      // In a real app, you would update the event status and refresh the page
      router.refresh()
    }, 1000)
  }

  // Handle cancel event
  const handleCancelEvent = () => {
    setIsLoading({ ...isLoading, cancel: true })

    // Simulate API call to cancel the event
    setTimeout(() => {
      setIsLoading({ ...isLoading, cancel: false })
      // In a real app, you would update the event status and refresh the page
      router.refresh()
    }, 1000)
  }

  // Show loading state
  if (isLoading.fetchingEvent) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <h2 className="text-xl font-semibold">Loading Event</h2>
          <p className="text-muted-foreground">Please wait while we fetch the event details...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (apiError) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-2xl font-bold">Error Loading Event</h2>
          <p className="text-muted-foreground">{apiError}</p>
          <Button className="mt-4" asChild>
            <Link href="/admin/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Show not found state
  if (!event) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Event Not Found</h2>
          <p className="text-muted-foreground">The event you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" asChild>
            <Link href="/admin/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Calculate total bookings and capacity from the API data
  // Since the API doesn't provide booking counts, we'll use 0 as a placeholder
  const totalBookings = 0 // In a real implementation, this would come from the API
  // Prefer detailed 'games_with_slots' if provided by API, otherwise fall back to 'games'
  const gameSlots = (event.games_with_slots || event.games || []) as any[]
  const totalCapacity = gameSlots.reduce((acc: number, slot: any) => acc + (slot.max_participants || 0), 0)
  const fillRate = totalCapacity > 0 ? Math.round((totalBookings / totalCapacity) * 100) : 0

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="outline" size="icon" asChild className="touch-manipulation flex-shrink-0">
            <Link href="/admin/events">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">
              {event.event_title} 
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">
              {event.venue_name}, {event.city_name} | {(event.event_date || "").split('T')[0]}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" asChild className="touch-manipulation">
            <Link href={`/admin/events/${event.event_id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Edit Event</span>
              <span className="sm:hidden">Edit</span>
            </Link>
          </Button>

          {(event.event_status || "").toLowerCase() === "published" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="touch-manipulation">
                  <Pause className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Pause Event</span>
                  <span className="sm:hidden">Pause</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="mx-4 max-w-md sm:max-w-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle>Pause Event</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm">
                    This will pause all slots for this event. No new bookings will be allowed, but existing bookings will be maintained. Are you sure you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="touch-manipulation">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handlePauseEvent}
                    disabled={isLoading.pause}
                    className="touch-manipulation"
                  >
                    {isLoading.pause ? "Pausing..." : "Pause Event"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {(event.event_status || "").toLowerCase() === "paused" && (
            <Button
              variant="outline"
              onClick={handleResumeEvent}
              disabled={isLoading.resume}
              className="touch-manipulation"
            >
              <Play className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">
                {isLoading.resume ? "Resuming..." : "Resume Event"}
              </span>
              <span className="sm:hidden">
                {isLoading.resume ? "Resuming..." : "Resume"}
              </span>
            </Button>
          )}
          {((event.event_status || "").toLowerCase() === "published" || (event.event_status || "").toLowerCase() === "paused") && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 touch-manipulation"
                >
                  <X className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Cancel Event</span>
                  <span className="sm:hidden">Cancel</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="mx-4 max-w-md sm:max-w-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Event</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm">
                    This will cancel the entire event and all its slots. All existing bookings will be cancelled, and users will be notified. This action cannot be undone. Are you sure you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="touch-manipulation">No, Keep Event</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600 touch-manipulation"
                    onClick={handleCancelEvent}
                    disabled={isLoading.cancel}
                  >
                    {isLoading.cancel ? "Cancelling..." : "Yes, Cancel Event"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Event Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1 rounded-lg border p-3">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className="flex items-center gap-2">
                  {(event.event_status || "").toLowerCase() === "published" && (
                    <Badge className="bg-green-500 hover:bg-green-600">Published</Badge>
                  )}
                  {(event.event_status || "").toLowerCase() === "draft" && (
                    <Badge variant="outline">Draft</Badge>
                  )}
                  {(event.event_status || "").toLowerCase() === "paused" && (
                    <Badge className="bg-amber-500 hover:bg-amber-600">Paused</Badge>
                  )}
                  {(event.event_status || "").toLowerCase() === "cancelled" && (
                    <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>
                  )}
                  {(event.event_status || "").toLowerCase() === "completed" && (
                    <Badge className="bg-blue-500 hover:bg-blue-600">Completed</Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1 rounded-lg border p-3">
                <span className="text-sm text-muted-foreground">Total Bookings</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{totalBookings}</span>
                  <span className="text-sm text-muted-foreground">of {totalCapacity}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 rounded-lg border p-3">
                <span className="text-sm text-muted-foreground">Fill Rate</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{fillRate}%</span>
                  <div className="h-2 flex-1 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${fillRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" asChild>
              <Link href={`/admin/events/${event.event_id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Event Details
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href={`/admin/events/${event.event_id}/slots`}>
                <Clock className="mr-2 h-4 w-4" />
                Manage Time Slots
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href={`/admin/events/${event.event_id}/participants`}>
                <Users className="mr-2 h-4 w-4" />
                View Participants
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href={`/admin/events/${event.event_id}/certificates`}>
                <FileText className="mr-2 h-4 w-4" />
                Manage Certificates
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href={`/admin/events/${event.event_id}/add-ons`}>
                <Package className="mr-2 h-4 w-4" />
                Add-on Collections
              </Link>
            </Button>

          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Event Details</TabsTrigger>
          <TabsTrigger value="slots">Time Slots</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="history">Audit History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-medium">Game Template</h3>
                  <p>{gameSlots[0]?.game_title || gameSlots[0]?.custom_title || "No game template"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Age Range: {gameSlots[0]?.min_age || 0}-{gameSlots[0]?.max_age || 0} {(gameSlots[0]?.min_age || 0) < 12 ? "months" : "years"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Duration: {gameSlots[0]?.game_duration_minutes || "N/A"} minutes
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-medium">Venue</h3>
                  <p>{event.venue_name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{event.venue_address || "No address provided"}</p>
                  <p className="text-sm text-muted-foreground">{event.city_name}</p>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="mb-2 font-medium">Description</h3>
                <p className="text-sm text-muted-foreground">{event.event_description || "No description provided"}</p>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-medium">Created At</h3>
                  <p className="text-sm text-muted-foreground">
                    {event.event_created_at ? new Date(event.event_created_at).toLocaleString() : "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-medium">Last Updated At</h3>
                  <p className="text-sm text-muted-foreground">
                    {event.event_updated_at ? new Date(event.event_updated_at).toLocaleString() : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slots" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Slots</CardTitle>
              <CardDescription>Manage time slots for this event</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gameSlots.map((slot) => (
                      <TableRow key={`${event.event_id}-${slot.id}`}>
                        <TableCell>
                          {slot.start_time} - {slot.end_time}
                        </TableCell>
                        <TableCell>₹{slot.slot_price}</TableCell>
                        <TableCell>{slot.max_participants}</TableCell>
                        <TableCell>
                          {/* Since the API doesn't provide booking counts, we'll use 0 as a placeholder */}
                          0/{slot.max_participants}
                          <div className="mt-1 h-2 w-full rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{
                                width: `${(0 / slot.max_participants) * 100}%`,
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          {slot.is_active === 1 || slot.is_active === true ? (
                            <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/events/${event.event_id}/slots/${slot.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/events/${event.event_id}/slots/${slot.id}/participants`}>
                                <Users className="mr-2 h-4 w-4" />
                                Participants
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Pause className="mr-2 h-4 w-4" />
                                  Pause
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Pause Time Slot</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will pause this time slot. No new bookings will be allowed, but existing bookings will be maintained. Are you sure you want to continue?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction>Pause Slot</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            <Button variant="ghost" size="sm">
                              <Play className="mr-2 h-4 w-4" />
                              Resume
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Time Slot</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    <p>
                                      This will cancel this time slot. Are you sure you want to continue?
                                    </p>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>No, Keep Slot</AlertDialogCancel>
                                  <AlertDialogAction className="bg-red-500 hover:bg-red-600">
                                    Yes, Cancel Slot
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex justify-end">
                <Button asChild>
                  <Link href={`/admin/events/${event.event_id}/slots/new`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Slot
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bookings</CardTitle>
              <CardDescription>View all bookings for this event</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={gameSlots.length > 0 ? `${gameSlots[0].id}` : "no-games"} className="space-y-4">
                <TabsList className="flex w-full flex-wrap">
                  {gameSlots.map((slot) => (
                    <TabsTrigger key={slot.id} value={`${slot.id}`} className="flex-grow">
                      {slot.start_time} - {slot.end_time} (0/{slot.max_participants})
                    </TabsTrigger>
                  ))}
                  {gameSlots.length === 0 && (
                    <TabsTrigger value="no-games" className="flex-grow">
                      No slots available
                    </TabsTrigger>
                  )}
                </TabsList>
                {gameSlots.map((slot) => (
                  <TabsContent key={slot.id} value={`${slot.id}`}>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Booking ID</TableHead>
                            <TableHead>Parent</TableHead>
                            <TableHead>Child</TableHead>
                            <TableHead>Child Age</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                              No bookings for this slot.
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button variant="outline" asChild>
                        <Link href={`/admin/events/${event.event_id}/slots/${slot.id}/participants/export`}>
                          Export Participants
                        </Link>
                      </Button>
                      <Button asChild>
                        <Link href={`/admin/events/${event.event_id}/slots/${slot.id}/participants`}>
                          Manage Participants
                        </Link>
                      </Button>
                    </div>
                  </TabsContent>
                ))}
                {gameSlots.length === 0 && (
                  <TabsContent value="no-games">
                    <div className="flex h-[200px] items-center justify-center rounded-md border">
                      <div className="text-center">
                        <p className="text-muted-foreground">No games available for this event.</p>
                        <Button className="mt-4" asChild>
                          <Link href={`/admin/events/${event.event_id}/slots/new`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Slot
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit History</CardTitle>
              <CardDescription>View all changes made to this event</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>2025-03-20 14:32:15</TableCell>
                      <TableCell>Admin User</TableCell>
                      <TableCell>update_event_details</TableCell>
                      <TableCell>Updated event description</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2025-03-18 10:15:42</TableCell>
                      <TableCell>Admin User</TableCell>
                      <TableCell>update_slot_capacity</TableCell>
                      <TableCell>Increased capacity for 10:00 AM slot from 10 to 12</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2025-03-15 09:45:30</TableCell>
                      <TableCell>Admin User</TableCell>
                      <TableCell>create_event</TableCell>
                      <TableCell>Created event with 2 slots</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
