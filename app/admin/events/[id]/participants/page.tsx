"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Download, Eye, Check, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Participant {
  booking_id: number;
  booking_ref: string;
  parent_id: number;
  parent_name: string;
  email: string;
  additional_phone: string;
  child_id: number;
  child_name: string;
  date_of_birth: string;
  gender: string;
  event_title: string;
  event_date: string;
  venue_name: string;
  game_id: number;
  game_name: string;
}

interface EventParticipantsResponse {
  event_date: string;
  venue_name: string;
  total_participants: number;
  participants: Participant[];
}

export default function ParticipantsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBookings, setSelectedBookings] = useState<number[]>([])
  const [eventData, setEventData] = useState<EventParticipantsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!params.id) {
          throw new Error('Event ID is required');
        }

        const response = await fetch(`https://ai.nibog.in/webhook/v1/nibog/events/participants`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ event_id: parseInt(params.id, 10) }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(response.status === 404 ? 'Event not found' : 'Failed to fetch participants');
        }

        const data = await response.json();
        
        // Check if data is an array and has items
        if (Array.isArray(data) && data.length > 0) {
          setEventData(data[0]);
        } else if (typeof data === 'object' && data !== null) {
          // If data is a single object, use it directly
          setEventData(data);
        } else {
          throw new Error('No participant data available for this event');
        }
      } catch (err) {
        console.error('Error fetching participants:', err);
        setError(err instanceof Error ? err.message : 'Failed to load participants');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading...</h2>
        </div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Error</h2>
          <p className="text-muted-foreground">{error || "Failed to load participants"}</p>
          <Button className="mt-4" asChild>
            <Link href="/admin/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Filter participants based on search query
  const filteredParticipants = eventData.participants.filter((participant) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      participant.parent_name.toLowerCase().includes(query) ||
      participant.email.toLowerCase().includes(query) ||
      participant.additional_phone.toLowerCase().includes(query) ||
      participant.child_name.toLowerCase().includes(query) ||
      participant.booking_ref.toLowerCase().includes(query) ||
      participant.game_name.toLowerCase().includes(query)
    );
  });

  // Toggle selection of a booking
  const toggleBookingSelection = (bookingId: number) => {
    if (selectedBookings.includes(bookingId)) {
      setSelectedBookings(selectedBookings.filter((id) => id !== bookingId))
    } else {
      setSelectedBookings([...selectedBookings, bookingId])
    }
  }

  // Toggle selection of all bookings
  const toggleAllBookings = () => {
    if (selectedBookings.length === filteredParticipants.length) {
      setSelectedBookings([])
    } else {
      setSelectedBookings(filteredParticipants.map((p) => p.booking_id))
    }
  }

  // Mark selected bookings as attended
  const markAsAttended = () => {
    // TODO: Implement API call to mark bookings as attended
    setSelectedBookings([])
  }

  // Mark selected bookings as no-show
  const markAsNoShow = () => {
    // TODO: Implement API call to mark bookings as no-show
    setSelectedBookings([])
  }

  // Export participants list
  const exportParticipants = () => {
    // Define the CSV headers
    const headers = [
      "Booking Ref",
      "Parent Name",
      "Email",
      "Phone",
      "Child Name",
      "Date of Birth",
      "Gender",
      "Game"
    ].join(",");

    // Convert participant data to CSV rows
    const rows = filteredParticipants.map(participant => [
      participant.booking_ref,
      `"${participant.parent_name}"`,
      participant.email,
      participant.additional_phone,
      `"${participant.child_name}"`,
      participant.date_of_birth,
      participant.gender,
      `"${participant.game_name}"`
    ].join(","));

    // Combine headers and rows
    const csvContent = [headers, ...rows].join("\n");

    // Create a Blob containing the CSV data
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    
    // Create a download link
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    // Set up download attributes
    const eventTitle = eventData.participants?.[0]?.event_title || 'Event';
    const fileName = `${eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_participants.csv`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    
    // Add to document, trigger download, and cleanup
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/events">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Participants</h1>
          <p className="text-muted-foreground">
            {eventData.participants?.[0]?.event_title || 'Event'} | {eventData.venue_name || 'Venue'} | {eventData.event_date ? new Date(eventData.event_date).toLocaleDateString() : 'Date TBD'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Participant List</CardTitle>
            <CardDescription>
              {eventData.total_participants} total participants registered for this event
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
                      checked={selectedBookings.length === filteredParticipants.length && filteredParticipants.length > 0}
                      onChange={toggleAllBookings}
                    />
                  </TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Child</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Game</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No participants found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredParticipants.map((participant) => (
                    <TableRow key={`${participant.booking_id}-${participant.game_id}`}>
                      <TableCell>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          checked={selectedBookings.includes(participant.booking_id)}
                          onChange={() => toggleBookingSelection(participant.booking_id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{participant.parent_name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{participant.email}</div>
                          <div className="text-muted-foreground">{participant.additional_phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>{participant.child_name}</TableCell>
                      <TableCell>{participant.gender}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {participant.game_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Manage Booking</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => { /* View booking: implement modal or navigation */ }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Booking
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => { /* Mark as attended: implement API call */ }}>
                              <Check className="mr-2 h-4 w-4" />
                              Mark as Attended
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { /* Mark as no-show: implement API call */ }}>
                              <X className="mr-2 h-4 w-4" />
                              Mark as No-Show
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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




