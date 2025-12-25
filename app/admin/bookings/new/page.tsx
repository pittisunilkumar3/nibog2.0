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
import { BOOKING_API, PAYMENT_API } from "@/config/api"
import { getAllCities, City, getCitiesWithBookingInfo, BookingCity } from "@/services/cityService"
import { getAllAddOns, AddOn, AddOnVariant } from "@/services/addOnService"
import { generateConsistentBookingRef, generateManualBookingRef } from "@/utils/bookingReference"
import { sendBookingConfirmationFromServer, BookingConfirmationData } from "@/services/emailNotificationService"
import { sendTicketEmail, TicketEmailData } from "@/services/ticketEmailService"
// Removed direct import of WhatsApp service to avoid browser environment issues - using API endpoint instead
// Promo code functionality simplified for admin panel
import { getEventsByCityId, getGamesByAgeAndEvent } from "@/services/eventService"
import { differenceInMonths } from "date-fns"
import { formatDateShort } from "@/lib/utils"
import { initiatePhonePePayment, createManualPayment, ManualPaymentData } from "@/services/paymentService"
import { sendPaymentLinkEmail, generateWhatsAppMessage, PaymentLinkEmailData } from "@/services/paymentLinkEmailService"



// Interface for selected addon
interface SelectedAddon {
  addon: AddOn;
  variant?: AddOnVariant;
  quantity: number;
}

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

  // Generate PhonePe payment link for the created booking
  const handleGeneratePaymentLink = async () => {
    if (!createdBookingId || !createdBookingAmount || !createdBookingPhone) {
      toast({
        title: "Error",
        description: "Missing booking information for payment link generation",
        variant: "destructive"
      })
      return
    }

    setIsGeneratingPaymentLink(true)

    try {
      // Generating payment link for booking (debug logs removed)

      // Use admin user ID (4) for payment link generation
      const paymentUrl = await initiatePhonePePayment(
        createdBookingId,
        4, // Admin user ID
        createdBookingAmount,
        createdBookingPhone
      )

      setPaymentLinkGenerated(paymentUrl)

      toast({
        title: "Success",
        description: "Payment link generated successfully! You can now share it with the customer.",
      })

    } catch (error) {
      console.error("Error generating payment link:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate payment link",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingPaymentLink(false)
    }
  }

  // Send payment link via email
  const handleSendPaymentEmail = async () => {
    if (!paymentLinkGenerated || !createdBookingEmail || !createdBookingParentName) {
      toast({
        title: "Error",
        description: "Payment link not generated or missing customer information",
        variant: "destructive"
      })
      return
    }

    setIsSendingEmail(true)

    try {
      const emailData: PaymentLinkEmailData = {
        parentName: createdBookingParentName,
        parentEmail: createdBookingEmail,
        childName: createdBookingChildName,
        bookingId: createdBookingId!,
        bookingRef: createdBookingRef,
        totalAmount: createdBookingAmount,
        paymentLink: paymentLinkGenerated,
        expiryHours: 24 // Payment link expires in 24 hours
      }

      const result = await sendPaymentLinkEmail(emailData)

      if (result.success) {
        setEmailSent(true)
        toast({
          title: "Success",
          description: `Payment link sent successfully to ${createdBookingEmail}`,
        })
      } else {
        throw new Error(result.error || "Failed to send email")
      }

    } catch (error) {
      console.error("Error sending payment link email:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send payment link email",
        variant: "destructive"
      })
    } finally {
      setIsSendingEmail(false)
    }
  }





  // Parent Information
  const [parentName, setParentName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  // Child Information
  const [childName, setChildName] = useState("")
  const [childDateOfBirth, setChildDateOfBirth] = useState("")
  const [dob, setDob] = useState<Date>()  // For Calendar Popover
  const [childGender, setChildGender] = useState("female")  // Default to female
  const [schoolName, setSchoolName] = useState("")

  // Payment Method Selection
  const [paymentMethod, setPaymentMethod] = useState("")

  // Selection State (matching frontend structure exactly)
  const [selectedCityId, setSelectedCityId] = useState<string | number>("")
  const [selectedEventType, setSelectedEventType] = useState("")
  const [selectedGames, setSelectedGames] = useState<Array<{gameId: number; slotId: number}>>([])
  const [childAgeMonths, setChildAgeMonths] = useState<number | null>(null)

  // Data state (matching user panel structure)
  const [cities, setCities] = useState<{ id: string | number; name: string }[]>([])
  const [bookingCities, setBookingCities] = useState<BookingCity[]>([])
  const [apiEvents, setApiEvents] = useState<EventListItem[]>([])
  const [eligibleGames, setEligibleGames] = useState<EligibleGame[]>([])
  const [addOns, setAddOns] = useState<AddOn[]>([])
  const [selectedAddOns, setSelectedAddOns] = useState<{ addOn: AddOn; quantity: number; variantId?: string }[]>([])

  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [isLoadingGames, setIsLoadingGames] = useState(false)
  const [cityError, setCityError] = useState<string | null>(null)
  const [eventError, setEventError] = useState<string | null>(null)
  const [gameError, setGameError] = useState<string | null>(null)

  // Phase 2: Payment Management States
  const [bookingCreated, setBookingCreated] = useState(false)
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null)
  const [createdBookingRef, setCreatedBookingRef] = useState<string>("")
  const [createdBookingAmount, setCreatedBookingAmount] = useState<number>(0)
  const [createdBookingPhone, setCreatedBookingPhone] = useState<string>("")
  const [createdBookingEmail, setCreatedBookingEmail] = useState<string>("")
  const [createdBookingParentName, setCreatedBookingParentName] = useState<string>("")
  const [createdBookingChildName, setCreatedBookingChildName] = useState<string>("")
  const [createdBookingPaymentMethod, setCreatedBookingPaymentMethod] = useState<string>("")
  const [isGeneratingPaymentLink, setIsGeneratingPaymentLink] = useState(false)
  const [paymentLinkGenerated, setPaymentLinkGenerated] = useState<string>("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)



  // Promo code state (matching user panel structure)
  const [appliedPromoCode, setAppliedPromoCode] = useState<string>("")
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [promoCodeInput, setPromoCodeInput] = useState("")
  const [isValidatingPromoCode, setIsValidatingPromoCode] = useState(false)

  // Calculate child's age based on event date (if available) or current date
  const calculateAge = (birthDate: Date, eventDate?: Date) => {
    const referenceDate = eventDate || new Date()
    const ageInMonths = differenceInMonths(referenceDate, birthDate)
    return ageInMonths
  }

  // Handle DOB change (matching user panel logic)
  const handleDobChange = (dateString: string | Date) => {
    console.log('🎂 DOB Change triggered:', dateString)
    // Handle both string and Date inputs
    let dateStr: string
    let dateObj: Date
    
    if (typeof dateString === 'string') {
      dateStr = dateString
      dateObj = new Date(dateString)
    } else {
      dateObj = dateString
      dateStr = format(dateObj, 'yyyy-MM-dd')
    }
    
    setChildDateOfBirth(dateStr)
    setDob(dateObj)

    if (dateStr) {
      const date = dateObj
      
      // Find the selected event to get the event date
      const selectedApiEvent = apiEvents.find(event => event.event_title === selectedEventType);
      const eventDate = selectedApiEvent?.event_date ? new Date(selectedApiEvent.event_date) : undefined;
      
      // Calculate child's age in months based on the event date (if available) or current date
      const ageInMonths = calculateAge(date, eventDate)
      setChildAgeMonths(ageInMonths)

      console.log('📊 Age calculated:', ageInMonths, 'months')
      console.log('🎪 Selected event type:', selectedEventType)
      console.log('📋 Available API events:', apiEvents.length)

      // If an event is already selected, load games filtered by age
      if (selectedEventType) {
        if (selectedApiEvent) {
          console.log('✅ Loading games for event:', selectedApiEvent.event_id, 'age:', ageInMonths)
          loadGamesForEvent(selectedApiEvent, ageInMonths);
        } else {
          console.warn(`⚠️ Selected event type "${selectedEventType}" not found in API events`);
        }
      } else {
        console.log('ℹ️ No event selected yet - games will be loaded when event is selected')
      }
    } else {
      // Reset age if DOB is cleared
      setChildAgeMonths(null)
      setEligibleGames([]);
    }
  }

  // Calculate games total (matching frontend logic exactly)
  const calculateGamesTotal = () => {
    if (!selectedGames || selectedGames.length === 0) {
      return 0;
    }

    // Calculate total based on eligible games prices (matching frontend)
    let total = 0;

    for (const selection of selectedGames) {
      // Find the slot in eligible games by slot ID (matching frontend)
      const game = eligibleGames.find(g => g.id === selection.slotId);

      // Get price from the game object - prioritize slot_price (matching frontend)
      let gamePrice = 0;
      if (game) {
        // Parse price values as numbers since they might be stored as strings
        // Use slot_price first, then fallback to custom_price (matching frontend)
        if (game.slot_price) {
          gamePrice = parseFloat(game.slot_price.toString());
        } else if (game.custom_price) {
          gamePrice = parseFloat(game.custom_price.toString());
        } else {
          gamePrice = parseFloat(game.price.toString()) || 0;
        }
        // Adding game price (debug log removed)
      } else {
        console.warn(`⚠️ Slot with ID ${selection.slotId} not found in eligible games`);
      }

      total += gamePrice;
    }

    // Total games price calculated (debug log removed)
    return total;
  }

  // Calculate add-ons subtotal (matching user panel logic)
  const calculateAddOnsTotal = () => {
    const total = selectedAddOns.reduce((sum, item) => {
      let price = parseFloat(item.addOn.price.toString()) || 0;

      // Check if this is a variant with a different price
      if (item.variantId && item.addOn.has_variants && item.addOn.variants) {
        const variant = item.addOn.variants.find(v => v.id === item.variantId);
        if (variant && variant.price_modifier) {
          const modifier = parseFloat(variant.price_modifier.toString());
          price = parseFloat(item.addOn.price.toString()) + modifier;
          // Variant price calculation log removed
        }
      }

      // Round to 2 decimal places for each item's total
      const itemTotal = price * item.quantity;
      return sum + parseFloat(itemTotal.toFixed(2));
    }, 0);

    // Round final total to 2 decimal places
    const finalTotal = parseFloat(total.toFixed(2));
    // Total add-ons price calculated (debug log removed)
    return finalTotal;
  }

  // Calculate total price including add-ons and promocode discount (matching frontend logic - NO GST)
  const calculateTotalPrice = () => {
    const gamesTotal = calculateGamesTotal();
    const addOnsTotal = calculateAddOnsTotal();
    const subtotal = gamesTotal + addOnsTotal;

    // Pricing breakdown logs removed

    // Apply promocode discount if available
    let discountedSubtotal = subtotal;
    if (appliedPromoCode && discountAmount > 0) {
      discountedSubtotal = subtotal - discountAmount;
      // Promo discount logs removed
    }

    // Frontend doesn't add GST - removed GST calculation to match frontend
    // Ensure final total is rounded to 2 decimal places
    const finalTotal = parseFloat(discountedSubtotal.toFixed(2));
    // Final total calculated (debug log removed)
    return finalTotal;
  }

  // GST calculation removed to match frontend (frontend doesn't include GST)
  const calculateGST = () => {
    // Frontend doesn't calculate GST, so return 0
    return 0;
  }

  // Fetch cities from API when component mounts (matching user panel logic)
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setIsLoadingCities(true)
        setCityError(null)

        // Use booking info API that includes events and games_with_slots
        const bookingData = await getCitiesWithBookingInfo()
        setBookingCities(bookingData)

        // Map the API response to the format expected by the dropdown
        const formattedCities = bookingData.map(city => ({
          id: city.id,
          name: city.city_name
        }))

        setCities(formattedCities)
        console.log('✅ Loaded cities with booking info:', formattedCities.length, 'cities')
      } catch (error: any) {
        console.error("❌ Failed to fetch cities:", error)
        setCityError("Failed to load cities. Please try again.")
        
        // Fallback to basic city list if booking info fails
        try {
          const basicCities = await getAllCities()
          const formattedCities = basicCities.map(city => ({
            id: city.id || 0,
            name: city.city_name
          }))
          setCities(formattedCities)
        } catch (fallbackError) {
          console.error('Failed to load basic cities:', fallbackError)
        }
        
        toast({
          title: "Cities Loading Error",
          description: "Failed to load cities. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingCities(false)
      }
    }

    fetchCities()
  }, [])

  // Fetch add-ons from external API (matching user panel logic)
  useEffect(() => {
    async function loadAddOns() {
      setIsLoadingData(true);
      try {
        const addOnData = await getAllAddOns();

        const activeAddOns = addOnData.filter(addon => addon.is_active);
        setAddOns(activeAddOns);
      } catch (error) {
        console.error('❌ Failed to load add-ons:', error);
        toast({
          title: "Add-ons Loading Error",
          description: "Failed to load add-ons. Some features may not be available.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    }

    loadAddOns();
  }, [])

  // Handle city change and fetch events for the selected city (matching user panel logic)
  const handleCityChange = async (cityId: string) => {
    console.log('🏙️ City changed to:', cityId)
    setSelectedCityId(cityId)
    setSelectedEventType("") // Reset event type when city changes
    setSelectedGames([]) // Reset selected games
    setEligibleGames([]) // Reset eligible games

    if (!cityId) return

    // Use events from booking cities data (already includes games_with_slots)
    const cityData = bookingCities.find(c => c.id.toString() === cityId.toString())
    
    if (!cityData) {
      console.error('❌ City not found in booking cities data')
      setEventError("No events found for this city")
      return
    }

    console.log('✅ Found city data with', cityData.events?.length || 0, 'events')

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
      console.log('✅ Set', convertedEvents.length, 'events with games_with_slots')
    } else {
      setApiEvents([])
      setEventError("No events available for this city")
    }
  }

  // Load games for event by filtering games_with_slots by age (matching register-event page)
  const loadGamesForEvent = (event: EventListItem, childAgeMonths: number) => {
    console.log('🎮 Loading games for event:', event.event_title, 'age:', childAgeMonths, 'months')
    
    if (!event.games_with_slots || event.games_with_slots.length === 0) {
      console.log('⚠️ No games_with_slots in event data')
      setEligibleGames([])
      setGameError("No games available for this event")
      return
    }

    console.log('📦 Event has', event.games_with_slots.length, 'game slots')

    // Filter games based on child's age in months
    const ageFilteredSlots = event.games_with_slots.filter((slot: any) => {
      const minAgeMonths = slot.min_age
      const maxAgeMonths = slot.max_age
      const isEligible = childAgeMonths >= minAgeMonths && childAgeMonths <= maxAgeMonths
      console.log(`  ${slot.game_name} (${slot.start_time}-${slot.end_time}): age ${minAgeMonths}-${maxAgeMonths} months, eligible: ${isEligible}`)
      return isEligible
    })

    console.log('✅ Found', ageFilteredSlots.length, 'age-eligible game slots')

    if (ageFilteredSlots.length === 0) {
      setEligibleGames([])
      setGameError(`No games available for age ${Math.floor(childAgeMonths / 12)} years ${childAgeMonths % 12} months`)
      return
    }

    // Convert to EligibleGame format
    const formattedGames: EligibleGame[] = ageFilteredSlots.map((slot: any) => ({
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
      max_participants: slot.max_participants - (slot.booked_count || 0), // Remaining capacity
      slot_id: slot.slot_id,
      game_name: slot.game_name
    }))

    setEligibleGames(formattedGames)
    setGameError(null)
    console.log('✅ Set', formattedGames.length, 'eligible games')
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

      // If DOB is set, load games filtered by age
      if (childDateOfBirth && childAgeMonths !== null) {
        const birthDate = new Date(childDateOfBirth);
        const eventDate = selectedApiEvent.event_date ? new Date(selectedApiEvent.event_date) : undefined;
        
        // Recalculate age based on event date
        const ageInMonths = calculateAge(birthDate, eventDate);
        setChildAgeMonths(ageInMonths);
        
        console.log('📊 Recalculated age for event date:', ageInMonths, 'months')
        
        // Load games from event's games_with_slots filtered by age
        loadGamesForEvent(selectedApiEvent, ageInMonths);
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
      console.log('📡 Calling getGamesByAgeAndEvent API...')

      // Call the new API to get games by age and event
      const gamesData = await getGamesByAgeAndEvent(eventId, childAge);

      console.log('📦 API Response:', gamesData)

      if (gamesData && gamesData.length > 0) {
        console.log('✅ Games found:', gamesData.length, 'games')

        // Format games data to match the expected structure - API returns games with slots array
        const formattedGames: EligibleGame[] = [];

        gamesData.forEach((game: any) => {
          console.log('🎯 Processing game:', game.game_id, game.title)
          // Each game now has a slots array - process each slot as a separate selectable item
          if (game.slots && Array.isArray(game.slots)) {
            console.log('  📋 Found', game.slots.length, 'slots for game', game.game_id)
            game.slots.forEach((slot: any) => {
              formattedGames.push({
                id: Number(slot.slot_id || 0), // Use slot_id as number (matching frontend)
                game_id: Number(game.game_id || 0), // Store actual game_id for API calls
                title: game.title || game.game_title || game.name || '',
                description: game.description || game.game_description || '',
                price: parseFloat(slot.slot_price || game.listed_price || '0'),
                slot_price: parseFloat(slot.slot_price || '0'), // Prioritized price (matching frontend)
                custom_price: parseFloat(game.listed_price || '0'), // Fallback price (matching frontend)
                start_time: slot.start_time || '',
                end_time: slot.end_time || '',
                custom_title: game.title || '',
                custom_description: game.description || '',
                max_participants: slot.max_participants || 0,
                slot_id: Number(slot.slot_id || 0),
                game_name: game.title || game.game_title || game.name || ''
              });
            });
          } else {
            console.log('  ⚠️ No slots array found, using fallback format')
            // Fallback for games without slots array (backward compatibility)
            formattedGames.push({
              id: Number(game.slot_id || game.id || 0),
              game_id: Number(game.game_id || game.id || 0),
              title: game.title || game.game_title || game.name || '',
              description: game.description || game.game_description || '',
              price: parseFloat(game.price || game.slot_price || game.listed_price || '0'),
              slot_price: parseFloat(game.slot_price || game.price || '0'),
              custom_price: parseFloat(game.listed_price || game.price || '0'),
              start_time: game.start_time || '',
              end_time: game.end_time || '',
              custom_title: game.title || '',
              custom_description: game.description || '',
              max_participants: game.max_participants || 0,
              slot_id: Number(game.slot_id || game.id || 0),
              game_name: game.title || game.game_title || game.name || ''
            });
          }
        });

        console.log('✅ Formatted', formattedGames.length, 'game slots')

        // Set the formatted games (this is separate from eligibleEvents which contains event details)
        setEligibleGames(formattedGames);
      } else {
        console.log('⚠️ No games returned from API')
        setEligibleGames([]);
      }
    } catch (error) {
      console.error('❌ Error fetching games:', error);
      console.error('❌ Error details:', {
        eventId,
        childAge,
        error: error instanceof Error ? error.message : error
      });

      const errorMessage = error instanceof Error
        ? `Failed to load games: ${error.message}`
        : "Failed to load games. Please try again.";

      setGameError(errorMessage);
      setEligibleGames([]);

      // Show toast notification for better user feedback
      toast({
        title: "Games Loading Error",
        description: errorMessage,
        variant: "destructive",
      });
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
      if (appliedPromoCode) {
        setAppliedPromoCode("");
        setDiscountAmount(0);
        setPromoCodeInput("");
      }

      // Selection details updated (debug logs removed)

      return newSelectedGames;
    });
  }

  // Handle promo code input change (matching user panel logic)
  const handlePromoCodeInputChange = (value: string) => {
    setPromoCodeInput(value)
    if (!value.trim()) {
      setAppliedPromoCode("")
      setDiscountAmount(0)
    }
  }

  // Handle promo code validation (simplified for admin panel)
  const handlePromoCodeValidation = async () => {
    if (!promoCodeInput.trim()) {
      setAppliedPromoCode("")
      setDiscountAmount(0)
      return
    }

    // Use the same promo code validation API as frontend
    setIsValidatingPromoCode(true)

    try {
      // Get the selected event ID
      const selectedApiEvent = apiEvents.find(event => event.event_title === selectedEventType);
      if (!selectedApiEvent) {
        throw new Error('Selected event not found');
      }

      // Get the total amount before discount
      const gamesTotal = calculateGamesTotal();
      const addOnsTotal = calculateAddOnsTotal();
      const subtotal = gamesTotal + addOnsTotal;

      if (subtotal <= 0) {
        throw new Error('Please select games before applying promo code');
      }

      // Get game IDs from selected games (use game_id, not slot_id for promo validation, matching frontend)
      const gameIds = selectedGames.map(selection => selection.gameId);

      if (gameIds.length === 0) {
        throw new Error('No valid games selected for promo code validation');
      }

      // Validating promo code (debug logs removed); payload prepared for validation.

      // Use the same API endpoint as frontend
      const response = await fetch('/api/promo-codes/validate-preview', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promocode: promoCodeInput.trim(),
          eventId: selectedApiEvent.event_id,
          gameIds: gameIds,
          subtotal: subtotal
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to validate promo code');
      }

      const result = await response.json();


      if (result.isValid && result.discountAmount > 0) {
        setAppliedPromoCode(promoCodeInput.trim())
        setDiscountAmount(result.discountAmount)
        toast({
          title: "Promo Code Applied",
          description: `Discount applied: ₹${result.discountAmount.toFixed(2)}`,
        })
      } else {
        setAppliedPromoCode("")
        setDiscountAmount(0)
        toast({
          title: "Invalid Promo Code",
          description: result.message || "Please enter a valid promo code",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error validating promo code:", error)
      setAppliedPromoCode("")
      setDiscountAmount(0)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to validate promo code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsValidatingPromoCode(false)
    }
  }

  // Handle add-on selection (matching user panel logic)
  const handleAddOnChange = (addOn: AddOn, quantity: number, variantId?: string) => {
    const existingIndex = selectedAddOns.findIndex(item =>
      item.addOn.id === addOn.id && item.variantId === variantId
    )

    if (quantity === 0) {
      // Remove the add-on
      if (existingIndex !== -1) {
        setSelectedAddOns(prev => prev.filter((_, index) => index !== existingIndex))
      }
    } else {
      // Add or update the add-on
      const newItem = { addOn, quantity, variantId }

      if (existingIndex !== -1) {
        // Update existing
        setSelectedAddOns(prev => prev.map((item, index) =>
          index === existingIndex ? newItem : item
        ))
      } else {
        // Add new
        setSelectedAddOns(prev => [...prev, newItem])
      }
    }
  }





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
      const totalAmount = calculateTotalPrice()

      // Generate unique manual booking reference using MAN format
      const generateBookingRef = () => {
        const timestamp = Date.now().toString()
        return generateManualBookingRef(timestamp)
      }

      // Process booking_addons according to API structure
      const processedAddons: any[] = []
      if (selectedAddOns.length > 0) {
        // Group addons by addon_id to handle multiple variants of the same addon
        const addonGroups = new Map<number, any>()

        selectedAddOns.forEach(item => {
          const addonId = Number(item.addOn.id)

          if (item.addOn.has_variants && item.variantId) {
            // For addons with variants, group by addon_id and collect variants
            if (!addonGroups.has(addonId)) {
              addonGroups.set(addonId, {
                addon_id: addonId,
                variants: []
              })
            }
            addonGroups.get(addonId).variants.push({
              variant_id: Number(item.variantId),
              quantity: item.quantity
            })
          } else if (!item.addOn.has_variants) {
            // For addons without variants, simple structure
            addonGroups.set(addonId, {
              addon_id: addonId,
              quantity: item.quantity
            })
          }
        })

        // Convert map to array
        processedAddons.push(...Array.from(addonGroups.values()))
      }

      // Create booking data matching the expected API structure
      const bookingData = {
        user_id: 4, // Admin user ID
        parent: {
          parent_name: parentName,
          email: email,
          additional_phone: `+91${phoneDigits}` // Use validated phone digits with +91 prefix
        },
        child: {
          full_name: childName,
          date_of_birth: childDateOfBirth, // Keep as YYYY-MM-DD format
          school_name: schoolName || "Not Specified",
          gender: childGender
        },
        booking: {
          booking_ref: generateBookingRef(),
          event_id: selectedApiEvent.event_id,
          status: "Confirmed",
          total_amount: totalAmount,
          payment_method: paymentMethod,
          payment_status: paymentMethod === "Cash payment" ? "completed" : "pending",
          terms_accepted: true
        },
        booking_games: selectedGamesObj.map(game => ({
          game_id: game.game_id, // Use actual game_id for the API
          game_price: game.slot_price || game.price, // Prioritize slot_price (matching frontend)
          slot_id: game.slot_id // Add slot_id for proper game details lookup
        })),
        booking_addons: processedAddons,
        ...(appliedPromoCode && { promo_code: appliedPromoCode })
      }

      // Creating booking with data (debug log removed)

      // Call the booking creation API (using the same endpoint as user panel)
      const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/bookingsevents/create', {
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

      // Create payment record based on selected payment method
      const paymentData = {
        booking_id: bookingId,
        transaction_id: generateUniqueTransactionId("MAN_TXN"),
        amount: totalAmount,
        payment_method: paymentMethod,
        payment_status: paymentMethod === "Cash payment" ? "completed" : "pending",
        created_by_admin: true,
        notes: paymentMethod === "Cash payment"
          ? "Manual booking - Cash payment received by admin"
          : "Manual booking - Online payment pending"
      }

      // Creating payment record (debug log removed)

      // Create payment record
      const paymentResponse = await fetch(PAYMENT_API.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      })

      if (!paymentResponse.ok) {
        console.warn("Payment record creation failed, but booking was created successfully")
        // Don't throw error here as booking was successful
      } else {
        const paymentResult = await paymentResponse.json()

      }

      // Store booking details for payment management
      setCreatedBookingId(bookingId)
      setCreatedBookingRef(bookingData.booking.booking_ref)
      setCreatedBookingAmount(totalAmount)
      setCreatedBookingPhone(`+91${phoneDigits}`) // Store validated phone with +91 prefix
      setCreatedBookingEmail(email)
      setCreatedBookingParentName(parentName)
      setCreatedBookingChildName(childName)
      setCreatedBookingPaymentMethod(paymentMethod)
      setBookingCreated(true)

      toast({
        title: "Success",
        description: paymentMethod === "Cash payment"
          ? "Manual booking created successfully! Cash payment has been recorded."
          : "Manual booking created successfully! You can now generate a payment link.",
      })

      // Prepare game details for email (matching frontend structure) - moved outside try block
      const gameDetails = selectedGamesObj.map(game => ({
        gameName: game.custom_title || game.title || `Game ${game.game_id}`,
        gameTime: game.start_time && game.end_time ? `${game.start_time} - ${game.end_time}` : 'Time TBD',
        gamePrice: game.slot_price || game.price || 0
      }));

      // Prepare add-on details for email - moved outside try block
      const addOnDetails = selectedAddOns.map(item => {
          let price = parseFloat(item.addOn.price.toString()) || 0;
          if (item.variantId && item.addOn.variants) {
            const variant = item.addOn.variants.find(v => v.id?.toString() === item.variantId);
            if (variant) {
              price += variant.price_modifier;
            }
          }
          return {
            name: item.addOn.name + (item.variantId ? ` (${item.addOn.variants?.find(v => v.id?.toString() === item.variantId)?.name || 'Variant'})` : ''),
            quantity: item.quantity,
            price: price * item.quantity
          };
        });

      // Send booking confirmation email
      try {
        // Sending booking confirmation email (debug log removed)

        const confirmationData: BookingConfirmationData = {          bookingId: bookingId,
          bookingRef: bookingData.booking.booking_ref,
          parentName: parentName,
          parentEmail: email,
          childName: childName,
          eventTitle: selectedApiEvent.event_title,
          eventDate: selectedApiEvent.event_date || new Date().toLocaleDateString(),
          eventVenue: selectedApiEvent.venue_name || 'Event Venue',
          totalAmount: totalAmount,
          paymentMethod: paymentMethod,
          transactionId: paymentData.transaction_id,
          gameDetails: gameDetails,
          addOns: addOnDetails.length > 0 ? addOnDetails : undefined
        };

        const emailResult = await sendBookingConfirmationFromServer(confirmationData);

        if (emailResult.success) {
          // Booking confirmation email sent successfully (debug log removed)

          // Send admin notification email for manual booking
          try {
            const { sendAdminNotificationEmail } = await import('@/services/emailNotificationService');

            const adminNotificationResult = await sendAdminNotificationEmail(confirmationData);

            if (adminNotificationResult.success) {
              // Admin notification success (debug log removed)
            } else {
              console.error("❌ Admin notification email failed:", adminNotificationResult.error);
            }
          } catch (adminEmailError) {
            console.error("❌ Error sending admin notification email:", adminEmailError);
            // Don't fail the process if admin email fails
          }

          toast({
            title: "Email Sent",
            description: "Booking confirmation email sent to customer",
          });
        } else {
          console.error("❌ Failed to send booking confirmation email:", emailResult.error);
          toast({
            title: "Email Warning",
            description: "Booking created but email failed to send. You can resend it later.",
            variant: "destructive",
          });
        }
      } catch (emailError) {
        console.error("❌ Error sending booking confirmation email:", emailError);
        toast({
          title: "Email Warning",
          description: "Booking created but email failed to send. You can resend it later.",
          variant: "destructive",
        });
      }

      // Send WhatsApp booking confirmation message (matching frontend implementation)
      try {
        // Sending WhatsApp booking confirmation message (debug logs removed)

        // Validate phone number is provided
        if (!phoneDigits || phoneDigits.trim() === '') {
          // No phone number provided, skipping WhatsApp notification (debug log removed)
        } else {
          // Format phone number for WhatsApp (use phoneDigits which is already validated)
          const formattedPhone = `+91${phoneDigits}`;

          // WhatsApp phone formatting/debug logs removed

          // Prepare WhatsApp message data (matching frontend structure exactly)
          const whatsappData = {            bookingId: bookingId,
            bookingRef: bookingData.booking.booking_ref,
            parentName: parentName,
            parentPhone: formattedPhone, // Customer's WhatsApp number (formatted)
            childName: childName,
            eventTitle: selectedApiEvent.event_title || 'NIBOG Event',
            eventDate: selectedApiEvent.event_date || new Date().toLocaleDateString(),
            eventVenue: selectedApiEvent.venue_name || 'Event Venue',
            totalAmount: totalAmount,
            paymentMethod: paymentMethod,
            transactionId: paymentData.transaction_id,
            gameDetails: gameDetails,
            // Always include addOns as an array, never undefined
            addOns: addOnDetails.length > 0 ? addOnDetails : []
          };

          // WhatsApp data prepared (debug logs removed)

          // Debug: Check for any undefined or null values
          const undefinedFields = Object.entries(whatsappData).filter(([key, value]) => value === undefined || value === null);
          if (undefinedFields.length > 0) {
            console.warn("⚠️ WhatsApp data contains undefined/null fields:", undefinedFields);
          }

          // Send WhatsApp via API endpoint instead of direct service call (to avoid browser environment issues)
          const whatsappResponse = await fetch('/api/whatsapp/send-booking-confirmation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(whatsappData),
          });

          const whatsappResult = await whatsappResponse.json();

          if (whatsappResult.success) {
            // WhatsApp booking confirmation sent successfully (debug logs removed)
            toast({
              title: "WhatsApp Sent",
              description: `Booking confirmation sent via WhatsApp`,
            });
          } else {
            console.error("❌ Failed to send WhatsApp booking confirmation:", whatsappResult.error);
            console.error("❌ Zaptra response:", whatsappResult.zaptraResponse);

            // Check if it's the parameter mismatch error
            if (whatsappResult.error && whatsappResult.error.includes('132000')) {
              console.error("🔍 PARAMETER MISMATCH ERROR DETECTED!");
              console.error("📋 This is the #132000 error - parameter count mismatch");
              console.error("📋 WhatsApp data that caused the error:", JSON.stringify(whatsappData, null, 2));
            }

            toast({
              title: "WhatsApp Warning",
              description: `WhatsApp failed: ${whatsappResult.error}`,
              variant: "destructive",
            });
          }
        }
      } catch (whatsappError) {
        console.error("❌ Error sending WhatsApp booking confirmation:", whatsappError);
        toast({
          title: "WhatsApp Warning",
          description: "Booking created but WhatsApp message failed to send.",
          variant: "destructive",
        });
      }

      // Send tickets for all manual bookings (consistent with frontend behavior)
      try {
        // Starting ticket email process (debug logs removed)

        // Add a delay to ensure booking is fully processed in the database
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Fetch ticket details from database with retry logic (same as frontend approach)
        const { getTicketDetails } = await import('@/services/bookingService');
        let ticketDetails = null;
        let retryCount = 0;
        const maxRetries = 3;

        // Retry logic to handle database timing issues
        while (retryCount < maxRetries && (!ticketDetails || ticketDetails.length === 0)) {
          try {
            // Attempting to fetch ticket details (debug logs removed)
            ticketDetails = await getTicketDetails(bookingData.booking.booking_ref);

            if (ticketDetails && ticketDetails.length > 0) {
              // Successfully retrieved ticket details (debug log removed)
              break;
            }

            if (retryCount < maxRetries - 1) {
              // No ticket details found, waiting before retry (debug log removed)
              await new Promise(resolve => setTimeout(resolve, 3000));
            }
          } catch (error) {
            console.error(`🎫 Error fetching ticket details (attempt ${retryCount + 1}):`, error);
            if (retryCount < maxRetries - 1) {
              await new Promise(resolve => setTimeout(resolve, 3000));
            }
          }
          retryCount++;
        }

        if (ticketDetails && ticketDetails.length > 0) {
          // Retrieved ticket details (debug log removed)

          // Prepare QR code data (matching frontend format exactly)
          const firstTicket = ticketDetails[0];
          const qrCodeData = JSON.stringify({
            ref: bookingData.booking.booking_ref,
            id: bookingId,
            name: firstTicket.child_name || childName,
            game: firstTicket.custom_title || firstTicket.event_title || firstTicket.game_name || selectedApiEvent.event_title,
            slot_id: firstTicket.event_game_slot_id || firstTicket.booking_game_id || 0
          });
          // Prepare ticket email data (matching frontend structure exactly)
          const ticketEmailData: TicketEmailData = {
            bookingId: bookingId,
            bookingRef: bookingData.booking.booking_ref,
            parentName: parentName,
            parentEmail: email,
            childName: childName,
            eventTitle: selectedApiEvent.event_title,
            eventDate: selectedApiEvent.event_date || new Date().toLocaleDateString(),
            eventVenue: 'Event Venue', // Use generic venue name for manual bookings
            eventCity: '',
            ticketDetails: ticketDetails,
            qrCodeData: qrCodeData
          };

          // Sending ticket email with data (debug logs removed)

          // Send ticket email using direct service call (same as frontend)
          const ticketResult = await sendTicketEmail(ticketEmailData);

          if (ticketResult.success) {
            // Tickets sent successfully (debug logs removed)
            toast({
              title: "Tickets Sent",
              description: "Event tickets with QR codes have been sent to the customer's email",
            });
          } else {
            console.error("❌ Failed to send tickets:", ticketResult.error);
            toast({
              title: "Ticket Warning",
              description: `Tickets failed to send: ${ticketResult.error}`,
              variant: "destructive",
            });
          }
        } else {
          // No ticket details found; creating fallback ticket details (debug logs removed)

          // Create fallback ticket details from the booking data
          const fallbackTicketDetails = selectedGamesObj.map((game, index) => ({
            booking_id: bookingId,
            booking_game_id: index + 1,
            game_id: game.game_id,
            game_name: game.title,
            custom_title: game.custom_title || game.title || selectedApiEvent.event_title || 'NIBOG Event',
            custom_description: game.custom_description || game.description,
            custom_price: game.slot_price || game.price,
            slot_price: game.slot_price || game.price,
            start_time: game.start_time,
            end_time: game.end_time,
            event_title: selectedApiEvent.event_title || 'NIBOG Event',
            event_date: selectedApiEvent.event_date,
            parent_name: parentName,
            parent_email: email,
            child_name: childName,
            event_game_slot_id: game.slot_id || game.id,
            booking_ref: bookingData.booking.booking_ref,
            booking_created_at: new Date().toISOString(),
            booking_status: 'Confirmed'
          }));

          // Prepare QR code data using fallback ticket details
          const firstTicket = fallbackTicketDetails[0];
          const qrCodeData = JSON.stringify({
            ref: bookingData.booking.booking_ref,
            id: bookingId,
            name: firstTicket.child_name,
            game: firstTicket.custom_title || firstTicket.event_title || firstTicket.game_name,
            slot_id: firstTicket.event_game_slot_id || 0
          });

          // Fallback QR code data prepared (debug logs removed)

          // Prepare ticket email data using fallback details
          const ticketEmailData: TicketEmailData = {            bookingId: bookingId,
            bookingRef: bookingData.booking.booking_ref,
            parentName: parentName,
            parentEmail: email,
            childName: childName,
            eventTitle: selectedApiEvent.event_title,
            eventDate: selectedApiEvent.event_date || new Date().toLocaleDateString(),
            eventVenue: 'Event Venue',
            eventCity: '',
            ticketDetails: fallbackTicketDetails as any, // Cast as any for fallback scenario
            qrCodeData: qrCodeData
          };

          // Sending ticket email with fallback data (debug logs removed)

          // Send ticket email using fallback data
          const ticketResult = await sendTicketEmail(ticketEmailData);

          if (ticketResult.success) {

            toast({
              title: "Tickets Sent",
              description: "Event tickets with QR codes have been sent to the customer's email (using fallback data)",
            });
          } else {
            console.error("❌ Failed to send tickets using fallback data:", ticketResult.error);
            toast({
              title: "Ticket Warning",
              description: `Tickets failed to send even with fallback data: ${ticketResult.error}`,
              variant: "destructive",
            });
          }
        }
      } catch (ticketError) {
          console.error("❌ Error sending tickets:", ticketError);
          toast({
            title: "Ticket Warning",
            description: "Booking created but tickets failed to send. You can resend them later.",
            variant: "destructive",
          });
        }

        setTimeout(() => {
          // Optionally redirect to bookings list
          // router.push("/admin/bookings")
        }, 3000)

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

  if (isLoadingData) {
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

        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading events and venues...</span>
          </div>
        </div>
      </div>
    )
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
              <p className="text-muted-foreground">Manage payment for booking {createdBookingRef}</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Management</CardTitle>
            <p className="text-sm text-muted-foreground">
              {createdBookingPaymentMethod === "Cash payment"
                ? "Booking has been created and marked as paid. Cash payment has been recorded."
                : "Booking has been created with pending payment status. Generate a payment link to send to the customer."
              }
            </p>
            <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
              💡 <strong>Testing Tip:</strong> In sandbox mode, avoid entering real UPI details. Look for "Test Payment" or "Simulate Success" buttons on the PhonePe page, or use test card details instead.
            </div>
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

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {createdBookingPaymentMethod === "Cash payment" ? "Payment Status" : "Payment Options"}
              </h3>

              {createdBookingPaymentMethod === "Cash payment" ? (
                // Cash Payment Status
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Cash Payment Completed</p>
                      <p className="text-sm text-green-700">
                        This booking has been marked as paid. Cash payment was received by admin.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // Online Payment Options
                <>
                  {/* Payment Link Generation */}
                  <div className="space-y-2">
                <Button
                  onClick={handleGeneratePaymentLink}
                  disabled={isGeneratingPaymentLink}
                  className="w-full"
                >
                  {isGeneratingPaymentLink ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Payment Link...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Generate PhonePe Payment Link
                    </>
                  )}
                </Button>

                {paymentLinkGenerated && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-3">
                    <p className="text-sm font-medium text-green-800">Payment Link Generated Successfully!</p>

                    <div className="flex gap-2">
                      <Input
                        value={paymentLinkGenerated}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(paymentLinkGenerated)
                          toast({ title: "Copied!", description: "Payment link copied to clipboard" })
                        }}
                      >
                        Copy
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Button
                        onClick={handleSendPaymentEmail}
                        disabled={isSendingEmail || emailSent}
                        size="sm"
                        className="w-full"
                      >
                        {isSendingEmail ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Sending...
                          </>
                        ) : emailSent ? (
                          <>
                            <CheckCircle className="mr-2 h-3 w-3" />
                            Email Sent
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2 h-3 w-3" />
                            Send via Email
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const whatsappMessage = generateWhatsAppMessage({
                            parentName: createdBookingParentName,
                            parentEmail: createdBookingEmail,
                            childName: createdBookingChildName,
                            bookingId: createdBookingId!,
                            bookingRef: createdBookingRef,
                            totalAmount: createdBookingAmount,
                            paymentLink: paymentLinkGenerated
                          })
                          const whatsappUrl = `https://wa.me/${createdBookingPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`
                          window.open(whatsappUrl, '_blank')
                        }}
                        className="w-full"
                      >
                        <MessageCircle className="mr-2 h-3 w-3" />
                        WhatsApp
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(paymentLinkGenerated, '_blank')}
                        className="w-full"
                      >
                        <ExternalLink className="mr-2 h-3 w-3" />
                        Open Link
                      </Button>
                    </div>

                    {emailSent && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                        ✅ Payment link sent to {createdBookingEmail}
                      </div>
                    )}
                  </div>
                )}
              </div>

                  {/* Manual Payment Recording */}
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Navigate to manual payment page
                        router.push(`/admin/bookings/payment/${createdBookingId}?amount=${createdBookingAmount}`)
                      }}
                      className="w-full"
                      disabled={!createdBookingId}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Record Manual Payment
                    </Button>
                  </div>
                </>
              )}
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
                                    return (
                                      <div
                                        key={slot.id}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                                          isSelected
                                            ? "border-primary bg-primary/10 shadow-md"
                                            : slot.max_participants <= 0
                                              ? "border-muted bg-gray-100 opacity-70"
                                              : "border-muted hover:border-primary/30 hover:bg-primary/5 cursor-pointer"
                                        }`}
                                        onClick={() => slot.max_participants > 0 && handleGameSelection(slot.id)}
                                      >
                                        <div className="flex items-center space-x-3">
                                          <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => slot.max_participants > 0 && handleGameSelection(slot.id)}
                                            disabled={slot.max_participants <= 0}
                                            className={`${slot.max_participants <= 0 ? 'opacity-50 cursor-not-allowed' : 'text-primary focus:ring-primary'}`}
                                          />
                                          <div>
                                            <div className="font-medium text-sm">
                                              {slot.start_time} - {slot.end_time}
                                            </div>
                                            <div className={`text-xs ${slot.max_participants <= 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                                              {slot.max_participants <= 0
                                                ? 'Max participants reached'
                                                : `Max ${slot.max_participants} participants`
                                              }
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-bold text-lg text-primary">
                                            ₹{slot.slot_price.toLocaleString()}
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

          <Card>
            <CardHeader>
              <CardTitle>Add-ons Selection</CardTitle>
              <CardDescription>Select optional add-ons for your booking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading add-ons...</span>
                  </div>
                </div>
              ) : addOns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No add-ons available
                </div>
              ) : (
                <div className="space-y-4">
                  {addOns.map((addon) => (
                    <div key={addon.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
                          {addon.images && addon.images.length > 0 ? (
                            <img
                              src={addon.images[0]}
                              alt={addon.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <span className="text-xs">No image</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{addon.name}</h4>
                              <p className="text-sm text-muted-foreground">{addon.description}</p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-sm font-medium">₹{parseFloat(addon.price).toLocaleString()}</span>
                                <span className="text-xs text-muted-foreground capitalize">• {addon.category}</span>
                              </div>
                            </div>
                          </div>

                          {addon.has_variants ? (
                            <div className="mt-3 space-y-2">
                              <p className="text-sm font-medium">Variants:</p>
                              {addon.variants?.map((variant) => {
                                const finalPrice = parseFloat(addon.price) + variant.price_modifier
                                const selectedItem = selectedAddOns.find(item =>
                                  item.addOn.id === addon.id && item.variantId === variant.id
                                )
                                const currentQuantity = selectedItem?.quantity || 0

                                return (
                                  <div key={variant.id} className="flex items-center justify-between p-2 border rounded">
                                    <div className="flex-1">
                                      <span className="text-sm font-medium">{variant.name}</span>
                                      <div className="text-xs text-muted-foreground">
                                        ₹{finalPrice.toLocaleString()}
                                        {variant.price_modifier !== 0 && (
                                          <span className={variant.price_modifier > 0 ? "text-green-600" : "text-red-600"}>
                                            {" "}({variant.price_modifier > 0 ? "+" : ""}₹{variant.price_modifier})
                                          </span>
                                        )}
                                        {" "}• Stock: {variant.stock_quantity}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAddOnChange(addon, Math.max(0, currentQuantity - 1), variant.id?.toString())}
                                        disabled={currentQuantity === 0}
                                      >
                                        -
                                      </Button>
                                      <span className="w-8 text-center text-sm">{currentQuantity}</span>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAddOnChange(addon, currentQuantity + 1, variant.id?.toString())}
                                        disabled={currentQuantity >= variant.stock_quantity}
                                      >
                                        +
                                      </Button>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="mt-3">
                              {(() => {
                                const selectedItem = selectedAddOns.find(item =>
                                  item.addOn.id === addon.id && !item.variantId
                                )
                                const currentQuantity = selectedItem?.quantity || 0

                                return (
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                      Stock: {addon.stock_quantity} units
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAddOnChange(addon, Math.max(0, currentQuantity - 1))}
                                        disabled={currentQuantity === 0}
                                      >
                                        -
                                      </Button>
                                      <span className="w-8 text-center text-sm">{currentQuantity}</span>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAddOnChange(addon, currentQuantity + 1)}
                                        disabled={currentQuantity >= addon.stock_quantity}
                                      >
                                        +
                                      </Button>
                                    </div>
                                  </div>
                                )
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pricing Summary */}
              {(selectedGames.length > 0 || selectedAddOns.length > 0) && (
                <div className="mt-6 p-4 bg-muted/50 rounded-md">
                  <h4 className="font-medium mb-3">Booking Summary:</h4>
                  <div className="space-y-2">
                    {/* Games */}
                    {selectedGames.length > 0 && (
                      <>
                        <div className="text-sm font-medium">Games:</div>
                        {selectedGames.map((selection) => {
                          const game = eligibleGames.find(g => g.id === selection.slotId)
                          return game ? (
                            <div key={selection.slotId} className="flex justify-between text-sm ml-4">
                              <span>{game.title} ({game.start_time} - {game.end_time})</span>
                              <span>₹{game.price.toLocaleString()}</span>
                            </div>
                          ) : null
                        })}
                        <div className="flex justify-between text-sm font-medium ml-4">
                          <span>Games Subtotal:</span>
                          <span>₹{calculateGamesTotal().toLocaleString()}</span>
                        </div>
                      </>
                    )}

                    {/* Add-ons */}
                    {selectedAddOns.length > 0 && (
                      <>
                        <div className="text-sm font-medium mt-3">Add-ons:</div>
                        {selectedAddOns.map((item, index) => {
                          let price = parseFloat(item.addOn.price.toString()) || 0;

                          // Check if this is a variant with a different price
                          if (item.variantId && item.addOn.has_variants && item.addOn.variants) {
                            const variant = item.addOn.variants.find(v => v.id === item.variantId);
                            if (variant && variant.price_modifier) {
                              const modifier = parseFloat(variant.price_modifier.toString());
                              price = parseFloat(item.addOn.price.toString()) + modifier;
                            }
                          }

                          const totalPrice = price * item.quantity;

                          return (
                            <div key={index} className="flex justify-between text-sm ml-4">
                              <span>
                                {item.addOn.name}
                                {item.variantId && item.addOn.variants && (
                                  ` - ${item.addOn.variants.find(v => v.id === item.variantId)?.name || ''}`
                                )}
                                {" "}× {item.quantity}
                              </span>
                              <span>₹{totalPrice.toLocaleString()}</span>
                            </div>
                          )
                        })}
                        <div className="flex justify-between text-sm font-medium ml-4">
                          <span>Add-ons Subtotal:</span>
                          <span>₹{calculateAddOnsTotal().toLocaleString()}</span>
                        </div>
                      </>
                    )}

                    <Separator className="my-2" />

                    {/* Subtotal */}
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>₹{(calculateGamesTotal() + calculateAddOnsTotal()).toLocaleString()}</span>
                    </div>

                    {/* Promo Code Discount */}
                    {appliedPromoCode && discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Promo Discount ({appliedPromoCode}):</span>
                        <span>-₹{discountAmount.toLocaleString()}</span>
                      </div>
                    )}

                    {/* GST removed to match frontend pricing */}

                    <Separator className="my-2" />

                    {/* Total */}
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total Amount:</span>
                      <span>₹{calculateTotalPrice().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Promo Code Section */}
          {selectedEventType && selectedGames.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Promo Code (Optional)</CardTitle>
                <CardDescription>Enter a promo code to get discount on your booking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="promoCodeInput">Promo Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="promoCodeInput"
                      value={promoCodeInput}
                      onChange={(e) => handlePromoCodeInputChange(e.target.value)}
                      placeholder="Enter promo code"
                      disabled={isValidatingPromoCode}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePromoCodeValidation}
                      disabled={!promoCodeInput.trim() || isValidatingPromoCode}
                    >
                      {isValidatingPromoCode ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Validating...
                        </>
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                </div>

                {/* Show applied promo code */}
                {appliedPromoCode && discountAmount > 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Promo Code Applied:</span>
                        <span className="font-medium">{appliedPromoCode}</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount:</span>
                        <span>-₹{discountAmount.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-green-600 mt-2">Promo code applied successfully!</p>
                    </div>
                  </div>
                )}

                {/* Promo code hint */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Try "ADMIN10" for a 10% discount on your booking.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

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
