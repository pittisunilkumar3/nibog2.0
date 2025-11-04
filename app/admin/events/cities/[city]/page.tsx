"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Search, MapPin, Building, Calendar, Plus, ChevronRight, Loader2 } from "lucide-react"
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
import { getAllCities, type City } from "@/services/cityService"
import { getAllVenues } from "@/services/venueService"
import { getAllEvents } from "@/services/eventService"

// Types for venues and events
interface VenueData {
  id: string
  name: string
  address: string
  activeEvents: number
  upcomingEvents: number
}

interface EventData {
  id: string
  title: string
  date: string
  status: "active" | "scheduled"
  registrations: number
  capacity: number
}

export default function EventsCityPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const cityName = decodeURIComponent(params.city as string)
  const [searchQuery, setSearchQuery] = useState("")
  const [city, setCity] = useState<City | null>(null)
  const [venues, setVenues] = useState<VenueData[]>([])
  const [events, setEvents] = useState<Record<string, EventData[]>>({})
  const [totalGames, setTotalGames] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch city and venue data when component mounts
  useEffect(() => {
    const fetchCityData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch all data in parallel for better performance
        const [allCities, allVenues, allEvents] = await Promise.all([
          getAllCities(),
          getAllVenues(),
          getAllEvents()
        ])

        // Find the city matching the name
        const foundCity = allCities.find(c => c.city_name === cityName)

        if (!foundCity) {
          throw new Error(`City "${cityName}" not found`)
        }

        setCity(foundCity)

        if (foundCity.id) {
          // Filter venues for this city and exclude empty objects
          const cityVenues = allVenues.filter((venue: any) =>
            venue.city_id === foundCity.id &&
            venue.venue_name &&
            venue.venue_name.trim() !== '' &&
            venue.id // Make sure venue has a valid ID
          )

          // Filter events for this city
          const cityEvents = allEvents.filter((event: any) => event.city_id === foundCity.id)

          // Transform venues data with event counts
          const venuesWithEventCounts: VenueData[] = cityVenues.map((venue: any) => {
            // Count events for this venue
            const venueEvents = cityEvents.filter((event: any) => event.venue_id === venue.id)

            // Calculate active and upcoming events for this venue
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

            let activeEvents = 0
            let upcomingEvents = 0

            venueEvents.forEach((event: any) => {
              const eventDate = new Date(event.event_date)
              const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())

              if (event.event_status === 'Published' || event.event_status === 'Active') {
                if (eventDateOnly >= today) {
                  upcomingEvents++
                } else {
                  activeEvents++
                }
              }
            })

            return {
              id: venue.id?.toString() || '',
              name: venue.venue_name || '',
              address: venue.address || '',
              activeEvents,
              upcomingEvents,
            }
          })

          setVenues(venuesWithEventCounts)

          // Group events by venue for the events section and calculate total games
          const eventsByVenue: Record<string, EventData[]> = {}
          let totalGamesCount = 0

          cityEvents.forEach((event: any) => {
            const venue = cityVenues.find((v: any) => v.id === event.venue_id)
            if (venue && venue.venue_name) {
              if (!eventsByVenue[venue.venue_name]) {
                eventsByVenue[venue.venue_name] = []
              }

              eventsByVenue[venue.venue_name].push({
                id: event.event_id?.toString() || '',
                title: event.event_title || '',
                date: event.event_date || '',
                status: event.event_status === 'Published' ? 'active' : 'scheduled',
                registrations: 0, // This would need to come from registration data
                capacity: 100, // This would need to come from venue capacity or event settings
              })

              // Count games in this event
              if (event.games && Array.isArray(event.games)) {
                // Filter out null/invalid games
                const validGames = event.games.filter((game: any) =>
                  game &&
                  game.game_id !== null &&
                  game.game_title !== null &&
                  game.game_title !== undefined
                )
                totalGamesCount += validGames.length
              }
            }
          })

          setEvents(eventsByVenue)

          // Store the total games count for use in cityTotals
          setTotalGames(totalGamesCount)
        }

        if (allCities.length === 0) {
          toast({
            title: "No Cities Found",
            description: "There are no cities in the database.",
            variant: "default",
          })
        }
      } catch (err: any) {
        setError(err.message || "Failed to load city data")
        toast({
          title: "Error",
          description: err.message || "Failed to load city data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCityData()
  }, [cityName, toast])

  // Filter venues based on search query
  const filteredVenues = venues.filter(venue => {
    if (!searchQuery) return true

    return (
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Calculate city totals including games count
  const cityTotals = {
    totalVenues: venues.length,
    activeEvents: venues.reduce((sum: number, venue: VenueData) => sum + venue.activeEvents, 0),
    upcomingEvents: venues.reduce((sum: number, venue: VenueData) => sum + venue.upcomingEvents, 0),
    totalGames: totalGames, // Use the actual count from events data
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin/events/cities">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{cityName}</h1>
              <p className="text-muted-foreground">Manage venues and events in {cityName}</p>
            </div>
          </div>
        </div>
        <div className="flex h-40 items-center justify-center rounded-md border">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-muted-foreground">Loading city data...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin/events/cities">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{cityName}</h1>
              <p className="text-muted-foreground">Manage venues and events in {cityName}</p>
            </div>
          </div>
        </div>
        <div className="flex h-40 items-center justify-center rounded-md border">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="outline" size="icon" asChild className="touch-manipulation flex-shrink-0">
            <Link href="/admin/events/cities">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">{cityName}</h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">Manage venues and events in {cityName}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" asChild className="touch-manipulation">
            <Link href={`/admin/cities/${city?.id}/edit`}>
              <span className="hidden sm:inline">Edit City</span>
              <span className="sm:hidden">Edit</span>
            </Link>
          </Button>
          <Button asChild className="touch-manipulation">
            <Link href={`/admin/venues/new?city=${encodeURIComponent(cityName)}`}>
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Venue</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cityTotals.totalVenues}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cityTotals.totalGames}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cityTotals.activeEvents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cityTotals.upcomingEvents}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search venues in ${cityName}...`}
              className="h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="transition-all duration-300 ease-in-out space-y-6">
          {filteredVenues.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-md border">
              <p className="text-muted-foreground">No venues found matching your search.</p>
            </div>
          ) : (
            filteredVenues.map((venue) => (
              <Card key={venue.id} className="overflow-hidden">
                <div
                  className="flex cursor-pointer items-center justify-between border-b p-4 hover:bg-muted/50"
                  onClick={() => router.push(`/admin/events/venues/${encodeURIComponent(venue.name)}`)}
                >
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">{venue.name}</h3>
                      <p className="text-sm text-muted-foreground">{venue.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm font-medium">Active Events</div>
                      <div className="flex items-center justify-end">
                        <Badge variant={venue.activeEvents > 0 ? "default" : "outline"}>
                          {venue.activeEvents}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">Upcoming Events</div>
                      <div className="flex items-center justify-end">
                        <Badge variant="outline">
                          {venue.upcomingEvents}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                {events[venue.name] && events[venue.name].length > 0 && (
                  <div className="max-h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Registrations</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {events[venue.name].map((event: EventData) => (
                          <TableRow key={event.id}>
                            <TableCell className="font-medium">{event.title}</TableCell>
                            <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge variant={event.status === "active" ? "default" : "outline"}>
                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span className="mr-2">{event.registrations}/{event.capacity}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({Math.round((event.registrations / event.capacity) * 100)}%)
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/events/${event.id}`}>
                                  View Details
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}

                        {(!events[venue.name] || events[venue.name].length === 0) && (
                          <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                              No events found for this venue.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Card>
            ))
          )}
      </div>
    </div>
  )
}
