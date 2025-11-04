"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"
import { getAllBookings, BookingWithDetails } from "@/services/bookingService"
import { SkeletonTable } from "@/components/ui/skeleton-loader"

// Mock data - in a real app, this would come from an API
const recentBookings = [
  {
    id: "B001",
    user: "Harikrishna",
    event: "Baby Crawling",
    date: "2025-10-26",
    time: "9:00 AM",
    children: 1,
    amount: 1800,
    status: "confirmed",
  },
  {
    id: "B002",
    user: "Durga Prasad",
    event: "Baby Walker",
    date: "2025-10-26",
    time: "9:00 AM",
    children: 1,
    amount: 1800,
    status: "pending_payment",
  },
  {
    id: "B003",
    user: "Srujana",
    event: "Running Race",
    date: "2025-10-26",
    time: "9:00 AM",
    children: 2,
    amount: 3600,
    status: "confirmed",
  },
  {
    id: "B004",
    user: "Ramesh Kumar",
    event: "Hurdle Toddle",
    date: "2025-03-16",
    time: "9:00 AM",
    children: 1,
    amount: 1800,
    status: "cancelled_by_user",
  },
  {
    id: "B005",
    user: "Suresh Reddy",
    event: "Cycle Race",
    date: "2025-08-15",
    time: "9:00 AM",
    children: 1,
    amount: 1800,
    status: "confirmed",
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "confirmed":
      return <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>
    case "pending_payment":
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending Payment</Badge>
    case "cancelled_by_user":
      return <Badge className="bg-red-500 hover:bg-red-600">Cancelled by User</Badge>
    case "cancelled_by_admin":
      return <Badge className="bg-red-500 hover:bg-red-600">Cancelled by Admin</Badge>
    case "attended":
      return <Badge className="bg-blue-500 hover:bg-blue-600">Attended</Badge>
    case "no_show":
      return <Badge variant="outline">No Show</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function AdminRecentBookings() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentBookings = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const allBookings = await getAllBookings()
        // Get the 5 most recent bookings
        const recentBookings = allBookings
          .sort((a, b) => new Date(b.booking_created_at).getTime() - new Date(a.booking_created_at).getTime())
          .slice(0, 5)
        setBookings(recentBookings)
      } catch (error: any) {
        console.error('Error fetching recent bookings:', error)
        setError(error.message || 'Failed to load recent bookings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentBookings()
  }, [])

  if (isLoading) {
    return <SkeletonTable />
  }

  if (error) {
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="text-destructive mb-2">Failed to load recent bookings</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Children</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <TableRow key={booking.booking_id}>
                <TableCell className="font-medium">{booking.booking_id}</TableCell>
                <TableCell>{booking.parent_name}</TableCell>
                <TableCell>{booking.event_title}</TableCell>
                <TableCell>
                  {new Date(booking.booking_created_at).toLocaleDateString()} at{' '}
                  {new Date(booking.booking_created_at).toLocaleTimeString()}
                </TableCell>
                <TableCell>{booking.child_full_name}</TableCell>
                <TableCell>₹{parseFloat(booking.total_amount || '0').toLocaleString()}</TableCell>
                <TableCell>{getStatusBadge(booking.booking_status || 'pending')}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/bookings/${booking.booking_id}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View details</span>
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                No recent bookings found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
