"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Trash, AlertTriangle, MapPin, Loader2 } from "lucide-react"
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
import { getVenueById, deleteVenue } from "@/services/venueService"
import { getCityById } from "@/services/cityService"
import { useToast } from "@/components/ui/use-toast"

// Function to fetch events data for a venue
const fetchVenueEvents = async (venueId: number) => {
  try {
    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/get-upcoming-events/venues-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        venues_id: venueId
      }),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch events data: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching events data:', error)
    throw error
  }
}

type Props = {
  params: { id: string }
}

export default function VenueDetailPage({ params }: Props) {
  const router = useRouter()
  const { toast } = useToast()

  // In Next.js app router, params is already resolved
  const venueId = parseInt(params.id)

  const [venue, setVenue] = useState<any>(null)
  const [city, setCity] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [eventsData, setEventsData] = useState<any>(null)
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)

  // Fetch venue data on component mount
  useEffect(() => {
    const fetchVenueData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // First try to get all venues with city details and find the one we need
        // This is more reliable than the individual venue endpoint
        try {
          const allVenuesWithCity = await fetch('/api/venues/getall-with-city').then(res => res.json())

          if (Array.isArray(allVenuesWithCity) && allVenuesWithCity.length > 0) {

            // Find the venue with the matching ID (could be venue_id or id)
            const foundVenue = allVenuesWithCity.find(v =>
              v.venue_id === venueId ||
              v.id === venueId ||
              (v.venue_id && v.venue_id.toString() === venueId.toString()) ||
              (v.id && v.id.toString() === venueId.toString())
            )

            if (foundVenue) {
              setVenue(foundVenue)

              // City data is already included in the venue data
              if (foundVenue.city_name) {
                setCity({
                  id: foundVenue.city_id,
                  city_name: foundVenue.city_name,
                  state: foundVenue.state || "",
                  is_active: foundVenue.city_is_active
                })

                // We found everything we need, so we can return early
                setIsLoading(false)
                return
              }
            }
          }
        } catch (allVenuesError) {
          console.error("Error fetching all venues with city:", allVenuesError)
          // Continue to the next approach
        }

        // If we get here, we couldn't find the venue in the all venues list
        // Try the direct API call
        try {
          // Fetch venue data from API
          const venueData = await getVenueById(venueId)
          setVenue(venueData)

          // Fetch city data if venue has a city_id
          if (venueData && venueData.city_id) {
            try {
              const cityData = await getCityById(venueData.city_id)
              setCity(cityData)
            } catch (cityError) {
              console.error("Error fetching city data:", cityError)
              // Don't set an error for city fetch failure, just log it
            }
          }
        } catch (error: any) {
          console.error("Failed to fetch venue data:", error)
          setError(error.message || "Failed to load venue. Please try again.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchVenueData()
  }, [venueId])
  
  // Fetch events data when venue is loaded
  useEffect(() => {
    const fetchEvents = async () => {
      if (!venue) return
      
      try {
        setIsLoadingEvents(true)
        // Use the correct venue ID (could be venue_id or id)
        const actualVenueId = venue.venue_id || venue.id
        
        const data = await fetchVenueEvents(actualVenueId)
        
        // Log the full structure to debug
        
        if (Array.isArray(data) && data.length > 0) {
          setEventsData(data[0]) // API returns an array with one object
        } else {
          console.error('Unexpected data format from API', data)
          setEventsData({
            summary: { total_events: 0, upcoming_events: 0, past_events: 0 },
            upcoming_events: []
          })
        }
      } catch (error) {
        console.error('Failed to fetch events data:', error)
        // Set default empty data structure
        setEventsData({
          summary: { total_events: 0, upcoming_events: 0, past_events: 0 },
          upcoming_events: []
        })
      } finally {
        setIsLoadingEvents(false)
      }
    }
    
    fetchEvents()
  }, [venue])

  // Handle venue deletion
  const handleDeleteVenue = async () => {
    try {
      setIsDeleting(true)

      // Get the correct venue ID (could be venue_id or id)
      const actualVenueId = venue.venue_id || venue.id

      // Call the API to delete the venue
      const result = await deleteVenue(actualVenueId)

      if (result.success) {
        toast({
          title: "Success",
          description: "Venue deleted successfully",
        })

        // Redirect back to venues list
        router.push("/admin/venues")
      } else {
        throw new Error("Failed to delete venue. Please try again.")
      }
    } catch (error: any) {
      console.error("Error deleting venue:", error)

      toast({
        title: "Error",
        description: error.message || "Failed to delete venue. Please try again.",
        variant: "destructive",
      })

      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading venue details...</h2>
        </div>
      </div>
    )
  }

  if (error || !venue) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Venue not found</h2>
          <p className="text-muted-foreground">{error || "The venue you are looking for does not exist."}</p>
          <Button className="mt-4" onClick={() => router.push("/admin/venues")}>
            Back to Venues
          </Button>
        </div>
      </div>
    )
  }
  
  // Get the venue name (could be venue_name or name depending on the API response)
  const venueName = venue.venue_name || venue.name

  // Define Event interface
  interface Event {
    event_id: number | string;
    title?: string;
    event_date?: string;
    status?: string;
    [key: string]: any; // For any additional properties
  }

  // Get events from the API data or use empty array as fallback
  const upcomingEvents = eventsData?.upcoming_events || [] as Event[]
  
  // Get event statistics from the API data or use fallbacks
  const eventStats = eventsData?.summary || { total_events: 0, upcoming_events: 0, past_events: 0 }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="outline" size="icon" asChild className="touch-manipulation flex-shrink-0">
            <Link href="/admin/venues">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">{venueName}</h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">{city ? city.city_name : `City ID: ${venue.city_id}`}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" asChild className="touch-manipulation">
            <Link href={`/admin/venues/${venue.venue_id || venue.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Edit Venue</span>
              <span className="sm:hidden">Edit</span>
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20">
                <Trash className="mr-2 h-4 w-4" />
                Delete Venue
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Venue</AlertDialogTitle>
                <AlertDialogDescription>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                    <div className="space-y-2">
                      <div className="font-medium">This action cannot be undone.</div>
                      <div>
                        This will permanently delete the venue "{venueName}" in {city ? city.city_name : `City ID: ${venue.city_id}`} and all associated data.
                        {eventStats.total_events > 0 ? (
                          <>
                            {" "}This venue has {eventStats.total_events} event{eventStats.total_events !== 1 ? "s" : ""}.
                            Deleting it may affect existing data.
                          </>
                        ) : (
                          " This venue has no events."
                        )}
                      </div>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600"
                  onClick={handleDeleteVenue}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Venue"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Venue Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 font-medium">Address</h3>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{venue.address}</p>
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">City</h3>
                <p className="text-sm text-muted-foreground">{city ? city.city_name : `City ID: ${venue.city_id}`}</p>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Capacity</h3>
                <p className="text-sm text-muted-foreground">{venue.capacity} participants</p>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="mb-2 font-medium">Status</h3>
              {venue.is_active || venue.venue_is_active ? (
                <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
              ) : (
                <Badge variant="outline">Inactive</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Events</h3>
              <p className="mt-2 text-2xl font-bold">{eventStats.total_events}</p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Upcoming Events</h3>
              <p className="mt-2 text-2xl font-bold">{eventStats.upcoming_events}</p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Past Events</h3>
              <p className="mt-2 text-2xl font-bold">{eventStats.past_events}</p>
            </div>
            {isLoadingEvents && (
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Loading event data...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Upcoming Events</h2>
          <p className="text-muted-foreground">Events scheduled at this venue</p>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Registrations</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingEvents ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                    <span>Loading events...</span>
                  </TableCell>
                </TableRow>
              ) : upcomingEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No events found for this venue.
                  </TableCell>
                </TableRow>
              ) : (
                upcomingEvents.map((event: Event) => {
                  return (
                    <TableRow key={event.event_id}>
                      <TableCell className="font-medium">{event.title || 'Unnamed Event'}</TableCell>
                      <TableCell>{event.event_date || 'No Date'}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-500 hover:bg-blue-600">{event.status || 'Unknown'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/events/${event.event_id}`}>
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
