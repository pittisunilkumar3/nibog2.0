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


import { ArrowLeft, Save, Loader2, CreditCard, CheckCircle, Mail, MessageCircle, ExternalLink } from "lucide-react"
import { format } from "date-fns"

import { useToast } from "@/hooks/use-toast"
import { BOOKING_API, PAYMENT_API } from "@/config/api"
import { getAllCities, City } from "@/services/cityService"
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
  const [childGender, setChildGender] = useState("")
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
  const handleDobChange = (dateString: string) => {
    setChildDateOfBirth(dateString)

    if (dateString) {
      const date = new Date(dateString)
      
      // Find the selected event to get the event date
      const selectedApiEvent = apiEvents.find(event => event.event_title === selectedEventType);
      const eventDate = selectedApiEvent?.event_date ? new Date(selectedApiEvent.event_date) : undefined;
      
      // Calculate child's age in months based on the event date (if available) or current date
      const ageInMonths = calculateAge(date, eventDate)
      setChildAgeMonths(ageInMonths)

      // Child DOB debug logs removed

      // If an event is already selected, fetch games for this age
      if (selectedEventType) {
        if (selectedApiEvent) {
          // Fetching games for selected event (debug logs removed)
          fetchGamesByEventAndAge(selectedApiEvent.event_id, ageInMonths);
        } else {
          console.warn(`⚠️ Selected event type "${selectedEventType}" not found in API events`);
        }
      } else {
        // No event selected yet (debug logs removed)
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

        const citiesData = await getAllCities()

        // Map the API response to the format expected by the dropdown
        const formattedCities = citiesData.map(city => ({
          id: city.id || 0,
          name: city.city_name
        }))

        setCities(formattedCities)
      } catch (error: any) {
        console.error("❌ Failed to fetch cities:", error)
        setCityError("Failed to load cities. Please try again.")
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
    setSelectedCityId(cityId)
    setSelectedEventType("") // Reset event type when city changes
    setSelectedGames([]) // Reset selected games
    setEligibleGames([]) // Reset eligible games

    if (!cityId) return

    // Fetch events for the selected city
    try {
      setIsLoadingEvents(true);
      setEventError(null);

      const eventsData = await getEventsByCityId(Number(cityId));

      // Validate API response
      if (!Array.isArray(eventsData)) {
        throw new Error('Invalid events data format: expected an array');
      }

      if (eventsData.length === 0) {
        setApiEvents([]);
        setEventError("No events available for this city.");
        return;
      }

      // Normalize API event shapes to `EventListItem` and validate
      const mappedEvents: EventListItem[] = eventsData
        .map((eventAny: any) => {
          // If API already returns full EventListItem shape, use it
          if (eventAny && typeof eventAny.event_id === 'number' && eventAny.event_title) {
            return eventAny as EventListItem
          }

          // Handle simplified API response like { id, title }
          return {
            event_id: Number(eventAny.id || eventAny.event_id || 0),
            event_title: eventAny.title || eventAny.event_title || 'Untitled Event',
            event_description: eventAny.description || eventAny.event_description || '',
            event_date: eventAny.event_date || eventAny.eventDate || '',
            event_status: eventAny.status || eventAny.event_status || 'upcoming',
            city_id: Number(eventAny.city_id || cityId || 0),
            venue_id: Number(eventAny.venue_id || 0),
            venue_name: eventAny.venue_name || eventAny.venue || undefined,
          }
        })
        .filter(e => e.event_id && e.event_title) // keep only valid entries

      setApiEvents(mappedEvents);

      // No need to filter events by age anymore - games will be fetched separately
      // when both event and DOB are selected

    } catch (error: any) {
      console.error(`❌ Failed to fetch events for city ID ${cityId}:`, error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load events. Please try again.";
      setEventError(errorMessage);

      toast({
        title: "Events Loading Error",
        description: errorMessage,
        variant: "destructive",
      });

      // Clear events on error
      setApiEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  }

  // Handle event type selection (matching user panel logic)
  const handleEventTypeChange = (eventType: string) => {
    setSelectedEventType(eventType)
    setSelectedGames([]) // Reset selected games
    setEligibleGames([]) // Reset eligible games

    // Find the selected event from API events
    const selectedApiEvent = apiEvents.find(event => event.event_title === eventType);

    if (selectedApiEvent) {
      // Selected event found (debug logs removed)

      // If DOB is set, recalculate age based on event date
      if (childDateOfBirth) {
        const birthDate = new Date(childDateOfBirth);
        const eventDate = selectedApiEvent.event_date ? new Date(selectedApiEvent.event_date) : undefined;
        
        // Recalculate age based on event date
        const ageInMonths = calculateAge(birthDate, eventDate);
        setChildAgeMonths(ageInMonths);
        
        // Recalculated age and fetching games (debug logs removed)
        
        // Fetch games for this event and child age
        fetchGamesByEventAndAge(selectedApiEvent.event_id, ageInMonths);
      } else {
        // Child date of birth not set; cannot fetch games yet (debug logs removed)
      }
    } else {
      // If no matching event found, clear eligible games
      console.error(`❌ Selected event "${eventType}" not found in API events:`, apiEvents);
      setEligibleGames([]);
    }
  }

  // Fetch games based on event ID and child age (matching user panel logic)
  const fetchGamesByEventAndAge = async (eventId: number, childAge: number) => {
    if (!eventId || childAge === null || childAge === undefined) {
      // Skipping games fetch - missing required data (debug log removed)
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
      // Fetching games for event (debug logs removed)

      // Call the new API to get games by age and event
      const gamesData = await getGamesByAgeAndEvent(eventId, childAge);


      if (gamesData && gamesData.length > 0) {
        // Games found; raw data logged (debug logs removed)

        // Format games data to match the expected structure - API returns games with slots array
        const formattedGames: EligibleGame[] = [];

        gamesData.forEach((game: any) => {
          // Each game now has a slots array - process each slot as a separate selectable item
          if (game.slots && Array.isArray(game.slots)) {
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

        // Formatted games (debug logs removed)

        // Set the formatted games (this is separate from eligibleEvents which contains event details)
        setEligibleGames(formattedGames);
      } else {
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

  // Handle game selection with slot selection - SINGLE SELECTION ONLY (matching frontend exactly)
  const handleGameSelection = (slotId: number) => {
    // Find the game associated with this slot
    const selectedSlot = eligibleGames.find((g) => g.id === slotId);
    if (!selectedSlot) {
      console.error(`❌ Slot with ID ${slotId} not found in eligible games`);
      return;
    }

    const gameId = selectedSlot.game_id;

    // SINGLE SELECTION LOGIC: Only allow one game/slot selection at a time (matching frontend)
    setSelectedGames((prev) => {
      // Check if this exact slot is already selected
      const isCurrentlySelected = prev.length === 1 && prev[0].slotId === slotId;

      let newSelectedGames: Array<{ gameId: number; slotId: number }>;

      if (isCurrentlySelected) {
        // If clicking the same slot that's already selected, deselect it
        newSelectedGames = [];
      } else {
        // Replace any existing selection with this new selection (SINGLE SELECTION)
        newSelectedGames = [{ gameId, slotId }];
      }

      // Clear promo code when games selection changes (matching frontend)
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
              <div className="space-y-2">
                <Label htmlFor="parentName">Parent Name</Label>
                <Input
                  id="parentName"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Enter parent name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
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
                  placeholder="Enter 10-digit mobile number (or +91XXXXXXXXXX)"
                  required
                  maxLength={13}
                  pattern="[0-9]{10}"
                  className="font-mono"
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
              <div className="space-y-2">
                <Label htmlFor="childName">Child Name</Label>
                <Input
                  id="childName"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Enter child name"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="childDateOfBirth">Date of Birth</Label>
                  <Input
                    id="childDateOfBirth"
                    type="date"
                    value={childDateOfBirth}
                    onChange={(e) => handleDobChange(e.target.value)}
                    required
                  />
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

                <div className="space-y-2">
                  <Label htmlFor="childGender">Gender</Label>
                  <Select value={childGender} onValueChange={setChildGender} required>
                    <SelectTrigger id="childGender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name (Optional)</Label>
                <Input
                  id="schoolName"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Enter school name"
                />
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
                    {/* Selection Status Indicator (matching frontend) */}
                    <div className={`mb-4 p-3 rounded-lg border text-sm ${
                      selectedGames.length === 0
                        ? "bg-gray-50 border-gray-200 text-gray-600"
                        : selectedGames.length === 1
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}>
                      <div className="flex items-center gap-2">
                        {selectedGames.length === 0 && (
                          <>
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            <span>No game selected - Please select one game and time slot</span>
                          </>
                        )}
                        {selectedGames.length === 1 && (
                          <>
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span>✓ One game selected - Ready to continue</span>
                          </>
                        )}
                        {selectedGames.length > 1 && (
                          <>
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span>⚠ Multiple games selected - Please select only one</span>
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
                                  Select Time Slot {slots.length > 1 ? '(Choose one)' : ''}:
                                </Label>
                                <div className="grid gap-2">
                                  {slots.map((slot) => {
                                    const isSelected = selectedSlotForGame?.slotId === slot.id;
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
                                            type="radio"
                                            name="game-slot-selection"
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
