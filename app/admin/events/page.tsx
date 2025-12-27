"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import EnhancedDataTable, { Column, TableAction } from "@/components/admin/enhanced-data-table"
import { createEventExportColumns } from "@/lib/export-utils"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Plus, Search, Filter, Eye, Edit, Copy, Pause, Play, X, MapPin, Building, Trash2, ChevronLeft, ChevronRight, Clock, Users, RefreshCw } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from "date-fns"
import { cn } from "@/lib/utils"
import { deleteEvent, updateEvent } from "@/services/eventService"
import { getAllCities, City } from "@/services/cityService"
import { getVenuesByCity } from "@/services/venueService"
import { getAllBabyGames, BabyGame } from "@/services/babyGameService"
import { useToast } from "@/hooks/use-toast"
import { TruncatedText } from "@/components/ui/truncated-text"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"



export default function EventsPage() {
    // Stub for handleToggleEventStatus to fix build error
    const handleToggleEventStatus = (eventId: string, status: string) => {
      // TODO: Implement event status toggling logic
      toast({
        title: "Not implemented",
        description: `Toggling status for event ${eventId} (${status}) is not implemented yet.`,
        variant: "destructive",
      });
    };
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedVenue, setSelectedVenue] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [apiEvents, setApiEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeletingEvent, setIsDeletingEvent] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [eventToUpdate, setEventToUpdate] = useState<string | null>(null)

  // Calendar view state
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDayEvents, setSelectedDayEvents] = useState<any[]>([])
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)

  // State for filter data from APIs
  const [cities, setCities] = useState<City[]>([])
  const [venues, setVenues] = useState<any[]>([]) // Venues with city details
  const [gameTemplates, setGameTemplates] = useState<BabyGame[]>([])
  const [isLoadingFilters, setIsLoadingFilters] = useState(true)

  // Function to fetch events with complete information
  const fetchEventsWithGames = async () => {
    const response = await fetch('/api/events/list?t=' + Date.now(), {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`)
    }
    return response.json()
  }

  // Extracted fetch events function so it can be called from anywhere
  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch events from the API with complete information
      const eventsData = await fetchEventsWithGames()

      if (eventsData.length === 0) {
        toast({
          title: "No Events Found",
          description: "There are no events in the database. You can create a new event using the 'Create New Event' button.",
          variant: "default",
        })
      }

      setApiEvents(eventsData)
    } catch (err: any) {
      setError(err.message || "Failed to load events")
      toast({
        title: "Error",
        description: err.message || "Failed to load events",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch events from API when component mounts
  useEffect(() => {
    fetchEvents()

    // Add event listener to refresh data when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page became visible, refreshing events...')
        fetchEvents()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Refresh data when window receives focus
    const handleFocus = () => {
      console.log('🔄 Window focused, refreshing events...')
      fetchEvents()
    }

    window.addEventListener('focus', handleFocus)

    // Cleanup event listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // Fetch filter data (cities, venues, game templates) from APIs
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setIsLoadingFilters(true)

        // Fetch cities and games first
        const [citiesData, gamesData] = await Promise.all([
          getAllCities(),
          getAllBabyGames()
        ])

        setCities(citiesData)
        setGameTemplates(gamesData)

        // Fetch venues for each city using get-by-city API
        try {
          const allVenues: any[] = []

          // Fetch venues for each city
          for (const city of citiesData) {
            if (city.id) {
              try {
                const cityVenues = await getVenuesByCity(city.id)
                // Add city name to each venue
                const venuesWithCityName = cityVenues.map(venue => ({
                  ...venue,
                  city_name: city.city_name
                }))
                allVenues.push(...venuesWithCityName)
              } catch (cityVenueError) {
                // If fetching venues for a specific city fails, continue with other cities
                console.warn(`Failed to fetch venues for city ${city.city_name}:`, cityVenueError)
              }
            }
          }

          setVenues(allVenues)
        } catch (venueError) {
          // If venue fetching fails completely, set empty array
          setVenues([])
        }
      } catch (err: any) {
        toast({
          title: "Warning",
          description: "Some filter options may not be available due to a loading error.",
          variant: "default",
        })
      } finally {
        setIsLoadingFilters(false)
      }
    }

    fetchFilterData()
  }, [])

  // Track if we have any valid events in the database
  const [hasValidEvents, setHasValidEvents] = useState<boolean>(false);

  // Convert API events to the format expected by the UI and filter out invalid events
  const convertedEvents = useMemo(() => {
    if (!apiEvents || !Array.isArray(apiEvents)) return [];
    
    const validEvents = apiEvents
      .map((apiEvent: any) => {
        // Skip events that are completely empty or invalid
        if (!apiEvent || !apiEvent.id) return null;
        
        // Extract games from event_games_with_slots
        const games = apiEvent.event_games_with_slots || [];
        const gameNames = games.map((game: any) => game.custom_title || game.game_title);
        const uniqueGameNames = [...new Set(gameNames.filter(Boolean))]; // Remove duplicates and empty values

        // Parse date correctly for Indian timezone (IST = UTC+5:30)
        // API returns date in UTC like "2025-12-30T18:30:00.000Z"
        // Convert to IST for display
        let displayDate = null
        if (apiEvent.event_date) {
          const utcDate = new Date(apiEvent.event_date)
          const istOffset = 5.5 * 60 * 60 * 1000 // 5 hours 30 minutes in milliseconds
          const istDate = new Date(utcDate.getTime() + istOffset)
          // Format as YYYY-MM-DD in IST
          displayDate = istDate.toISOString().split('T')[0]
        }

        // Create the event object
        const event = {
          id: apiEvent.id.toString(),
          title: apiEvent.title || "Untitled Event",
          gameTemplate: uniqueGameNames.length > 0 ? uniqueGameNames.join(", ") : "No games",
          venue: apiEvent.venue_name,
          venueId: apiEvent.venue_id?.toString(),
          city: apiEvent.city_name,
          date: displayDate,
          slots: games.map((game: any, index: number) => {
            // Format time from HH:mm:ss to HH:mm for display
            const startTime = game.start_time ? game.start_time.substring(0, 5) : null
            const endTime = game.end_time ? game.end_time.substring(0, 5) : null
            return {
              id: `${apiEvent.id}-${game.game_id || 'unknown'}-${index}`,
              time: startTime && endTime ? `${startTime} - ${endTime}` : null,
              capacity: parseInt(game.max_participants || "0", 10),
              booked: 0, // API doesn't provide this information
              status: game.is_active === 1 ? "active" : "inactive"
            }
          }).filter((slot: any) => slot.time !== null), // Only keep slots with valid times
          status: apiEvent.status ? apiEvent.status.toLowerCase() : "draft",
          isActive: apiEvent.is_active === 1,
          imageUrl: apiEvent.image_url,
          priority: apiEvent.priority,
          _isValid: true // Flag to indicate this is a valid event
        };

        // Check if this is a valid event (has at least some valid data)
        const isValidEvent = 
          event.title !== "Untitled Event" ||
          event.venue ||
          event.city ||
          event.date ||
          (event.slots && event.slots.length > 0);

        return isValidEvent ? event : null;
      })
      .filter(Boolean); // Remove any null entries (invalid events)

    return validEvents;
  }, [apiEvents]);

  // Update hasValidEvents when apiEvents changes
  useEffect(() => {
    if (apiEvents && Array.isArray(apiEvents)) {
      // Check if we have any valid events (not just empty or invalid ones)
      const hasAnyValidEvents = apiEvents.some(apiEvent => {
        if (!apiEvent || !apiEvent.id) return false;
        return (
          apiEvent.title ||
          apiEvent.venue_name ||
          apiEvent.city_name ||
          apiEvent.event_date ||
          (apiEvent.event_games_with_slots && apiEvent.event_games_with_slots.length > 0)
        );
      });
      setHasValidEvents(hasAnyValidEvents);
    } else {
      setHasValidEvents(false);
    }
  }, [apiEvents]);

  // Use the processed events
  const eventsToUse = convertedEvents;

  // Filter events based on search and filters
  const filteredEvents = eventsToUse.filter((event) => {
    if (!event) return false;
    // Search query filter
    if (
      searchQuery &&
      !event.title?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !event.gameTemplate?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !event.venue?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !event.city?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    // City filter
    if (selectedCity && event.city !== selectedCity) {
      return false;
    }
    // Venue filter
    if (selectedVenue && event.venue !== selectedVenue) {
      return false;
    }
    // Game template filter
    if (selectedTemplate && event.gameTemplate !== selectedTemplate) {
      return false;
    }
    // Status filter
    if (selectedStatus && event.status !== selectedStatus) {
      return false;
    }
    // Date filter
    if (selectedDate && event.date !== format(selectedDate, "yyyy-MM-dd")) {
      return false;
    }
    return true;
  });

  // Define table columns for EnhancedDataTable
  const columns: Column<any>[] = [
    {
      key: 'title',
      label: 'Event',
      sortable: true,
      priority: 1, // Highest priority for mobile
      render: (value) => (
        <TruncatedText
          text={value}
          maxLength={50}
          showTooltip={true}
        />
      )
    },
    {
      key: 'city',
      label: 'City',
      sortable: true,
      priority: 2, // Second priority for mobile
      render: (value) => (
        <Link
          href={`/admin/events/cities/${encodeURIComponent(value)}`}
          className="flex items-center hover:underline touch-manipulation"
        >
          <MapPin className="mr-1 h-3 w-3 text-muted-foreground" />
          {value}
        </Link>
      )
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      priority: 3, // Third priority for mobile
      render: (value) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      priority: 4, // Fourth priority for mobile
      render: (value) => {
        const statusColors = {
          published: 'bg-green-500 hover:bg-green-600',
          draft: 'outline',
          paused: 'bg-amber-500 hover:bg-amber-600',
          cancelled: 'bg-red-500 hover:bg-red-600',
          completed: 'bg-blue-500 hover:bg-blue-600'
        }
        const variant = value === 'draft' ? 'outline' : undefined
        const className = statusColors[value as keyof typeof statusColors] || ''

        return (
          <Badge variant={variant} className={variant ? undefined : className}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        )
      }
    },
    {
      key: 'venue',
      label: 'Venue',
      sortable: true,
      hideOnMobile: true, // Hide on mobile to save space
      render: (value, row) => (
        <Link
          href={`/admin/events/venues/${row.venueId}`}
          className="flex items-center hover:underline touch-manipulation"
        >
          <Building className="mr-1 h-3 w-3 text-muted-foreground" />
          {value}
        </Link>
      )
    },
    {
      key: 'gameTemplate',
      label: 'Games',
      sortable: true,
      hideOnMobile: true, // Hide on mobile to save space
      render: (value) => (
        <div className="max-w-[200px]">
          {value && typeof value === 'string' ?
            value.split(", ").map((game, index) => (
              <Badge key={index} variant="outline" className="mr-1 mb-1 text-xs">
                {game}
              </Badge>
            )) : (
              <Badge variant="outline">Unknown</Badge>
            )
          }
        </div>
      )
    },
    {
      key: 'slots',
      label: 'Slots',
      hideOnMobile: true, // Hide on mobile to save space
      render: (value) => (
        <div className="flex flex-col gap-1">
          {value && Array.isArray(value) && value.length > 0 ?
            value.map((slot: any) => (
              <div key={slot.id} className="flex items-center gap-2 text-xs">
                <Badge
                  variant="outline"
                  className={cn(
                    "h-1.5 w-1.5 rounded-full p-0",
                    slot.status === "active" && "bg-green-500",
                    slot.status === "paused" && "bg-amber-500",
                    slot.status === "cancelled" && "bg-red-500"
                  )}
                />
                <span>
                  {slot.time} ({slot.booked}/{slot.capacity})
                </span>
              </div>
            )) : (
              <span className="text-xs text-muted-foreground">No slots</span>
            )
          }
        </div>
      )
    }
  ]

  // Define table actions
  const actions: TableAction<any>[] = [
    {
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: (event) => {
        window.location.href = `/admin/events/${event.id}`
      }
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (event) => {
        window.location.href = `/admin/events/${event.id}/edit`
      }
    },

    {
      label: "Toggle Status",
      icon: <Pause className="h-4 w-4" />,
      onClick: (event: any) => handleToggleEventStatus(event.id, event.status),
      disabled: (event: any) => isUpdatingStatus && eventToUpdate === event.id
    },
    {
      label: "Cancel",
      icon: <X className="h-4 w-4" />,
      onClick: (event) => handleCancelEvent(event.id),
      disabled: (event) => isUpdatingStatus && eventToUpdate === event.id,
      variant: 'destructive'
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (event) => handleDeleteEvent(event.id),
      disabled: (event) => isDeletingEvent && eventToDelete === event.id,
      variant: 'destructive'
    }
  ]

  // Handle event deletion
  const handleDeleteEvent = async (eventId: string) => {
    if (!eventId) return;

    // Find the event object to get the imageUrl
    const eventObj = apiEvents.find(event => (event.id || event.event_id)?.toString() === eventId);
    const imageUrl = eventObj?.image_url || eventObj?.imageUrl;

    try {
      setIsDeletingEvent(true);
      setEventToDelete(eventId);

      // Call the API to delete the event, passing imageUrl
      const result = await deleteEvent(Number(eventId), imageUrl);

      // Check if the result indicates success (either directly or as an array with success property)
      const isSuccess = (result && typeof result === 'object' && 'success' in result && result.success) ||
                        (Array.isArray(result) && result[0]?.success === true);

      if (isSuccess) {
        toast({
          title: "Success",
          description: "Event deleted successfully",
        });

        // Remove the deleted event from the state
        setApiEvents(prevEvents => {
          const filteredEvents = (prevEvents || []).filter(event => {
            const eventIdStr = (event.id || event.event_id)?.toString();
            return eventIdStr !== eventId;
          });
          return filteredEvents;
        });

        // Reset the event to delete
        setEventToDelete(null);
      } else {
        throw new Error("Failed to delete event. Please try again.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    } finally {
      setIsDeletingEvent(false);
    }
  };

  // Handle cancel event
  const handleCancelEvent = async (eventId: string) => {
    try {
      setIsUpdatingStatus(true);
      setEventToUpdate(eventId);

      // Find the event in the current data
      const eventToCancel = apiEvents.find(event => (event.id || event.event_id)?.toString() === eventId);
      if (!eventToCancel) {
        throw new Error("Event not found");
      }

      // Prepare the update data with all required fields
      const updateData = {
        id: Number(eventId),
        title: eventToCancel.event_title,
        description: eventToCancel.event_description,
        city_id: eventToCancel.city?.city_id || eventToCancel.city_id,
        venue_id: eventToCancel.venue?.venue_id || eventToCancel.venue_id,
        event_date: eventToCancel.event_date.split('T')[0], // Format as YYYY-MM-DD
        status: "Cancelled",
        updated_at: new Date().toISOString(),
        games: eventToCancel.games || []
      };

      // Call the API to cancel the event
      const result = await updateEvent(updateData);

      // Check if the result indicates success
      const isSuccess = (result && typeof result === 'object' && 'success' in result && result.success) ||
                        (Array.isArray(result) && result[0]?.success === true);

      if (isSuccess) {
        toast({
          title: "Success",
          description: "Event cancelled successfully",
        });

        // Update the event status in the state
        setApiEvents(prevEvents => {
          return prevEvents.map(event =>
            (event.id || event.event_id)?.toString() === eventId
              ? { ...event, event_status: "Cancelled" }
              : event
          );
        });
      } else {
        throw new Error("Failed to cancel event. Please try again.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
      setEventToUpdate(null);
    }
  };

  // Get filtered venues based on selected city
  const filteredVenues = selectedCity
    ? venues.filter((venue) => venue.city_name === selectedCity)
    : venues

  // Calendar helper functions
  const generateCalendarDays = (month: Date) => {
    const start = startOfWeek(startOfMonth(month))
    const end = endOfWeek(endOfMonth(month))
    return eachDayOfInterval({ start, end })
  }

  const getEventsForDay = (day: Date) => {
    const dayString = format(day, "yyyy-MM-dd")
    return filteredEvents.filter((event): event is NonNullable<typeof event> => !!event).filter(event => event.date === dayString)
  }

  const handleDayClick = (day: Date) => {
    const dayEvents = getEventsForDay(day)
    setSelectedDayEvents(dayEvents)
    setIsEventModalOpen(true)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1))
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published': return 'bg-green-500'
      case 'paused': return 'bg-amber-500'
      case 'cancelled': return 'bg-red-500'
      case 'draft': return 'bg-gray-500'
      case 'completed': return 'bg-blue-500'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">NIBOG Events</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage NIBOG baby games events across 21 cities</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button 
            variant="outline" 
            className="touch-manipulation" 
            onClick={() => {
              toast({
                title: "Refreshing...",
                description: "Fetching latest events data",
              })
              fetchEvents()
            }}
            disabled={isLoading}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
            <span className="sm:hidden">Refresh</span>
          </Button>
          <Button variant="outline" asChild className="touch-manipulation">
            <Link href="/admin/events/cities">
              <MapPin className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Browse by City</span>
              <span className="sm:hidden">Cities</span>
            </Link>
          </Button>
          <Button asChild className="touch-manipulation">
            <Link href="/admin/events/new">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Create New Event</span>
              <span className="sm:hidden">New Event</span>
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-none sm:flex">
            <TabsTrigger value="list" className="touch-manipulation">List View</TabsTrigger>
            <TabsTrigger value="calendar" className="touch-manipulation">Calendar View</TabsTrigger>
          </TabsList>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search events..."
                className="pl-9 h-10 touch-manipulation"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto touch-manipulation">
                  <Filter className="mr-2 h-4 w-4 sm:mr-0" />
                  <span className="sm:sr-only">Filters</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80 md:w-96" align="end" sideOffset={8}>
                <div className="space-y-3 sm:space-y-4 p-1">
                  <h4 className="font-medium text-base">Filter Events</h4>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">City</Label>
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                      <SelectTrigger id="city" className="touch-manipulation">
                        <SelectValue placeholder="All Cities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="" className="touch-manipulation">All Cities</SelectItem>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.city_name} className="touch-manipulation">
                            {city.city_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="venue" className="text-sm font-medium">Venue</Label>
                    <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                      <SelectTrigger id="venue" className="touch-manipulation">
                        <SelectValue placeholder="All Venues" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="" className="touch-manipulation">All Venues</SelectItem>
                        {filteredVenues.map((venue) => (
                          <SelectItem key={venue.id} value={venue.venue_name} className="touch-manipulation">
                            {venue.venue_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template" className="text-sm font-medium">Game Template</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger id="template" className="touch-manipulation">
                        <SelectValue placeholder="All Templates" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="" className="touch-manipulation">All Templates</SelectItem>
                        {gameTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.game_name} className="touch-manipulation">
                            {template.game_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger id="status" className="touch-manipulation">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="" className="touch-manipulation">All Statuses</SelectItem>
                        <SelectItem value="draft" className="touch-manipulation">Draft</SelectItem>
                        <SelectItem value="published" className="touch-manipulation">Published</SelectItem>
                        <SelectItem value="paused" className="touch-manipulation">Paused</SelectItem>
                        <SelectItem value="cancelled" className="touch-manipulation">Cancelled</SelectItem>
                        <SelectItem value="completed" className="touch-manipulation">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal touch-manipulation",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex flex-col gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("")
                        setSelectedCity("")
                        setSelectedVenue("")
                        setSelectedTemplate("")
                        setSelectedStatus("")
                        setSelectedDate(undefined)
                      }}
                      className="w-full touch-manipulation"
                    >
                      Reset Filters
                    </Button>
                    <Button className="w-full touch-manipulation">Apply Filters</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <TabsContent value="list" className="space-y-4">
          <EnhancedDataTable
            data={filteredEvents}
            columns={columns}
            actions={actions}
            loading={isLoading}
            searchable={false} // We have custom search above
            filterable={false} // We have custom filters above
            exportable={true}
            selectable={false}
            pagination={true}
            pageSize={25}
            exportColumns={createEventExportColumns()}
            exportTitle="NIBOG Events Report"
            exportFilename="nibog-events"
            emptyMessage={!hasValidEvents ? "No events found. Get started by creating your first event." : "No matching events. Try adjusting your search or filter criteria."}
            className="min-h-[400px]"
          />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex h-[400px] items-center justify-center">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading events...</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-2xl font-bold">
                      {format(currentMonth, "MMMM yyyy")}
                    </h2>
                    <div className="flex gap-1 sm:gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateMonth('prev')}
                        className="h-9 w-9 touch-manipulation"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateMonth('next')}
                        className="h-9 w-9 touch-manipulation"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                    {/* Day headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-muted-foreground">
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{day.charAt(0)}</span>
                      </div>
                    ))}

                    {/* Calendar days */}
                    {generateCalendarDays(currentMonth).map((day, index) => {
                      const dayEvents = getEventsForDay(day)
                      const isCurrentMonth = format(day, 'M') === format(currentMonth, 'M')
                      const isCurrentDay = isToday(day)

                      return (
                        <div
                          key={index}
                          className={cn(
                            "min-h-[60px] sm:min-h-[100px] p-0.5 sm:p-1 border border-border cursor-pointer hover:bg-muted/50 transition-colors touch-manipulation",
                            !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                            isCurrentDay && "bg-primary/10 border-primary"
                          )}
                          onClick={() => handleDayClick(day)}
                        >
                          <div className="flex flex-col h-full">
                            <div className={cn(
                              "text-xs sm:text-sm font-medium mb-0.5 sm:mb-1",
                              isCurrentDay && "text-primary font-bold"
                            )}>
                              {format(day, 'd')}
                            </div>

                            <div className="flex-1 space-y-0.5 sm:space-y-1">
                              {dayEvents.slice(0, 2).map((event, eventIndex) => (
                                <div
                                  key={eventIndex}
                                  className={cn(
                                    "text-[10px] sm:text-xs p-0.5 sm:p-1 rounded text-white truncate",
                                    getStatusColor(event.status)
                                  )}
                                  title={`${event.title} - ${event.status}`}
                                >
                                  {event.title}
                                </div>
                              ))}

                              {dayEvents.length > 2 && (
                                <div className="text-[10px] sm:text-xs text-muted-foreground">
                                  +{dayEvents.length - 2} more
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-2 sm:gap-4 pt-3 sm:pt-4 border-t">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-green-500"></div>
                      <span className="text-xs sm:text-sm">Published</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-amber-500"></div>
                      <span className="text-xs sm:text-sm">Paused</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-red-500"></div>
                      <span className="text-xs sm:text-sm">Cancelled</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-gray-500"></div>
                      <span className="text-xs sm:text-sm">Draft</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-blue-500"></div>
                      <span className="text-xs sm:text-sm">Completed</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Event Details Modal */}
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Events for {selectedDayEvents.length > 0 && format(new Date(selectedDayEvents[0].date), "MMMM d, yyyy")}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {selectedDayEvents.length} event{selectedDayEvents.length !== 1 ? 's' : ''} scheduled for this day
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No events scheduled for this day</p>
              </div>
            ) : (
              selectedDayEvents.map((event) => (
                <Card key={event.id} className="p-3 sm:p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                        <h3 className="text-base sm:text-lg font-semibold">
                          <TruncatedText
                            text={event.title}
                            maxLength={60}
                            showTooltip={true}
                          />
                        </h3>
                        {event.status === "published" && (
                          <Badge className="bg-green-500 hover:bg-green-600">Published</Badge>
                        )}
                        {event.status === "draft" && (
                          <Badge variant="outline">Draft</Badge>
                        )}
                        {event.status === "paused" && (
                          <Badge className="bg-amber-500 hover:bg-amber-600">Paused</Badge>
                        )}
                        {event.status === "cancelled" && (
                          <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>
                        )}
                        {event.status === "completed" && (
                          <Badge className="bg-blue-500 hover:bg-blue-600">Completed</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{event.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium mb-2">Games:</div>
                        <div className="flex flex-wrap gap-1">
                          {event.gameTemplate && typeof event.gameTemplate === 'string' ?
                            event.gameTemplate.split(", ").map((game: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {game}
                              </Badge>
                            )) : (
                              <Badge variant="outline" className="text-xs">Unknown</Badge>
                            )
                          }
                        </div>
                      </div>

                      {event.slots && event.slots.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2">Time Slots:</div>
                          <div className="space-y-1">
                            {event.slots.map((slot: any) => (
                              <div key={slot.id} className="flex items-center gap-2 text-sm">
                                <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                <span className="truncate">{slot.time}</span>
                                <Users className="h-3 w-3 text-muted-foreground ml-2 flex-shrink-0" />
                                <span>{slot.booked}/{slot.capacity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 sm:ml-4">
                      <Button variant="ghost" size="sm" asChild className="touch-manipulation">
                        <Link href={`/admin/events/${event.id}`}>
                          <Eye className="h-4 w-4 mr-2 sm:mr-0" />
                          <span className="sm:sr-only">View</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild className="touch-manipulation">
                        <Link href={`/admin/events/${event.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2 sm:mr-0" />
                          <span className="sm:sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild className="touch-manipulation">
                        <Link href={`/admin/events/clone/${event.id}`}>
                          <Copy className="h-4 w-4 mr-2 sm:mr-0" />
                          <span className="sm:sr-only">Clone</span>
                        </Link>
                      </Button>

                      {/* Action buttons with same functionality as table view */}
                      {event.status === "published" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleEventStatus(event.id, event.status)}
                          disabled={isUpdatingStatus && eventToUpdate === event.id}
                        >
                          {isUpdatingStatus && eventToUpdate === event.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          ) : (
                            <Pause className="h-4 w-4" />
                          )}
                          <span className="sr-only">Pause event</span>
                        </Button>
                      )}
                      {event.status === "paused" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleEventStatus(event.id, event.status)}
                          disabled={isUpdatingStatus && eventToUpdate === event.id}
                        >
                          {isUpdatingStatus && eventToUpdate === event.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                          <span className="sr-only">Resume event</span>
                        </Button>
                      )}
                      {(event.status === "published" || event.status === "paused" || event.status === "draft") && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <X className="h-4 w-4" />
                              <span className="sr-only">Cancel event</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Event</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel this event? This will prevent any new bookings, but existing bookings will be maintained. This action can be reversed by editing the event status.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCancelEvent(event.id)}
                                disabled={isUpdatingStatus && eventToUpdate === event.id}
                                className="bg-orange-500 hover:bg-orange-600"
                              >
                                {isUpdatingStatus && eventToUpdate === event.id ? (
                                  <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Cancelling...
                                  </>
                                ) : (
                                  "Cancel Event"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Delete event</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Event</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this event? This action cannot be undone.
                              All registrations and data associated with this event will be permanently removed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteEvent(event.id)}
                              disabled={isDeletingEvent && eventToDelete === event.id}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              {isDeletingEvent && eventToDelete === event.id ? (
                                <>
                                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                  Deleting...
                                </>
                              ) : (
                                "Delete Event"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
