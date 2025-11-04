"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, MapPin, Building, Calendar, Plus, ChevronRight, ChevronDown, ChevronUp, Trash2, Edit, Loader2 } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { getAllCities, deleteCity, type City } from "@/services/cityService"
import { getAllVenues, type Venue } from "@/services/venueService"
import { getAllEvents, type EventListItem } from "@/services/eventService"

// Types for internal use
interface CityWithStats extends City {
  activeEvents?: number
  upcomingEvents?: number
  totalVenues?: number
  totalGames?: number
}

interface VenueData {
  id: string
  name: string
  address: string
  activeEvents: number
  upcomingEvents: number
}

export default function EventsCitiesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [cities, setCities] = useState<CityWithStats[]>([])
  const [venues, setVenues] = useState<Record<string, VenueData[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingCityId, setDeletingCityId] = useState<number | null>(null)
  const [expandedCities, setExpandedCities] = useState<Set<number>>(new Set())

  // Fetch cities data when component mounts
  useEffect(() => {
    const fetchCitiesData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch all data in parallel for better performance
        const [citiesData, allVenues, allEvents] = await Promise.all([
          getAllCities(),
          getAllVenues(),
          getAllEvents()
        ])





        // Calculate statistics for each city
        const citiesWithStats: CityWithStats[] = citiesData.map((city) => {
          let totalVenues = 0
          let activeEvents = 0
          let upcomingEvents = 0
          let totalGames = 0

          if (city.id) {
            // Filter venues for this city and exclude empty objects
            const cityVenues = allVenues.filter((venue: Venue) =>
              venue.city_id === city.id &&
              venue.venue_name &&
              venue.venue_name.trim() !== '' &&
              venue.id // Make sure venue has a valid ID
            )
            totalVenues = cityVenues.length

            // Filter events for this city
            const cityEvents = allEvents.filter((event: EventListItem) => event.city_id === city.id)

            // Calculate event statistics
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

            cityEvents.forEach((event: EventListItem) => {
              const eventDate = new Date(event.event_date)
              const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())

              // Check event status and date
              if (event.event_status === 'Published' || event.event_status === 'Active') {
                if (eventDateOnly >= today) {
                  upcomingEvents++
                } else {
                  activeEvents++
                }
              }

              // Count games in this event (filter out null/invalid games)
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

            // Store venues data for the venue section (only valid venues)
            const venueData: VenueData[] = cityVenues.map((venue: Venue) => {
              // Calculate events for this specific venue
              const venueEvents = cityEvents.filter((event: EventListItem) => event.venue_id === venue.id)

              let venueActiveEvents = 0
              let venueUpcomingEvents = 0

              venueEvents.forEach((event: EventListItem) => {
                const eventDate = new Date(event.event_date)
                const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())

                if (event.event_status === 'Published' || event.event_status === 'Active') {
                  if (eventDateOnly >= today) {
                    venueUpcomingEvents++
                  } else {
                    venueActiveEvents++
                  }
                }
              })

              const venueId = venue.id?.toString()
              if (!venueId) {
                console.error('Venue missing ID:', venue)
                return null // Skip venues without IDs
              }

              return {
                id: venueId,
                name: venue.venue_name || '',
                address: venue.address || '',
                activeEvents: venueActiveEvents,
                upcomingEvents: venueUpcomingEvents,
              }
            }).filter((venue): venue is VenueData => venue !== null)

            setVenues(prev => ({
              ...prev,
              [city.city_name]: venueData
            }))
          }



          return {
            ...city,
            activeEvents,
            upcomingEvents,
            totalVenues,
            totalGames,
          }
        })

        setCities(citiesWithStats)

        if (citiesData.length === 0) {
          toast({
            title: "No Cities Found",
            description: "There are no cities in the database. You can create a new city using the 'Add New City' button.",
            variant: "default",
          })
        }
      } catch (err: any) {
        setError(err.message || "Failed to load cities")
        toast({
          title: "Error",
          description: err.message || "Failed to load cities",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCitiesData()
  }, [toast])

  // Toggle city expansion
  const toggleCityExpansion = (cityId: number) => {
    setExpandedCities(prev => {
      const newSet = new Set(prev)
      if (newSet.has(cityId)) {
        newSet.delete(cityId)
      } else {
        newSet.add(cityId)
      }
      return newSet
    })
  }

  // Handle navigation to individual city page
  const navigateToCity = (cityName: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the toggle
    router.push(`/admin/events/cities/${encodeURIComponent(cityName)}`)
  }

  // Handle city deletion
  const handleDeleteCity = async (cityId: number, cityName: string) => {
    try {
      setDeletingCityId(cityId)

      await deleteCity(cityId)

      // Remove the city from the local state
      setCities(prevCities => prevCities.filter(city => city.id !== cityId))

      toast({
        title: "Success",
        description: `City "${cityName}" has been deleted successfully.`,
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete city",
        variant: "destructive",
      })
    } finally {
      setDeletingCityId(null)
    }
  }

  // Filter cities based on search query
  const filteredCities = cities.filter(city => {
    if (!searchQuery) return true

    return (
      city.city_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.state.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Show loading state
  if (isLoading) {
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
              <h1 className="text-3xl font-bold tracking-tight">Cities</h1>
              <p className="text-muted-foreground">Manage events by city</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/admin/cities/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New City
            </Link>
          </Button>
        </div>
        <div className="flex h-40 items-center justify-center rounded-md border">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-muted-foreground">Loading cities...</p>
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
              <Link href="/admin/events">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Cities</h1>
              <p className="text-muted-foreground">Manage events by city</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/admin/cities/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New City
            </Link>
          </Button>
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
            <h1 className="text-3xl font-bold tracking-tight">Cities</h1>
            <p className="text-muted-foreground">Manage events by city</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/admin/cities/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New City
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cities..."
              className="h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="transition-all duration-300 ease-in-out space-y-6">
          {filteredCities.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-md border">
              <p className="text-muted-foreground">No cities found matching your search.</p>
            </div>
          ) : (
            filteredCities.map((city) => (
              <Card key={city.id} className="overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div
                    className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 flex-1 p-2 -m-2 rounded transition-colors"
                    onClick={() => toggleCityExpansion(city.id!)}
                  >
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{city.city_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {city.state} • {city.totalVenues} venues • {city.totalGames} games
                      </p>
                    </div>
                    {/* Expansion indicator */}
                    {expandedCities.has(city.id!) ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm font-medium">Active Events</div>
                      <div className="font-semibold">{city.activeEvents}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">Upcoming Events</div>
                      <div className="font-semibold">{city.upcomingEvents}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/cities/${city.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={deletingCityId === city.id}>
                            {deletingCityId === city.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete City</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{city.city_name}"? This action cannot be undone and will also delete all associated venues and events.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCity(city.id!, city.city_name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => navigateToCity(city.city_name, e)}
                        className="hover:bg-muted/50"
                        title={`Go to ${city.city_name} details`}
                      >
                        <ChevronRight className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Collapsible venues section */}
                {expandedCities.has(city.id!) && (
                  <div className="border-t bg-muted/20 animate-in slide-in-from-top-2 duration-200">
                    {venues[city.city_name] && venues[city.city_name].length > 0 ? (
                      <div>
                        <div className="px-4 py-2 text-sm text-muted-foreground border-b bg-muted/10">
                          {venues[city.city_name].length} venue{venues[city.city_name].length !== 1 ? 's' : ''} in {city.city_name}
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                          <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Venue</TableHead>
                              <TableHead>Address</TableHead>
                              <TableHead>Active Events</TableHead>
                              <TableHead>Upcoming Events</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {venues[city.city_name].map((venue) => (
                              <TableRow key={venue.id}>
                                <TableCell className="font-medium">{venue.name}</TableCell>
                                <TableCell>{venue.address}</TableCell>
                                <TableCell>
                                  <Badge variant={venue.activeEvents > 0 ? "default" : "outline"}>
                                    {venue.activeEvents}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {venue.upcomingEvents}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/admin/events/venues/${venue.id}`}>
                                      View Games
                                    </Link>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        <Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No venues found for this city.</p>
                        <Button variant="outline" size="sm" className="mt-2" asChild>
                          <Link href={`/admin/venues/new?city=${encodeURIComponent(city.city_name)}`}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Venue
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))
          )}
      </div>
    </div>
  )
}
