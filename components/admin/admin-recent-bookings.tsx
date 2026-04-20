"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Calendar, User, IndianRupee } from "lucide-react"
import Link from "next/link"

const getStatusBadge = (status: string) => {
  const s = (status || "").toLowerCase()
  if (s === "confirmed") return <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>
  if (s === "completed") return <Badge className="bg-blue-500 hover:bg-blue-600">Completed</Badge>
  if (s === "pending") return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
  if (s.includes("cancel")) return <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>
  return <Badge variant="outline">{status || "Unknown"}</Badge>
}

interface RecentBooking {
  booking_id: number
  booking_ref?: string
  status: string
  total_amount: string | number
  booking_date: string
  parent_name?: string
  email?: string
  phone?: string
  event_title?: string
  event_date?: string
  city_name?: string
  venue_name?: string
}

export default function AdminRecentBookings({ bookings }: { bookings?: RecentBooking[] }) {
  const data = bookings || []

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No recent bookings found</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ref</TableHead>
            <TableHead>Parent</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((booking) => (
            <TableRow key={booking.booking_id}>
              <TableCell className="font-mono text-xs font-medium">
                {booking.booking_ref || `#${booking.booking_id}`}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-sm">{booking.parent_name || "—"}</p>
                  {booking.city_name && (
                    <p className="text-xs text-muted-foreground">{booking.city_name}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm">{booking.event_title || "—"}</p>
                  {booking.event_date && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(booking.event_date).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm">
                {booking.booking_date
                  ? new Date(booking.booking_date).toLocaleDateString("en-IN", { day:"numeric", month:"short" })
                  : "—"}
              </TableCell>
              <TableCell className="font-semibold text-green-700">
                ₹{parseFloat(String(booking.total_amount || 0)).toLocaleString("en-IN")}
              </TableCell>
              <TableCell>{getStatusBadge(booking.status)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/admin/bookings/${booking.booking_id}`}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
