"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarIcon, ArrowLeft, AlertTriangle, Loader2, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { getEventById, updateEvent, formatEventDataForUpdate, uploadEventImage, fetchEventImages, sendEventImageToWebhook, updateEventImage } from "@/services/eventService"
import { getAllCities } from "@/services/cityService"
import { getVenuesByCity } from "@/services/venueService"
import { getAllBabyGames, BabyGame as ImportedBabyGame } from "@/services/babyGameService"

interface LocalBabyGame {
  id: string;
  game_name: string;
  description?: string;
  min_age_months?: number;
  max_age_months?: number;
  duration_minutes: number;
  suggested_price?: number;
  categories?: string[];
}
import { TimePickerDemo } from "@/components/time-picker"
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

// Fallback game templates in case API fails
const fallbackGameTemplates = [
  {
    id: "1",
    name: "Baby Sensory Play",
    description: "Engage your baby's senses with various textures, sounds, and colors.",
    minAgeMonths: 6,
    maxAgeMonths: 18,
    durationMinutes: 90,
    suggestedPrice: 799,
    categories: ["Sensory", "Play"]
  },
  {
    id: "2",
    name: "Toddler Music & Movement",
    description: "Fun-filled session with music, dance, and movement activities.",
    minAgeMonths: 12,
    maxAgeMonths: 36,
    durationMinutes: 90,
    suggestedPrice: 899,
    categories: ["Music", "Movement"]
  },
  {
    id: "3",
    name: "Baby Olympics",
    description: "Exciting mini-games and activities designed for babies to have fun and develop motor skills.",
    minAgeMonths: 8,
    maxAgeMonths: 24,
    durationMinutes: 120,
    suggestedPrice: 999,
    categories: ["Sports", "Games"]
  },
]

interface Props {
  params: {
    id: string
  }
}

export default function EditEventPage({ params }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const eventId = params.id

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [eventData, setEventData] = useState<any>(null)
  const [cities, setCities] = useState<Array<{ id: number; name: string }>>([])
  const [apiVenues, setApiVenues] = useState<Array<{ id: number; name: string }>>([])
  const [babyGames, setBabyGames] = useState<ImportedBabyGame[]>([])

  const [eventTitle, setEventTitle] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedVenue, setSelectedVenue] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [eventStatus, setEventStatus] = useState("draft")
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
    }>;
  }>>([])
  const [activeGameIndex, setActiveGameIndex] = useState<number | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [hasBookings, setHasBookings] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [isLoadingVenues, setIsLoadingVenues] = useState(false)
  const [isLoadingGames, setIsLoadingGames] = useState(false)
  const [cityError, setCityError] = useState<string | null>(null)
  const [venueError, setVenueError] = useState<string | null>(null)
  const [gamesError, setGamesError] = useState<string | null>(null)
  const [eventImage, setEventImage] = useState<string | null>(null)
  const [eventImageFile, setEventImageFile] = useState<File | null>(null)
  const [existingImages, setExistingImages] = useState<any[]>([])
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isLoadingImages, setIsLoadingImages] = useState(false)
  const [imagePriority, setImagePriority] = useState("1")

  // Fetch event data when component mounts
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log(`Fetching event with ID: ${eventId}`)
        const event = await getEventById(Number(eventId))
        console.log("Retrieved event:", event)
        setEventData(event)

        // Set initial form values
        setEventTitle(event.event_title)
        setEventDescription(event.event_description)
        setSelectedCity(event.city_name)
        setSelectedVenue(event.venue_id.toString())
        setSelectedDate(new Date(event.event_date.split('T')[0]))
        setEventStatus(event.event_status.toLowerCase())

        // Format games data for the form
        const formattedGames = event.games.map((game: any) => {
          // The correct API returns flat structure with note field directly in game object
          return {
            templateId: game.game_id.toString(),
            customTitle: game.custom_title || game.game_title,
            customDescription: game.custom_description || game.game_description,
            customPrice: game.custom_price || 0,
            note: game.note || "",
            slots: [{
              id: `game-${game.game_id}-slot-1`,
              startTime: game.start_time ? game.start_time.substring(0, 5) : "09:00",
              endTime: game.end_time ? game.end_time.substring(0, 5) : "10:00",
              price: game.slot_price || game.custom_price || 0,
              maxParticipants: game.max_participants || 50
            }]
          }
        })
        
        console.log("=== FINAL FORMATTED GAMES ===");
        console.log("Formatted games with notes:", JSON.stringify(formattedGames, null, 2));
        console.log("First game note value:", formattedGames[0]?.note);
        console.log("=== END FINAL FORMATTED GAMES ===");
        setSelectedGames(formattedGames)
        if (formattedGames.length > 0) {
          setActiveGameIndex(0)
        }

        // Fetch cities, venues, games, and images
        console.log("🔄 Starting to fetch additional data...")
        fetchCities()
        fetchBabyGames()
        console.log("🖼️ About to call fetchExistingImages()...")
        console.log("🎯 Event ID for image fetch:", eventId)
        fetchExistingImages()
      } catch (error: any) {
        console.error(`Error fetching event with ID ${eventId}:`, error)
        setError(error.message || "Failed to load event")
        toast({
          title: "Error",
          description: error.message || "Failed to load event",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEventData()
  }, [eventId])

  // Fetch cities from API
  const fetchCities = async () => {
    try {
      setIsLoadingCities(true)
      setCityError(null)

      console.log("Fetching cities from API...")
      const citiesData = await getAllCities()
      console.log("Cities data from API:", citiesData)

      // Map the API response to the format expected by the dropdown
      const formattedCities = citiesData.map(city => ({
        id: city.id || 0,
        name: city.city_name
      }))

      console.log("Formatted cities for dropdown:", formattedCities)
      setCities(formattedCities)
    } catch (error: any) {
      console.error("Failed to fetch cities:", error)
      setCityError("Failed to load cities. Please try again.")
    } finally {
      setIsLoadingCities(false)
    }
  }

  // Fetch venues when a city is selected
  useEffect(() => {
    const fetchVenues = async () => {
      if (!selectedCity) return

      try {
        setIsLoadingVenues(true)
        setVenueError(null)

        // Find the city ID from the selected city name
        const cityObj = cities.find(c => c.name === selectedCity)
        if (!cityObj) {
          console.error(`City object not found for name: ${selectedCity}`)
          setVenueError("Selected city not found")
          return
        }

        // Make sure we have a valid city ID
        const cityId = Number(cityObj.id)
        

        if (isNaN(cityId) || cityId <= 0) {
          console.error(`Invalid city ID: ${cityObj.id}`)
          setVenueError("Invalid city ID")
          return
        }

        console.log(`Fetching venues for city: ${selectedCity} (ID: ${cityId})`)

        try {
          // Fetch venues for the selected city
          const venuesData = await getVenuesByCity(cityId)
          console.log(`Retrieved ${venuesData.length} venues for city ${selectedCity}:`, venuesData)

          // Map the API response to the format expected by the dropdown
          const formattedVenues = venuesData.map(venue => ({
            id: venue.id || 0,
            name: venue.venue_name
          }))

          console.log(`Formatted venues for dropdown:`, formattedVenues)
          setApiVenues(formattedVenues)

          // If no venues are found, show a message
          if (formattedVenues.length === 0) {
            console.warn(`No venues found for city ${selectedCity} (ID: ${cityId})`)
            setVenueError(`No venues found for ${selectedCity}`)
          }
        } catch (venueError: any) {
          console.error(`Error fetching venues for city ${selectedCity} (ID: ${cityId}):`, venueError)

          // Try to provide a more helpful error message
          let errorMessage = "Failed to load venues. Please try again."
          if (venueError.message.includes("404")) {
            errorMessage = `No venues found for ${selectedCity} or API endpoint not available`
          } else if (venueError.message.includes("500")) {
            errorMessage = "Server error while fetching venues. Please try again later."
          } else if (venueError.message.includes("timeout")) {
            errorMessage = "Request timed out. Please check your connection and try again."
          }

          setVenueError(errorMessage)
        }
      } catch (error: any) {
        console.error(`Failed to fetch venues for city ${selectedCity}:`, error)
        setVenueError("Failed to load venues. Please try again.")
      } finally {
        setIsLoadingVenues(false)
      }
    }

    if (selectedCity) {
      fetchVenues()
    } else {
      setApiVenues([])
    }
  }, [selectedCity, cities])

  // Fetch baby games from API
  const fetchBabyGames = async () => {
    try {
      setIsLoadingGames(true)
      setGamesError(null)

      console.log("Fetching baby games from API...")
      const gamesData = await getAllBabyGames()
      console.log("Baby games data from API:", gamesData)

      if (gamesData.length === 0) {
        console.warn("No baby games found in the API response")
        setGamesError("No games found. Please add games first.")
      } else {
        setBabyGames(gamesData as ImportedBabyGame[])
      }
    } catch (error: any) {
      console.error("Failed to fetch baby games:", error)
      setGamesError("Failed to load games. Please try again.")
    } finally {
      setIsLoadingGames(false)
    }
  }

  // Fetch existing images for the event
  const fetchExistingImages = async () => {
    try {
      setIsLoadingImages(true)
      console.log(`🔍 Fetching existing images for event ID: ${eventId}`)
      console.log(`📍 This will use the new mapping system to find the correct API ID`)

      const images = await fetchEventImages(Number(eventId))
      console.log("✅ Images fetched with mapping system:", images)

      // Filter out any invalid images and ensure we have an array
      const validImages = Array.isArray(images)
        ? images.filter(img =>
            img &&
            typeof img === 'object' &&
            img.id !== undefined &&
            img.image_url !== undefined &&
            img.image_url !== null &&
            img.image_url.trim() !== ''
          )
        : []
      console.log("Filtered valid images:", validImages)
      setExistingImages(validImages)

      // If there are existing images, set the first one as the current image and priority
      if (validImages.length > 0) {
        const firstImage = validImages[0]
        console.log("Setting first image as current:", firstImage)

        if (firstImage.image_url) {
          setEventImage(firstImage.image_url)
          console.log("Set event image to:", firstImage.image_url)
        }

        if (firstImage.priority !== undefined && firstImage.priority !== null) {
          const priorityValue = firstImage.priority.toString()
          setImagePriority(priorityValue)
          console.log("Set image priority to:", priorityValue)
        } else {
          setImagePriority("1")
          console.log("No priority found, defaulting to 1")
        }
      } else {
        console.log("No existing images found")
        setEventImage(null)
        setImagePriority("1")
      }
    } catch (error: any) {
      console.error("Failed to fetch existing images:", error)
      // Don't show error toast for images as it's not critical
      console.warn("Could not load existing images, continuing without them")
      setExistingImages([])
      setEventImage(null)
      setImagePriority("1")
    } finally {
      setIsLoadingImages(false)
    }
  }

  // Get game templates (either from API or fallback)
  const gameTemplates = babyGames.length > 0
    ? babyGames.map((game: ImportedBabyGame) => ({
        id: game.id?.toString() || "",
        name: game.game_name,
        description: game.description || "",
        minAgeMonths: game.min_age_months || 0,
        maxAgeMonths: game.max_age_months || 0,
        durationMinutes: game.duration_minutes,
        suggestedPrice: game.suggested_price || 799,
        categories: game.categories || []
      }))
    : fallbackGameTemplates

  // Get filtered venues based on selected city (fallback to mock data if API fails)
  const filteredVenues = selectedCity
    ? apiVenues.length > 0
      ? apiVenues
      : []
    : []

  // Handle venue change
  const handleVenueChange = (venueId: string) => {
    if (hasBookings && venueId !== selectedVenue) {
      setShowWarning(true)
    }
    setSelectedVenue(venueId)
  }

  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    if (hasBookings && date && date.toDateString() !== selectedDate?.toDateString()) {
      setShowWarning(true)
    }
    setSelectedDate(date)
  }

  // Add a game to the event
  const addGame = (templateId: string) => {
    const template = gameTemplates.find((t) => t.id === templateId)
    if (!template) return

    // Check if game is already added
    if (selectedGames.some(game => game.templateId === templateId)) {
      toast({
        title: "Game already added",
        description: "This game is already added to the event.",
        variant: "destructive",
      })
      return
    }

    const newGame = {
      templateId,
      customTitle: template.name,
      customDescription: template.description,
      customPrice: template.suggestedPrice,
      note: "",
      slots: [{
        id: `game-${templateId}-slot-1`,
        startTime: "10:00",
        endTime: "11:30",
        price: template.suggestedPrice,
        maxParticipants: 12
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

    const newSlot = {
      id: `game-${game.templateId}-slot-${game.slots.length + 1}`,
      startTime: "10:00",
      endTime: "11:30",
      price: game.customPrice || gameTemplates.find(t => t.id === game.templateId)?.suggestedPrice || 799,
      maxParticipants: 12
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

  // Handle image upload - store the file for later use
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
    console.log('Event image selected:', file.name)

    toast({
      title: "Success",
      description: "Event image selected! It will be uploaded after event update.",
    })
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!selectedVenue || !selectedDate || selectedGames.length === 0) {
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
      toast({
        title: "Validation Error",
        description: `Please add at least one time slot to each game. Games without slots: ${gamesWithoutSlots.map(g => g.customTitle).join(", ")}`,
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)

      // Get the city ID from the selected city name
      const cityObj = cities.find(c => c.name === selectedCity)
      const cityId = cityObj?.id || 0

      // Format the data for the API
      const formData = {
        title: eventTitle,
        description: eventDescription,
        venueId: selectedVenue,
        date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
        status: eventStatus,
        games: selectedGames,
        cityId: cityId,
        imagePath: eventImage,
        imagePriority: imagePriority
      }

      console.log("Form data for update:", formData)

      // Log uploaded image path and priority if available
      if (eventImage) {
        console.log("Event image uploaded successfully:", eventImage)
        console.log("Event priority:", imagePriority)
      }

      // Format the data for the API
      const apiData = formatEventDataForUpdate(Number(eventId), formData)
      console.log("API data for update:", apiData)

      // Call the API to update the event
      const updatedEvent = await updateEvent(apiData)
      console.log("Updated event:", updatedEvent)

      // Handle image updates - either new image upload or priority change
      if (eventImageFile) {
        try {
          console.log("🖼️ Uploading new event image after successful event update...")

          // Upload the new image
          const uploadResult = await uploadEventImage(eventImageFile)
          console.log("✅ Event image uploaded:", uploadResult)

          // Check if there are existing images to update or if we need to create new
          if (existingImages.length > 0) {
            console.log("🔄 Updating existing event image with new file...")

            // Delete old image files from filesystem
            for (const existingImage of existingImages) {
              if (existingImage.image_url) {
                try {
                  // Call API to delete the old file
                  await fetch('/api/files/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filePath: existingImage.image_url })
                  })
                  console.log(`🗑️ Deleted old image file: ${existingImage.image_url}`)
                } catch (deleteError) {
                  console.warn(`⚠️ Failed to delete old image file: ${existingImage.image_url}`, deleteError)
                }
              }
            }

            // Update the image record with new file
            const updateResult = await updateEventImage(
              Number(eventId),
              uploadResult.path,
              parseInt(imagePriority),
              true
            )
            console.log("✅ Event image update result:", updateResult)
          } else {
            console.log("➕ Creating new event image...")
            // Create new image record
            const webhookResult = await sendEventImageToWebhook(
              Number(eventId),
              uploadResult.path,
              parseInt(imagePriority),
              true
            )
            console.log("✅ Event image webhook result:", webhookResult)
          }

          toast({
            title: "Success",
            description: "Event updated and image uploaded successfully!",
          })
        } catch (imageError: any) {
          console.error("❌ Error uploading image after event update:", imageError)
          toast({
            title: "Warning",
            description: `Event updated successfully, but image upload failed: ${imageError.message || "Unknown error"}`,
            variant: "destructive",
          })
        }
      } else if (existingImages.length > 0) {
        // No new image file, but update existing image priority if it changed
        try {
          console.log("🔄 Updating existing event image priority (no new file)...")

          // Get the latest existing image
          const sortedImages = [...existingImages].sort((a, b) => {
            if (a.priority !== b.priority) {
              return b.priority - a.priority;
            }
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
          });
          const latestImage = sortedImages[0];

          console.log(`📊 Current image: ${latestImage.image_url}, Priority: ${latestImage.priority}`);
          console.log(`📊 New priority: ${imagePriority}`);

          // Always call the secondary API to update priority (even if it's the same)
          const updateResult = await updateEventImage(
            Number(eventId),
            latestImage.image_url,
            parseInt(imagePriority),
            true
          )
          console.log("✅ Event image priority update result:", updateResult)

          toast({
            title: "Success",
            description: "Event updated and image priority updated successfully!",
          })
        } catch (imageError: any) {
          console.error("❌ Error updating image priority:", imageError)
          toast({
            title: "Warning",
            description: `Event updated successfully, but image priority update failed: ${imageError.message || "Unknown error"}`,
            variant: "destructive",
          })
        }
      } else {
        // No existing images and no new image file
        console.log("ℹ️ No image updates needed - no existing images and no new file")
        toast({
          title: "Success",
          description: "Event updated successfully!",
        })
      }

      // Redirect to event details page after a short delay to show the toast
      setTimeout(() => {
        router.push('/admin/events')
      }, 2000)
    } catch (error: any) {
      console.error("Error updating event:", error)
      toast({
        title: "Error",
        description: `Failed to update event: ${error.message || "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading event data...</p>
        </div>
      </div>
    )
  }

  if (error || !eventData) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Event Not Found</h2>
          <p className="text-muted-foreground">The event you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" asChild>
            <Link href="/admin/events">Back to Events</Link>
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
            <Link href={`/admin/events/${eventId}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">Edit Event</h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">Update event details for {eventData.event_title}</p>
          </div>
        </div>
      </div>

      {showWarning && (
        <Alert className="bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This event has existing bookings. Changing the venue or date will affect all bookings. Participants will be notified of these changes.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>Basic information about the event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Enter event title"
                    className="touch-manipulation"
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
                    className="touch-manipulation"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventImage">Event Image</Label>
                  <div className="space-y-2">
                    <Input
                      id="eventImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      className="cursor-pointer touch-manipulation"
                    />
                    {isLoadingImages && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading existing images...
                      </div>
                    )}
                    {isUploadingImage && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading image...
                      </div>
                    )}
                    {existingImages.length > 0 && !eventImageFile && (
                      <div className="space-y-3">
                        <div className="text-sm font-medium text-gray-700">Current Event Images:</div>
                        {existingImages.map((img, index) => (
                          <div key={img.id || index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-sm text-gray-700">
                                <span className="font-medium">📷 {img.image_url ? img.image_url.split('/').pop() : 'Unknown file'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Priority: {img.priority || 'N/A'}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${img.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                  {img.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              Created: {img.created_at ? new Date(img.created_at).toLocaleDateString() : 'Unknown'}
                              {img.updated_at && img.updated_at !== img.created_at && (
                                <span> • Updated: {new Date(img.updated_at).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        ))}
                        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                          💡 The priority field below shows the current priority. Upload a new image to replace the existing one.
                        </div>
                      </div>
                    )}
                    {existingImages.length === 0 && !eventImageFile && !isLoadingImages && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="text-sm text-yellow-800">
                          📷 No existing images found for Event ID {eventId}
                        </div>
                        <div className="text-xs text-yellow-600 mt-1">
                          This event doesn't have any images yet. Upload an image above to add one.
                        </div>
                        <div className="text-xs text-yellow-500 mt-2">
                          💡 If you expect images to be here, verify the event ID in the external system.
                        </div>
                      </div>
                    )}
                    {eventImageFile && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center text-sm text-green-700">
                          <span>✓ New image selected: <strong>{eventImageFile.name}</strong></span>
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          This image will be uploaded after the event is updated
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">
                      Priority
                      {existingImages.length > 0 && (
                        <span className="text-xs text-blue-600 ml-2">(loaded from existing image)</span>
                      )}
                    </Label>
                    <Input
                      id="priority"
                      type="number"
                      min="1"
                      max="10"
                      value={imagePriority}
                      onChange={(e) => setImagePriority(e.target.value)}
                      placeholder="Enter priority (1-10)"
                      className="touch-manipulation"
                    />
                    <div className="text-xs text-gray-500">
                      Priority determines the display order (1 = highest priority)
                    </div>
                  </div>
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
                    <Select
                      value={selectedCity}
                      onValueChange={(value) => {
                        setSelectedCity(value)
                        setSelectedVenue("")
                      }}
                      disabled={cities.length === 0}
                    >
                      <SelectTrigger id="city" className="touch-manipulation">
                        <SelectValue placeholder={cities.length === 0 ? "No cities available" : "Select a city"} />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  {isLoadingVenues ? (
                    <div className="flex h-10 items-center rounded-md border border-input px-3 py-2 text-sm">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground">Loading venues...</span>
                    </div>
                  ) : venueError ? (
                    <div className="flex h-10 items-center rounded-md border border-destructive px-3 py-2 text-sm text-destructive">
                      {venueError}
                    </div>
                  ) : (
                    <Select
                      value={selectedVenue}
                      onValueChange={handleVenueChange}
                      disabled={!selectedCity || filteredVenues.length === 0}
                    >
                      <SelectTrigger id="venue" className="touch-manipulation">
                        <SelectValue
                          placeholder={
                            !selectedCity
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
                          filteredVenues.map((venue) => (
                            <SelectItem key={venue.id} value={venue.id.toString()}>
                              {venue.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Event Date</Label>
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
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate || undefined}
                        onSelect={(date: any) => handleDateChange(date)}
                        initialFocus
                        disabled={(date: Date) => {
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
                  <Label htmlFor="status">Status</Label>
                  <Select value={eventStatus} onValueChange={setEventStatus}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Games</CardTitle>
                <CardDescription>Select games to include in this event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                                {game.slots.length} slot(s) • Custom Price: ₹{game.customPrice || template?.suggestedPrice}
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

            <Card>
              <CardFooter className="flex justify-between pt-6">
                <Button type="button" variant="outline" asChild>
                  <Link href={`/admin/events/${eventId}`}>Cancel</Link>
                </Button>
                {hasBookings ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Changes</AlertDialogTitle>
                        <AlertDialogDescription>
                          This event has existing bookings. Changing the venue or date will affect all bookings.
                          Participants will be notified of these changes. Are you sure you want to proceed?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSubmit}>
                          Confirm Changes
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-6">
            {activeGameIndex !== null && selectedGames[activeGameIndex] && (
              <Card>
                <CardHeader>
                  <CardTitle>Game Configuration</CardTitle>
                  <CardDescription>
                    Customize the selected game for this event
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                            {template.categories && template.categories.length > 0 && (
                              <div>
                                <span className="font-medium">Categories:</span>{" "}
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {template.categories.map((category, idx) => (
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
                            onChange={(e) => {
                              console.log("=== NOTE FIELD UI DEBUG ===");
                              console.log("Current game object:", JSON.stringify(game, null, 2));
                              console.log("Current note value in UI:", game.note);
                              console.log("New note value:", e.target.value);
                              console.log("Active game index:", activeGameIndex);
                              console.log("=== END NOTE FIELD UI DEBUG ===");
                              updateGame(activeGameIndex, "note", e.target.value);
                            }}
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
                              <h4 className="font-medium">Slot {slotIndex + 1}</h4>
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
                                  type="number"
                                  min="1"
                                  value={slot.maxParticipants}
                                  onChange={(e) => updateSlot(activeGameIndex, slot.id, "maxParticipants", parseInt(e.target.value))}
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
          </div>
        </div>
      </form>
    </div>
  )
}
