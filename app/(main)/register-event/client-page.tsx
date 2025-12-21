"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addMonths, differenceInMonths, differenceInDays } from "date-fns"
import { cn, formatDateForAPI } from "@/lib/utils"
import { createPendingBooking } from "@/services/pendingBookingServices"
import { getEventWithVenueDetails } from "@/services/bookingService"
import { Calendar as CalendarIcon, ArrowLeft, ChevronRight, MapPin, AlertTriangle, AlertCircle, Loader2, Info, CheckCircle } from "lucide-react"
import { useState, useEffect, useMemo, useCallback, memo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

// Lazy load components that aren't needed on initial render
const AddOnSelector = dynamic(() => import("@/components/add-on-selector"), {
  loading: () => <div className="p-4 text-center">Loading add-ons...</div>,
  ssr: false
})

import { fetchAllAddOnsFromExternalApi } from "@/services/addOnService"
import type { AddOn } from "@/types"
import type { AddOn as AddOnType } from "@/types"
// OLD IMPORTS - No longer using these separate API calls
// import { getAllCities } from "@/services/cityService"
// import { getEventsByCityId, getGamesByAgeAndEvent, EventListItem, EventGameListItem } from "@/services/eventService"
import { Game } from "@/services/gameService"
import { registerBooking, formatBookingDataForAPI } from "@/services/bookingRegistrationService"
import { initiatePhonePePayment } from "@/services/paymentService"
import { getPromoCodesByEventAndGames, validatePromoCodePreview } from "@/services/promoCodeService"

import { validateGameData } from "@/utils/gameIdValidation"

// Helper function to format price.
const formatPrice = (price: number | string | undefined) => {
  // Convert price to a number and handle undefined/NaN cases
  const numericPrice = typeof price === 'string' ? parseFloat(price) : Number(price || 0);
  
  // Check if the result is a valid number
  if (isNaN(numericPrice)) {
    console.warn('Invalid price value:', price);
    return '₹0';
  }
  
  // Round to 2 decimal places and remove trailing zeros
  const roundedPrice = Math.round(numericPrice * 100) / 100;
  
  // If it's a whole number, don't show decimal places
  if (roundedPrice === Math.floor(roundedPrice)) {
    return `₹${roundedPrice.toLocaleString('en-IN')}`;
  }
  
  // Otherwise format with exactly 2 decimal places
  return `₹${roundedPrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

// Cities will be fetched from API

export default function RegisterEventClientPage() {
  const router = useRouter()
  const [dob, setDob] = useState<Date>()
  const [eventDate, setEventDate] = useState<Date>(new Date("2025-10-26"))
  const [childAgeMonths, setChildAgeMonths] = useState<number | null>(null)
  const [selectedCity, setSelectedCity] = useState<string>("") // Empty string initially
  const [selectedEventType, setSelectedEventType] = useState<string>("") // New state for event type dropdown
  const [selectedEvent, setSelectedEvent] = useState<string>("")
  const [eligibleEvents, setEligibleEvents] = useState<
    Array<{
      id: string;
      title: string;
      description: string;
      minAgeMonths: number;
      maxAgeMonths: number;
      date: string;
      time: string;
      venue: string;
      city: string;
      price: number;
      image: string;
    }>
  >([])
  const [availableDates, setAvailableDates] = useState<Date[]>([])
  const [step, setStep] = useState(1)
  const [parentName, setParentName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [childName, setChildName] = useState<string>('')
  const [gender, setGender] = useState<string>('female')
  const [schoolName, setSchoolName] = useState<string>('')
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false)
  const [selectedAddOns, setSelectedAddOns] = useState<{ addOn: AddOnType; quantity: number; variantId?: string }[]>([])
  const [cities, setCities] = useState<{ id: string | number; name: string }[]>([])
  const [isLoadingCities, setIsLoadingCities] = useState<boolean>(true) // Start as true to show loading state immediately
  const [cityError, setCityError] = useState<string | null>(null)
  const [apiEvents, setApiEvents] = useState<EventListItem[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false)
  const [eventError, setEventError] = useState<string | null>(null)
  const [apiAddOns, setApiAddOns] = useState<AddOnType[]>([])
  const [isLoadingAddOns, setIsLoadingAddOns] = useState<boolean>(false)
  const [addOnError, setAddOnError] = useState<string | null>(null)
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null)
  const [games, setGames] = useState<Game[]>([])
  const [isLoadingGames, setIsLoadingGames] = useState<boolean>(false)
  const [gameError, setGameError] = useState<string | null>(null)
  const [eligibleGames, setEligibleGames] = useState<Game[]>([])
  const [selectedGames, setSelectedGames] = useState<Array<{gameId: number; slotId: number}>>([])
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false)
  const [bookingReference, setBookingReference] = useState<string | null>(null)
  
  // Promocode related states
  const [availablePromocodes, setAvailablePromocodes] = useState<any[]>([])
  const [isLoadingPromocodes, setIsLoadingPromocodes] = useState<boolean>(false)
  const [promocodeError, setPromocodeError] = useState<string | null>(null)
  const [promoCode, setPromoCode] = useState<string>('')
  const [appliedPromoCode, setAppliedPromoCode] = useState<any | null>(null)
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [isApplyingPromocode, setIsApplyingPromocode] = useState<boolean>(false)

  // State for booking info data
  const [bookingInfoData, setBookingInfoData] = useState<any[]>([])
  const [isLoadingBookingInfo, setIsLoadingBookingInfo] = useState<boolean>(false)
  const [bookingInfoError, setBookingInfoError] = useState<string | null>(null)

  // Get authentication state from auth context
  const { isAuthenticated, user } = useAuth()
  
  // Fetch booking info (cities with events, games, and slots)
  useEffect(() => {
    async function loadBookingInfo() {
      setIsLoadingBookingInfo(true);
      setIsLoadingCities(true);
      setBookingInfoError(null);
      setCityError(null);
      try {
        console.log('Fetching booking info from API...');
        const response = await fetch('/api/city/booking-info/list');
        
        if (!response.ok) {
          throw new Error('Failed to fetch booking information');
        }
        
        const result = await response.json();
        console.log('Booking info data:', result);
        console.log('📊 Data structure check:');
        if (result.data && result.data.length > 0) {
          console.log('  - First city:', result.data[0].city_name);
          console.log('  - Events in first city:', result.data[0].events?.length || 0);
          if (result.data[0].events && result.data[0].events.length > 0) {
            console.log('  - First event:', result.data[0].events[0].title);
            console.log('  - Games in first event:', result.data[0].events[0].games_with_slots?.length || 0);
            if (result.data[0].events[0].games_with_slots && result.data[0].events[0].games_with_slots.length > 0) {
              console.log('  - First game:', result.data[0].events[0].games_with_slots[0]);
            }
          }
        }
        
        if (result.success && result.data) {
          setBookingInfoData(result.data);
          
          // Extract cities for dropdown
          const citiesFromData = result.data.map((city: any) => ({
            id: city.id,
            name: city.city_name
          }));
          setCities(citiesFromData);
          console.log('Cities extracted:', citiesFromData);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Failed to load booking info:', error);
        setBookingInfoError('Failed to load booking information. Please try again.');
        setCityError('Failed to load cities. Please try again.');
      } finally {
        setIsLoadingBookingInfo(false);
        setIsLoadingCities(false);
      }
    }
    
    loadBookingInfo();
  }, [])
  
  // Fetch add-ons from external API
  useEffect(() => {
    async function loadAddOns() {
      setIsLoadingAddOns(true);
      setAddOnError(null);
      try {
        const addOnData = await fetchAllAddOnsFromExternalApi();
        console.log('Fetched add-ons from external API:', addOnData);
        
        // Transform the API response to match the AddOn type
        const transformedAddOns = addOnData.map(addon => ({
          ...addon,
          id: addon.id.toString(), // Convert ID to string to match AddOn type
          name: addon.name || '',
          description: addon.description || '',
          price: parseFloat(String(addon.price)) || 0, // Ensure price is a number
          images: Array.isArray(addon.images) ? addon.images : [],
          category: addon.category as 'meal' | 'merchandise' | 'service' | 'other',
          isActive: Boolean(addon.is_active),
          availableForEvents: [],
          hasVariants: Boolean(addon.has_variants),
          variants: (addon.variants || []).map(variant => ({
            id: String(variant.id || ''), // Ensure ID is a string
            name: String(variant.name || 'Variant'),
            price: (parseFloat(String(variant.price_modifier)) || 0) + (parseFloat(String(addon.price)) || 0),
            price_modifier: parseFloat(String(variant.price_modifier)) || 0,
            addon_id: addon.id,
            attributes: {}, // Default empty attributes
            stockQuantity: Number(variant.stock_quantity) || 0,
            sku: String(variant.sku || `variant-${variant.id || 'default'}`)
          })),
          stockQuantity: Number(addon.stock_quantity) || 0,
          sku: String(addon.sku || ''),
          bundleDiscount: {
            minQuantity: Number(addon.bundle_min_quantity) || 1,
            discountPercentage: parseFloat(String(addon.bundle_discount_percentage)) || 0
          },
          minQuantity: Number(addon.bundle_min_quantity) || 1,
          discountPercentage: parseFloat(String(addon.bundle_discount_percentage)) || 0,
          createdAt: addon.created_at || new Date().toISOString(),
          updatedAt: addon.updated_at || new Date().toISOString()
        }));
        
        setApiAddOns(transformedAddOns as AddOnType[]);
      } catch (error) {
        console.error('Failed to load add-ons:', error);
        setAddOnError('Failed to load add-ons. Please try again.');
      } finally {
        setIsLoadingAddOns(false);
      }
    }
    
    loadAddOns();
  }, [])

  // Calculate child's age based on event date
  const calculateAge = (birthDate: Date) => {
    const ageInMonths = differenceInMonths(eventDate, birthDate)
    return ageInMonths
  }

  // Calculate total price of selected games with memoization to prevent unnecessary recalculations
  const calculateGamesTotal = useCallback(() => {
    if (!selectedGames || selectedGames.length === 0) {
      return 0;
    }
    
    // Calculate total based on eligible games prices
    let total = 0;
    
    for (const selection of selectedGames) {
      // Find the slot in eligible games by slot ID
      const game = eligibleGames.find(g => g.id === selection.slotId);
      
      // Get price from the game object - prioritize slot_price from event_games_with_slots table
      let gamePrice = 0;
      if (game) {
        // Parse price values as numbers since they might be stored as strings
        // Fixed: Use slot_price first (from event_games_with_slots table), then fallback to custom_price
        if (game.slot_price) {
          gamePrice = parseFloat(game.slot_price.toString());
        } else if (game.custom_price) {
          gamePrice = parseFloat(game.custom_price.toString());
        }
      }
      
      total += gamePrice;
    }
    
    return total;
  }, [selectedGames, eligibleGames]); // Recalculate only when these dependencies change

  // Calculate total price including add-ons and promocode discount (GST removed)
  const calculateTotalPrice = () => {
    const gamesTotal = calculateGamesTotal();
    const addOnsTotal = calculateAddOnsTotal();
    const subtotal = gamesTotal + addOnsTotal;
    
    // Apply promocode discount if available
    let discountedSubtotal = subtotal;
    if (appliedPromoCode) {
      discountedSubtotal = subtotal - discountAmount;
    }
    
    // Ensure final total is rounded to 2 decimal places
    return parseFloat(discountedSubtotal.toFixed(2));
  }

  // GST calculation removed as per request

  // Calculate add-ons subtotal
  const calculateAddOnsTotal = () => {
    const total = selectedAddOns.reduce((sum, item) => {
      let price = parseFloat(String(item.addOn.price)) || 0;

      // Check if this is a variant with a different price
      if (item.variantId && item.addOn.hasVariants && item.addOn.variants) {
        const variant = item.addOn.variants.find((v: any) => v.id === item.variantId);
        if (variant) {
          // First try to use the variant's direct price if available
          if (typeof variant.price === 'number') {
            price = variant.price;
          } 
          // Then try to parse the price as a number if it's a string
          else if (typeof variant.price === 'string' && !isNaN(parseFloat(variant.price))) {
            price = parseFloat(variant.price);
          }
          // Finally, try to use the price modifier if available
          else if (typeof variant.price_modifier === 'number') {
            price = parseFloat(String(item.addOn.price)) + variant.price_modifier;
          }
          else if (typeof variant.price_modifier === 'string' && !isNaN(parseFloat(variant.price_modifier))) {
            price = parseFloat(String(item.addOn.price)) + parseFloat(variant.price_modifier);
          }
        }
      }

      // Apply bundle discount if applicable
      if (item.addOn.bundleDiscount && item.quantity >= item.addOn.bundleDiscount.minQuantity) {
        const discountMultiplier = 1 - (item.addOn.bundleDiscount.discountPercentage / 100);
        price = price * discountMultiplier;
      }

      // Round to 2 decimal places for each item's total
      const itemTotal = price * item.quantity;
      return sum + parseFloat(itemTotal.toFixed(2));
    }, 0);
    
    // Round final total to 2 decimal places
    return parseFloat(total.toFixed(2));
  }

  // Handle DOB change
  const handleDobChange = (date: Date | undefined) => {
    console.log("=== DOB CHANGE HANDLER CALLED ===");
    console.log("Previous DOB:", dob);
    console.log("New DOB:", date);
    console.log("Date type:", typeof date);
    console.log("Date string:", date?.toString());
    console.log("Date ISO:", date?.toISOString());

    // Additional validation and debugging
    if (date) {
      const isValidDate = date instanceof Date && !isNaN(date.getTime());
      console.log("Is valid date:", isValidDate);
      if (isValidDate) {
        console.log("Formatted for API:", formatDateForAPI(date));
      }
    }

    setDob(date)

    // Log the state after setting (this will show in the next render)
    console.log("DOB state will be set to:", date);

    if (date) {
      // Calculate child's age in months based on the event date
      const ageInMonths = calculateAge(date)
      setChildAgeMonths(ageInMonths)

      console.log(`Child's age: ${ageInMonths} months`)
      console.log("Formatted DOB for API:", formatDateForAPI(date));

      // If an event is already selected, filter games by age from booking info
      if (selectedEventType) {
        console.log('🔍 Searching for games in selectedEventType:', selectedEventType);
        console.log('📋 Available apiEvents:', apiEvents);
        
        const selectedApiEvent = apiEvents.find(event => event.event_title === selectedEventType);
        console.log('🎯 Selected API event:', selectedApiEvent);
        
        if (selectedApiEvent) {
          const gamesWithSlots = selectedApiEvent.games_with_slots || [];
          console.log('🎮 Total games_with_slots available:', gamesWithSlots.length);
          console.log('🎮 Games data structure:', gamesWithSlots);
          
          if (gamesWithSlots.length === 0) {
            console.warn('⚠️ No games_with_slots found in selected event!');
            setEligibleGames([]);
            return;
          }
          
          // Filter games by child age
          const eligibleGamesForAge = gamesWithSlots.filter((game: any) => {
            const minAge = game.min_age || 0;
            const maxAge = game.max_age || 999;
            const isEligible = ageInMonths >= minAge && ageInMonths <= maxAge;
            console.log(`  Game "${game.game_name || game.custom_title}" - Age range: ${minAge}-${maxAge}, Child: ${ageInMonths}, Eligible: ${isEligible}`);
            return isEligible;
          });

          console.log(`✅ Eligible games after age filter: ${eligibleGamesForAge.length}`);

          // Map games to the format expected by the UI
          const gamesForUI = eligibleGamesForAge.map((slot: any) => {
            const mappedGame = {
              id: slot.slot_id,
              game_id: slot.game_id,
              game_name: slot.game_name || slot.custom_title,
              game_title: slot.game_name || slot.custom_title, // Add game_title for UI compatibility
              game_description: slot.game_description || slot.custom_description,
              game_image: slot.game_image,
              slot_price: slot.price,
              custom_price: slot.price,
              start_time: slot.start_time,
              end_time: slot.end_time,
              max_participants: slot.max_participants,
              booked_count: slot.booked_count,
              available_slots: slot.available_slots,
              is_available: slot.is_available,
              min_age: slot.min_age,
              max_age: slot.max_age,
              duration_minutes: slot.duration_minutes,
              game_duration_minutes: slot.duration_minutes, // Add game_duration_minutes for UI compatibility
              categories: slot.categories,
              custom_title: slot.custom_title,
              custom_description: slot.custom_description,
              note: slot.note
            };
            console.log('📌 Mapped game for UI:', mappedGame);
            return mappedGame;
          });

          setEligibleGames(gamesForUI);
          console.log(`✅ Set ${gamesForUI.length} eligible games for age ${ageInMonths} months`);
          console.log('🎯 Final eligible games:', gamesForUI);
        } else {
          console.warn('⚠️ Selected API event not found!');
        }
      } else {
        console.log('ℹ️ No event type selected yet');
      }
    } else {
      // Reset age if DOB is cleared
      setChildAgeMonths(null)
      console.log("DOB cleared, age reset to null");
    }
  }

  // Handle event date change when selecting from available dates
  const handleEventDateChange = (date: Date) => {
    setEventDate(date)

    // Recalculate child's age based on the new event date
    if (dob) {
      const ageInMonths = differenceInMonths(date, dob)
      setChildAgeMonths(ageInMonths)
    }
  }

  // ==================================================================================
  // OLD FUNCTION - NO LONGER USED - Using booking-info API instead
  // This function previously fetched events from a separate API endpoint
  // Now all data comes from /api/city/booking-info/list in one call
  // ==================================================================================
  /*
  const fetchEventsForCity = useCallback(async (cityId: number, cityName: string) => {
    // ... old implementation removed ...
  }, []);
  */

  // Handle city change using booking info data
  const handleCityChange = async (city: string) => {
    setSelectedCity(city)
    setSelectedEventType("") // Reset event type when city changes
    setSelectedEvent("") // Reset selected event when city changes
    setEligibleEvents([]) // Reset eligible events
    setEligibleGames([]) // Reset eligible games
    setSelectedGames([]) // Reset selected games

    // Find city from booking info data
    const cityData = bookingInfoData.find(c => c.city_name === city);
    if (!cityData) {
      console.log('City not found in booking info data');
      return;
    }

    setSelectedCityId(cityData.id);
    console.log('🏙️ Selected city:', cityData.city_name);
    console.log('📊 City has', cityData.total_events, 'events');
    console.log('📋 Full city data:', cityData);

    // Extract events from booking info data
    if (cityData.events && cityData.events.length > 0) {
      console.log('✅ Processing', cityData.events.length, 'events from booking info');
      // Map events to API events format for compatibility
      const eventsFromBookingInfo = cityData.events.map((event: any) => ({
        event_id: event.id,
        event_title: event.title,
        event_description: event.description,
        event_date: event.event_date,
        city_id: event.city_id,
        city_name: cityData.city_name,
        venue_name: event.venue_name,
        venue_address: event.venue_address,
        venue_capacity: event.venue_capacity,
        games_with_slots: event.games_with_slots || []
      }));

      setApiEvents(eventsFromBookingInfo);

      // Set eligible events for display
      const eligibleEventsMapped = eventsFromBookingInfo.map((event: any) => ({
        id: event.event_id.toString(),
        title: event.event_title,
        description: event.event_description,
        minAgeMonths: 5,
        maxAgeMonths: 84,
        date: event.event_date.split('T')[0],
        time: "9:00 AM - 8:00 PM",
        venue: event.venue_name || "Venue TBD",
        city: cityData.city_name,
        price: 1800,
        image: "/images/baby-crawling.jpg"
      }));

      setEligibleEvents(eligibleEventsMapped);

      // Get unique dates
      const dates = eligibleEventsMapped.map((event: any) => new Date(event.date));
      const uniqueDates = Array.from(new Set(dates.map(date => date.toISOString())))
        .map(dateStr => new Date(dateStr));
      setAvailableDates(uniqueDates);

      if (uniqueDates.length > 0) {
        setEventDate(uniqueDates[0]);
      }
    } else {
      setApiEvents([]);
      setEligibleEvents([]);
      setAvailableDates([]);
    }
  }

  // Handle event type change using booking info data
  const handleEventTypeChange = async (eventType: string) => {
    setSelectedEventType(eventType)
    setSelectedEvent("") // Reset selected event when event type changes
    setEligibleGames([]) // Reset games when event type changes
    setSelectedGames([]) // Reset selected games when event type changes

    // Reset promocode when event changes
    setPromoCode('')
    setAppliedPromoCode(null)
    setDiscountAmount(0)
    setAvailablePromocodes([])

    // Find the selected event from API events
    const selectedApiEvent = apiEvents.find(event => event.event_title === eventType);

    if (selectedApiEvent) {
      console.log("🎯 Selected event:", selectedApiEvent);
      console.log("🎮 Event has games_with_slots:", selectedApiEvent.games_with_slots?.length || 0, "games");

      // Create event object for display
      const mockEvent = {
        id: selectedApiEvent.event_id.toString(),
        title: selectedApiEvent.event_title,
        description: selectedApiEvent.event_description,
        minAgeMonths: 5,
        maxAgeMonths: 84,
        date: selectedApiEvent.event_date.split('T')[0],
        time: "9:00 AM - 8:00 PM",
        venue: selectedApiEvent.venue_name || "Venue TBD",
        city: selectedApiEvent.city_name,
        price: 1800,
        image: "/images/baby-crawling.jpg",
      };

      setEligibleEvents([mockEvent]);
      setSelectedEvent(mockEvent.id);

      // Set event date
      if (selectedApiEvent.event_date) {
        const eventDate = new Date(selectedApiEvent.event_date);
        setEventDate(eventDate);
        setAvailableDates([eventDate]);
      }

      // If DOB is set, filter games by age
      if (dob && childAgeMonths !== null) {
        console.log('🎂 DOB is set, filtering games for age:', childAgeMonths);
        console.log('📋 Selected API event has games_with_slots:', selectedApiEvent.games_with_slots);
        
        // Get games from booking info data
        const gamesWithSlots = selectedApiEvent.games_with_slots || [];
        console.log('🎮 Total games available in event:', gamesWithSlots.length);
        
        if (gamesWithSlots.length === 0) {
          console.warn('⚠️ No games found in selected event!');
          setEligibleGames([]);
          return;
        }
        
        // Filter games by child age
        const eligibleGamesForAge = gamesWithSlots.filter((game: any) => {
          const minAge = game.min_age || 0;
          const maxAge = game.max_age || 999;
          const isEligible = childAgeMonths >= minAge && childAgeMonths <= maxAge;
          console.log(`  🎯 Game "${game.game_name || game.custom_title}" - Age: ${minAge}-${maxAge}, Child: ${childAgeMonths}, Match: ${isEligible}`);
          return isEligible;
        });

        console.log(`✅ ${eligibleGamesForAge.length} games match age criteria`);

        // Map games to the format expected by the UI
        const gamesForUI = eligibleGamesForAge.map((slot: any) => {
          const mappedGame = {
            id: slot.slot_id,
            game_id: slot.game_id,
            game_name: slot.game_name || slot.custom_title,
            game_title: slot.game_name || slot.custom_title, // Add game_title for UI compatibility
            game_description: slot.game_description || slot.custom_description,
            game_image: slot.game_image,
            slot_price: slot.price,
            custom_price: slot.price,
            start_time: slot.start_time,
            end_time: slot.end_time,
            max_participants: slot.max_participants,
            booked_count: slot.booked_count,
            available_slots: slot.available_slots,
            is_available: slot.is_available,
            min_age: slot.min_age,
            max_age: slot.max_age,
            duration_minutes: slot.duration_minutes,
            game_duration_minutes: slot.duration_minutes, // Add game_duration_minutes for UI compatibility
            categories: slot.categories,
            custom_title: slot.custom_title,
            custom_description: slot.custom_description,
            note: slot.note
          };
          console.log('  📌 Mapped game:', mappedGame.game_name, 'Slot:', mappedGame.start_time, '-', mappedGame.end_time);
          return mappedGame;
        });

        setEligibleGames(gamesForUI);
        console.log(`✅ Set ${gamesForUI.length} eligible games in state`);
        console.log('🎯 Complete eligible games list:', gamesForUI);
      } else {
        console.log('ℹ️ DOB or childAgeMonths not set yet');
      }
    } else {
      setEligibleEvents([]);
    }
  }
  
  // ==================================================================================
  // OLD FUNCTION - NO LONGER USED - Using booking-info API instead
  // This function previously fetched games from a separate API endpoint by age
  // Now all game data with age restrictions comes from /api/city/booking-info/list
  // Games are filtered client-side based on child's age from the booking-info data
  // ==================================================================================
  /*
  const fetchGamesByEventAndAge = async (eventId: number, childAge: number) => {
    // ... old implementation removed ...
  }
  */

  // Handle game selection with slot selection - SINGLE SELECTION ONLY
  const handleGameSelection = (slotId: number) => {
    // Find the game associated with this slot
    const selectedSlot = eligibleGames.find((g) => g.id === slotId);
    if (!selectedSlot) return;

    const gameId = selectedSlot.game_id;

    // SINGLE SELECTION LOGIC: Only allow one game/slot selection at a time
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

      // Reset promocode when games change
      setPromoCode('');
      setAppliedPromoCode(null);
      setDiscountAmount(0);

      // Fetch applicable promocodes for the new game selection
      if (newSelectedGames.length > 0 && selectedEventType) {
        const selectedApiEvent = apiEvents.find((event) => event.event_title === selectedEventType);
        if (selectedApiEvent) {
          // Get unique game IDs for promo code API (should only be one now)
          const gameIdsForPromo = [...new Set(newSelectedGames.map((selection) => selection.gameId))];

          if (gameIdsForPromo.length > 0) {
            fetchApplicablePromocodes(selectedApiEvent.event_id, gameIdsForPromo);
          }
        }
      } else {
        setAvailablePromocodes([]);
      }

      return newSelectedGames;
    });

    // Log selection state for debugging
    console.log(`Selected slot ID: ${slotId} for game ID: ${gameId} (SINGLE SELECTION)`);
    console.log("Selected slot:", selectedSlot);
  };

  // Get unique event titles from API events
  const getUniqueEventTypes = () => {
    if (apiEvents.length === 0) return []

    // Extract event titles from the API response
    const eventTitles = apiEvents.map(event => event.event_title);
    return Array.from(new Set(eventTitles));
  }

  // Get selected event details from eligible events
  const selectedEventDetails = eligibleEvents.find((event) => event.id === selectedEvent);

  // Handle registration - now focuses on authentication check and navigation
  const handleRegistration = async () => {
    if (!isAuthenticated) {
      // Save complete registration data to sessionStorage including add-ons
      console.log("=== SAVING REGISTRATION DATA TO SESSION STORAGE ===");
      console.log("Current DOB state:", dob);
      console.log("DOB type:", typeof dob);
      console.log("DOB toString:", dob?.toString());
      console.log("DOB toISOString:", dob?.toISOString());

      const formattedDob = dob ? formatDateForAPI(dob) : undefined;
      console.log("Formatted DOB for storage:", formattedDob);

      const registrationData = {
        parentName,
        email,
        phone,
        childName,
        schoolName,
        dob: formattedDob, // Store as YYYY-MM-DD format
        gender,
        eventDate: eventDate.toISOString(),
        selectedCity,
        selectedEventType,
        selectedEvent,
        selectedGames,
        childAgeMonths,
        availableDates: availableDates.map(date => date.toISOString()),
        step: 1, // Current step
        termsAccepted
      }
      sessionStorage.setItem('registrationData', JSON.stringify(registrationData))

      // Save add-ons to session storage
      saveDataToSession()

      // Show user-friendly message about login requirement
      alert("Please log in to continue with your registration. Your progress will be saved.")

      // Redirect to login with return URL that includes step information
      router.push(`/login?returnUrl=${encodeURIComponent('/register-event?step=payment')}`)
    } else {
      // User is authenticated, proceed to add-ons step
      saveDataToSession()
      setStep(2)
    }
  }

  // Handle authentication check and proceed to payment
  const handleProceedToPayment = async () => {
    if (!isAuthenticated) {
      // Save complete registration data including current step
      const registrationData = {
        parentName,
        email,
        phone,
        childName,
        schoolName,
        dob: dob ? formatDateForAPI(dob) : undefined, // Store as YYYY-MM-DD format
        gender,
        eventDate: eventDate.toISOString(),
        selectedCity,
        selectedEventType,
        selectedEvent,
        selectedGames,
        childAgeMonths,
        availableDates: availableDates.map(date => date.toISOString()),
        step: 3, // Payment step
        termsAccepted
      }
      sessionStorage.setItem('registrationData', JSON.stringify(registrationData))

      // Save add-ons and game data to session storage
      saveDataToSession()

      // Show user-friendly message about login requirement
      alert("Please log in to proceed with payment. Your registration details will be saved.")

      // Redirect to login with return URL that includes payment step
      router.push(`/login?returnUrl=${encodeURIComponent('/register-event?step=payment')}`)
    } else {
      // User is authenticated, proceed to payment step
      saveDataToSession()
      setStep(3)
    }
  }

  // Save add-ons and game data to session storage
  const saveDataToSession = () => {
    // Save add-ons data
    const addOnsData = selectedAddOns.map(item => ({
      addOnId: item.addOn.id,
      quantity: item.quantity,
      variantId: item.variantId
    }))
    sessionStorage.setItem('selectedAddOns', JSON.stringify(addOnsData))
    
    // Save eligible games data to preserve price information
    sessionStorage.setItem('eligibleGames', JSON.stringify(eligibleGames))
    console.log('Saved eligible games to session:', eligibleGames)
  }

  // Handle continue to payment - now includes authentication check
  const handleContinueToPayment = () => {
    handleProceedToPayment()
  }

  // Fetch applicable promocodes for selected event and games
  const fetchApplicablePromocodes = async (eventId: number, gameIds: number[]) => {
    if (!eventId || !gameIds.length) return;
    
    try {
      setIsLoadingPromocodes(true);
      setPromocodeError(null);
      
      // Reset any applied promocode when fetching new ones
      setPromoCode('');
      setAppliedPromoCode(null);
      setDiscountAmount(0);
      
      // Fetch promocodes from the API
      const promocodes = await getPromoCodesByEventAndGames(eventId, gameIds);
      console.log('Fetched promocodes:', promocodes);
      
      // Filter out any invalid promocodes and update state
      const validPromocodes = promocodes.filter((code) => {
        if (!code || typeof code !== 'object' || !('promo_code' in code) || !code.promo_code) {
          return false;
        }
        
        // Check if promocode is active
        if (code.is_active === false) {
          return false;
        }
        
        // Check if promocode is not expired
        try {
          const validTo = new Date(code.valid_to);
          return validTo >= new Date();
        } catch (e) {
          console.error('Invalid date format for promocode:', code.promo_code, e);
          return false;
        }
      });
      
      setAvailablePromocodes(validPromocodes);
      
      if (validPromocodes.length === 0) {
        console.log('No valid promocodes available for the selected games');
      }
    } catch (error) {
      console.error('Error fetching promocodes:', error);
      setPromocodeError('Failed to load promocodes');
      setAvailablePromocodes([]);
    } finally {
      setIsLoadingPromocodes(false);
    }
  };
  
  // Handle applying a promocode
  const handleApplyPromoCode = async () => {
    if (!promoCode) return;
    
    try {
      setIsApplyingPromocode(true);
      setPromocodeError(null);
      
      // Get the selected event ID
      const selectedApiEvent = apiEvents.find(event => event.event_title === selectedEventType);
      if (!selectedApiEvent) {
        throw new Error('Selected event not found');
      }
      
      // Get the total amount before discount
      const gamesTotal = calculateGamesTotal();
      const addOnsTotal = calculateAddOnsTotal();
      const subtotal = gamesTotal + addOnsTotal;
      
      // Validate the promocode - use game IDs array (not slot IDs)
      const gameIds = selectedGames.map(selection => selection.gameId);
      const result = await validatePromoCodePreview(
        promoCode,
        selectedApiEvent.event_id,
        gameIds,
        subtotal
      );
      
      console.log('Promocode validation result:', result);
      
      if (result.isValid) {
        // Find the promocode details from available promocodes
        const promocodeDetails = availablePromocodes.find(code => code.promo_code === promoCode);
        
        if (promocodeDetails) {
          setAppliedPromoCode(promocodeDetails);
          setDiscountAmount(result.discountAmount);
        } else {
          // If promocode details not found in available promocodes, create a basic object
          setAppliedPromoCode({
            promo_code: promoCode,
            type: result.discountAmount === subtotal * (parseInt(promoCode.split('%')[0]) / 100) ? 'percentage' : 'fixed',
            value: result.discountAmount === subtotal * (parseInt(promoCode.split('%')[0]) / 100) ? parseInt(promoCode.split('%')[0]) : result.discountAmount
          });
          setDiscountAmount(result.discountAmount);
        }
      } else {
        setPromocodeError(result.message || 'Invalid promocode');
        setAppliedPromoCode(null);
        setDiscountAmount(0);
      }
    } catch (error: any) {
      console.error('Error applying promocode:', error);
      setPromocodeError(error.message || 'Failed to apply promocode');
      setAppliedPromoCode(null);
      setDiscountAmount(0);
    } finally {
      setIsApplyingPromocode(false);
    }
  };
  
  // Handle removing an applied promocode
  const handleRemovePromoCode = () => {
    setPromoCode('');
    setAppliedPromoCode(null);
    setDiscountAmount(0);
    setPromocodeError(null);
  };
  
  // Handle payment initiation - redirect to PhonePe first, booking will be created after successful payment
  const handlePayment = async () => {
    try {
      setIsProcessingPayment(true)
      setPaymentError(null)

      console.log("=== PAYMENT INITIATION STARTED ===")
      console.log("User authenticated:", isAuthenticated)
      console.log("User object:", user)
      console.log("Selected games:", selectedGames)
      console.log("Selected event type:", selectedEventType)
      console.log("Parent name:", parentName)
      console.log("Email:", email)
      console.log("Phone:", phone)
      console.log("Child name:", childName)

      // Mobile browser compatibility check
      if (typeof window !== 'undefined') {
        console.log("=== MOBILE COMPATIBILITY CHECK ===")
        console.log("User Agent:", navigator.userAgent)
        console.log("Screen size:", `${window.innerWidth}x${window.innerHeight}`)
        console.log("Touch support:", 'ontouchstart' in window)
        console.log("Crypto API:", window.crypto && window.crypto.subtle ? 'Available' : 'Not available')

        // Check if this is a mobile device
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        console.log("Mobile device detected:", isMobileDevice)

        if (isMobileDevice && (!window.crypto || !window.crypto.subtle)) {
          console.warn("⚠️ Mobile device with limited crypto support detected - using fallback implementation")
        }
      }

      // SINGLE GAME VALIDATION: Ensure exactly one game is selected
      if (selectedGames.length !== 1) {
        throw new Error(`Invalid game selection. Expected exactly 1 game, but found ${selectedGames.length}. Please select exactly one game.`)
      }

      // Pre-validation checks with user-friendly error messages
      if (!isAuthenticated || !user?.user_id) {
        throw new Error("Please log in to complete your payment. Your registration data will be saved.")
      }

      if (!parentName.trim()) {
        throw new Error("Please enter your full name to continue.")
      }

      if (!email.trim()) {
        throw new Error("Please enter your email address to continue.")
      }

      if (!phone.trim()) {
        throw new Error("Please enter your mobile number to continue.")
      }

      if (!childName.trim()) {
        throw new Error("Please enter your child's name to continue.")
      }

      // Add DOB validation
      if (!dob) {
        throw new Error("Please select your child's date of birth to continue.")
      }

      console.log("=== DOB VALIDATION DEBUG ===");
      console.log("DOB state:", dob);
      console.log("DOB type:", typeof dob);
      console.log("DOB toString:", dob?.toString());
      console.log("DOB toISOString:", dob?.toISOString());
      console.log("Formatted DOB:", formatDateForAPI(dob));

      // Note: Game selection validation already handled above (exactly 1 game required)
      if (false) { // Unreachable code - keeping structure for safety
        throw new Error("Please select at least one game for your child to participate in.")
      }

      if (!selectedEventType) {
        throw new Error("Please select an event to continue.")
      }

      console.log("✅ Pre-validation checks passed")

      // Get the selected game details with comprehensive logging
      console.log("=== GAME ID PROCESSING DEBUG ===")
      console.log("Selected slot IDs (for UI selection):", selectedGames)
      console.log("Eligible games:", eligibleGames.map(g => ({
        slot_id: g.id, // This is the slot_id used for selection
        game_id: g.game_id, // This is the actual game_id for API
        title: g.custom_title || g.game_title,
        time: `${g.start_time} - ${g.end_time}`
      })))

      // Filter out any undefined games to prevent errors
      const selectedGamesObj = selectedGames
        .map(selection => {
          const game = eligibleGames.find(game => game.id === selection.slotId)
          if (!game) {
            console.error(`❌ Game slot with ID ${selection.slotId} not found in eligible games!`)
          } else {
            console.log(`✅ Found game slot: Slot ID ${selection.slotId}, Game ID ${game.game_id}, Title: ${game.custom_title || game.game_title}`)
          }
          return game
        })
        .filter(game => game !== undefined);

      console.log("Selected games objects:", selectedGamesObj.map(g => ({ id: g?.id, title: g?.custom_title || g?.game_title })))

      if (selectedGamesObj.length === 0) {
        throw new Error("No valid games selected. Please select exactly one game.")
      }

      // SINGLE GAME VALIDATION: Ensure only one game is selected
      if (selectedGamesObj.length > 1) {
        throw new Error("Multiple games selected. Please select only one game per registration.")
      }

      if (selectedGamesObj.length !== selectedGames.length) {
        console.warn(`⚠️ Warning: ${selectedGames.length} games selected but only ${selectedGamesObj.length} found in eligible games`)
      }

      // Get the selected event details
      const selectedApiEvent = apiEvents.find(event => event.event_title === selectedEventType)
      if (!selectedApiEvent) {
        throw new Error("Selected event not found")
      }

      // Get the user ID from the auth context
      const userId = user?.user_id
      if (!userId) {
        throw new Error("User ID not found. Please log in again.")
      }

      // Prepare booking data for database storage
      // IMPORTANT: Extract actual game_id values for API, not slot_id values
      const gameIds = selectedGamesObj.map(game => game?.game_id).filter(Boolean)
      const gamePrices = selectedGamesObj.map(game => game?.slot_price || game?.custom_price || 0)
      const slotIds = selectedGamesObj.map(game => game?.id).filter(Boolean) // Keep slot IDs for reference

      console.log("=== BOOKING DATA PREPARATION ===")
      console.log("Slot IDs (selected by user):", slotIds)
      console.log("Game IDs (for API):", gameIds)
      console.log("Game prices for booking:", gamePrices)
      console.log("Event ID:", selectedApiEvent.event_id)

      // Use validation utility to ensure game data is correct
      const totalAmount = calculateTotalPrice()
      const validationResult = validateGameData(gameIds, gamePrices, totalAmount)

      if (!validationResult.isValid || validationResult.validGames.length === 0) {
        console.error("Game validation failed:", validationResult.errors)
        throw new Error("Invalid game selection. Please select valid games and try again.")
      }

      const validGameIds = validationResult.validGames.map(game => game.gameId)
      const validGamePrices = validationResult.validGames.map(game => game.gamePrice)

      console.log("Validated Game IDs:", validGameIds)
      console.log("Validated Game Prices:", validGamePrices)

      const bookingData = {
        userId,
        parentName,
        email,
        phone,
        childName,
        childDob: formatDateForAPI(dob!), // Store as YYYY-MM-DD format
        schoolName,
        gender,
        eventId: selectedApiEvent.event_id,
        // Store both slot IDs and game IDs for proper handling
        slotId: slotIds,  // Array of selected slot IDs (for reference)
        gameId: validGameIds,  // Array of actual game IDs (for API)
        gamePrice: validGamePrices,  // Array of game prices
        totalAmount: calculateTotalPrice(),
        paymentMethod: "PhonePe",
        termsAccepted,
        addOns: selectedAddOns.map(item => ({
          addOnId: item.addOn.id,
          quantity: item.quantity,
          variantId: item.variantId
        })),
        ...(appliedPromoCode && { promoCode: promoCode }),

        // Add rich event details for email
        eventTitle: selectedEventDetails?.title || selectedApiEvent.event_title,
        eventDate: selectedEventDetails?.date ? format(new Date(selectedEventDetails.date), "PPP") : 'TBD',
        eventVenue: selectedEventDetails?.venue || 'TBD',
        eventCity: selectedEventDetails?.city || selectedCity || 'TBD', // Use selectedCity as fallback

        // Add rich game details for email with enhanced slot timing information
        selectedGamesObj: selectedGamesObj.map(game => ({
          id: game?.id,
          game_id: game?.game_id,
          slot_id: game?.slot_id || game?.id, // Ensure slot_id is available
          custom_title: game?.custom_title,
          game_title: game?.game_title,
          custom_description: game?.custom_description,
          game_description: game?.game_description,
          start_time: game?.start_time,
          end_time: game?.end_time,
          // Enhanced timing information for email ticket
          slot_timing: `${game?.start_time} - ${game?.end_time}`,
          formatted_timing: game?.start_time && game?.end_time ?
            `${game.start_time} to ${game.end_time}` : 'Time TBD',
          slot_price: game?.slot_price,
          custom_price: game?.custom_price,
          max_participants: game?.max_participants,
          game_duration_minutes: game?.game_duration_minutes,
          // Additional formatted information for ticket
          display_title: game?.custom_title || game?.game_title || 'Game',
          display_description: game?.custom_description || game?.game_description || '',
          price_display: `₹${game?.slot_price || game?.custom_price || 0}`
        })),

        // Add a separate games_with_timings array for easy access in email templates
        games_with_timings: selectedGamesObj.map(game => ({
          game_name: game?.custom_title || game?.game_title || 'Game',
          slot_timing: `${game?.start_time} - ${game?.end_time}`,
          price: game?.slot_price || game?.custom_price || 0,
          duration: `${game?.game_duration_minutes || 0} minutes`
        }))
      }

      console.log("=== CREATING PENDING BOOKING RECORD ===")
      console.log("Selected city:", selectedCity)
      console.log("Selected event details city:", selectedEventDetails?.city)
      console.log("Event venue:", selectedEventDetails?.venue)
      console.log("=== DOB TRACKING IN REGISTRATION ===")
      console.log("Original DOB from form:", dob)
      console.log("DOB type:", typeof dob)
      console.log("DOB toString:", dob?.toString())
      console.log("DOB toISOString:", dob?.toISOString())
      console.log("Formatted DOB for booking:", bookingData.childDob)
      console.log("DOB format validation:", /^\d{4}-\d{2}-\d{2}$/.test(bookingData.childDob) ? "✅ Valid YYYY-MM-DD" : "❌ Invalid format")
      console.log("DOB matches expected format:", bookingData.childDob === "2024-07-01" ? "✅ Matches expected" : "❌ Does not match expected")
      console.log("Booking data for pending booking:", JSON.stringify(bookingData, null, 2))

      // Create pending booking record in database
      console.log("🔄 Creating pending booking record...")
      const pendingBookingResult = await createPendingBooking(bookingData)

      if (!pendingBookingResult.success || !pendingBookingResult.transactionId) {
        throw new Error(`Failed to create pending booking: ${pendingBookingResult.error}`)
      }

      const transactionId = pendingBookingResult.transactionId
      console.log("✅ Pending booking created with transaction ID:", transactionId)

      // Also store in localStorage as backup
      localStorage.setItem('nibog_booking_data', JSON.stringify({
        ...bookingData,
        transactionId,
        timestamp: new Date().getTime()
      }))

      console.log("✅ Booking data also stored in localStorage as backup")

      console.log("=== PHONEPE PAYMENT INITIATION ===")
      console.log("Transaction ID:", transactionId)
      console.log("User ID:", userId)
      console.log("Phone:", phone)
      console.log("Total Amount (₹):", totalAmount)

      // Initiate the payment with the generated transaction ID
      console.log("🚀 Calling initiatePhonePePayment...")
      const paymentUrl = await initiatePhonePePayment(
        transactionId, // Use the generated transaction ID
        userId,
        totalAmount,
        phone
      )

      console.log("✅ PhonePe payment URL received:", paymentUrl)
      console.log("🔄 Redirecting to PhonePe payment page...")

      // Don't remove registration data yet as we might need it if payment fails
      // We'll clear it after successful payment completion

      // Redirect to the PhonePe payment page
      window.location.href = paymentUrl
    } catch (error: any) {
      console.error("Error processing payment and booking:", error)

      // Provide more specific error messages with mobile-specific handling
      let errorMessage = "Failed to process payment and booking. Please try again."

      if (error.message?.includes("User ID not found")) {
        errorMessage = "Authentication expired. Please log in again to continue."
        // Redirect to login if authentication failed
        setTimeout(() => {
          router.push(`/login?returnUrl=${encodeURIComponent('/register-event?step=payment')}`)
        }, 2000)
      } else if (error.message?.includes("booking")) {
        errorMessage = "Failed to create booking. Please check your details and try again."
      } else if (error.message?.includes("payment") || error.message?.includes("hash generation")) {
        // Check if this is a mobile browser compatibility issue
        const isMobileDevice = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        if (isMobileDevice && error.message?.includes("digest")) {
          errorMessage = "Payment processing issue detected on mobile. Please try refreshing the page or use a different browser."
        } else {
          errorMessage = "Failed to initiate payment. Please try again or contact support."
        }
      } else if (error.message?.includes("digest") || error.message?.includes("crypto")) {
        errorMessage = "Browser compatibility issue detected. Please try refreshing the page or use a different browser."
      } else if (error.message) {
        errorMessage = error.message
      }

      setPaymentError(errorMessage)
    } finally {
      setIsProcessingPayment(false)
    }
    // After successful payment and booking, clear all registration/session data
    // (This runs after redirect, so also add this logic to the confirmation page if needed)
    if (bookingSuccess) {
      sessionStorage.removeItem('registrationData')
      sessionStorage.removeItem('selectedAddOns')
      sessionStorage.removeItem('eligibleGames')
      sessionStorage.removeItem('nibog_restored_city')
      sessionStorage.removeItem('nibog_restored_eventType')
      sessionStorage.removeItem('nibog_restored_childAgeMonths')
      localStorage.removeItem('nibog_booking_data')
    }
  }

  // ==================================================================================
  // OLD FUNCTION - NO LONGER USED - Using booking-info API instead
  // Previously fetched cities from separate /api/city/list endpoint
  // Now all cities come from /api/city/booking-info/list loaded in the loadBookingInfo useEffect
  // ==================================================================================
  /*
  const fetchCitiesData = useCallback(async () => {
    // ... old implementation removed ...
  }, [])
  */

  // ==================================================================================
  // OLD useEffect - NO LONGER USED - Cities loaded via booking-info API
  // The loadBookingInfo useEffect at the top of the component now handles fetching cities
  // ==================================================================================
  /*
  useEffect(() => {
    // ... old implementation removed ...
  }, [fetchCitiesData])
  */

  // Log authentication state for debugging
  useEffect(() => {
    console.log("Authentication state:", isAuthenticated)
  }, [isAuthenticated])

  // Load city from URL or saved registration data
  // --- Session restore logic ---
  useEffect(() => {
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const cityParam = urlParams.get('city')
    const stepParam = urlParams.get('step')

    // If city is provided in URL, set it
    if (cityParam) {
      setSelectedCity(cityParam)
    }

    // Try to load saved registration data
    const savedData = sessionStorage.getItem('registrationData')
    if (savedData) {
      try {
        const data = JSON.parse(savedData)

        console.log("=== RESTORING REGISTRATION DATA FROM SESSION STORAGE ===");
        console.log("Saved DOB data:", data.dob);
        console.log("Saved DOB type:", typeof data.dob);

        // Restore all form data
        setParentName(data.parentName || '')
        setEmail(data.email || '')
        setPhone(data.phone || '')
        setChildName(data.childName || '')
        setSchoolName(data.schoolName || '')

        // Handle DOB restoration with debugging
        if (data.dob) {
          const restoredDob = new Date(data.dob);
          console.log("Restored DOB object:", restoredDob);
          console.log("Restored DOB ISO:", restoredDob.toISOString());
          console.log("Restored DOB formatted:", formatDateForAPI(restoredDob));
          setDob(restoredDob);
        } else {
          console.log("No saved DOB found, setting to undefined");
          setDob(undefined);
        }

        setGender(data.gender || 'female')
        setSelectedCity(data.selectedCity || cityParam || '')
        setSelectedEventType(data.selectedEventType || '')
        setSelectedEvent(data.selectedEvent || '')
        setSelectedGames(data.selectedGames || [])
        setChildAgeMonths(data.childAgeMonths || null)
        setTermsAccepted(data.termsAccepted || false)

        // Restore event date
        if (data.eventDate) {
          setEventDate(new Date(data.eventDate))
        }

        // Load available dates from saved data
        if (data.availableDates && Array.isArray(data.availableDates)) {
          setAvailableDates(data.availableDates.map((dateStr: string) => new Date(dateStr)))
        }
        
        // Load eligible games with price information
        const savedEligibleGames = sessionStorage.getItem('eligibleGames')
        let eligibleGamesData: any[] = []
        if (savedEligibleGames) {
          try {
            eligibleGamesData = JSON.parse(savedEligibleGames)
            console.log('Restored eligible games from session:', eligibleGamesData)
            setEligibleGames(eligibleGamesData)
          } catch (error) {
            console.error('Error parsing saved eligible games data:', error)
          }
        }

        // Load saved add-ons if available
        const savedAddOns = sessionStorage.getItem('selectedAddOns')
        if (savedAddOns) {
          try {
            const addOnsData = JSON.parse(savedAddOns)
            const loadedAddOns = addOnsData.map((item: { addOnId: string; quantity: number; variantId?: string }) => ({
              addOn: apiAddOns.find(addon => addon.id === item.addOnId) as AddOn,
              quantity: item.quantity,
              variantId: item.variantId
            })).filter((item: { addOn: AddOn | undefined }) => item.addOn !== undefined)

            setSelectedAddOns(loadedAddOns)
          } catch (error) {
            console.error('Error parsing saved add-ons data:', error)
          }
        }

        // Determine the appropriate step
        if (stepParam === 'payment' && isAuthenticated) {
          // User is authenticated and wants to go to payment
          setStep(3)
        } else if (stepParam === 'addons' || (data.step && data.step >= 2)) {
          // Go to add-ons step
          setStep(2)
        } else {
          // Stay on registration step
          setStep(1)
        }

        // Save the restored city for use in the next effect
        sessionStorage.setItem('nibog_restored_city', data.selectedCity || cityParam || '')

        // Save the restored event type and age for use in the next effect
        sessionStorage.setItem('nibog_restored_eventType', data.selectedEventType || '')
        sessionStorage.setItem('nibog_restored_childAgeMonths', data.childAgeMonths ? String(data.childAgeMonths) : '')

        // Clear the URL parameters to clean up the URL
        if (stepParam) {
          const newUrl = window.location.pathname + (cityParam ? `?city=${cityParam}` : '')
          window.history.replaceState({}, '', newUrl)
        }
      } catch (error) {
        console.error('Error parsing saved registration data:', error)
      }
    } else if (stepParam === 'payment' || stepParam === 'addons') {
      // If no saved data but step parameter exists, redirect to start
      router.push('/register-event' + (cityParam ? `?city=${cityParam}` : ''))
    }
  }, [isAuthenticated, router])

  // --- Wait for cities to load, then trigger handleCityChange if needed ---
  useEffect(() => {
    const restoredCity = sessionStorage.getItem('nibog_restored_city')
    if (restoredCity && cities.length > 0) {
      handleCityChange(restoredCity)
      sessionStorage.removeItem('nibog_restored_city')
    }
  }, [cities])

  // --- Wait for apiEvents to load, then filter games from booking info if needed ---
  useEffect(() => {
    const restoredEventType = sessionStorage.getItem('nibog_restored_eventType')
    const restoredChildAgeMonths = sessionStorage.getItem('nibog_restored_childAgeMonths')
    if (
      restoredEventType &&
      restoredChildAgeMonths &&
      apiEvents.length > 0
    ) {
      console.log('🔄 Restoring session: Event:', restoredEventType, 'Age:', restoredChildAgeMonths);
      const selectedApiEvent = apiEvents.find(event => event.event_title === restoredEventType)
      if (selectedApiEvent && selectedApiEvent.games_with_slots) {
        console.log('✅ Found event in session restore, filtering games from booking info');
        const childAge = Number(restoredChildAgeMonths);
        
        // Filter games by child age from booking info data
        const gamesWithSlots = selectedApiEvent.games_with_slots || [];
        const eligibleGamesForAge = gamesWithSlots.filter((game: any) => {
          const minAge = game.min_age || 0;
          const maxAge = game.max_age || 999;
          return childAge >= minAge && childAge <= maxAge;
        });

        // Map games to the format expected by the UI
        const gamesForUI = eligibleGamesForAge.map((slot: any) => ({
          id: slot.slot_id,
          game_id: slot.game_id,
          game_name: slot.game_name || slot.custom_title,
          game_title: slot.game_name || slot.custom_title,
          game_description: slot.game_description || slot.custom_description,
          game_image: slot.game_image,
          slot_price: slot.price,
          custom_price: slot.price,
          start_time: slot.start_time,
          end_time: slot.end_time,
          max_participants: slot.max_participants,
          booked_count: slot.booked_count,
          available_slots: slot.available_slots,
          is_available: slot.is_available,
          min_age: slot.min_age,
          max_age: slot.max_age,
          duration_minutes: slot.duration_minutes,
          game_duration_minutes: slot.duration_minutes,
          categories: slot.categories,
          custom_title: slot.custom_title,
          custom_description: slot.custom_description,
          note: slot.note
        }));

        setEligibleGames(gamesForUI);
        console.log(`✅ Restored ${gamesForUI.length} games from session`);
        
        sessionStorage.removeItem('nibog_restored_eventType')
        sessionStorage.removeItem('nibog_restored_childAgeMonths')
      }
    }
  }, [apiEvents])

  // Show initial loading state while cities are being fetched
  // Show loading if: cities are being loaded AND (no cities loaded yet OR no error yet)
  if (isLoadingCities && cities.length === 0 && !cityError) {
    return (
      <div className="container py-6 sm:py-12 px-3 sm:px-4 lg:px-6 relative min-h-screen bg-gradient-to-br from-skyblue-100 via-coral-100 to-mint-100 dark:from-skyblue-900/20 dark:via-coral-900/20 dark:to-mint-900/20">
        {/* Homepage-style background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-20 hidden sm:block">
          <div className="absolute top-10 left-10 w-16 h-16 bg-skyblue-400 rounded-full opacity-20 animate-bounce-gentle"></div>
          <div className="absolute top-20 right-20 w-12 h-12 bg-coral-400 rounded-full opacity-30 animate-float-delayed"></div>
          <div className="absolute bottom-20 left-20 w-20 h-20 bg-mint-400 rounded-full opacity-25 animate-float-slow"></div>
          <div className="absolute bottom-10 right-10 w-14 h-14 bg-lavender-400 rounded-full opacity-20 animate-bounce-gentle" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/4 w-10 h-10 bg-skyblue-300 rounded-full opacity-25 animate-float-delayed" style={{animationDelay: '0.5s'}}></div>
        </div>

        <Card className="mx-auto w-full max-w-4xl relative overflow-hidden shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 rounded-3xl">
          {/* Homepage-style top gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-skyblue-400 via-coral-400 to-mint-400"></div>

          <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="relative">
              <div className="animate-spin h-16 w-16 border-4 border-primary border-t-transparent rounded-full"></div>
              <div className="absolute inset-0 animate-ping h-16 w-16 border-4 border-primary/20 rounded-full"></div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-primary">Loading Event Registration</h3>
              <p className="text-muted-foreground">Please wait while we prepare the registration form...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 sm:py-12 px-3 sm:px-4 lg:px-6 relative min-h-screen bg-gradient-to-br from-skyblue-100 via-coral-100 to-mint-100 dark:from-skyblue-900/20 dark:via-coral-900/20 dark:to-mint-900/20">
      {/* Homepage-style background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-20 hidden sm:block">
        <div className="absolute top-10 left-10 w-16 h-16 bg-skyblue-400 rounded-full opacity-20 animate-bounce-gentle"></div>
        <div className="absolute top-20 right-20 w-12 h-12 bg-coral-400 rounded-full opacity-30 animate-float-delayed"></div>
        <div className="absolute bottom-20 left-20 w-20 h-20 bg-mint-400 rounded-full opacity-25 animate-float-slow"></div>
        <div className="absolute bottom-10 right-10 w-14 h-14 bg-lavender-400 rounded-full opacity-20 animate-bounce-gentle" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-10 h-10 bg-skyblue-300 rounded-full opacity-25 animate-float-delayed" style={{animationDelay: '0.5s'}}></div>
      </div>

      <Card className="mx-auto w-full max-w-4xl relative overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 rounded-3xl">
        {/* Homepage-style top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-skyblue-400 via-coral-400 to-mint-400"></div>

        {/* Homepage-style corner decorations */}
        <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-skyblue-100 opacity-50 dark:bg-skyblue-900/50"></div>
        <div className="absolute -left-8 -bottom-8 w-24 h-24 rounded-full bg-mint-100 opacity-50 dark:bg-mint-900/50"></div>

        <CardHeader className="space-y-6 relative pb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-skyblue-400/20 to-coral-400/20 p-3 rounded-2xl shadow-lg border-2 border-skyblue-400/30">
              <CalendarIcon className="h-8 w-8 text-skyblue-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-skyblue-600 via-coral-600 to-mint-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-rainbow-shift">
                  🎯 Register for NIBOG Event 🎯
                </span>
              </CardTitle>
              <CardDescription className="text-base mt-2 text-neutral-charcoal/70 dark:text-white/70">
                {selectedCity
                  ? `Register your child for exciting baby games in ${selectedCity}`
                  : "Register your child for exciting baby games and create memorable moments"}
              </CardDescription>
            </div>
          </div>

          {/* Homepage-style progress indicator */}
          <div className="flex items-center justify-center space-x-3 pt-4">
            <div className={`w-10 h-3 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-gradient-to-r from-skyblue-400 to-coral-400' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`w-10 h-3 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-gradient-to-r from-coral-400 to-mint-400' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`w-10 h-3 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-gradient-to-r from-mint-400 to-lavender-400' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
          </div>

          <div className="text-center">
            <p className="text-sm text-neutral-charcoal/70 dark:text-white/70 font-semibold">
              Step {step} of 3: {step === 1 ? '📝 Registration Details' : step === 2 ? '🎁 Add-ons & Extras' : '💳 Payment & Confirmation'}
            </p>
          </div>
        </CardHeader>

        {/* Authentication Status Indicator */}
        {!isAuthenticated ? (
          <div className="mx-6 mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded-full">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-sm">
                <span className="font-medium text-blue-800 dark:text-blue-200">Login Required</span>
                <p className="text-blue-600 dark:text-blue-300 mt-1">
                  You'll need to log in to complete your registration and payment. Your progress will be saved.
                </p>
              </div>
            </div>
          </div>
        ) : user && (
          <div className="mx-6 mb-4 p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800">
            <div className="flex items-center gap-2">
              <div className="bg-green-100 dark:bg-green-900 p-1 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-sm">
                <span className="font-medium text-green-800 dark:text-green-200">Welcome back, {user.full_name}!</span>
                <p className="text-green-600 dark:text-green-300 mt-1">
                  You're logged in and ready to complete your registration.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step Indicator */}
        <div className="mx-6 mb-4">
          <div className="flex items-center justify-center space-x-4">
            <div className={cn(
              "flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-all",
              step === 1 ? "bg-primary text-white" : step > 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            )}>
              <span className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                step === 1 ? "bg-white text-primary" : step > 1 ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
              )}>
                {step > 1 ? "✓" : "1"}
              </span>
              <span>Registration</span>
            </div>

            <div className={cn(
              "w-8 h-0.5 transition-all",
              step > 1 ? "bg-green-500" : "bg-gray-300"
            )}></div>

            <div className={cn(
              "flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-all",
              step === 2 ? "bg-primary text-white" : step > 2 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            )}>
              <span className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                step === 2 ? "bg-white text-primary" : step > 2 ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
              )}>
                {step > 2 ? "✓" : "2"}
              </span>
              <span>Add-ons</span>
            </div>

            <div className={cn(
              "w-8 h-0.5 transition-all",
              step > 2 ? "bg-green-500" : "bg-gray-300"
            )}></div>

            <div className={cn(
              "flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-all",
              step === 3 ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
            )}>
              <span className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                step === 3 ? "bg-white text-primary" : "bg-gray-300 text-gray-600"
              )}>
                3
              </span>
              <span>Payment</span>
            </div>
          </div>
        </div>

        <CardContent className="space-y-4 px-3 sm:px-6 py-4 sm:py-6">
          {step === 1 && (
            <>
              {/* City Selection - Moved to the top */}
              <div className="p-4 rounded-lg border border-dashed border-primary/20 bg-white/80 space-y-4 mb-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 relative">
                {/* Loading overlay when city is selected and events are being fetched */}
                {isLoadingEvents && selectedCity && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="relative">
                        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
                        <div className="absolute inset-0 animate-ping h-12 w-12 border-4 border-primary/20 rounded-full"></div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-primary">Loading events for {selectedCity}...</p>
                        <p className="text-xs text-muted-foreground mt-1">Please wait</p>
                      </div>
                    </div>
                  </div>
                )}

                <h3 className="text-sm font-medium text-primary flex items-center gap-2">
                    <div className="bg-primary/10 p-1 rounded-full">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    Select Your City
                  </h3>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <span>City</span>
                      <span className="text-xs text-primary/70">(Required)</span>
                    </Label>
                    {isLoadingCities || isLoadingBookingInfo ? (
                      <div className="flex h-10 items-center rounded-md border border-input px-3 py-2 text-sm">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                        <span className="text-muted-foreground">Loading booking information...</span>
                      </div>
                    ) : cityError || bookingInfoError ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex h-10 items-center rounded-md border border-destructive px-3 py-2 text-sm text-destructive">
                          {cityError || bookingInfoError}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.reload()}
                          className="w-full sm:w-auto"
                        >
                          <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Reload Page
                        </Button>
                      </div>
                    ) : (
                      <Select value={selectedCity} onValueChange={handleCityChange} disabled={cities.length === 0 || isLoadingEvents}>
                        <SelectTrigger className={cn(
                          "border-dashed transition-all duration-200 h-11 sm:h-10 text-base sm:text-sm",
                          selectedCity ? "border-primary/40 bg-primary/5" : "border-muted-foreground/40 text-muted-foreground"
                        )}>
                          <SelectValue placeholder={cities.length === 0 ? "No cities available" : "Select your city"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto border-2 border-primary/10 shadow-xl">
                          <div className="p-2 bg-gradient-to-r from-primary/5 to-purple-500/5 border-b border-primary/10 sticky top-0 z-10">
                            <h3 className="text-sm font-medium text-primary">Select Your City</h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-1">
                            {cities.map((city) => (
                              <SelectItem key={city.id} value={city.name} className="rounded-md hover:bg-primary/5 transition-colors duration-200">
                                {city.name}
                              </SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {selectedCity && (
                    <div className="space-y-2 mt-4 pt-4 border-t border-dashed border-primary/10">
                      <Label className="flex items-center gap-1">
                        <span>Event</span>
                        <span className="text-xs text-primary/70">(Required)</span>
                      </Label>
                      {isLoadingEvents ? (
                        <div className="flex h-10 items-center rounded-md border border-input px-3 py-2 text-sm">
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                          <span className="text-muted-foreground">Loading events...</span>
                        </div>
                      ) : eventError ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex h-10 items-center rounded-md border border-destructive px-3 py-2 text-sm text-destructive">
                            {eventError}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Reload the page to re-fetch booking info
                              window.location.reload();
                            }}
                            className="w-full sm:w-auto"
                          >
                            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Retry Loading Events
                          </Button>
                        </div>
                      ) : getUniqueEventTypes().length > 0 ? (
                        <Select
                          value={selectedEventType}
                          onValueChange={handleEventTypeChange}
                          disabled={getUniqueEventTypes().length === 0}
                        >
                          <SelectTrigger className={cn(
                            "border-dashed transition-all duration-200 h-11 sm:h-10 text-base sm:text-sm",
                            selectedEventType ? "border-primary/40 bg-primary/5" : "border-muted-foreground/40 text-muted-foreground"
                          )}>
                            <SelectValue placeholder="Select an event" />
                          </SelectTrigger>
                          <SelectContent className="border-2 border-primary/10 shadow-xl">
                            <div className="p-2 bg-gradient-to-r from-primary/5 to-purple-500/5 border-b border-primary/10 sticky top-0 z-10">
                              <h3 className="text-sm font-medium text-primary">Select an Event</h3>
                            </div>
                            {getUniqueEventTypes().map((eventType) => (
                              <SelectItem key={eventType} value={eventType} className="rounded-md hover:bg-primary/5 transition-colors duration-200">
                                {eventType}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex h-10 items-center rounded-md border border-destructive px-3 py-2 text-sm text-destructive">
                          No events found for this city
                        </div>
                      )}
                    </div>
                  )}

                  {selectedCity && selectedEventType && (
                    <div className="space-y-2 mt-4 pt-4 border-t border-dashed border-primary/10">
                      <Label className="flex items-center gap-1">
                        <span>Event Details</span>
                      </Label>
                      {eligibleEvents.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-1">
                          {eligibleEvents.map((event) => (
                            <div
                              key={event.id}
                              className="flex items-start space-x-3 rounded-lg border-2 p-3 transition-all duration-200 border-primary/30 bg-primary/5 shadow-md"
                            >
                              <div className="space-y-1 flex-1">
                                <div className="font-medium text-lg">
                                  {format(new Date(event.date), "PPP")}
                                </div>
                                <p className="text-sm text-muted-foreground">{event.venue}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 p-4 dark:from-yellow-950 dark:to-amber-950 border border-yellow-100 dark:border-yellow-900 shadow-inner">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900 rounded-full p-1">
                              <Info className="h-5 w-5 text-yellow-500 dark:text-yellow-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                                No event details available
                              </h3>
                              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                                <p>
                                  Could not load details for {selectedEventType} in {selectedCity}.
                                  Please try a different event or city.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

              </div>

              <div className="p-6 rounded-3xl border-0 bg-white/90 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300 space-y-6 dark:bg-gray-800/90">
                <h3 className="text-xl font-bold text-neutral-charcoal dark:text-white flex items-center gap-3">
                  <div className="bg-gradient-to-br from-skyblue-400/20 to-coral-400/20 p-3 rounded-2xl shadow-lg border-2 border-skyblue-400/30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-skyblue-600">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  👨‍👩‍👧‍👦 Parent Information
                </h3>
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-3">
                    <Label htmlFor="parent-name" className="flex items-center gap-2 text-sm font-bold text-neutral-charcoal dark:text-white">
                      <span>Parent's Full Name</span>
                      <span className="text-xs text-skyblue-700 bg-skyblue-100 px-2 py-0.5 rounded-full border border-skyblue-300">Required</span>
                    </Label>
                    <Input
                      id="parent-name"
                      placeholder="Enter your full name"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      required
                      className="border-2 border-skyblue-200 focus:border-skyblue-400 focus:ring-2 focus:ring-skyblue-200 bg-white hover:bg-skyblue-50 dark:bg-gray-800 dark:border-skyblue-600 dark:hover:bg-gray-700 dark:text-white h-12 text-base rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="flex items-center gap-2 text-sm font-bold text-neutral-charcoal dark:text-white">
                      <span>Email Address</span>
                      <span className="text-xs text-coral-700 bg-coral-100 px-2 py-0.5 rounded-full border border-coral-300">Required</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-2 border-coral-200 focus:border-coral-400 focus:ring-2 focus:ring-coral-200 bg-white hover:bg-coral-50 dark:bg-gray-800 dark:border-coral-600 dark:hover:bg-gray-700 dark:text-white h-12 text-base rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-bold text-neutral-charcoal dark:text-white">
                      <span>Mobile Number</span>
                      <span className="text-xs text-mint-700 bg-mint-100 px-2 py-0.5 rounded-full border border-mint-300">Required</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your 10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="border-2 border-mint-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-200 bg-white hover:bg-mint-50 dark:bg-gray-800 dark:border-mint-600 dark:hover:bg-gray-700 dark:text-white h-12 text-base rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl border-0 bg-white/90 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300 space-y-6 dark:bg-gray-800/90">
                <h3 className="text-xl font-bold text-neutral-charcoal dark:text-white flex items-center gap-3">
                  <div className="bg-gradient-to-br from-coral-400/20 to-mint-400/20 p-3 rounded-2xl shadow-lg border-2 border-coral-400/30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-coral-600">
                      <path d="M9 12h.01"></path>
                      <path d="M15 12h.01"></path>
                      <path d="M10 16c.5.3 1.1.5 2 .5s1.5-.2 2-.5"></path>
                      <path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"></path>
                    </svg>
                  </div>
                  👶 Child Information
                </h3>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                  <div className="space-y-3">
                    <Label htmlFor="child-name" className="flex items-center gap-2 text-sm font-bold text-neutral-charcoal dark:text-white">
                      <span>Child's Full Name</span>
                      <span className="text-xs text-skyblue-700 bg-skyblue-100 px-2 py-0.5 rounded-full border border-skyblue-300">Required</span>
                    </Label>
                    <Input
                      id="child-name"
                      placeholder="Enter your child's full name"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      required
                      className="border-2 border-skyblue-200 focus:border-skyblue-400 focus:ring-2 focus:ring-skyblue-200 bg-white hover:bg-skyblue-50 dark:bg-gray-800 dark:border-skyblue-600 dark:hover:bg-gray-700 dark:text-white h-12 text-base rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-bold text-neutral-charcoal dark:text-white">
                      <span>Child's Date of Birth</span>
                      <span className="text-xs text-coral-700 bg-coral-100 px-2 py-0.5 rounded-full border border-coral-300">Required</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal transition-all duration-200 h-12 text-base rounded-2xl shadow-lg hover:shadow-xl border-2",
                            !dob
                              ? "text-neutral-charcoal border-coral-200 hover:border-coral-300 hover:bg-coral-50 dark:border-coral-600 dark:hover:bg-gray-700 dark:text-white"
                              : "border-coral-400 bg-coral-50 hover:bg-coral-100 text-neutral-charcoal dark:text-white dark:bg-coral-900/20"
                          )}
                          onClick={() => {
                            console.log("=== DOB BUTTON CLICKED ===");
                            console.log("Current DOB state:", dob);
                            console.log("DOB type:", typeof dob);
                            console.log("DOB toString:", dob?.toString());
                            console.log("DOB toISOString:", dob?.toISOString());
                            console.log("Formatted display:", dob ? format(dob, "PPP") : "Select date of birth");
                          }}
                        >
                          <CalendarIcon className={cn("mr-2 h-4 w-4", dob ? "text-primary" : "text-muted-foreground")} />
                          <span className="truncate">{dob ? format(dob, "PPP") : "Select date of birth"}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gradient-to-br from-white to-blue-50 border-2 border-primary/10 shadow-xl">
                        <div className="p-2 bg-gradient-to-r from-primary/5 to-purple-500/5 border-b border-primary/10">
                          <h3 className="text-sm font-medium text-primary">Select Child's Birthday</h3>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                          <Calendar
                            mode="single"
                            selected={dob}
                            onSelect={(date) => {
                              console.log("=== CALENDAR COMPONENT onSelect CALLED ===");
                              console.log("Calendar selected date:", date);
                              console.log("Date type:", typeof date);
                              console.log("Date toString:", date?.toString());
                              console.log("Date toISOString:", date?.toISOString());
                              console.log("Formatted date:", date ? formatDateForAPI(date) : 'undefined');
                              handleDobChange(date);
                            }}
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
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="school-name" className="flex items-center gap-2 text-sm font-bold text-neutral-charcoal dark:text-white">
                    <span>School Name</span>
                    <span className="text-xs text-mint-700 bg-mint-100 px-2 py-0.5 rounded-full border border-mint-300">Required</span>
                  </Label>
                  <Input
                    id="school-name"
                    placeholder={childAgeMonths && childAgeMonths < 36 ? "Home, Daycare, or Playschool" : "Enter school name"}
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    required={childAgeMonths ? childAgeMonths >= 36 : false}
                    className="border-2 border-mint-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-200 bg-white hover:bg-mint-50 dark:bg-gray-800 dark:border-mint-600 dark:hover:bg-gray-700 dark:text-white h-12 text-base rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  />
                  {childAgeMonths && childAgeMonths < 36 && (
                    <p className="text-xs text-neutral-charcoal dark:text-white mt-2 p-3 bg-gradient-to-r from-skyblue-50 to-coral-50 dark:from-skyblue-900/20 dark:to-coral-900/20 rounded-2xl border-2 border-skyblue-200 dark:border-skyblue-800 shadow-lg">
                      💡 For children under 3 years, you can enter "Home", "Daycare", or the name of their playschool
                    </p>
                  )}
                </div>
              </div>

              {/* Display child's age in months when DOB is selected */}
              {dob && childAgeMonths !== null && (
                <div className="mt-3 mb-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-full p-1 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                        <path d="M12 2v6.5l3-3"></path>
                        <path d="M12 2v6.5l-3-3"></path>
                        <path d="M12 22v-6.5l3 3"></path>
                        <path d="M12 22v-6.5l-3 3"></path>
                        <path d="M2 12h6.5l-3 3"></path>
                        <path d="M2 12h6.5l-3-3"></path>
                        <path d="M22 12h-6.5l3 3"></path>
                        <path d="M22 12h-6.5l3-3"></path>
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-blue-800">Child's Age: </span>
                      <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{childAgeMonths} months</span>
                      <span className="text-xs text-blue-600 ml-2">({Math.floor(childAgeMonths / 12)} years, {childAgeMonths % 12} months)</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <span>Gender</span>
                  <span className="text-xs text-primary/70">(Required)</span>
                </Label>
                <RadioGroup
                  value={gender}
                  onValueChange={setGender}
                  className="flex gap-4 p-2 border border-dashed rounded-md border-primary/20 bg-white/80 dark:bg-black dark:border-gray-700 dark:text-gray-50"
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

              <div className="p-4 rounded-lg border border-dashed border-primary/20 bg-white/80 space-y-4 mb-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50">
                
                
                {/* Games Section - Only shown when child age and event are selected */}
                {selectedCity && selectedEventType && childAgeMonths !== null && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <span>Available Games</span>
                      <span className="text-xs text-primary/70">(Required - Select ONE game)</span>
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Please select exactly one game and time slot for your registration. You can only register for one game per booking.
                    </p>
                    
                    {isLoadingGames || isLoadingBookingInfo ? (
                      <div className="flex items-center justify-center p-8 bg-gradient-to-r from-skyblue-50 via-coral-50 to-mint-50 rounded-3xl border-2 border-skyblue-200 shadow-lg">
                        <Loader2 className="h-8 w-8 animate-spin text-skyblue-600" />
                        <span className="ml-3 text-base font-semibold text-neutral-charcoal">🎮 Loading available games and time slots...</span>
                      </div>
                    ) : gameError ? (
                      <div className="rounded-3xl bg-gradient-to-r from-coral-50 to-skyblue-50 p-6 dark:from-coral-950/50 dark:to-skyblue-950/50 border-2 border-coral-200 dark:border-coral-800 shadow-2xl">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 bg-gradient-to-br from-coral-100 to-skyblue-100 dark:bg-coral-900 rounded-2xl p-2 shadow-lg">
                            <AlertCircle className="h-6 w-6 text-coral-600 dark:text-coral-400" aria-hidden="true" />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-base font-bold text-neutral-charcoal dark:text-white">
                              ⚠️ Error loading games
                            </h3>
                            <div className="mt-2 text-sm text-neutral-charcoal/70 dark:text-white/70 font-medium">
                              <p>{gameError}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : eligibleGames.length > 0 ? (
                      <>
                        {/* Selection Status Indicator */}
                        <div className={cn(
                          "mb-6 p-4 rounded-3xl border-2 text-base font-semibold shadow-lg",
                          selectedGames.length === 0
                            ? "bg-gradient-to-r from-skyblue-50 to-coral-50 border-skyblue-200 text-neutral-charcoal"
                            : selectedGames.length === 1
                            ? "bg-gradient-to-r from-mint-50 to-skyblue-50 border-mint-300 text-neutral-charcoal"
                            : "bg-gradient-to-r from-coral-50 to-skyblue-50 border-coral-300 text-neutral-charcoal"
                        )}>
                          <div className="flex items-center gap-3">
                            {selectedGames.length === 0 && (
                              <>
                                <div className="w-3 h-3 rounded-full bg-skyblue-400 animate-pulse"></div>
                                <span>🎯 No game selected - Please select one game and time slot</span>
                              </>
                            )}
                            {selectedGames.length === 1 && (
                              <>
                                <div className="w-3 h-3 rounded-full bg-mint-500 animate-bounce-gentle"></div>
                                <span>✅ One game selected - Ready to continue!</span>
                              </>
                            )}
                            {selectedGames.length > 1 && (
                              <>
                                <div className="w-3 h-3 rounded-full bg-coral-500 animate-pulse"></div>
                                <span>⚠️ Multiple games selected - Please select only one</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="grid gap-3 sm:gap-4 grid-cols-1">
                        {(() => {
                          // Group games by game_id to show slots for each game
                          const groupedGames = eligibleGames.reduce((acc, game) => {
                            const gameId = game.game_id;
                            if (!acc[gameId]) {
                              acc[gameId] = {
                                gameInfo: {
                                  game_id: game.game_id,
                                  game_title: game.game_title,
                                  game_description: game.game_description,
                                  min_age: game.min_age,
                                  max_age: game.max_age,
                                  game_duration_minutes: game.game_duration_minutes,
                                  custom_title: game.custom_title,
                                  custom_description: game.custom_description,
                                  custom_price: game.custom_price
                                },
                                slots: []
                              };
                            }
                            acc[gameId].slots.push(game);
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
                                  <div className="flex flex-wrap gap-2">
                                    <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                                      {gameInfo.game_duration_minutes} min
                                    </div>
                                    <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                                      Age: {gameInfo.min_age}-{gameInfo.max_age} months
                                    </div>
                                  </div>
                                </div>

                                {/* Slot Selection */}
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">
                                    Select Time Slot {slots.length > 1 ? '(Choose one)' : ''}:
                                  </Label>
                                  <div className="grid gap-2">
                                    {slots.map((slot) => {
                                      const isSelected = selectedSlotForGame?.slotId === slot.id;
                                      const availableSlots = slot.available_slots ?? (slot.max_participants - (slot.booked_count || 0));
                                      const isAvailable = slot.is_available ?? (availableSlots > 0);
                                      
                                      return (
                                        <div
                                          key={slot.id}
                                          className={cn(
                                            "flex items-center justify-between p-3 sm:p-4 rounded-lg border transition-all duration-200 touch-manipulation min-h-[60px] sm:min-h-[auto]",
                                            isSelected
                                              ? "border-primary bg-primary/10 shadow-md"
                                              : !isAvailable
                                                ? "border-muted bg-gray-100 dark:bg-gray-800 opacity-70"
                                                : "border-muted hover:border-primary/30 hover:bg-primary/5 cursor-pointer"
                                          )}
                                          onClick={() => isAvailable && handleGameSelection(slot.id)}
                                        >
                                          <div className="flex items-center space-x-3">
                                            <input
                                              type="radio"
                                              name="game-slot-selection"
                                              checked={isSelected}
                                              onChange={() => isAvailable && handleGameSelection(slot.id)}
                                              disabled={!isAvailable}
                                              className={`${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'text-primary focus:ring-primary'}`}
                                            />
                                            <div>
                                              <div className="font-medium text-sm">
                                                {slot.start_time} - {slot.end_time}
                                              </div>
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <div className={`text-xs ${!isAvailable ? 'text-destructive font-medium' : availableSlots <= 3 ? 'text-orange-600 dark:text-orange-400 font-medium' : 'text-muted-foreground'}`}>
                                                  {!isAvailable 
                                                    ? '🔴 Fully Booked' 
                                                    : `✅ ${availableSlots}/${slot.max_participants} slots available`
                                                  }
                                                </div>
                                                {isAvailable && availableSlots <= 3 && (
                                                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold dark:bg-orange-900 dark:text-orange-300">
                                                    ⚡ Filling Fast
                                                  </span>
                                                )}
                                              </div>
                                              {slot.note && (
                                                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                                                  <Info className="h-3 w-3" />
                                                  {slot.note}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <div className="font-medium text-primary">
                                              ₹{slot.slot_price || slot.custom_price || 0}
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
                    ) : (
                      <div className="rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 p-4 dark:from-yellow-950 dark:to-amber-950 border border-yellow-100 dark:border-yellow-900 shadow-inner">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900 rounded-full p-1">
                            <Info className="h-5 w-5 text-yellow-500 dark:text-yellow-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                              No games available
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                              <p>
                                No games found for {selectedEventType} in {selectedCity} for a child of {childAgeMonths} months.
                                Please try a different event or contact support for assistance.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {dob && selectedCity && (
                <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:from-blue-950 dark:to-indigo-950 border border-blue-100 dark:border-blue-900 shadow-inner">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-full p-1">
                      <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Child's Age Information</h3>
                      <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                        <p>
                          Based on the date of birth, your child will be{" "}
                          <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{childAgeMonths} months</span> old on the event date ({format(eventDate, "PPP")}).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Child age information is displayed above, no games section needed */}

              {/* Event date selection has been integrated into the event selection */}

              {/* Event selection has been moved to the city selection section */}

              <div className="flex items-start space-x-2 p-3 rounded-lg border border-dashed border-primary/20 bg-white/80 dark:bg-black dark:border-gray-700 dark:text-gray-50">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  required
                  className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:text-white"
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
                      terms and conditions
                    </Link>
                  </Label>
                  <p className="text-xs text-muted-foreground">By registering, you agree to NIBOG's terms of service and privacy policy.</p>
                </div>
              </div>

              <Button
                size="lg"
                className={cn(
                  "w-full relative overflow-hidden group transition-all duration-300 h-16 text-lg font-bold touch-manipulation rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-105 border-2 border-white/50 animate-medal-shine",
                  (!selectedCity || !dob || !selectedEventType || !selectedEvent || selectedGames.length !== 1 || childAgeMonths === null || !parentName || !email || !phone || !childName ||
                 (childAgeMonths && childAgeMonths >= 36 && !schoolName) || !termsAccepted || isProcessingPayment)
                    ? "opacity-50 cursor-not-allowed bg-gray-400"
                    : "bg-gradient-to-r from-skyblue-400 via-coral-400 to-mint-400 hover:from-skyblue-500 hover:via-coral-500 hover:to-mint-500 text-white"
                )}
                onClick={handleRegistration}
                disabled={!selectedCity || !dob || !selectedEventType || !selectedEvent || selectedGames.length !== 1 || childAgeMonths === null || !parentName || !email || !phone || !childName ||
                         (childAgeMonths && childAgeMonths >= 36 && !schoolName) || !termsAccepted || isProcessingPayment}
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      🎯 {isAuthenticated ? "Continue to Add-ons" : "Continue (Login Required)"} 🎯
                      <ChevronRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </span>
                <span className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></span>
              </Button>
            </>
          )}

          {step === 2 && selectedEventDetails && (
            <>
              <div className="rounded-md bg-muted p-4 mb-6">
                <h3 className="font-semibold">Registration Summary</h3>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Event:</span>
                    <span className="font-medium">{selectedEventDetails.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{format(eventDate, "PPP")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Venue:</span>
                    <span>{selectedEventDetails.venue}, {selectedEventDetails.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Child's Age on Event Date:</span>
                    <span>{childAgeMonths} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">School:</span>
                    <span>{schoolName || (childAgeMonths && childAgeMonths < 36 ? "Home" : "Not specified")}</span>
                  </div>
                </div>
              </div>

              {/* Add-ons Section with Optional Indicator */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Add-ons</h3>
                  <Badge variant="secondary" className="text-xs">
                    Optional
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enhance your experience with optional add-ons. You can skip this step and proceed directly to payment if you prefer.
                </p>

                <div className="mt-8">
                  {isLoadingAddOns && (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="ml-2 text-lg">Loading add-ons...</p>
                    </div>
                  )}
                  {addOnError && (
                    <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                        <p className="text-red-600">{addOnError}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2" 
                        onClick={() => {
                          setIsLoadingAddOns(true);
                          setAddOnError(null);
                          fetchAllAddOnsFromExternalApi()
                            .then(apiAddOns => {
                              // Transform the API add-ons to match the expected AddOn type
                              const transformedAddOns = apiAddOns.map(addOn => ({
                                id: addOn.id.toString(),
                                name: addOn.name,
                                description: addOn.description,
                                price: parseFloat(addOn.price) || 0,
                                images: addOn.images || [],
                                category: addOn.category,
                                isActive: addOn.is_active,
                                availableForEvents: [],
                                hasVariants: addOn.has_variants,
                                variants: addOn.variants?.map(v => ({
                                  id: v.id?.toString() || '',
                                  name: v.name,
                                  price: parseFloat(addOn.price) + (v.price_modifier || 0),
                                  price_modifier: v.price_modifier,
                                  sku: v.sku,
                                  stockQuantity: v.stock_quantity || 0,
                                  attributes: {}
                                })) || [],
                                stockQuantity: addOn.stock_quantity,
                                sku: addOn.sku,
                                bundleDiscount: addOn.bundle_min_quantity ? {
                                  minQuantity: addOn.bundle_min_quantity,
                                  discountPercentage: parseFloat(addOn.bundle_discount_percentage) || 0
                                } : undefined,
                                createdAt: addOn.created_at,
                                updatedAt: addOn.updated_at
                              }));
                              
                              setApiAddOns(transformedAddOns);
                              setIsLoadingAddOns(false);
                            })
                            .catch(error => {
                              console.error('Failed to load add-ons:', error);
                              setAddOnError('Failed to load add-ons. Please try again.');
                              setIsLoadingAddOns(false);
                            });
                        }}
                      >
                        Try Again
                      </Button>
                    </div>
                  )}
                  {!isLoadingAddOns && !addOnError && apiAddOns.length > 0 && (
                    <AddOnSelector
                      addOns={apiAddOns} 
                      onAddOnsChange={setSelectedAddOns}
                      initialSelectedAddOns={selectedAddOns}
                    />
                  )}
                  {!isLoadingAddOns && !addOnError && apiAddOns.length === 0 && (
                    <div className="p-4 border border-gray-200 rounded-md text-center">
                      <p className="text-gray-500">No add-ons are currently available.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Show different messaging based on add-ons selection */}
              {selectedAddOns.length === 0 && (
                <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-blue-800 dark:text-blue-200">
                      No add-ons selected. You can proceed to payment or add some optional extras above.
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
                <Button
                  variant="outline"
                  className="w-full h-12 sm:h-10 text-base sm:text-sm touch-manipulation"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button
                  className="w-full h-12 sm:h-10 text-base sm:text-sm font-semibold touch-manipulation"
                  onClick={handleContinueToPayment}
                >
                  <span className="hidden sm:inline">
                    {selectedAddOns.length === 0
                      ? (isAuthenticated ? "Skip Add-ons & Proceed to Payment" : "Skip Add-ons & Continue (Login Required)")
                      : (isAuthenticated ? "Proceed to Payment" : "Continue to Payment (Login Required)")
                    }
                  </span>
                  <span className="sm:hidden">
                    {selectedAddOns.length === 0 ? "Skip & Continue" : "Continue"}
                  </span>
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {step === 3 && selectedEventDetails && (
            <>
                <div className="rounded-md bg-muted p-4">
                  <h3 className="font-semibold">Registration Summary</h3>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Event:</span>
                      <span className="font-medium">{selectedEventDetails.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{format(eventDate, "PPP")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Venue:</span>
                      <span>{selectedEventDetails.venue}, {selectedEventDetails.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Child's Age:</span>
                      <span>{childAgeMonths} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">School:</span>
                      <span>{schoolName || (childAgeMonths && childAgeMonths < 36 ? "Home" : "Not specified")}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Games Subtotal:</span>
                      <span>{formatPrice(calculateGamesTotal())}</span>
                    </div>
                    {selectedAddOns.length > 0 ? (
                    <>
                      {selectedAddOns.map((item) => {
                        // Debug the add-on and variant information
                        console.log(`Add-on: ${item.addOn.name}`, item);
                        
                        // Start with the base add-on price
                        let price = parseFloat(String(item.addOn.price || '0'))
                        let variantName = ""

                        // Check if this is a variant with a different price
                        if (item.variantId && item.addOn.hasVariants && item.addOn.variants) {
                          const variant = item.addOn.variants.find(v => v.id === item.variantId)
                          console.log(`Variant found for ${item.addOn.name}:`, variant);
                          
                          if (variant) {
                            // For variants, we need to use the base price + price_modifier
                            // If variant has a direct price, use that, otherwise use base price + modifier
                            if (variant.price) {
                              price = parseFloat(String(variant.price));
                            } else if (variant.price_modifier) {
                              // Add the price modifier to the base price
                              const modifier = parseFloat(String(variant.price_modifier || 0));
                              price = parseFloat(String(item.addOn.price)) + modifier;
                            }
                            
                            console.log(`Calculated variant price for ${item.addOn.name}: ${price}`);
                            variantName = ` - ${variant.name}`
                          }
                        }

                        // Apply bundle discount if applicable
                        let discountedPrice = price
                        let hasDiscount = false

                        if (item.addOn.bundleDiscount && 
                            item.quantity >= item.addOn.bundleDiscount.minQuantity && 
                            item.addOn.bundleDiscount.discountPercentage > 0) { // Only apply if discount > 0%
                          hasDiscount = true
                          const discountMultiplier = 1 - (item.addOn.bundleDiscount.discountPercentage / 100)
                          discountedPrice = price * discountMultiplier
                        }

                        return (
                          <div key={item.addOn.id} className="flex justify-between">
                            <div>
                              <span>{item.addOn.name}{variantName} {item.quantity > 1 ? `(${item.quantity})` : ""}</span>
                              {hasDiscount && (
                                <Badge className="ml-2 bg-green-500 hover:bg-green-600 text-xs">
                                  {item.addOn.bundleDiscount?.discountPercentage}% OFF
                                </Badge>
                              )}
                            </div>
                            <div>
                              {hasDiscount ? (
                                <div className="flex flex-col items-end">
                                  <span className="text-xs line-through text-muted-foreground">
                                    {formatPrice(price * item.quantity)}
                                  </span>
                                  <span>{formatPrice(discountedPrice * item.quantity)}</span>
                                </div>
                              ) : (
                                <span>{formatPrice(price * item.quantity)}</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                      <div className="flex justify-between font-medium">
                        <span>Add-ons Subtotal:</span>
                        <span>₹{calculateAddOnsTotal()}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Add-ons:</span>
                      <span>None selected</span>
                    </div>
                  )}
                  {appliedPromoCode && (
                    <div className="flex justify-between text-green-600">
                      <span>Promocode Discount:</span>
                      <span>- ₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span>₹{calculateTotalPrice()}</span>
                  </div>
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  <Label htmlFor="promo">Promo Code</Label>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                    <Input
                      id="promo"
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      disabled={isApplyingPromocode || !selectedGames.length}
                      className="h-11 sm:h-10 text-base sm:text-sm"
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyPromoCode}
                      disabled={isApplyingPromocode || !promoCode || !selectedGames.length}
                      className="h-11 sm:h-10 text-base sm:text-sm touch-manipulation sm:min-w-[80px]"
                    >
                      {isApplyingPromocode ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                          <span className="hidden sm:inline">Applying...</span>
                          <span className="sm:hidden">...</span>
                        </>
                      ) : appliedPromoCode ? 'Change' : 'Apply'}
                    </Button>
                  </div>
                  
                  {/* Available promocodes section */}
                  <div className="mt-2">
                    <Label className="text-xs text-muted-foreground">Available Promocodes</Label>
                    {Array.isArray(availablePromocodes) && availablePromocodes.length > 0 && availablePromocodes.some(code => code.promo_code) ? (
                      <div>
                        {/* Only render the Select component when promocodes are available with valid promo_code properties */}
                        <Select onValueChange={(value) => setPromoCode(value)}>
                          <SelectTrigger className="w-full mt-1 h-11 sm:h-10 text-base sm:text-sm">
                            <SelectValue placeholder="Select a promocode" />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePromocodes
                              .filter(code => code.promo_code) // Only include items that have a promo_code property
                              .map((code) => (
                                <SelectItem key={code.id || `promo-${code.promo_code}`} value={code.promo_code} className="text-sm">
                                  <div className="flex justify-between items-center w-full">
                                    <span className="font-medium">{code.promo_code}</span>
                                    {code.type && code.value !== undefined && (
                                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                        {code.type === 'percentage' ? `${code.value}% OFF` : `₹${code.value} OFF`}
                                      </span>
                                    )}
                                  </div>
                                  {code.description && (
                                    <div className="text-xs text-muted-foreground mt-1">{code.description}</div>
                                  )}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="mt-1 text-sm text-muted-foreground p-2 bg-muted/50 rounded-md border border-dashed border-muted-foreground/20">
                        No promocodes available
                      </div>
                    )}
                  </div>
                  
                  {/* Applied promocode */}
                  {appliedPromoCode && (
                    <div className="mt-2 p-2 rounded-md border border-green-200 bg-green-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-green-700">{appliedPromoCode.promo_code}</span>
                          <span className="text-xs text-green-600 ml-2">Applied Successfully</span>
                        </div>
                        <Badge className="bg-green-500 hover:bg-green-600">
                          {appliedPromoCode.type === 'percentage' ? `${appliedPromoCode.value}% OFF` : `₹${appliedPromoCode.value} OFF`}
                        </Badge>
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        Discount: ₹{discountAmount.toFixed(2)}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 p-0 h-auto mt-1"
                        onClick={handleRemovePromoCode}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  
                  {/* Promocode error */}
                  {promocodeError && (
                    <div className="mt-2 p-2 rounded-md border border-red-200 bg-red-50">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-xs text-red-600">{promocodeError}</span>
                      </div>
                    </div>
                  )}
                </div>

                {paymentError && (
                  <div className="rounded-lg bg-red-50 p-4 border border-red-100 shadow-inner mb-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-red-100 rounded-full p-1">
                        <AlertTriangle className="h-5 w-5 text-red-500" aria-hidden="true" />
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-red-800 mb-1">Payment Error</h3>
                        <div className="text-sm text-red-700 leading-relaxed">
                          <p>{paymentError}</p>
                          {paymentError.includes("mobile") && (
                            <p className="mt-2 text-xs text-red-600">
                              💡 Tip: Try refreshing the page or switching to a different browser if the issue persists.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 mt-8 border-t pt-6">
                  <Label>Payment Method</Label>
                  <div className="p-4 rounded-lg border border-dashed border-primary/20 bg-white/80 space-y-4 mb-2">
                    <div className="flex items-center justify-center">
                      <div className="bg-[#5f259f] p-4 rounded-lg text-white font-bold text-xl flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2v13c0 1.1-.9 2-2 2h-3.5"></path>
                          <path d="M2 10h20"></path>
                          <path d="M7 15h.01"></path>
                          <path d="M11 15h2"></path>
                          <path d="M10.5 20a2.5 2.5 0 1 1 5 0 2.5 2.5 0 1 1-5 0z"></path>
                        </svg>
                        PhonePe
                      </div>
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                      You will be redirected to PhonePe to complete your payment securely.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      <div className="bg-gray-100 p-2 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                          <line x1="2" x2="22" y1="10" y2="10"></line>
                        </svg>
                      </div>
                      <div className="bg-gray-100 p-2 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16.7 8A3 3 0 0 0 14 6h-4a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-4a3 3 0 0 1-2.7-2"></path>
                          <path d="M12 18V6"></path>
                        </svg>
                      </div>
                      <div className="bg-gray-100 p-2 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2v20"></path>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                      </div>
                      <div className="bg-gray-100 p-2 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"></path>
                          <path d="M2 9v1c0 1.1.9 2 2 2h1"></path>
                          <path d="M16 11h0"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
                  <Button
                    variant="outline"
                    className="w-full h-12 sm:h-10 text-base sm:text-sm touch-manipulation"
                    onClick={() => setStep(2)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    className="w-full h-16 text-lg font-bold touch-manipulation bg-gradient-to-r from-skyblue-400 via-coral-400 to-mint-400 hover:from-skyblue-500 hover:via-coral-500 hover:to-mint-500 text-white shadow-2xl transform transition-all hover:scale-105 rounded-3xl border-2 border-white/50 animate-medal-shine"
                    onClick={handlePayment}
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="animate-spin mr-3 h-6 w-6 border-2 border-neutral-charcoal border-t-transparent rounded-full"></div>
                        <span className="text-lg">Processing Payment...</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">💳 Pay with PhonePe ₹{calculateTotalPrice()} 💳</span>
                        <span className="sm:hidden">💳 Pay ₹{calculateTotalPrice()} 💳</span>
                      </>
                    )}
                  </Button>
                </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 border-t-2 border-skyblue-200 bg-gradient-to-r from-skyblue-50 via-coral-50 to-mint-50 dark:from-skyblue-900/20 dark:via-coral-900/20 dark:to-mint-900/20 px-6 py-6 rounded-b-3xl">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-skyblue-400 animate-bounce-gentle"></div>
              <div className="h-2 w-2 rounded-full bg-coral-400 animate-bounce-gentle" style={{animationDelay: '0.2s'}}></div>
              <div className="h-2 w-2 rounded-full bg-mint-400 animate-bounce-gentle" style={{animationDelay: '0.4s'}}></div>
              <div className="h-2 w-2 rounded-full bg-lavender-400 animate-bounce-gentle" style={{animationDelay: '0.6s'}}></div>
              <div className="h-2 w-2 rounded-full bg-mint-400 animate-bounce-gentle" style={{animationDelay: '0.4s'}}></div>
              <div className="h-2 w-2 rounded-full bg-coral-400 animate-bounce-gentle" style={{animationDelay: '0.2s'}}></div>
              <div className="h-2 w-2 rounded-full bg-skyblue-400 animate-bounce-gentle"></div>
            </div>
            <div className="text-neutral-charcoal/70 dark:text-white/70 font-semibold">
              🏆 Need help? Contact us at{" "}
              <Link href="mailto:newindiababyolympics@gmail.com" className="text-skyblue-600 font-bold underline-offset-4 hover:underline transition-colors hover:text-coral-600">
                newindiababyolympics@gmail.com
              </Link>
              {" "}🏆
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}