"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TimePickerDemo } from "@/components/time-picker"
// import { getAllCities } from "@/services/cityService"
// import { getVenuesByCity } from "@/services/venueService"
import { getAllBabyGames, BabyGame } from "@/services/babyGameService"
import { createEvent, formatEventDataForAPI, formatEventDataForUpdate, updateEvent, uploadEventImage, sendEventImageToWebhook } from "@/services/eventService"
import { toast } from "@/components/ui/use-toast"

// Removed hardcoded venues. Only use API data for cities and venues.

// Fallback game templates in case API fails
const fallbackGameTemplates = [
  {
    id: "1",
    name: "Baby Sensory Play",
    description: "Engage your baby's senses with various textures, sounds, and colors.",
    minAgeMonths: 6,
    maxAgeMonths: 18,
    durationMinutes: 90,
    suggestedPrice: 1799,
    categories: ["sensory", "development"]
  },
  {
    id: "2",
    name: "Toddler Music & Movement",
    description: "Fun-filled session with music, dance, and movement activities.",
    minAgeMonths: 12,
    maxAgeMonths: 36,
    durationMinutes: 90,
    suggestedPrice: 1799,
    categories: ["music", "movement"]
  },
  {
    id: "3",
    name: "Baby Olympics",
    description: "Exciting mini-games and activities designed for babies to have fun and develop motor skills.",
    minAgeMonths: 8,
    maxAgeMonths: 24,
    durationMinutes: 120,
    suggestedPrice: 1799,
    categories: ["olympics", "motor-skills"]
  },
]

export default function NewEventPage() {
  const router = useRouter()
  const [citiesWithVenues, setCitiesWithVenues] = useState<Array<any>>([])
  const [debugCities, setDebugCities] = useState<string>("")
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null)
  const [babyGames, setBabyGames] = useState<BabyGame[]>([])
  // Remove unused selectedCity state
  const [selectedVenue, setSelectedVenue] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [eventTitle, setEventTitle] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [eventStatus, setEventStatus] = useState("draft")
  const [isActive, setIsActive] = useState(true)
  const [eventImage, setEventImage] = useState<string | null>(null)
  const [eventImageFile, setEventImageFile] = useState<File | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imagePriority, setImagePriority] = useState("1")
  const [selectedGames, setSelectedGames] = useState<Array<{
    templateId: string;
    customTitle?: string;
    customDescription?: string;
    customPrice?: number;
    note?: string;
    slots: Array<{
      id: string;
      startTime: string;
      endTime: string;
      price: number;
      maxParticipants: number;
      minAge?: number;
      maxAge?: number;
      isActive?: boolean;
    }>;
  }>>([])
  const [activeGameIndex, setActiveGameIndex] = useState<number | null>(null)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [isLoadingVenues, setIsLoadingVenues] = useState(false)
  const [isLoadingGames, setIsLoadingGames] = useState(false)
  const [cityError, setCityError] = useState<string | null>(null)
  const [venueError, setVenueError] = useState<string | null>(null)
  const [gamesError, setGamesError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch cities with venues from API when component mounts
  useEffect(() => {
    const fetchCitiesWithVenues = async () => {
      try {
        setIsLoadingCities(true)
        setCityError(null)
        // Fetching cities with venues from API (debug log removed)
        const res = await fetch("/api/city/with-venues/list")
        // API Response status (debug log removed)
        if (!res.ok) throw new Error("Failed to fetch cities with venues")
        let data = await res.json()
        // Cities with venues data (debug log removed)
        // Data type (debug log removed)
        // Defensive: ensure data is always an array
        if (!Array.isArray(data)) {
          console.error("API response is not an array:", data)
          data = []
        }
        // Loaded cities from API (debug log removed)
        // Filter only active cities
        const activeCities = data.filter((city: any) => city.is_active === 1)
        // Active cities count (debug log removed)
        setCitiesWithVenues(activeCities)
        setDebugCities(JSON.stringify(activeCities, null, 2))
      } catch (error: any) {
        console.error("Error fetching cities:", error)
        setCityError("Failed to load cities. Please try again.")
        setDebugCities(error.message || "Unknown error")
      } finally {
        setIsLoadingCities(false)
      }
    }
    fetchCitiesWithVenues()
  }, [])

  // No need to fetch venues separately, handled by citiesWithVenues

  // Fetch baby games from API when component mounts
  useEffect(() => {
    const fetchBabyGames = async () => {
      try {
        setIsLoadingGames(true)
        setGamesError(null)

        // Fetching baby games from API (debug log removed)

        // Fetch baby games from the API
        const gamesData = await getAllBabyGames()
        // Baby games data from API (debug log removed)

        if (gamesData.length === 0) {
          console.warn("No baby games found in the API response")
          setGamesError("No games found. Please add games first.")
        } else {
          setBabyGames(gamesData)
        }
      } catch (error: any) {
        console.error("Failed to fetch baby games:", error)
        setGamesError("Failed to load games. Please try again.")
      } finally {
        setIsLoadingGames(false)
      }
    }

    fetchBabyGames()
  }, [])

  // Get filtered venues based on selected cityId
  // Only show venues for the selected city (from API)
  const filteredVenues = selectedCityId
    ? (citiesWithVenues.find(city => city.id === selectedCityId)?.venues || [])
    : []

  // Get game templates (either from API or fallback)
  const gameTemplates = babyGames.length > 0
    ? babyGames.map(game => ({
        id: game.id?.toString() || "",
        name: game.game_name,
        description: game.description || "",
        minAgeMonths: game.min_age || 0,
        maxAgeMonths: game.max_age || 0,
        durationMinutes: game.duration_minutes,
        suggestedPrice: 1799, // Default price since API doesn't provide price
        categories: game.categories || []
      }))
    : fallbackGameTemplates

  // Add a game to the event
  const addGame = (templateId: string) => {
    const template = gameTemplates.find((t) => t.id === templateId)
    if (!template) return

    // Check if game is already added
    if (selectedGames.some(game => game.templateId === templateId)) {
      toast({
        title: "Game Already Added",
        description: "This game is already added to the event.",
        variant: "destructive",
      })
      return
    }

    const newGame = {
      templateId,
      customTitle: template.name,
      customDescription: template.description,
      customPrice: template.suggestedPrice ?? 0,
      note: "",
      slots: [{
        id: `game-${templateId}-slot-1`,
        startTime: "10:00",
        endTime: "11:30",
        price: template.suggestedPrice ?? 0,
        maxParticipants: 12,
        minAge: template.minAgeMonths || 0,
        maxAge: template.maxAgeMonths || 36,
        isActive: true
      }]
    }

    const newGames = [...selectedGames, newGame]
    setSelectedGames(newGames)
    setActiveGameIndex(newGames.length - 1)
  }

  // Remove a game from the event
  const removeGame = (index: number) => {
    setSelectedGames(selectedGames.filter((_, i) => i !== index))
    if (activeGameIndex === index) {
      setActiveGameIndex(null)
    } else if (activeGameIndex !== null && activeGameIndex > index) {
      setActiveGameIndex(activeGameIndex - 1)
    }
  }

  // Update game details
  const updateGame = (index: number, field: string, value: any) => {
    setSelectedGames(selectedGames.map((game, i) => {
      if (i === index) {
        return { ...game, [field]: value }
      }
      return game
    }))
  }

  // Add a new time slot to a game
  const addSlot = (gameIndex: number) => {
    const game = selectedGames[gameIndex]
    if (!game) return

    const template = gameTemplates.find(t => t.id === game.templateId);
    const newSlot = {
      id: `game-${game.templateId}-slot-${game.slots.length + 1}`,
      startTime: "10:00",
      endTime: "11:30",
      price: game.customPrice ?? template?.suggestedPrice ?? 0,
      maxParticipants: 12,
      minAge: Math.floor((template?.minAgeMonths || 0) / 12),
      maxAge: Math.floor((template?.maxAgeMonths || 36) / 12),
      isActive: true
    }

    setSelectedGames(selectedGames.map((g, i) => {
      if (i === gameIndex) {
        return { ...g, slots: [...g.slots, newSlot] }
      }
      return g
    }))
  }

  // Remove a time slot from a game
  const removeSlot = (gameIndex: number, slotId: string) => {
    setSelectedGames(selectedGames.map((game, i) => {
      if (i === gameIndex) {
        return { ...game, slots: game.slots.filter(slot => slot.id !== slotId) }
      }
      return game
    }))
  }

  // Update a slot field
  const updateSlot = (gameIndex: number, slotId: string, field: string, value: any) => {
    setSelectedGames(selectedGames.map((game, i) => {
      if (i === gameIndex) {
        return {
          ...game,
          slots: game.slots.map(slot => {
            if (slot.id === slotId) {
              return { ...slot, [field]: value }
            }
            return slot
          })
        }
      }
      return game
    }))
  }

  // Handle image upload - just store the file for now, upload after event creation
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: "File size too large. Maximum size is 5MB.",
        variant: "destructive",
      })
      return
    }

    setEventImageFile(file)
    setEventImage(file.name) // Store filename for display
    // Event image selected (debug log removed)

    toast({
      title: "Success",
      description: "Event image selected! It will be uploaded after event creation.",
    })
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent double submission
    if (isSubmitting) {
      console.log('⏸️ Already submitting, ignoring duplicate submission');
      return;
    }

    console.log('🚀 Starting form submission...');

    // Validate form
    if (!selectedCityId || !selectedVenue || !selectedDate || selectedGames.length === 0) {
      console.error("❌ Validation failed:", {
        selectedCityId,
        selectedVenue,
        selectedDate: selectedDate?.toISOString(),
        selectedGamesCount: selectedGames.length
      });
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and add at least one game.",
        variant: "destructive",
      })
      return
    }

    // Check if all games have at least one slot
    const gamesWithoutSlots = selectedGames.filter(game => game.slots.length === 0)
    if (gamesWithoutSlots.length > 0) {
      console.error("❌ Games without slots:", gamesWithoutSlots);
      toast({
        title: "Validation Error",
        description: `Please add at least one time slot to each game. Games without slots: ${gamesWithoutSlots.map(g => g.customTitle).join(", ")}`,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true);
    console.log('✅ Validation passed, proceeding with event creation...');

    try {
      // Get the city ID from the selected city
      const cityId = selectedCityId || 0

      // Format the date correctly - API expects YYYY-MM-DD format
      let apiDate = "";
      if (selectedDate) {
        // Format as YYYY-MM-DD to match database DATE column and API specification
        apiDate = format(selectedDate, "yyyy-MM-dd");
        console.log('📅 Date formatted for API (YYYY-MM-DD):', apiDate);
      }

      // Format the data for the API
      const formData = {
        title: eventTitle,
        description: eventDescription,
        venueId: selectedVenue,
        date: apiDate,
        status: eventStatus,
        isActive: isActive,
        games: selectedGames,
        cityId: cityId,
        imagePath: null, // Don't set image path yet, will update after upload
        imagePriority: imagePriority
      }

      // Form data prepared (debug log removed)

      // Format the data for the API
      const apiData = formatEventDataForAPI(formData)
      // Log the games and slots being sent to API for debugging
      console.log('🎮 Games being sent to API:')
      console.log('Total games:', selectedGames.length)
      selectedGames.forEach((game, idx) => {
        console.log(`Game ${idx + 1}: ${game.customTitle}, Slots: ${game.slots.length}`)
        game.slots.forEach((slot, slotIdx) => {
          console.log(`  Slot ${slotIdx + 1}: ${slot.startTime} - ${slot.endTime}, Price: ${slot.price}`)
        })
      })
      console.log('📤 Formatted API data - event_games_with_slots count:', apiData.event_games_with_slots?.length)
      apiData.event_games_with_slots?.forEach((slot: any, idx: number) => {
        console.log(`  API Slot ${idx + 1}: game_id=${slot.game_id}, ${slot.start_time} - ${slot.end_time}`)
      })

      // Call the API to create the event
      const createdEvent = await createEvent(apiData)
      // Created event (debug log removed)

      // Get the event ID from the response
      // Handle both response formats: {id: ...} or {event_id: ...}
      const eventId = (createdEvent as any)?.event_id || (createdEvent as any)?.id
      if (!eventId) {
        throw new Error("Event created but no ID returned")
      }

      // Event created with ID (debug log removed)

      // If there's an image file, upload it and update the event with image ONLY
      // IMPORTANT: DO NOT include games in the update to avoid slot duplication!
      if (eventImageFile) {
        try {
          console.log('📷 Uploading event image after successful event creation...');

          // Upload the image
          const uploadResult = await uploadEventImage(eventImageFile)
          console.log('✅ Event image uploaded:', uploadResult);

          // Update the event with the correct image filename
          // Extract just the filename from the path (e.g., "eventimage_1766294157627_3470.jpg")
          const imageFilename = uploadResult.filename || uploadResult.path.split('/').pop()
          
          console.log('🔄 Updating event with image filename:', imageFilename);
          
          // CRITICAL FIX: Create a minimal update object with ONLY the image
          // Do NOT include games in this update - the slots were already created!
          const updateDataWithImage = {
            title: eventTitle,
            description: eventDescription,
            venueId: selectedVenue,
            date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
            status: eventStatus,
            isActive: isActive,
            games: [], // EMPTY array - do not send games to prevent slot duplication
            cityId: cityId,
            imagePath: imageFilename, // Set the correct uploaded filename
            imagePriority: imagePriority
          }

          const apiDataWithImage = formatEventDataForUpdate(eventId, updateDataWithImage)
          apiDataWithImage.id = eventId

          console.log('🎬 Calling updateEvent with image-only data (no games)...');
          const updatedEvent = await updateEvent(apiDataWithImage)
          console.log('✅ Event updated with image filename successfully');

          toast({
            title: "Success",
            description: "Event created and image uploaded successfully!",
          })
        } catch (imageError: any) {
          console.error("❌ Error uploading image after event creation:", imageError)
          toast({
            title: "Warning",
            description: `Event created successfully, but image upload failed: ${imageError.message || "Unknown error"}`,
            variant: "destructive",
          })
        }
      } else {
        // Show success message for event creation only
        toast({
          title: "Success",
          description: "Event created successfully!",
        })
      }


      // Redirect to events list after a short delay to show the toast
      setTimeout(() => {
        router.push("/admin/events")
      }, 2000)
    } catch (error: any) {
      console.error("❌ Error creating event:", error)
      console.error("Error stack:", error.stack);
      toast({
        title: "Error",
        description: `Failed to create event: ${error.message || "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false);
      console.log('✅ Form submission completed');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Event</h1>
        <p className="text-muted-foreground">Schedule a new event based on a game template</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>Basic information about the event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Enter event title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Event Description</Label>
                  <Textarea
                    id="description"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="Enter event description"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventImage">Event Image</Label>
                  <Input
                    id="eventImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                    className="cursor-pointer"
                  />
                  {isUploadingImage && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading image...
                    </div>
                  )}
                  {eventImageFile && (
                    <div className="flex items-center text-sm text-blue-600">
                      <span>✓ Image selected: {eventImageFile.name} (will be uploaded after event creation)</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="10"
                    value={imagePriority}
                    onChange={(e) => setImagePriority(e.target.value)}
                    placeholder="Enter priority (1-10)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  {isLoadingCities ? (
                    <div className="flex h-10 items-center rounded-md border border-input px-3 py-2 text-sm">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground">Loading cities...</span>
                    </div>
                  ) : cityError ? (
                    <div className="flex h-10 items-center rounded-md border border-destructive px-3 py-2 text-sm text-destructive">
                      {cityError}
                    </div>
                  ) : (
                    <>
                      <div className="text-xs text-muted-foreground mb-1">
                        {citiesWithVenues.length > 0 
                          ? `${citiesWithVenues.length} cities loaded from API` 
                          : "No cities available - Check console for errors"}
                      </div>
                      <Select
                        value={selectedCityId ? String(selectedCityId) : ""}
                        onValueChange={(value) => {
                          setSelectedCityId(Number(value))
                          setSelectedVenue("") // Reset venue when city changes
                        }}
                        disabled={citiesWithVenues.length === 0}
                      >
                        <SelectTrigger id="city">
                          <SelectValue placeholder={citiesWithVenues.length === 0 ? "No cities available" : "Select a city"} />
                        </SelectTrigger>
                        <SelectContent>
                          {citiesWithVenues.map((city) => (
                            <SelectItem key={city.id} value={String(city.id)}>
                              {city.city_name} ({city.state})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Select
                    value={selectedVenue}
                    onValueChange={setSelectedVenue}
                    disabled={!selectedCityId || filteredVenues.length === 0}
                  >
                    <SelectTrigger id="venue">
                      <SelectValue
                        placeholder={
                          !selectedCityId
                            ? "Select a city first"
                            : filteredVenues.length === 0
                              ? "No venues available"
                              : "Select a venue"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredVenues.length === 0 ? (
                        <SelectItem value="no-venues" disabled>
                          No venues available for this city
                        </SelectItem>
                      ) : (
                        filteredVenues.map((venue: any) => (
                          <SelectItem key={venue.id} value={venue.id.toString()}>
                            {venue.venue_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  
                  {/* Display venues for selected city */}
                  {selectedCityId && filteredVenues.length > 0 && (
                    <div className="mt-3 p-3 rounded-md border bg-muted/50">
                      <p className="text-sm font-medium mb-2">Available Venues ({filteredVenues.length}):</p>
                      <div className="space-y-2">
                        {filteredVenues.map((venue: any) => (
                          <div key={venue.id} className="text-sm p-2 rounded bg-background border">
                            <p className="font-medium">{venue.venue_name}</p>
                            <p className="text-muted-foreground text-xs">{venue.address}</p>
                            {venue.capacity && (
                              <p className="text-muted-foreground text-xs">Capacity: {venue.capacity}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">\n                  <Label>Event Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        disabled={(date) => {
                          const minDate = new Date(2000, 0, 1);
                          const maxDate = new Date(new Date().getFullYear() + 20, 11, 31);
                          return date < minDate || date > maxDate;
                        }}
                        fromYear={2000}
                        toYear={new Date().getFullYear() + 20}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Initial Status</Label>
                  <Select value={eventStatus} onValueChange={setEventStatus}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="is-active" className="cursor-pointer">
                    Active Event (visible to users)
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Games</CardTitle>
                <CardDescription>Select games to include in this event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                <div className="space-y-2">
                  <Label htmlFor="gameTemplate">Game Templates</Label>
                  {isLoadingGames ? (
                    <div className="flex h-10 items-center rounded-md border border-input px-3 py-2 text-sm">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground">Loading games...</span>
                    </div>
                  ) : gamesError ? (
                    <div className="flex h-10 items-center rounded-md border border-destructive px-3 py-2 text-sm text-destructive">
                      {gamesError}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Select onValueChange={addGame} disabled={gameTemplates.length === 0}>
                        <SelectTrigger id="gameTemplate" className="flex-1">
                          <SelectValue placeholder={gameTemplates.length === 0 ? "No games available" : "Select a game to add"} />
                        </SelectTrigger>
                        <SelectContent>
                          {gameTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {selectedGames.length === 0 ? (
                  <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                    <p className="text-sm text-muted-foreground">No games added yet. Select a game template to add it to the event.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Selected Games</Label>
                    <div className="space-y-2">
                      {selectedGames.map((game, index) => {
                        const template = gameTemplates.find(t => t.id === game.templateId)
                        return (
                          <div
                            key={`${game.templateId}-${index}`}
                            className={cn(
                              "flex items-center justify-between rounded-md border p-3 cursor-pointer",
                              activeGameIndex === index && "border-primary bg-primary/5"
                            )}
                            onClick={() => setActiveGameIndex(index)}
                          >
                            <div>
                              <h4 className="font-medium">{game.customTitle || template?.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {game.slots.length} slot(s) • Custom Price: ₹{game.customPrice ?? template?.suggestedPrice ?? 0}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeGame(index)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove game</span>
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {activeGameIndex !== null && selectedGames[activeGameIndex] && (
              <Card>
                <CardHeader>
                  <CardTitle>Game Configuration</CardTitle>
                  <CardDescription>
                    Customize the selected game for this event
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  {activeGameIndex !== null && selectedGames[activeGameIndex] && (() => {
                    const game = selectedGames[activeGameIndex];
                    const template = gameTemplates.find(t => t.id === game.templateId);

                    if (!template) {
                      return (
                        <div className="flex h-32 items-center justify-center">
                          <p className="text-sm text-muted-foreground">Template not found</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        <div className="rounded-md bg-muted p-3">
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Template:</span>{" "}
                              <span>{template.name}</span>
                            </div>
                            <div>
                              <span className="font-medium">Age Range:</span>{" "}
                              <span>{template.minAgeMonths}-{template.maxAgeMonths} {template.minAgeMonths < 12 ? "months" : "years"}</span>
                            </div>
                            <div>
                              <span className="font-medium">Duration:</span>{" "}
                              <span>{template.durationMinutes} minutes</span>
                            </div>
                            <div>
                              <span className="font-medium">Suggested Price:</span>{" "}
                              <span>₹{template.suggestedPrice}</span>
                            </div>
                            {template.categories && Array.isArray(template.categories) && template.categories.length > 0 && (
                              <div>
                                <span className="font-medium">Categories:</span>{" "}
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {template.categories.map((category: string, idx: number) => (
                                    <Badge key={idx} variant="secondary">{category}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="customTitle">Custom Title (Optional)</Label>
                          <Input
                            id="customTitle"
                            value={game.customTitle || ""}
                            onChange={(e) => updateGame(activeGameIndex, "customTitle", e.target.value)}
                            placeholder={template.name}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="customDescription">Custom Description (Optional)</Label>
                          <Textarea
                            id="customDescription"
                            value={game.customDescription || ""}
                            onChange={(e) => updateGame(activeGameIndex, "customDescription", e.target.value)}
                            placeholder={template.description}
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="customPrice">Custom Price (₹)</Label>
                          <Input
                            id="customPrice"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={game.customPrice ?? template.suggestedPrice ?? 0}
                            onChange={(e) => {
                              const inputValue = e.target.value
                              // Only allow numbers
                              if (inputValue === '' || /^\d+$/.test(inputValue)) {
                                const price = inputValue === '' ? 0 : parseInt(inputValue) || 0
                                updateGame(activeGameIndex, "customPrice", price)

                                // Update all slot prices if they match the previous custom price
                                const prevPrice = game.customPrice ?? template.suggestedPrice ?? 0
                                const slotsToUpdate = game.slots.filter(slot => slot.price === prevPrice)

                                if (slotsToUpdate.length > 0) {
                                  const updatedSlots = game.slots.map(slot => {
                                    if (slot.price === prevPrice) {
                                      return { ...slot, price }
                                    }
                                    return slot
                                  })

                                  setSelectedGames(selectedGames.map((g, i) => {
                                    if (i === activeGameIndex) {
                                      return { ...g, slots: updatedSlots }
                                    }
                                    return g
                                  }))
                                }
                              }
                            }}
                          />
                          <p className="text-xs text-muted-foreground">
                            Suggested price: ₹{template.suggestedPrice}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gameNote">Note (Optional)</Label>
                          <Textarea
                            id="gameNote"
                            value={game.note || ""}
                            onChange={(e) => updateGame(activeGameIndex, "note", e.target.value)}
                            placeholder="Add any special notes or instructions for this game..."
                            rows={3}
                          />
                          <p className="text-xs text-muted-foreground">
                            This note will be visible to organizers and can include special instructions or requirements.
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {activeGameIndex !== null && selectedGames[activeGameIndex] && (
              <Card>
                <CardHeader>
                  <CardTitle>Time Slots</CardTitle>
                  <CardDescription>
                    {(() => {
                      const game = selectedGames[activeGameIndex];
                      const template = gameTemplates.find(t => t.id === game.templateId);
                      return `Define time slots for ${game.customTitle || template?.name}`;
                    })()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const game = selectedGames[activeGameIndex];

                    if (game.slots.length === 0) {
                      return (
                        <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                          <p className="text-sm text-muted-foreground">No time slots added yet</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {game.slots.map((slot, slotIndex) => (
                          <div key={slot.id} className="rounded-md border p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <h4 className="font-medium">Slot {slotIndex + 1}</h4>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    id={`slot-active-${slot.id}`}
                                    checked={slot.isActive !== false}
                                    onCheckedChange={(checked) => updateSlot(activeGameIndex, slot.id, "isActive", checked)}
                                  />
                                  <Label htmlFor={`slot-active-${slot.id}`} className="text-sm cursor-pointer">
                                    {slot.isActive !== false ? (
                                      <Badge variant="default" className="bg-green-500">Active</Badge>
                                    ) : (
                                      <Badge variant="secondary">Inactive</Badge>
                                    )}
                                  </Label>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSlot(activeGameIndex, slot.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remove slot</span>
                              </Button>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`start-time-${slot.id}`}>Start Time</Label>
                                <Input
                                  id={`start-time-${slot.id}`}
                                  type="time"
                                  value={slot.startTime}
                                  onChange={(e) => updateSlot(activeGameIndex, slot.id, "startTime", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`end-time-${slot.id}`}>End Time</Label>
                                <Input
                                  id={`end-time-${slot.id}`}
                                  type="time"
                                  value={slot.endTime}
                                  onChange={(e) => updateSlot(activeGameIndex, slot.id, "endTime", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`price-${slot.id}`}>Price (₹)</Label>
                                <Input
                                  id={`price-${slot.id}`}
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={slot.price ?? 0}
                                  onChange={(e) => {
                                    const inputValue = e.target.value
                                    // Only allow numbers
                                    if (inputValue === '' || /^\d+$/.test(inputValue)) {
                                      const price = inputValue === '' ? 0 : parseInt(inputValue) || 0
                                      updateSlot(activeGameIndex, slot.id, "price", price)
                                    }
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`capacity-${slot.id}`}>Max Participants</Label>
                                <Input
                                  id={`capacity-${slot.id}`}
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={slot.maxParticipants}
                                  onChange={(e) => {
                                    const inputValue = e.target.value
                                    // Only allow numbers
                                    if (inputValue === '' || /^\d+$/.test(inputValue)) {
                                      const participants = inputValue === '' ? 1 : parseInt(inputValue) || 1
                                      updateSlot(activeGameIndex, slot.id, "maxParticipants", participants)
                                    }
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`min-age-${slot.id}`}>Min Age (months)</Label>
                                <Input
                                  id={`min-age-${slot.id}`}
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={slot.minAge ?? 0}
                                  onChange={(e) => {
                                    const inputValue = e.target.value
                                    if (inputValue === '' || /^\d+$/.test(inputValue)) {
                                      const age = inputValue === '' ? 0 : parseInt(inputValue) || 0
                                      updateSlot(activeGameIndex, slot.id, "minAge", age)
                                    }
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`max-age-${slot.id}`}>Max Age (months)</Label>
                                <Input
                                  id={`max-age-${slot.id}`}
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={slot.maxAge ?? 12}
                                  onChange={(e) => {
                                    const inputValue = e.target.value
                                    if (inputValue === '' || /^\d+$/.test(inputValue)) {
                                      const age = inputValue === '' ? 12 : parseInt(inputValue) || 12
                                      updateSlot(activeGameIndex, slot.id, "maxAge", age)
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => addSlot(activeGameIndex)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Time Slot
                  </Button>

                  {selectedGames[activeGameIndex].slots.length > 0 && (
                    <Alert>
                      <AlertDescription>
                        Time slots should be within the venue's operating hours. Make sure to allow enough time between slots for setup and cleanup.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between pt-4 sm:pt-6 p-4 sm:p-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/events")}
                  className="w-full sm:w-auto touch-manipulation"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto touch-manipulation"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Event...
                    </>
                  ) : (
                    'Create Event'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
