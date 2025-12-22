"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Download, Eye, Check, X, AlertTriangle } from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data - in a real app, this would come from an API
const events = [
  {
    id: "E001",
    title: "Baby Sensory Play",
    venue: {
      name: "Little Explorers Center",
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
          { 
            id: "B001", 
            user: { 
              id: "U001", 
              name: "Priya Sharma", 
              email: "priya@example.com", 
              phone: "+91 9876543210" 
            }, 
            child: { 
              id: "C001", 
              name: "Aryan", 
              dob: "2023-02-15", 
              ageAtEvent: "14 months" 
            }, 
            status: "confirmed",
            paymentStatus: "paid",
            bookingDate: "2025-03-10",
          },
          { 
            id: "B002", 
            user: { 
              id: "U002", 
              name: "Rahul Verma", 
              email: "rahul@example.com", 
              phone: "+91 9876543211" 
            }, 
            child: { 
              id: "C002", 
              name: "Zara", 
              dob: "2023-04-10", 
              ageAtEvent: "12 months" 
            }, 
            status: "confirmed",
            paymentStatus: "paid",
            bookingDate: "2025-03-12",
          },
          { 
            id: "B003", 
            user: { 
              id: "U003", 
              name: "Ananya Patel", 
              email: "ananya@example.com", 
              phone: "+91 9876543212" 
            }, 
            child: { 
              id: "C003", 
              name: "Vihaan", 
              dob: "2023-06-20", 
              ageAtEvent: "10 months" 
            }, 
            status: "confirmed",
            paymentStatus: "paid",
            bookingDate: "2025-03-15",
          },
          { 
            id: "B004", 
            user: { 
              id: "U004", 
              name: "Vikram Singh", 
              email: "vikram@example.com", 
              phone: "+91 9876543213" 
            }, 
            child: { 
              id: "C004", 
              name: "Aarav", 
              dob: "2022-12-10", 
              ageAtEvent: "16 months" 
            }, 
            status: "confirmed",
            paymentStatus: "paid",
            bookingDate: "2025-03-18",
          },
          { 
            id: "B005", 
            user: { 
              id: "U005", 
              name: "Neha Gupta", 
              email: "neha@example.com", 
              phone: "+91 9876543214" 
            }, 
            child: { 
              id: "C005", 
              name: "Ishaan", 
              dob: "2023-08-25", 
              ageAtEvent: "8 months" 
            }, 
            status: "confirmed",
            paymentStatus: "paid",
            bookingDate: "2025-03-20",
          },
          { 
            id: "B006", 
            user: { 
              id: "U006", 
              name: "Kiran Reddy", 
              email: "kiran@example.com", 
              phone: "+91 9876543215" 
            }, 
            child: { 
              id: "C006", 
              name: "Aanya", 
              dob: "2023-05-15", 
              ageAtEvent: "11 months" 
            }, 
            status: "confirmed",
            paymentStatus: "paid",
            bookingDate: "2025-03-22",
          },
          { 
            id: "B007", 
            user: { 
              id: "U007", 
              name: "Deepak Sharma", 
              email: "deepak@example.com", 
              phone: "+91 9876543216" 
            }, 
            child: { 
              id: "C007", 
              name: "Advika", 
              dob: "2023-01-20", 
              ageAtEvent: "15 months" 
            }, 
            status: "confirmed",
            paymentStatus: "paid",
            bookingDate: "2025-03-25",
          },
        ]
      },
    ],
  },
]

type Props = {
  params: { id: string; slotId: string }
}

export default function SlotParticipantsPage({ params }: Props) {
  const router = useRouter()
  const event = events.find((e) => e.id === params.id)
  const slot = event?.slots.find((s) => s.id === params.slotId)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBookings, setSelectedBookings] = useState<string[]>([])

  if (!event || !slot) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Slot Not Found</h2>
          <p className="text-muted-foreground">The time slot you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" asChild>
            <Link href={`/admin/events/${params.id}/slots`}>Back to Slots</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Filter bookings based on search query
  const filteredBookings = slot.bookings.filter((booking) => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    return (
      booking.user.name.toLowerCase().includes(query) ||
      booking.user.email.toLowerCase().includes(query) ||
      booking.user.phone.toLowerCase().includes(query) ||
      booking.child.name.toLowerCase().includes(query) ||
      booking.id.toLowerCase().includes(query)
    )
  })

  // Toggle selection of a booking
  const toggleBookingSelection = (bookingId: string) => {
    if (selectedBookings.includes(bookingId)) {
      setSelectedBookings(selectedBookings.filter((id) => id !== bookingId))
    } else {
      setSelectedBookings([...selectedBookings, bookingId])
    }
  }

  // Toggle selection of all bookings
  const toggleAllBookings = () => {
    if (selectedBookings.length === filteredBookings.length) {
      setSelectedBookings([])
    } else {
      setSelectedBookings(filteredBookings.map((booking) => booking.id))
    }
  }

  // Mark selected bookings as attended
  const markAsAttended = () => {
    // In a real app, this would be an API call
    setSelectedBookings([])
  }

  // Mark selected bookings as no-show
  const markAsNoShow = () => {
    // In a real app, this would be an API call
    setSelectedBookings([])
  }

  // Export participants list
  const exportParticipants = () => {
    // In a real app, this would generate and download a CSV file
    // TODO: implement CSV export
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/events/${params.id}/slots`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Participants</h1>
          <p className="text-muted-foreground">
            {event.title} | {slot.startTime} - {slot.endTime} | {event.date}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Participant List</CardTitle>
            <CardDescription>
              {slot.currentParticipants} participants registered for this slot
            </CardDescription>
          </div>
          <Button variant="outline" onClick={exportParticipants}>
            <Download className="mr-2 h-4 w-4" />
            Export List
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search participants..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {selectedBookings.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedBookings.length} selected
                </span>
                <Button size="sm" variant="outline" onClick={markAsAttended}>
                  <Check className="mr-2 h-4 w-4" />
                  Mark Attended
                </Button>
                <Button size="sm" variant="outline" onClick={markAsNoShow}>
                  <X className="mr-2 h-4 w-4" />
                  Mark No-Show
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={selectedBookings.length === filteredBookings.length && filteredBookings.length > 0}
                      onChange={toggleAllBookings}
                    />
                  </TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Child</TableHead>
                  <TableHead>Age at Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No participants found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          checked={selectedBookings.includes(booking.id)}
                          onChange={() => toggleBookingSelection(booking.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{booking.user.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{booking.user.email}</div>
                          <div className="text-muted-foreground">{booking.user.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>{booking.child.name}</TableCell>
                      <TableCell>{booking.child.ageAtEvent}</TableCell>
                      <TableCell>
                        {booking.status === "confirmed" && (
                          <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>
                        )}
                        {booking.status === "attended" && (
                          <Badge className="bg-blue-500 hover:bg-blue-600">Attended</Badge>
                        )}
                        {booking.status === "no_show" && (
                          <Badge className="bg-amber-500 hover:bg-amber-600">No Show</Badge>
                        )}
                        {booking.status === "cancelled" && (
                          <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Manage Booking</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/bookings/${booking.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Booking
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => { /* Mark single booking as attended: implement API call */ }}>
                              <Check className="mr-2 h-4 w-4" />
                              Mark as Attended
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { /* Mark single booking as no-show: implement API call */ }}>
                              <X className="mr-2 h-4 w-4" />
                              Mark as No-Show
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-500 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/20"
                              asChild
                            >
                              <AlertDialogTrigger>
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Cancel Booking
                              </AlertDialogTrigger>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <AlertDialog>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel this booking? This action may trigger a refund process and cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>No, Keep Booking</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => { /* Cancel booking: implement API call */ }}
                              >
                                Yes, Cancel Booking
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
