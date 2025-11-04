"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, MapPin, Users, ArrowLeft, Edit, Copy, Pause, Play, X, AlertTriangle, Eye, Plus } from "lucide-react"
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

export default function EventDetailClientPage({ eventId }: { eventId: string }) {
  const router = useRouter()
  const event = events.find((e) => e.id === eventId)
  const [activeTab, setActiveTab] = useState("details")

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

  const totalBookings = event.slots.reduce((acc, slot) => acc + slot.currentParticipants, 0)
  const totalCapacity = event.slots.reduce((acc, slot) => acc + slot.maxParticipants, 0)
  const fillRate = totalCapacity > 0 ? Math.round((totalBookings / totalCapacity) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/events">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
            <p className="text-muted-foreground">
              {event.venue.name}, {event.venue.city} | {event.date}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/events/${event.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Event
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/events/clone/${event.id}`}>
              <Copy className="mr-2 h-4 w-4" />
              Clone Event
            </Link>
          </Button>
          {event.status === "scheduled" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Pause className="mr-2 h-4 w-4" />
                  Pause Event
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Pause Event</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will pause all slots for this event. No new bookings will be allowed, but existing bookings will be maintained. Are you sure you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Pause Event</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {event.status === "paused" && (
            <Button variant="outline">
              <Play className="mr-2 h-4 w-4" />
              Resume Event
            </Button>
          )}
          {(event.status === "scheduled" || event.status === "paused") && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20">
                  <X className="mr-2 h-4 w-4" />
                  Cancel Event
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Event</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will cancel the entire event and all its slots. All existing bookings will be cancelled, and users will be notified. This action cannot be undone. Are you sure you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, Keep Event</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-500 hover:bg-red-600">
                    Yes, Cancel Event
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Event Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1 rounded-lg border p-3">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className="flex items-center gap-2">
                  {event.status === "scheduled" && (
                    <Badge className="bg-green-500 hover:bg-green-600">Scheduled</Badge>
                  )}
                  {event.status === "draft" && (
                    <Badge variant="outline">Draft</Badge>
                  )}
                  {event.status === "paused" && (
                    <Badge className="bg-amber-500 hover:bg-amber-600">Paused</Badge>
                  )}
                  {event.status === "cancelled" && (
                    <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>
                  )}
                  {event.status === "completed" && (
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
              <Link href={`/admin/events/${event.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Event Details
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href={`/admin/events/${event.id}/slots`}>
                <Clock className="mr-2 h-4 w-4" />
                Manage Time Slots
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href={`/admin/events/${event.id}/participants`}>
                <Users className="mr-2 h-4 w-4" />
                View Participants
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href={`/events/${event.id}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                View Public Page
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
                  <p>{event.gameTemplate.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Age Range: {event.gameTemplate.minAgeMonths}-{event.gameTemplate.maxAgeMonths} months
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Duration: {event.gameTemplate.durationMinutes} minutes
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-medium">Venue</h3>
                  <p>{event.venue.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{event.venue.address}</p>
                  <p className="text-sm text-muted-foreground">{event.venue.city}</p>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="mb-2 font-medium">Description</h3>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-medium">Created By</h3>
                  <p className="text-sm text-muted-foreground">
                    {event.createdBy} on {event.createdAt}
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-medium">Last Updated By</h3>
                  <p className="text-sm text-muted-foreground">
                    {event.lastUpdatedBy} on {event.lastUpdatedAt}
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
                    {event.slots.map((slot) => (
                      <TableRow key={slot.id}>
                        <TableCell>
                          {slot.startTime} - {slot.endTime}
                        </TableCell>
                        <TableCell>₹{slot.price}</TableCell>
                        <TableCell>{slot.maxParticipants}</TableCell>
                        <TableCell>
                          {slot.currentParticipants}/{slot.maxParticipants}
                          <div className="mt-1 h-2 w-full rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{
                                width: `${(slot.currentParticipants / slot.maxParticipants) * 100}%`,
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          {slot.status === "active" && (
                            <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                          )}
                          {slot.status === "paused" && (
                            <Badge className="bg-amber-500 hover:bg-amber-600">Paused</Badge>
                          )}
                          {slot.status === "cancelled" && (
                            <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>
                          )}
                          {slot.status === "completed" && (
                            <Badge className="bg-blue-500 hover:bg-blue-600">Completed</Badge>
                          )}
                          {slot.status === "full" && (
                            <Badge className="bg-purple-500 hover:bg-purple-600">Full</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/events/${event.id}/slots/${slot.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/events/${event.id}/slots/${slot.id}/participants`}>
                                <Users className="mr-2 h-4 w-4" />
                                Participants
                              </Link>
                            </Button>
                            {slot.status === "active" && (
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
                            )}
                            {slot.status === "paused" && (
                              <Button variant="ghost" size="sm">
                                <Play className="mr-2 h-4 w-4" />
                                Resume
                              </Button>
                            )}
                            {(slot.status === "active" || slot.status === "paused") && (
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
                                      {slot.currentParticipants > 0 ? (
                                        <>
                                          <AlertTriangle className="mb-2 h-5 w-5 text-amber-500" />
                                          <p>
                                            This slot has {slot.currentParticipants} existing bookings. Cancelling will notify all participants and may require refunds.
                                          </p>
                                        </>
                                      ) : (
                                        <p>
                                          This will cancel this time slot. Are you sure you want to continue?
                                        </p>
                                      )}
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
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex justify-end">
                <Button asChild>
                  <Link href={`/admin/events/${event.id}/slots/new`}>
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
              <Tabs defaultValue={event.slots[0].id} className="space-y-4">
                <TabsList className="flex w-full flex-wrap">
                  {event.slots.map((slot) => (
                    <TabsTrigger key={slot.id} value={slot.id} className="flex-grow">
                      {slot.startTime} ({slot.currentParticipants}/{slot.maxParticipants})
                    </TabsTrigger>
                  ))}
                </TabsList>
                {event.slots.map((slot) => (
                  <TabsContent key={slot.id} value={slot.id}>
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
                          {slot.bookings.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-24 text-center">
                                No bookings for this slot.
                              </TableCell>
                            </TableRow>
                          ) : (
                            slot.bookings.map((booking) => (
                              <TableRow key={booking.id}>
                                <TableCell className="font-medium">{booking.id}</TableCell>
                                <TableCell>{booking.user}</TableCell>
                                <TableCell>{booking.childName}</TableCell>
                                <TableCell>{booking.childAge}</TableCell>
                                <TableCell>
                                  {booking.status === "confirmed" && (
                                    <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>
                                  )}
                                  {booking.status === "pending" && (
                                    <Badge variant="outline">Pending</Badge>
                                  )}
                                  {booking.status === "cancelled" && (
                                    <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>
                                  )}
                                  {booking.status === "attended" && (
                                    <Badge className="bg-blue-500 hover:bg-blue-600">Attended</Badge>
                                  )}
                                  {booking.status === "no_show" && (
                                    <Badge className="bg-amber-500 hover:bg-amber-600">No Show</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/admin/bookings/${booking.id}`}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View
                                    </Link>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button variant="outline" asChild>
                        <Link href={`/admin/events/${event.id}/slots/${slot.id}/participants/export`}>
                          Export Participants
                        </Link>
                      </Button>
                      <Button asChild>
                        <Link href={`/admin/events/${event.id}/slots/${slot.id}/participants`}>
                          Manage Participants
                        </Link>
                      </Button>
                    </div>
                  </TabsContent>
                ))}
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
