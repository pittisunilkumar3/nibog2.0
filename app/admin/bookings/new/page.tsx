"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { ArrowLeft, Save, Loader2, CreditCard, CheckCircle, Mail, MessageCircle, ExternalLink, CalendarIcon, Info } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

import { useToast } from "@/hooks/use-toast"
import { BOOKING_API } from "@/config/api"
import { getAllCities, getCitiesWithBookingInfo, BookingCity } from "@/services/cityService"
import { getGamesByAgeAndEvent } from "@/services/eventService"
import { generateManualBookingRef } from "@/utils/bookingReference"
import { differenceInMonths } from "date-fns"
import { formatDateShort } from "@/lib/utils"




// Interface for event from API (matching user panel structure)
interface EventListItem {
  event_id: number;
  event_title: string;
  event_description: string;
  event_date: string;
  event_status: string;
  city_id: number;
  venue_id: number;
  venue_name?: string;
  games_with_slots?: any[]; // Array of game slots with age restrictions
}

// Interface for game from API (matching frontend structure exactly)
interface EligibleGame {
  id: number; // This will be slot_id as number for unique identification (matching frontend)
  game_id: number; // Store game_id separately for API calls
  title: string;
  description: string;
  price: number;
  slot_price?: number; // Prioritized price from slot (matching frontend)
  custom_price?: number; // Fallback price (matching frontend)
  start_time: string;
  end_time: string;
  custom_title: string;
  custom_description: string;
  max_participants: number;
  slot_id: number;
  game_name: string; // Store original game name for reference
}

// Generate unique transaction ID
const generateUniqueTransactionId = (prefix: string = "TXN") => {
  const timestamp = Date.now()
  const randomPart = Math.random().toString(36).substring(2, 11)
  const extraRandom = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${prefix}${timestamp}_${randomPart}_${extraRandom}`
}

export default function NewBookingPage() {
  const router = useRouter()
  const { toast } = useToast()

  // State for cities, events, games, and errors
  const [cities, setCities] = useState<{ id: string | number; name: string }[]>([])
  const [bookingCities, setBookingCities] = useState<BookingCity[]>([])
  const [apiEvents, setApiEvents] = useState<EventListItem[]>([])
  const [eligibleGames, setEligibleGames] = useState<EligibleGame[]>([])
  const [selectedCityId, setSelectedCityId] = useState<string | number>("")
  const [selectedEventType, setSelectedEventType] = useState("")
  const [selectedGames, setSelectedGames] = useState<Array<{gameId: number; slotId: number}>>([])
  const [childAgeMonths, setChildAgeMonths] = useState<number | null>(null)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [isLoadingGames, setIsLoadingGames] = useState(false)
  const [cityError, setCityError] = useState<string | null>(null)
  const [eventError, setEventError] = useState<string | null>(null)
  const [gameError, setGameError] = useState<string | null>(null)

  // Parent Information
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Child Information
  const [childName, setChildName] = useState("");
  const [childDateOfBirth, setChildDateOfBirth] = useState<string>("");
  const [childGender, setChildGender] = useState<string>("");
  const [schoolName, setSchoolName] = useState<string>("");

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<string>("");

  // Booking creation state
  const [isLoading, setIsLoading] = useState(false);
  const [bookingCreated, setBookingCreated] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);
  const [createdBookingRef, setCreatedBookingRef] = useState<string>("");
  const [createdBookingAmount, setCreatedBookingAmount] = useState<number>(0);
  const [createdBookingPhone, setCreatedBookingPhone] = useState<string>("");
  const [createdBookingEmail, setCreatedBookingEmail] = useState<string>("");
  const [createdBookingParentName, setCreatedBookingParentName] = useState<string>("");
  const [createdBookingChildName, setCreatedBookingChildName] = useState<string>("");
  const [createdBookingPaymentMethod, setCreatedBookingPaymentMethod] = useState<string>("");

  // DOB UI state
  const [dob, setDob] = useState<Date | undefined>(undefined);

  // Handler for DOB change (updates both UI and string state)
  const handleDobChange = (date: Date) => {
    setDob(date);
    if (date) {
      setChildDateOfBirth(date.toISOString().split("T")[0]);
    } else {
      setChildDateOfBirth("");
    }
  };

  // Calculate child age in months when DOB or selected event changes
  useEffect(() => {
    console.log('[DEBUG] Age calculation effect triggered', { childDateOfBirth, selectedEventType })
    
    // Reset age if no DOB
    if (!childDateOfBirth) {
      console.log('[DEBUG] No DOB, resetting age to null')
      setChildAgeMonths(null)
      return
    }

    // Find the selected event
    const selectedEvent = apiEvents.find(event => event.event_title === selectedEventType)
    
    if (!selectedEvent || !selectedEvent.event_date) {
      // If no event selected or event has no date, calculate age as of today
      const today = new Date()
      const dob = new Date(childDateOfBirth)
      const ageMonths = differenceInMonths(today, dob)
      console.log('[DEBUG] No event selected, calculating age as of today:', ageMonths, 'months')
      setChildAgeMonths(ageMonths)
      return
    }

    // Calculate age on event date
    const eventDate = new Date(selectedEvent.event_date)
    const dob = new Date(childDateOfBirth)
    const ageMonths = differenceInMonths(eventDate, dob)
    
    console.log('[DEBUG] Age calculated on event date:', {
      dob: childDateOfBirth,
      eventDate: selectedEvent.event_date,
      ageMonths
    })
    
    setChildAgeMonths(ageMonths)

    // If event is already selected and we now have age, fetch games via API (fallback to local filtering)
    if (selectedEventType && ageMonths !== null) {
      console.log('[DEBUG] Event selected and age calculated, attempting to fetch games via API')
      if (selectedEvent && selectedEvent.event_id) {
        fetchGamesByEventAndAge(selectedEvent.event_id, ageMonths)
      } else {
        console.log('[DEBUG] Selected event not found in apiEvents, falling back to local load')
        loadGamesForEvent(selectedEvent, ageMonths)
      }
    }
  }, [childDateOfBirth, selectedEventType, apiEvents])

  // (Removed duplicate/legacy state declarations)
  // ...existing code...
  // Fetch cities from API when component mounts (matching user panel logic)
  useEffect(() => {
    const fetchCities = async () => {
      setIsLoadingCities(true)
      setCityError(null)
      try {
        const bookingData = await getCitiesWithBookingInfo()
        console.log('[DEBUG] /api/city/booking-info/list response:', bookingData)
        setBookingCities(bookingData)
        const formattedCities = bookingData.map(city => ({ id: city.id, name: city.city_name }))
        setCities(formattedCities)
        if (bookingData.length === 0) {
          console.warn('[DEBUG] No cities returned from booking info API')
        }
      } catch (error) {
        console.error('[DEBUG] Failed to load cities:', error)
        setCityError("Failed to load cities. Please try again.")
      } finally {
        setIsLoadingCities(false)
      }
    }
    fetchCities()
  }, [])

  // (Removed legacy add-ons loading effect)

  // Handle city change and fetch events for the selected city (matching user panel logic)
  const handleCityChange = async (cityId: string) => {
    console.log('[DEBUG] City changed to:', cityId)
    setSelectedCityId(cityId)
    setSelectedEventType("") // Reset event type when city changes
    setSelectedGames([]) // Reset selected games
    setEligibleGames([]) // Reset eligible games

    if (!cityId) return

    // Use events from booking cities data (already includes games_with_slots)
    const cityData = bookingCities.find(c => c.id.toString() === cityId.toString())
    if (!cityData) {
      console.error('[DEBUG] City not found in booking cities data', bookingCities)
      setEventError("No events found for this city")
      return
    }
    console.log('[DEBUG] Found city data:', cityData)
    console.log('[DEBUG] City has', cityData.events?.length || 0, 'events')

    if (cityData.events && cityData.events.length > 0) {
      // Convert booking events to EventListItem format
      const convertedEvents: EventListItem[] = cityData.events.map(event => ({
        event_id: event.id,
        event_title: event.title,
        event_description: event.description,
        event_date: event.event_date,
        event_status: event.status,
        event_created_at: event.created_at,
        event_updated_at: event.updated_at,
        city_id: event.city_id,
        city_name: cityData.city_name,
        state: cityData.state,
        city_is_active: cityData.is_active === 1,
        city_created_at: cityData.created_at,
        city_updated_at: cityData.updated_at,
        venue_id: event.venue_id,
        venue_name: event.venue_name,
        venue_address: event.venue_address,
        venue_capacity: event.venue_capacity,
        venue_is_active: true,
        venue_created_at: '',
        venue_updated_at: '',
        games: [],
        games_with_slots: event.games_with_slots // Include games_with_slots!
      }))
      setApiEvents(convertedEvents)
      console.log('[DEBUG] Set events:', convertedEvents)
    } else {
      setApiEvents([])
      setEventError("No events available for this city")
      console.warn('[DEBUG] No events available for this city:', cityData)
    }
  }

  // Load games for event by filtering games_with_slots by age (align with register-event behavior)
  const loadGamesForEvent = (event: EventListItem, childAgeMonths: number) => {
    console.log('[DEBUG] Loading games for event:', event)
    console.log('[DEBUG] Child age (months):', childAgeMonths)
    if (!event.games_with_slots || event.games_with_slots.length === 0) {
      console.log('[DEBUG] No games_with_slots in event data:', event)
      setEligibleGames([])
      setGameError("No games available for this event")
      return
    }
    console.log('[DEBUG] Event has', event.games_with_slots.length, 'game slots:', event.games_with_slots)

    // Filter games based on child's age - handle both months and years units
    const eligibleSlots = event.games_with_slots.filter((slot: any) => {
      const rawMin = Number(slot.min_age || 0)
      const rawMax = Number(slot.max_age || 0)

      // Interpret raw values as months OR years (to months)
      const minMonthsCandidate = rawMin
      const maxMonthsCandidate = rawMax
      const minMonthsFromYears = rawMin * 12
      const maxMonthsFromYears = rawMax * 12

      const isEligibleIfRawMonths = childAgeMonths >= minMonthsCandidate && childAgeMonths <= maxMonthsCandidate
      const isEligibleIfYears = childAgeMonths >= minMonthsFromYears && childAgeMonths <= maxMonthsFromYears

      const isAgeEligible = isEligibleIfRawMonths || isEligibleIfYears

      console.log(`[DEBUG] Slot:`, slot, 'rawMin:', rawMin, 'rawMax:', rawMax, 'eligibleMonths:', isEligibleIfRawMonths, 'eligibleYears:', isEligibleIfYears, '=> final:', isAgeEligible);
      return isAgeEligible;
    });

    console.log('[DEBUG] Found', eligibleSlots.length, 'age-eligible game slots:', eligibleSlots);

    if (eligibleSlots.length === 0) {
      setEligibleGames([]);
      setGameError(`No games available for age ${Math.floor(childAgeMonths / 12)} years ${childAgeMonths % 12} months.`);
      return;
    }

    // Convert to EligibleGame format and include remaining capacity and booked count
    const formattedGames: any[] = eligibleSlots.map((slot: any) => {
      const rawMin = Number(slot.min_age || 0)
      const rawMax = Number(slot.max_age || 0)

      // Normalize to months (prefer interpreting as months if values are >=24, otherwise provide both possibilities)
      const minAgeMonths = rawMin >= 24 ? rawMin : rawMin * 12 > 0 && rawMin <= 20 && rawMax <= 20 && rawMax * 12 < 120 ? rawMin * 12 : rawMin
      const maxAgeMonths = rawMax >= 24 ? rawMax : rawMax * 12 > 0 && rawMax <= 20 && rawMax * 12 < 120 ? rawMax * 12 : rawMax

      return ({
        id: slot.slot_id,
        game_id: slot.game_id,
        title: slot.custom_title || slot.game_name,
        description: slot.custom_description || slot.game_description,
        price: parseFloat(slot.price),
        slot_price: parseFloat(slot.price),
        custom_price: parseFloat(slot.price),
        start_time: slot.start_time,
        end_time: slot.end_time,
        custom_title: slot.custom_title || slot.game_name,
        custom_description: slot.custom_description || slot.game_description,
        max_participants: slot.max_participants, // total capacity
        remaining_capacity: (slot.max_participants || 0) - (slot.booked_count || 0), // remaining
        booked_count: slot.booked_count || 0,
        slot_id: slot.slot_id,
        game_name: slot.game_name,
        min_age_months: minAgeMonths,
        max_age_months: maxAgeMonths,
        raw_min_age: rawMin,
        raw_max_age: rawMax,
        is_active: slot.is_active
      })
    });

    setEligibleGames(formattedGames as any);
    setGameError(null);
    console.log('[DEBUG] Set eligible games (age-filtered):', formattedGames);
  }

  // Handle event type selection (matching user panel logic)
  const handleEventTypeChange = (eventType: string) => {
    console.log('🎪 Event type changed to:', eventType)
    setSelectedEventType(eventType)
    setSelectedGames([]) // Reset selected games
    setEligibleGames([]) // Reset eligible games

    // Find the selected event from API events
    const selectedApiEvent = apiEvents.find(event => event.event_title === eventType);

    if (selectedApiEvent) {
      console.log('✅ Event found:', selectedApiEvent)

      // If DOB is set, immediately load local age-filtered games for fast UX
      if (childDateOfBirth && childAgeMonths !== null) {
        // Load local age-filtered slots first
        loadGamesForEvent(selectedApiEvent, childAgeMonths);

        // Then attempt to fetch improved data from API; do not clear local results if API fails or returns empty
        fetchGamesByEventAndAge(selectedApiEvent.event_id, childAgeMonths);
      } else {
        console.log('⚠️ Child DOB not set yet - cannot load games')
      }
    } else {
      // If no matching event found, clear eligible games
      console.error(`❌ Selected event "${eventType}" not found in API events:`, apiEvents);
      setEligibleGames([]);
    }
  }

  // Fetch games based on event ID and child age (matching user panel logic)
  const fetchGamesByEventAndAge = async (eventId: number, childAge: number) => {
    console.log('🎮 fetchGamesByEventAndAge called with:', { eventId, childAge })
    
    if (!eventId || childAge === null || childAge === undefined) {
      console.log('⚠️ Skipping games fetch - missing data:', { eventId, childAge })
      return;
    }

    if (childAge < 0 || childAge > 120) {
      console.error(`❌ Invalid child age: ${childAge} months`);
      setGameError(`Invalid child age: ${childAge} months. Please check the date of birth.`);
      return;
    }

    setIsLoadingGames(true);
    setGameError("");

    try {
      const gamesData = await getGamesByAgeAndEvent(eventId, childAge);

      if (gamesData && gamesData.length > 0) {
        // Use the first game's event_date if provided to correct event info
        const firstGame = gamesData[0];
        if (firstGame && firstGame.event_date) {
          const firstGameAny = firstGame as any;
          const gameVenueValue = firstGameAny.venue_name || firstGameAny.venue || firstGameAny.location || firstGameAny.address || "Venue TBD";

          // Update the selected event details if we have a matching apiEvent
          const currentSelectedApiEvent = apiEvents.find(event => event.event_title === selectedEventType || event.event_id === eventId) as any;

          if (currentSelectedApiEvent) {
            // Build a simplified event object for UI
            const correctDate = firstGame.event_date.split('T')[0];
            const [year, month, day] = correctDate.split('-').map(Number);
            const updatedEvent = {
              id: (currentSelectedApiEvent.event_id || currentSelectedApiEvent.id || eventId).toString(),
              title: currentSelectedApiEvent.event_title || currentSelectedApiEvent.title || selectedEventType,
              description: currentSelectedApiEvent.event_description || currentSelectedApiEvent.description || '',
              minAgeMonths: 0,
              maxAgeMonths: 84,
              date: correctDate,
              time: "9:00 AM - 8:00 PM",
              venue: gameVenueValue,
              city: currentSelectedApiEvent.city_name || currentSelectedApiEvent.city || '',
              price: 1800,
              image: "/images/baby-crawling.jpg",
            };

            setApiEvents(prev => prev.map(ev => {
              if (ev.event_id === eventId || ev.event_title === selectedEventType) return { ...ev, event_date: firstGame.event_date } as any;
              return ev;
            }));

            setEligibleGames([]) // we'll set once formatted below
            setGameError(null);

            // Format the API games response into eligibleGames (slot per entry)
            const formattedGames: any[] = [];
            gamesData.forEach((game: any) => {
              if (game.slots && Array.isArray(game.slots)) {
                game.slots.forEach((slot: any) => {
                  formattedGames.push({
                    id: Number(slot.slot_id || 0),
                    game_id: Number(game.game_id || 0),
                    title: game.title || game.game_name || '',
                    description: game.description || game.game_description || '',
                    price: Number(game.listed_price || slot.slot_price || 0),
                    slot_price: Number(slot.slot_price || game.listed_price || 0),
                    custom_price: Number(game.listed_price || slot.slot_price || 0),
                    start_time: slot.start_time || '',
                    end_time: slot.end_time || '',
                    custom_title: game.title || slot.custom_title || '',
                    custom_description: game.description || slot.custom_description || '',
                    max_participants: slot.max_participants || 0,
                    remaining_capacity: (slot.max_participants || 0) - (slot.booked_count || 0),
                    booked_count: slot.booked_count || 0,
                    slot_id: Number(slot.slot_id || 0),
                    game_name: game.title || '',
                    min_age: game.min_age || 0,
                    max_age: game.max_age || 0,
                    note: slot.note || null
                  });
                });
              }
            });

            if (formattedGames.length > 0) {
              setEligibleGames(formattedGames as any);
              setGameError(null);
            } else {
              // Fallback to local filtering if API returned empty
              console.log('[DEBUG] games API returned no formatted slots, falling back to local filtering');
              const selectedApiEvent = apiEvents.find(ev => ev.event_id === eventId || ev.event_title === selectedEventType);
              if (selectedApiEvent) loadGamesForEvent(selectedApiEvent, childAge);
              // Do not clear the existing eligibleGames here; keep UX stable
            }
          }
        } else {
          // If API returned games but no event date, still format slots
          const formattedGames: any[] = [];
          gamesData.forEach((game: any) => {
            if (game.slots && Array.isArray(game.slots)) {
              game.slots.forEach((slot: any) => {
                formattedGames.push({
                  id: Number(slot.slot_id || 0),
                  game_id: Number(game.game_id || 0),
                  title: game.title || game.game_name || '',
                  description: game.description || game.game_description || '',
                  price: Number(game.listed_price || slot.slot_price || 0),
                  slot_price: Number(slot.slot_price || game.listed_price || 0),
                  custom_price: Number(game.listed_price || slot.slot_price || 0),
                  start_time: slot.start_time || '',
                  end_time: slot.end_time || '',
                  custom_title: game.title || slot.custom_title || '',
                  custom_description: game.description || slot.custom_description || '',
                  max_participants: slot.max_participants || 0,
                  remaining_capacity: (slot.max_participants || 0) - (slot.booked_count || 0),
                  booked_count: slot.booked_count || 0,
                  slot_id: Number(slot.slot_id || 0),
                  game_name: game.title || '',
                  min_age: game.min_age || 0,
                  max_age: game.max_age || 0,
                  note: slot.note || null
                });
              });
            }
          });

          if (formattedGames.length > 0) {
            setEligibleGames(formattedGames as any);
            setGameError(null);
          } else {
            // No formatted games from API - fallback to local load
            const selectedApiEvent = apiEvents.find(ev => ev.event_id === eventId);
            if (selectedApiEvent) loadGamesForEvent(selectedApiEvent, childAge);
          }
        }
      } else {
        // No games returned by API - fallback to local filtering
        console.log('[DEBUG] getGamesByAgeAndEvent returned empty; falling back to local filtering');
        const selectedApiEvent = apiEvents.find(ev => ev.event_id === eventId);
        if (selectedApiEvent) loadGamesForEvent(selectedApiEvent, childAge);
      }
    } catch (error) {
      console.error('Error fetching games by event and age:', error);
      // On error, fallback to local filtering
      const selectedApiEvent = apiEvents.find(ev => ev.event_id === eventId);
      if (selectedApiEvent) loadGamesForEvent(selectedApiEvent, childAge);
    } finally {
      setIsLoadingGames(false);
    }
  }

  // Handle game selection with slot selection - MULTIPLE SELECTION for admin panel
  const handleGameSelection = (slotId: number) => {
    // Find the game associated with this slot
    const selectedSlot = eligibleGames.find((g) => g.id === slotId);
    if (!selectedSlot) {
      console.error(`❌ Slot with ID ${slotId} not found in eligible games`);
      return;
    }

    const gameId = selectedSlot.game_id;

    // MULTIPLE SELECTION LOGIC: Allow selecting multiple games/slots
    setSelectedGames((prev) => {
      // Check if this exact slot is already selected
      const existingIndex = prev.findIndex(item => item.slotId === slotId);

      let newSelectedGames: Array<{ gameId: number; slotId: number }>;

      if (existingIndex !== -1) {
        // If slot is already selected, deselect it (remove from array)
        newSelectedGames = prev.filter((_, index) => index !== existingIndex);
      } else {
        // Add this new selection to existing selections
        newSelectedGames = [...prev, { gameId, slotId }];
      }

      // Clear promo code when games selection changes
      // Removed promo code reset

      // Selection details updated (debug logs removed)

      return newSelectedGames;
    });
  }

  // Handle promo code input change (matching user panel logic)
  const handlePromoCodeInputChange = (value: string) => {
    // (Removed legacy promo code input change)
  }

  // Handle promo code validation (simplified for admin panel)
  const handlePromoCodeValidation = async () => {
    // (Removed legacy promo code validation logic)
  }

  // Handle add-on selection (matching user panel logic)
  // Removed add-on change handler





  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      if (!parentName || !email || !phone || !childName || !childDateOfBirth || !childGender) {
        throw new Error("Please fill in all required fields")
      }

      if (!selectedEventType || selectedGames.length === 0) {
        throw new Error("Please complete the event and game selection")
      }

      // SINGLE GAME VALIDATION: Ensure exactly one game is selected (matching frontend)
      if (selectedGames.length !== 1) {
        throw new Error(`Invalid game selection. Expected exactly 1 game, but found ${selectedGames.length}. Please select exactly one game.`)
      }

      if (!childAgeMonths) {
        throw new Error("Please enter child's date of birth")
      }

      if (!paymentMethod) {
        throw new Error("Please select a payment method")
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address")
      }

      // Validate phone number format (must be exactly 10 digits)
      const phoneDigits = phone.replace(/\D/g, '')
      if (phoneDigits.length !== 10) {
        throw new Error("Please enter a valid 10-digit mobile number")
      }

      // Validate date of birth
      const birthDate = new Date(childDateOfBirth)
      const today = new Date()
      if (birthDate >= today) {
        throw new Error("Date of birth must be in the past")
      }

      // Find the selected event from API events
      const selectedApiEvent = apiEvents.find(event => event.event_title === selectedEventType)
      if (!selectedApiEvent) {
        throw new Error("Selected event not found")
      }

      // SINGLE GAME VALIDATION: Ensure exactly one game is selected (matching frontend)
      if (selectedGames.length !== 1) {
        throw new Error(`Invalid game selection. Expected exactly 1 game, but found ${selectedGames.length}. Please select exactly one game.`)
      }

      // Get selected games objects (using slot_id for selection, matching frontend)
      const selectedGamesObj = selectedGames
        .map(selection => {
          const game = eligibleGames.find(game => game.id === selection.slotId)
          if (!game) {
            console.error(`❌ Game slot with ID ${selection.slotId} not found in eligible games!`)
          } else {
            // Found game slot (debug log removed)
          }
          return game
        })
        .filter(game => game !== undefined);

      if (selectedGamesObj.length === 0) {
        throw new Error("No valid games selected. Please select exactly one game.")
      }

      if (selectedGamesObj.length !== selectedGames.length) {
        console.warn(`⚠️ Warning: ${selectedGames.length} games selected but only ${selectedGamesObj.length} found in eligible games`)
      }

      // Calculate total amount using frontend logic
      // Calculate total amount directly from selected games
      const totalAmount = selectedGamesObj.reduce((sum, game) => sum + (game?.slot_price || game?.price || 0), 0);

      // Generate unique manual booking reference using MAN format
      const generateBookingRef = () => {
        const timestamp = Date.now().toString()
        return generateManualBookingRef(timestamp)
      }

      // Process booking_addons according to API structure
      const processedAddons: any[] = []
      // Removed add-ons from booking payload

      // Create booking data matching the expected API structure
      // Build children array for payload
      const children = [
        {
          full_name: childName,
          date_of_birth: childDateOfBirth,
          gender: childGender,
          school_name: schoolName || "Not Specified",
          booking_games: selectedGamesObj.map(game => ({
            game_id: game.game_id,
            slot_id: game.slot_id,
            game_price: game.slot_price || game.price
          }))
        }
      ];

      // Build payment object
      const payment = {
        transaction_id: generateUniqueTransactionId("MAN_TXN"),
        amount: totalAmount,
        payment_method: paymentMethod,
        payment_status: paymentMethod === "Cash payment" ? "Paid" : "Pending"
      };

      // Final bookingData payload matching documentation
      const bookingData = {
        parent_name: parentName,
        email: email,
        phone: phoneDigits,
        event_id: selectedApiEvent.event_id,
        booking_ref: generateBookingRef(),
        status: "Pending",
        total_amount: totalAmount,
        children,
        payment
      };

      // Creating booking with data (debug log removed)

      // Call the booking creation API using the backend base URL from .env
      const response = await fetch(BOOKING_API.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Booking creation failed:", errorText)
        throw new Error(`Failed to create booking: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      // Booking created successfully (debug log removed)

      // Extract booking ID from the response (webhook returns an array)
      const bookingId = Array.isArray(result) ? result[0]?.booking_id : result.booking_id
      if (!bookingId) {
        throw new Error("Booking created but no booking ID returned")
      }

      // Store booking details for confirmation
      setCreatedBookingId(bookingId)
      setCreatedBookingRef(bookingData.booking_ref)
      setCreatedBookingAmount(totalAmount)
      setCreatedBookingPhone(`+91${phoneDigits}`)
      setCreatedBookingEmail(email)
      setCreatedBookingParentName(parentName)
      setCreatedBookingChildName(childName)
      setBookingCreated(true)

      toast({
        title: "Success",
        description: paymentMethod === "Cash payment"
          ? "Manual booking created successfully! Cash payment has been recorded."
          : "Manual booking created successfully!",
      })

    } catch (error: any) {
      console.error("Error creating booking:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Show payment management UI after booking creation
  if (bookingCreated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin/bookings">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Bookings</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Booking Created Successfully</h1>
              <p className="text-muted-foreground">Booking Reference: {createdBookingRef}</p>
            </div>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Booking ID</label>
                <p className="text-lg font-mono">{createdBookingId}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Booking Reference</label>
                <p className="text-lg font-mono">{createdBookingRef}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Amount</label>
                <p className="text-lg font-semibold">₹{createdBookingAmount.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Customer Phone</label>
                <p className="text-lg">{createdBookingPhone}</p>
              </div>
            </div>
            <Separator />
            <div className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href="/admin/bookings">
                  View All Bookings
                </Link>
              </Button>
              <Button asChild>
                <Link href="/admin/bookings/new">
                  Create Another Booking
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">


      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/bookings">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Booking</h1>
            <p className="text-muted-foreground">Add a new booking for a NIBOG event</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Parent Information</CardTitle>
              <CardDescription>Enter the parent details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="parentName" className="flex items-center gap-2 text-sm font-bold">
                  <span>Parent's Full Name</span>
                  <span className="text-xs text-skyblue-700 bg-skyblue-100 px-2 py-0.5 rounded-full border border-skyblue-300">Required</span>
                </Label>
                <Input
                  id="parentName"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Enter parent's full name"
                  required
                  className="border-2 border-skyblue-200 focus:border-skyblue-400 focus:ring-2 focus:ring-skyblue-200 bg-white hover:bg-skyblue-50 h-12 text-base rounded-xl transition-all duration-200"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-bold">
                  <span>Email Address</span>
                  <span className="text-xs text-coral-700 bg-coral-100 px-2 py-0.5 rounded-full border border-coral-300">Required</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="border-2 border-coral-200 focus:border-coral-400 focus:ring-2 focus:ring-coral-200 bg-white hover:bg-coral-50 h-12 text-base rounded-xl transition-all duration-200"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-bold">
                  <span>Mobile Number</span>
                  <span className="text-xs text-mint-700 bg-mint-100 px-2 py-0.5 rounded-full border border-mint-300">Required</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    // Remove all non-digits
                    let value = e.target.value.replace(/\D/g, '')

                    // If it starts with 91 and is longer than 10 digits, remove the 91 prefix
                    if (value.startsWith('91') && value.length > 10) {
                      value = value.substring(2)
                    }

                    // Limit to 10 digits
                    value = value.slice(0, 10)
                    setPhone(value)
                  }}
                  placeholder="Enter your 10-digit mobile number"
                  required
                  maxLength={13}
                  pattern="[0-9]{10}"
                  className="border-2 border-mint-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-200 bg-white hover:bg-mint-50 h-12 text-base rounded-xl transition-all duration-200 font-mono"
                />
                {phone && phone.length !== 10 && (
                  <p className="text-sm text-red-600">
                    Mobile number must be exactly 10 digits
                  </p>
                )}
                {phone && phone.length === 10 && (
                  <p className="text-sm text-green-600">
                    ✓ Valid mobile number
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Child Information</CardTitle>
              <CardDescription>Enter the child details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="childName" className="flex items-center gap-2 text-sm font-bold">
                  <span>Child's Full Name</span>
                  <span className="text-xs text-skyblue-700 bg-skyblue-100 px-2 py-0.5 rounded-full border border-skyblue-300">Required</span>
                </Label>
                <Input
                  id="childName"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Enter your child's full name"
                  required
                  className="border-2 border-skyblue-200 focus:border-skyblue-400 focus:ring-2 focus:ring-skyblue-200 bg-white hover:bg-skyblue-50 h-12 text-base rounded-xl transition-all duration-200"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-bold">
                    <span>Child's Date of Birth</span>
                    <span className="text-xs text-coral-700 bg-coral-100 px-2 py-0.5 rounded-full border border-coral-300">Required</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal transition-all duration-200 h-12 text-base rounded-xl border-2",
                          !dob
                            ? "border-coral-200 hover:border-coral-300 hover:bg-coral-50"
                            : "border-coral-400 bg-coral-50 hover:bg-coral-100"
                        )}
                      >
                        <CalendarIcon className={cn("mr-2 h-4 w-4", dob ? "text-primary" : "text-muted-foreground")} />
                        <span className="truncate">{dob ? format(dob, "PPP") : "Select date of birth"}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dob}
                        onSelect={(date) => date && handleDobChange(date)}
                        disabled={(date) => {
                          const minDate = new Date(2000, 0, 1);
                          const maxDate = new Date(new Date().getFullYear() + 10, 11, 31);
                          return date < minDate || date > maxDate;
                        }}
                        initialFocus
                        fromYear={2000}
                        toYear={new Date().getFullYear() + 10}
                        captionLayout="dropdown"
                        defaultMonth={dob || new Date()}
                        className="p-3"
                      />
                    </PopoverContent>
                  </Popover>
                  {childAgeMonths !== null && (
                    <p className="text-sm text-muted-foreground">
                      Child's age: {childAgeMonths} months
                      {selectedEventType && apiEvents.find(event => event.event_title === selectedEventType)?.event_date && (
                        <span className="text-xs block mt-1">
                          (calculated on event date: {new Date(apiEvents.find(event => event.event_title === selectedEventType)!.event_date).toLocaleDateString()})
                        </span>
                      )}
                      {!selectedEventType && (
                        <span className="text-xs block mt-1 text-orange-600">
                          (Select an event to calculate age on event date)
                        </span>
                      )}
                      {selectedEventType && apiEvents.find(event => event.event_title === selectedEventType)?.event_date && (
                        <span className="text-xs block mt-1">
                          Event Date: {formatDateShort(apiEvents.find(event => event.event_title === selectedEventType)!.event_date)}
                        </span>
                      )}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-bold">
                    <span>Gender</span>
                    <span className="text-xs text-primary/70">Required</span>
                  </Label>
                  <RadioGroup
                    value={childGender}
                    onValueChange={setChildGender}
                    className="flex gap-4 p-2 border border-dashed rounded-md border-primary/20 bg-white/80"
                  >
                    <div className="flex items-center space-x-2 flex-1 p-2 rounded-md hover:bg-primary/5 transition-colors duration-200">
                      <RadioGroupItem value="male" id="male" className="text-blue-500" />
                      <Label htmlFor="male" className="cursor-pointer">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2 flex-1 p-2 rounded-md hover:bg-primary/5 transition-colors duration-200">
                      <RadioGroupItem value="female" id="female" className="text-pink-500" />
                      <Label htmlFor="female" className="cursor-pointer">Female</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Display child's age in months when DOB is selected */}
              {dob && childAgeMonths !== null && (
                <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-full p-1 mr-2">
                      <Info className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-blue-800">Child's Age: </span>
                      <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{childAgeMonths} months</span>
                      <span className="text-xs text-blue-600 ml-2">({Math.floor(childAgeMonths / 12)} years, {childAgeMonths % 12} months)</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Label htmlFor="schoolName" className="flex items-center gap-2 text-sm font-bold">
                  <span>School Name</span>
                  <span className="text-xs text-mint-700 bg-mint-100 px-2 py-0.5 rounded-full border border-mint-300">Optional</span>
                </Label>
                <Input
                  id="schoolName"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder={childAgeMonths && childAgeMonths < 36 ? "Home, Daycare, or Playschool" : "Enter school name"}
                  className="border-2 border-mint-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-200 bg-white hover:bg-mint-50 h-12 text-base rounded-xl transition-all duration-200"
                />
                {childAgeMonths && childAgeMonths < 36 && (
                  <p className="text-xs mt-2 p-3 bg-gradient-to-r from-skyblue-50 to-coral-50 rounded-xl border-2 border-skyblue-200">
                    💡 For children under 3 years, you can enter "Home", "Daycare", or the name of their playschool
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Select how the payment will be processed for this booking. Manual bookings use MAN prefix (e.g., MAN250806123).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash payment">Cash Payment</SelectItem>
                    <SelectItem value="Online payment">Online Payment</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-muted-foreground">
                  {paymentMethod === "Cash payment" && (
                    <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-800">Cash Payment Selected</p>
                        <p className="text-green-700">
                          The booking will be marked as paid immediately. Use this when cash has been received.
                        </p>
                      </div>
                    </div>
                  )}
                  {paymentMethod === "Online payment" && (
                    <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <CreditCard className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800">Online Payment Selected</p>
                        <p className="text-blue-700">
                          A payment link will be generated after booking creation for the customer to pay online.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
              <CardDescription>Select city, event, game, date and time slot in order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select value={selectedCityId.toString()} onValueChange={handleCityChange} required>
                  <SelectTrigger id="city">
                    <SelectValue placeholder={
                      isLoadingCities
                        ? "Loading cities..."
                        : cityError
                          ? "Error loading cities"
                          : "Select city"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingCities ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading cities...
                      </div>
                    ) : cityError ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        {cityError}
                      </div>
                    ) : cities.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No cities available
                      </div>
                    ) : (
                      cities.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event">Event</Label>
                <Select
                  value={selectedEventType}
                  onValueChange={handleEventTypeChange}
                  required
                  disabled={!selectedCityId || isLoadingEvents}
                >
                  <SelectTrigger id="event">
                    <SelectValue placeholder={
                      !selectedCityId
                        ? "Select city first"
                        : isLoadingEvents
                          ? "Loading events..."
                          : eventError
                            ? "Error loading events"
                            : apiEvents.length === 0
                              ? "No events available"
                              : "Select event"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingEvents ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading events...
                      </div>
                    ) : eventError ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        {eventError}
                      </div>
                    ) : apiEvents.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No events available for this city
                      </div>
                    ) : (
                      apiEvents.map((event) => (
                        <SelectItem key={event.event_id} value={event.event_title}>
                          {event.event_title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Games (Select multiple based on child's age)</Label>
                {!selectedEventType ? (
                  <p className="text-sm text-muted-foreground">Select event first</p>
                ) : !childDateOfBirth ? (
                  <p className="text-sm text-muted-foreground">Enter child's date of birth first</p>
                ) : isLoadingGames ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading games...</span>
                  </div>
                ) : gameError ? (
                  <p className="text-sm text-muted-foreground text-red-600">{gameError}</p>
                ) : eligibleGames.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium">No games/time slots available</p>
                    <p className="text-xs text-yellow-600 mt-1">
                      No games found for this event and child's age ({childAgeMonths} months).
                      Please try selecting a different event or check the child's date of birth.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Selection Status Indicator - Updated for multiple selection */}
                    <div className={`mb-4 p-3 rounded-lg border text-sm ${
                      selectedGames.length === 0
                        ? "bg-gray-50 border-gray-200 text-gray-600"
                        : "bg-green-50 border-green-200 text-green-700"
                    }`}>
                      <div className="flex items-center gap-2">
                        {selectedGames.length === 0 && (
                          <>
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            <span>No game selected - Please select at least one game and time slot</span>
                          </>
                        )}
                        {selectedGames.length > 0 && (
                          <>
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span>✓ {selectedGames.length} game slot{selectedGames.length > 1 ? 's' : ''} selected - Ready to continue</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-1">
                      {(() => {
                        // Group games by game_id to show slots for each game (matching frontend exactly)
                        const groupedGames = eligibleGames.reduce((acc, game) => {
                          const gameId = game.game_id;
                          if (!acc[gameId]) {
                            acc[gameId] = {
                              gameInfo: {
                                game_id: game.game_id,
                                custom_title: game.custom_title || game.title,
                                game_title: game.title,
                                custom_description: game.custom_description || game.description,
                                game_description: game.description,
                                min_age: 0, // Will be set from first slot
                                max_age: 0, // Will be set from first slot
                                game_duration_minutes: 0 // Will be set from first slot
                              },
                              slots: []
                            };
                          }

                          // Add this slot to the game group
                          acc[gameId].slots.push({
                            id: game.id, // This is the slot_id
                            slot_id: game.slot_id,
                            slot_price: game.price,
                            start_time: game.start_time,
                            end_time: game.end_time,
                            max_participants: game.max_participants || 0
                          });

                          return acc;
                        }, {} as Record<number, { gameInfo: any; slots: any[] }>);

                        return Object.values(groupedGames).map((gameGroup) => {
                          const { gameInfo, slots } = gameGroup;
                          const selectedSlotForGame = selectedGames.find(selection => selection.gameId === gameInfo.game_id);

                          return (
                            <div
                              key={gameInfo.game_id}
                              className="rounded-lg border-2 border-muted p-4 space-y-3"
                            >
                              {/* Game Header */}
                              <div className="space-y-2">
                                <h4 className="font-medium text-lg">
                                  {gameInfo.custom_title || gameInfo.game_title}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {gameInfo.custom_description || gameInfo.game_description}
                                </p>
                              </div>

                              {/* Slot Selection */}
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  Select Time Slot(s) {slots.length > 1 ? '(You can select multiple)' : ''}:
                                </Label>
                                <div className="grid gap-2">
                                  {slots.map((slot) => {
                                    const isSelected = selectedGames.some(selection => selection.slotId === slot.id);
                                    // Use remaining_capacity to determine availability (we included it in formattedGames)
                                    const remaining = (slot as any).remaining_capacity ?? (slot.max_participants || 0);
                                    const isDisabled = remaining <= 0;

                                    return (
                                      <div
                                        key={slot.id}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                                          isSelected
                                            ? "border-primary bg-primary/10 shadow-md"
                                            : isDisabled
                                              ? "border-muted bg-gray-100 opacity-70"
                                              : "border-muted hover:border-primary/30 hover:bg-primary/5 cursor-pointer"
                                        }`}
                                        onClick={() => !isDisabled && handleGameSelection(slot.id)}
                                      >
                                        <div className="flex items-center space-x-3">
                                          <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => !isDisabled && handleGameSelection(slot.id)}
                                            disabled={isDisabled}
                                            className={`${isDisabled ? 'opacity-50 cursor-not-allowed' : 'text-primary focus:ring-primary'}`}
                                          />
                                          <div>
                                            <div className="font-medium text-sm">
                                              {slot.start_time} - {slot.end_time}
                                            </div>
                                            <div className={`text-xs ${isDisabled ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                                              {isDisabled
                                                ? 'Max participants reached'
                                                : `Max ${slot.max_participants} participants (${remaining} available)`
                                              }
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-bold text-lg text-primary">
                                            ₹{(slot.slot_price ?? slot.price ?? 0).toLocaleString()}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            per child
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </>
                )}
              </div>


            </CardContent>
          </Card>




          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" asChild>
              <Link href="/admin/bookings">
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Booking
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

    </div>
  )
}
