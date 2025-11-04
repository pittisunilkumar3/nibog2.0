import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit } from "lucide-react"
import Link from "next/link"

// Mock data - in a real app, this would come from an API
const upcomingEvents = [
  {
    id: "E001",
    title: "Baby Crawling",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    date: "2025-10-26",
    time: "9:00 AM - 8:00 PM",
    capacity: 50,
    booked: 12,
    status: "scheduled",
  },
  {
    id: "E002",
    title: "Baby Walker",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    date: "2025-10-26",
    time: "9:00 AM - 8:00 PM",
    capacity: 50,
    booked: 15,
    status: "scheduled",
  },
  {
    id: "E003",
    title: "Running Race",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    date: "2025-10-26",
    time: "9:00 AM - 8:00 PM",
    capacity: 50,
    booked: 10,
    status: "scheduled",
  },
  {
    id: "E004",
    title: "Hurdle Toddle",
    venue: "Indoor Stadium",
    city: "Chennai",
    date: "2025-03-16",
    time: "9:00 AM - 8:00 PM",
    capacity: 50,
    booked: 20,
    status: "scheduled",
  },
  {
    id: "E005",
    title: "Cycle Race",
    venue: "Sports Complex",
    city: "Vizag",
    date: "2025-08-15",
    time: "9:00 AM - 8:00 PM",
    capacity: 50,
    booked: 12,
    status: "scheduled",
  },
]

export default function AdminUpcomingEvents() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Venue</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Bookings</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {upcomingEvents.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{event.title}</TableCell>
              <TableCell>{event.venue}</TableCell>
              <TableCell>{event.city}</TableCell>
              <TableCell>
                {event.date}
                <br />
                <span className="text-xs text-muted-foreground">{event.time}</span>
              </TableCell>
              <TableCell>
                {event.booked}/{event.capacity}
                <div className="mt-1 h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${(event.booked / event.capacity) * 100}%`,
                    }}
                  />
                </div>
              </TableCell>
              <TableCell>
                <Badge className="bg-green-500 hover:bg-green-600">{event.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <a href={`/admin/events/${event.id}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View details</span>
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={`/admin/events/${event.id}/edit`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit event</span>
                    </a>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
