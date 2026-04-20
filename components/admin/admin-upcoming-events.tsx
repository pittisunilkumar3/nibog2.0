"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, MapPin, Calendar, Users } from "lucide-react"
import Link from "next/link"

interface UpcomingEvent {
  event_id: number
  event_title: string
  event_date: string
  event_description?: string
  city_name?: string
  venue_name?: string
  venue_address?: string
  booking_count: number
}

function getDaysUntil(dateStr: string): { text: string; color: string } {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return { text: "Past", color: "bg-gray-500" }
  if (diff === 0) return { text: "Today!", color: "bg-red-500" }
  if (diff <= 3) return { text: `${diff}d left`, color: "bg-red-500" }
  if (diff <= 7) return { text: `${diff}d left`, color: "bg-amber-500" }
  return { text: `${diff}d left`, color: "bg-green-500" }
}

export default function AdminUpcomingEvents({ events }: { events?: UpcomingEvent[] }) {
  const data = events || []

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No upcoming events</p>
      </div>
    )
  }

  // Find max booking count for progress bar scaling
  const maxBookings = Math.max(...data.map(e => e.booking_count || 0), 1)

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>City / Venue</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Bookings</TableHead>
            <TableHead>Countdown</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((event) => {
            const countdown = getDaysUntil(event.event_date)
            const fillPct = maxBookings > 0 ? Math.min((event.booking_count / maxBookings) * 100, 100) : 0
            return (
              <TableRow key={event.event_id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm max-w-[200px] truncate" title={event.event_title}>
                      {event.event_title}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      {event.city_name || "—"}
                    </p>
                    {event.venue_name && (
                      <p className="text-xs text-muted-foreground ml-4">{event.venue_name}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">
                      {new Date(event.event_date).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="min-w-[80px]">
                    <p className="text-sm font-semibold flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-indigo-500" />
                      {event.booking_count}
                    </p>
                    <div className="mt-1 h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${countdown.color} text-white text-xs`}>
                    {countdown.text}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/events/${event.event_id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/events/${event.event_id}/edit`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
