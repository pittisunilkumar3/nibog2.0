"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Search, Building, Calendar, Plus, ChevronRight, Clock, Users, DollarSign, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { getAllVenues, type Venue } from "@/services/venueService"
import { getAllEvents, type EventListItem } from "@/services/eventService"
import { getAllCities, type City } from "@/services/cityService"

// Types for venue data
interface VenueWithEvents extends Venue {
  city_name?: string
  events: EventListItem[]
  totalGames: number
}

export default function EventsVenuePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const venueId = params.venue as string

  const [venue, setVenue] = useState<VenueWithEvents | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch venue and events data
  useEffect(() => {
    const fetchVenueData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch all data in parallel
        const [allVenues, allEvents, allCities] = await Promise.all([
          getAllVenues(),
          getAllEvents(),
          getAllCities()
        ])

        // Find the venue by ID
        const foundVenue = allVenues.find((v: Venue) => v.id?.toString() === venueId)

        if (!foundVenue) {
          throw new Error(`Venue with ID "${venueId}" not found`)
        }

        // Find the city for this venue
        const venueCity = allCities.find((c: City) => c.id === foundVenue.city_id)

        // Filter events for this venue
        const venueEvents = allEvents.filter((event: EventListItem) =>
          event.venue_id?.toString() === venueId
        )

        // Calculate total games for this venue
        let totalGames = 0
        venueEvents.forEach((event: EventListItem) => {
          if (event.games && Array.isArray(event.games)) {
            const validGames = event.games.filter((game: any) =>
              game &&
              game.game_id !== null &&
              game.game_title !== null &&
              game.game_title !== undefined &&
              game.game_title.trim() !== ''
            )
            totalGames += validGames.length
          }
        })

        // Create venue with events data
        const venueWithEvents: VenueWithEvents = {
          ...foundVenue,
          city_name: venueCity?.city_name || 'Unknown City',
          events: venueEvents,
          totalGames
        }

        setVenue(venueWithEvents)

      } catch (err: any) {
        setError(err.message || "Failed to load venue data")
        toast({
          title: "Error",
          description: err.message || "Failed to load venue data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchVenueData()
  }, [venueId, toast])

  // Filter events based on search query
  const filteredEvents = venue?.events.filter((event: EventListItem) => {
    if (!searchQuery) return true

    return (
      event.event_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.event_description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }) || []

  // Calculate venue totals
  const venueTotals = {
    totalEvents: venue?.events.length || 0,
    totalGames: venue?.totalGames || 0,
    activeEvents: 0,
    upcomingEvents: 0,
  }

  // Calculate active and upcoming events
  if (venue?.events) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    venue.events.forEach((event: EventListItem) => {
      const eventDate = new Date(event.event_date)
      const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())

      if (event.event_status === 'Published' || event.event_status === 'Active') {
        if (eventDateOnly >= today) {
          venueTotals.upcomingEvents++
        } else {
          venueTotals.activeEvents++
        }
      }
    })
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-muted-foreground">Loading venue data...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !venue) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Venue Not Found</h2>
          <p className="text-muted-foreground">
            {error || "The venue you're looking for doesn't exist or has been removed."}
          </p>
          <Button className="mt-4" asChild>
            <Link href="/admin/events/cities">Back to Cities</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="outline" size="icon" asChild className="touch-manipulation flex-shrink-0">
            <Link href={`/admin/events/cities/${encodeURIComponent(venue.city_name || 'Unknown')}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">{venue.venue_name}</h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">{venue.address}, {venue.city_name}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" asChild className="touch-manipulation">
            <Link href={`/admin/venues/${venue.id}/edit`}>
              <span className="hidden sm:inline">Edit Venue</span>
              <span className="sm:hidden">Edit</span>
            </Link>
          </Button>
          <Button asChild className="touch-manipulation">
            <Link href={`/admin/events/new?venue=${encodeURIComponent(venue.venue_name || '')}`}>
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Create Event</span>
              <span className="sm:hidden">Create</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="space-y-4 sm:space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Venue Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">Venue Details</h3>
                <p><strong>Address:</strong> {venue.address || 'Not specified'}</p>
                <p className="mt-1 text-sm text-muted-foreground"><strong>City:</strong> {venue.city_name}</p>
                <p className="text-sm text-muted-foreground"><strong>Venue ID:</strong> {venue.id}</p>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Statistics</h3>
                <p><strong>Total Events:</strong> {venueTotals.totalEvents}</p>
                <p className="mt-1 text-sm text-muted-foreground"><strong>Total Games:</strong> {venueTotals.totalGames}</p>
                <p className="text-sm text-muted-foreground"><strong>Active Events:</strong> {venueTotals.activeEvents}</p>
              </div>
              <div className="sm:col-span-2">
                <h3 className="mb-2 font-medium">Event Status</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Active: {venueTotals.activeEvents}</Badge>
                  <Badge variant="outline">Upcoming: {venueTotals.upcomingEvents}</Badge>
                  <Badge variant="secondary">Total Games: {venueTotals.totalGames}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Events at {venue.venue_name}</CardTitle>
              <CardDescription>Manage games and events at this venue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  className="h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="transition-all duration-300 ease-in-out">
                  {filteredEvents.length === 0 ? (
                    <div className="flex h-40 items-center justify-center rounded-md border">
                      <p className="text-muted-foreground">No events found matching your search.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredEvents.map((event) => (
                        <div key={event.event_id} className="rounded-md border overflow-hidden">
                          <div
                            className="flex cursor-pointer items-center justify-between border-b p-4 hover:bg-muted/50"
                            onClick={() => router.push(`/admin/events/${event.event_id}`)}
                          >
                            <div className="flex items-center gap-2">
                              <Calendar className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <h3 className="font-semibold">{event.event_title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {event.games?.length || 0} games • {new Date(event.event_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <div className="text-sm font-medium">Games</div>
                                <div className="flex items-center justify-end">
                                  <span className="mr-2">{event.games?.filter((g: any) => g && g.game_title).length || 0}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">Status</div>
                                <Badge variant={event.event_status === "Published" ? "default" : "outline"}>
                                  {event.event_status || 'Draft'}
                                </Badge>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>

                          <div className="p-4">
                            <h4 className="mb-2 text-sm font-medium">Games in this Event</h4>
                            <div className="rounded-md border">
                              {event.games && event.games.length > 0 ? (
                                <div className="p-4">
                                  <div className="grid gap-2">
                                    {event.games.filter((game: any) => game && game.game_title).map((game: any, index: number) => (
                                      <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                                        <span className="font-medium">{game.game_title}</span>
                                        <Badge variant="outline">Game ID: {game.game_id}</Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4 text-center text-muted-foreground">
                                  No games configured for this event
                                </div>
                              )}
                            </div>

                            <div className="mt-4 flex justify-end">
                              <Button size="sm" asChild>
                                <Link href={`/admin/events/${event.event_id}`}>
                                  <Calendar className="mr-2 h-4 w-4" />
                                  View Event Details
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Venue Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Events</span>
                </div>
                <span className="font-medium">{venueTotals.totalEvents}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Games</span>
                </div>
                <span className="font-medium">{venueTotals.totalGames}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Active Events</span>
                </div>
                <span className="font-medium">{venueTotals.activeEvents}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Upcoming Events</span>
                </div>
                <span className="font-medium">{venueTotals.upcomingEvents}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" asChild>
                <Link href={`/admin/events/new?venue=${encodeURIComponent(venue.venue_name || '')}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Event
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/admin/venues/${venue.id}/edit`}>
                  Edit Venue Details
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/admin/venues/${venue.id}/calendar`}>
                  View Venue Calendar
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/admin/venues/${venue.id}/analytics`}>
                  Venue Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
