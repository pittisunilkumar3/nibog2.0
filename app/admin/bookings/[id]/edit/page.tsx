"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Check, Loader2, AlertTriangle, Plus, Trash, ExternalLink, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDateShort } from "@/lib/utils"
import { getBookingById, getBookingDetail, type Booking } from "@/services/bookingService"
import { getAllCities, getCitiesWithBookingInfo, type BookingCity } from "@/services/cityService"
import { getGamesByAgeAndEvent } from "@/services/eventService"

// Booking statuses that can be updated
const statuses = [
  { id: "1", name: "Pending", label: "Pending" },
  { id: "2", name: "Confirmed", label: "Confirmed" },
  { id: "3", name: "Cancelled", label: "Cancelled" },
  { id: "4", name: "Completed", label: "Completed" },
  { id: "5", name: "No Show", label: "No Show" },
  { id: "6", name: "Refunded", label: "Refunded" },
]

type Props = {
  params: { id: string }
}

export default function EditBookingPage({ params }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [bookingDetail, setBookingDetail] = useState<any>(null) // Store full API response
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // Form state
  const [status, setStatus] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [parentName, setParentName] = useState("")
  const [parentEmail, setParentEmail] = useState("")
  const [parentPhone, setParentPhone] = useState("")
  const [payment, setPayment] = useState<any>({ payment_id: null, transaction_id: "", amount: "", payment_method: "", payment_status: "" })

  // Children & deletions
  const [children, setChildren] = useState<any[]>([])
  const [deleteChildIds, setDeleteChildIds] = useState<number[]>([])
  const [deleteBookingGameIds, setDeleteBookingGameIds] = useState<number[]>([])

  // City / Event / Games state (re-using New Booking page behavior)
  const [cities, setCities] = useState<{ id: string | number; name: string }[]>([])
  const [bookingCities, setBookingCities] = useState<BookingCity[]>([])
  const [apiEvents, setApiEvents] = useState<any[]>([])
  const [selectedCityId, setSelectedCityId] = useState<string | number>("")
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [isLoadingGames, setIsLoadingGames] = useState(false)
  const [gameError, setGameError] = useState<string | null>(null)
  // Per-child loading state for eligible games
  const [loadingGamesForChild, setLoadingGamesForChild] = useState<Record<number, boolean>>({})

  // Extract booking ID from params
  const bookingId = params.id

  // Fetch booking data (full detail for edit form)
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data = await getBookingDetail(bookingId)
        
        // Store the complete API response
        setBookingDetail(data)

        // Load cities/events similar to New Booking page so edit form can select event/games
        setIsLoadingCities(true)
        try {
          const bookingData = await getCitiesWithBookingInfo()
          setBookingCities(bookingData)
          const formattedCities = bookingData.map(city => ({ id: city.id, name: city.city_name }))
          setCities(formattedCities)
        } catch (err) {
          // Silent error handling
        } finally {
          setIsLoadingCities(false)
        }

        // Set selected city / event if present
        const eventId = data.event?.id ?? data.event_id ?? null
        const cityId = data.event?.city_id ?? data.event?.venue?.city_id ?? null
        if (cityId) setSelectedCityId(cityId)
        if (eventId) setSelectedEventId(Number(eventId))

        // Try set normalized summary booking so the display card shows existing data
        try {
          const summary = await getBookingById(bookingId)
          setBooking(summary)
        } catch (err) {
          // as before, fallback to minimal booking object
          setBooking({
            booking_id: data.id || data.booking_id || 0,
            booking_ref: data.booking_ref || "",
            booking_status: data.status || data.booking_status || "",
            total_amount: data.total_amount || data.totalAmount || data.total || "",
            payment_method: data.payment?.payment_method || data.payments?.[0]?.payment_method || "",
            payment_status: data.payment?.payment_status || data.payments?.[0]?.payment_status || "",
            terms_accepted: !!data.terms_accepted,
            booking_is_active: data.booking_is_active ?? true,
            booking_created_at: data.booking_date || data.created_at || "",
            booking_updated_at: data.updated_at || "",
            cancelled_at: data.cancelled_at ?? null,
            completed_at: data.completed_at ?? null,
            parent_id: data.parent?.id ?? data.parent_id ?? 0,
            parent_name: data.parent?.name || data.parent_name || "",
            parent_email: data.parent?.email || data.parent_email || "",
            parent_additional_phone: data.parent?.phone || data.parent_additional_phone || "",
            parent_is_active: data.parent?.is_active ?? true,
            parent_created_at: data.parent?.created_at || "",
            parent_updated_at: data.parent?.updated_at || "",
            child_id: data.children && data.children[0]?.child_id ? data.children[0].child_id : (data.child_id ?? 0),
            child_full_name: data.children && data.children[0]?.full_name ? data.children[0].full_name : (data.child_full_name || ""),
            child_date_of_birth: data.children && data.children[0]?.date_of_birth ? data.children[0].date_of_birth : (data.child_date_of_birth || ""),
            child_school_name: data.children && data.children[0]?.school_name ? data.children[0].school_name : (data.child_school_name || ""),
            child_gender: data.children && data.children[0]?.gender ? data.children[0].gender : (data.child_gender || ""),
            child_is_active: true,
            child_created_at: "",
            child_updated_at: "",
            game_name: data.children && data.children[0]?.booking_games && data.children[0].booking_games[0]?.game_name ? data.children[0].booking_games[0].game_name : "",
            game_description: "",
            game_min_age: 0,
            game_max_age: 0,
            game_duration_minutes: 0,
            game_categories: [],
            game_is_active: true,
            game_created_at: "",
            game_updated_at: "",
            event_id: data.event?.id ?? data.event_id ?? 0,
            event: data.event ?? null,
            event_title: data.event?.name || data.event_title || "",
            event_description: data.event?.description || data.event_description || "",
            event_event_date: data.event?.date || data.event_date || "",
            event_status: data.event?.status || data.event_status || "",
            event_created_at: "",
            event_updated_at: "",
            user_full_name: data.user?.full_name || data.user_full_name || "",
            user_email: data.user?.email || data.user_email || "",
            user_phone: data.user?.phone || data.user_phone || "",
            user_city_id: data.user?.city_id ?? data.user_city_id ?? 0,
            user_accepted_terms: !!data.user?.accepted_terms,
            user_terms_accepted_at: data.user?.terms_accepted_at || null,
            user_is_active: data.user?.is_active ?? true,
            user_is_locked: data.user?.is_locked ?? false,
            user_locked_until: data.user?.locked_until || null,
            user_deactivated_at: data.user?.deactivated_at || null,
            user_created_at: data.user?.created_at || "",
            user_updated_at: data.user?.updated_at || "",
            user_last_login_at: data.user?.last_login_at || null,
            city_name: data.event?.venue?.city || data.city_name || "",
            city_state: data.event?.venue?.state || data.city_state || "",
            city_is_active: true,
            city_created_at: "",
            city_updated_at: "",
            venue_name: data.event?.venue?.name || data.venue_name || "",
            venue_address: data.event?.venue?.address || data.venue_address || "",
            venue_capacity: data.event?.venue?.capacity ?? data.venue_capacity ?? 0,
            venue_is_active: true,
            venue_created_at: "",
            venue_updated_at: "",
          } as Booking)
        }

        // Extract parent information with multiple fallback strategies
        // Note: Backend may return empty strings, so we need to filter those out
        const parentName = data.parent?.name?.trim() || data.parent_name?.trim() || data.parentName?.trim() || 
                          (data.data?.parent?.name?.trim()) || (data.data?.parent_name?.trim()) || "";
        const parentEmail = data.parent?.email?.trim() || data.parent_email?.trim() || data.parentEmail?.trim() || 
                           (data.data?.parent?.email?.trim()) || (data.data?.parent_email?.trim()) || "";
        const parentPhone = data.parent?.phone?.trim() || data.parent_phone?.trim() || data.parentPhone?.trim() || 
                           data.additional_phone?.trim() || data.parent_additional_phone?.trim() || 
                           (data.data?.parent?.phone?.trim()) || (data.data?.parent_phone?.trim()) || "";
        
        setStatus(data.status || data.booking_status || "")
        setTotalAmount(String(data.total_amount ?? data.totalAmount ?? data.total ?? ""))
        setParentName(parentName)
        setParentEmail(parentEmail)
        setParentPhone(parentPhone)
        setPayment({
          payment_id: data.payments && data.payments[0]?.payment_id ? data.payments[0].payment_id : (data.payment?.payment_id ?? null),
          transaction_id: data.payments && data.payments[0]?.transaction_id ? data.payments[0].transaction_id : (data.payment?.transaction_id ?? ""),
          amount: data.payments && data.payments[0]?.amount ? data.payments[0].amount : (data.payment?.amount ?? ""),
          payment_method: data.payments && data.payments[0]?.payment_method ? data.payments[0].payment_method : (data.payment?.payment_method ?? ""),
          payment_status: data.payments && data.payments[0]?.payment_status ? data.payments[0].payment_status : (data.payment?.payment_status ?? "")
        })

        // Normalize children to expected edit shape
        const normalizedChildren = (Array.isArray(data.children) ? data.children : []).map((c: any) => ({
          child_id: c.child_id ?? c.id ?? null,
          full_name: c.full_name || c.child_full_name || "",
          date_of_birth: c.date_of_birth || c.child_date_of_birth || "",
          gender: c.gender || c.child_gender || "",
          school_name: c.school_name || c.child_school_name || "",
          booking_games: Array.isArray(c.booking_games) ? c.booking_games.map((g: any) => ({
            booking_game_id: g.booking_game_id ?? g.id ?? null,
            game_id: g.game_id ?? g.gameId ?? null,
            slot_id: g.slot_id ?? g.slotId ?? null,
            game_price: g.game_price ?? g.slot_custom_price ?? g.price ?? ""
          })) : []
        }))

        setChildren(normalizedChildren)
      } catch (error: any) {
        setError(error.message || "Failed to load booking details")
        toast({
          title: "Error",
          description: "Failed to load booking details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (bookingId) {
      fetchBooking()
    }
  }, [bookingId, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSaving(true)

      // Build the payload according to the API contract
      const payload: any = {
        status: status,
        total_amount: Number(totalAmount) || 0,
        parent: {
          id: booking?.parent_id ?? undefined,
          name: parentName,
          email: parentEmail,
          phone: parentPhone
        },
        children: children.map((c) => ({
          child_id: c.child_id ?? undefined,
          full_name: c.full_name,
          date_of_birth: c.date_of_birth,
          gender: c.gender,
          school_name: c.school_name,
          booking_games: c.booking_games.map((g: any) => ({
            booking_game_id: g.booking_game_id ?? undefined,
            game_id: g.game_id,
            slot_id: g.slot_id,
            game_price: Number(g.game_price) || 0
          }))
        })),
        delete_child_ids: deleteChildIds,
        delete_booking_game_ids: deleteBookingGameIds,
        payment: {
          payment_id: payment.payment_id ?? undefined,
          transaction_id: payment.transaction_id,
          amount: Number(payment.amount) || 0,
          payment_method: payment.payment_method,
          payment_status: payment.payment_status
        }
      }

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Failed to update booking: ${response.status}`)
      }

      const data = await response.json()

      toast({ title: 'Success', description: 'Booking updated successfully.' })
      setIsSaved(true)

      setTimeout(() => {
        setIsSaved(false)
        router.push(`/admin/bookings/${bookingId}`)
      }, 1200)
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update booking', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-skyblue-100 via-coral-100 to-mint-100 dark:from-skyblue-900/20 dark:via-coral-900/20 dark:to-mint-900/20 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-skyblue-600" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-skyblue-600 via-coral-600 to-mint-600 bg-clip-text text-transparent">Loading booking details...</h2>
          <p className="text-muted-foreground mt-2">Please wait while we fetch the booking information.</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-skyblue-100 via-coral-100 to-mint-100 dark:from-skyblue-900/20 dark:via-coral-900/20 dark:to-mint-900/20 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-coral-600" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-skyblue-600 via-coral-600 to-mint-600 bg-clip-text text-transparent">
            {error ? "Error loading booking" : "Booking not found"}
          </h2>
          <p className="text-muted-foreground mt-2">
            {error || "The booking you are looking for does not exist."}
          </p>
          <Button className="mt-6 bg-gradient-to-r from-skyblue-500 to-coral-500 hover:from-skyblue-600 hover:to-coral-600 text-white shadow-lg" onClick={() => router.push("/admin/bookings")}>
            Back to Bookings
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-skyblue-100 via-coral-100 to-mint-100 dark:from-skyblue-900/20 dark:via-coral-900/20 dark:to-mint-900/20 py-6 sm:py-12 px-3 sm:px-4 lg:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="outline" size="icon" asChild className="touch-manipulation flex-shrink-0 border-2 border-skyblue-300 hover:bg-skyblue-50 hover:border-skyblue-400 shadow-lg transition-all duration-200">
              <Link href={`/admin/bookings/${bookingId}`}>
                <ArrowLeft className="h-5 w-5 text-skyblue-600" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-skyblue-600 via-coral-600 to-mint-600 bg-clip-text text-transparent">Edit Booking</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">Update booking details for #{booking.booking_id}</p>
            </div>
          </div>
        </div>

        {/* Booking Information Display */}
        <Card className="relative overflow-hidden shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 rounded-3xl">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-skyblue-400 via-coral-400 to-mint-400"></div>
          <CardHeader className="pb-4">
            <div className="bg-gradient-to-br from-skyblue-400/20 to-coral-400/20 p-4 rounded-2xl shadow-lg border-2 border-skyblue-400/30">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-skyblue-700 to-coral-700 bg-clip-text text-transparent">Booking Information</CardTitle>
              <CardDescription className="mt-1">Current booking details (read-only)</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {/* Debug Info - Temporary */}
            {bookingDetail && (
              <details className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg text-xs">
                <summary className="cursor-pointer font-semibold text-yellow-800 dark:text-yellow-200">🔍 Debug: API Response Structure (Click to expand)</summary>
                <div className="mt-2 overflow-auto max-h-96">
                  <pre className="font-mono text-xs whitespace-pre-wrap">
                    {JSON.stringify(bookingDetail, null, 2)}
                  </pre>
                </div>
              </details>
            )}
            
            {/* Booking Reference & Status */}
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-2 p-4 rounded-2xl bg-gradient-to-br from-skyblue-50 to-mint-50 dark:from-skyblue-950 dark:to-mint-950 border-2 border-skyblue-200 dark:border-skyblue-800">
                <Label className="text-sm font-semibold text-skyblue-700 dark:text-skyblue-300">Booking Reference</Label>
                <p className="text-base font-medium break-words">{bookingDetail?.booking_ref || booking?.booking_ref || 'N/A'}</p>
              </div>
              <div className="space-y-2 p-4 rounded-2xl bg-gradient-to-br from-coral-50 to-mint-50 dark:from-coral-950 dark:to-mint-950 border-2 border-coral-200 dark:border-coral-800">
                <Label className="text-sm font-semibold text-coral-700 dark:text-coral-300">Status</Label>
                <p className="text-base font-medium break-words">{bookingDetail?.status || booking?.booking_status || 'N/A'}</p>
              </div>
              <div className="space-y-2 p-4 rounded-2xl bg-gradient-to-br from-mint-50 to-lavender-50 dark:from-mint-950 dark:to-lavender-950 border-2 border-mint-200 dark:border-mint-800">
                <Label className="text-sm font-semibold text-mint-700 dark:text-mint-300">Total Amount</Label>
                <p className="text-base font-medium break-words">₹{bookingDetail?.total_amount || booking?.total_amount || '0'}</p>
              </div>
            </div>

            {/* Parent Details */}
            <div className="space-y-2 p-4 rounded-2xl bg-gradient-to-br from-skyblue-50 to-coral-50 dark:from-skyblue-950 dark:to-coral-950 border-2 border-skyblue-200 dark:border-skyblue-800">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-lg font-bold text-skyblue-700 dark:text-skyblue-300">Parent Details</Label>
                {(!bookingDetail?.parent?.name?.trim() && !parentName?.trim()) && (
                  <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 px-2 py-1 rounded-full">
                    ⚠️ Missing - Please update below
                  </span>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">Name</Label>
                  <p className="text-sm font-medium break-words">
                    {(bookingDetail?.parent?.name?.trim() || 
                     bookingDetail?.parent_name?.trim() || 
                     bookingDetail?.data?.parent?.name?.trim() || 
                     parentName?.trim() || 
                     booking?.parent_name?.trim()) || 
                     <span className="text-muted-foreground italic">Not provided - update in form below</span>}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">Email</Label>
                  <p className="text-sm font-medium break-all">
                    {(bookingDetail?.parent?.email?.trim() || 
                     bookingDetail?.parent_email?.trim() || 
                     bookingDetail?.data?.parent?.email?.trim() || 
                     parentEmail?.trim() || 
                     booking?.parent_email?.trim()) || 
                     <span className="text-muted-foreground italic">Not provided - update in form below</span>}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">Phone</Label>
                  <p className="text-sm font-medium">
                    {(bookingDetail?.parent?.phone?.trim() || 
                     bookingDetail?.parent_phone?.trim() || 
                     bookingDetail?.additional_phone?.trim() || 
                     bookingDetail?.data?.parent?.phone?.trim() || 
                     parentPhone?.trim() || 
                     booking?.parent_additional_phone?.trim()) || 
                     <span className="text-muted-foreground italic">Not provided - update in form below</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Event & Venue Details */}
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2 p-4 rounded-2xl bg-gradient-to-br from-mint-50 to-lavender-50 dark:from-mint-950 dark:to-lavender-950 border-2 border-mint-200 dark:border-mint-800">
                <Label className="text-sm font-semibold text-mint-700 dark:text-mint-300">Event</Label>
                <p className="text-base font-medium break-words">{bookingDetail?.event?.name || booking?.event_title || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">{bookingDetail?.event?.date ? formatDateShort(bookingDetail.event.date) : (booking?.event_event_date ? formatDateShort(booking.event_event_date) : 'N/A')}</p>
                {bookingDetail?.event?.description && (
                  <p className="text-xs text-muted-foreground mt-2">{bookingDetail.event.description}</p>
                )}
              </div>
              <div className="space-y-2 p-4 rounded-2xl bg-gradient-to-br from-lavender-50 to-skyblue-50 dark:from-lavender-950 dark:to-skyblue-950 border-2 border-lavender-200 dark:border-lavender-800">
                <Label className="text-sm font-semibold text-lavender-700 dark:text-lavender-300">Venue</Label>
                <p className="text-base font-medium break-words">{bookingDetail?.event?.venue?.name || booking?.venue_name || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">{bookingDetail?.event?.venue?.city || booking?.city_name || 'N/A'}</p>
                {bookingDetail?.event?.venue?.address && (
                  <p className="text-xs text-muted-foreground mt-2">{bookingDetail.event.venue.address}</p>
                )}
              </div>
            </div>

            {/* Children Details */}
            {bookingDetail?.children && Array.isArray(bookingDetail.children) && bookingDetail.children.length > 0 && (
              <div className="space-y-3">
                <Label className="text-lg font-bold text-coral-700 dark:text-coral-300 block">Children & Games</Label>
                {bookingDetail.children.map((child: any, idx: number) => (
                  <div key={child.child_id || idx} className="p-4 rounded-2xl bg-gradient-to-br from-coral-50 to-mint-50 dark:from-coral-950 dark:to-mint-950 border-2 border-coral-200 dark:border-coral-800">
                    <div className="mb-3">
                      <p className="text-base font-semibold text-coral-700 dark:text-coral-300">{child.full_name}</p>
                      <div className="grid gap-2 sm:grid-cols-3 mt-2 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">DOB:</span> {child.date_of_birth ? formatDateShort(child.date_of_birth) : 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Gender:</span> {child.gender || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">School:</span> {child.school_name || 'N/A'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Child's Games */}
                    {child.booking_games && Array.isArray(child.booking_games) && child.booking_games.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase">Booked Games:</Label>
                        {child.booking_games.map((game: any, gIdx: number) => (
                          <div key={game.booking_game_id || gIdx} className="pl-3 py-2 border-l-4 border-mint-400 bg-white/50 dark:bg-gray-900/50 rounded-r">
                            <p className="text-sm font-medium">{game.game_name || `Game #${game.game_id}`}</p>
                            <div className="grid gap-2 sm:grid-cols-2 mt-1 text-xs text-muted-foreground">
                              {game.slot_start_time && game.slot_end_time && (
                                <div>
                                  <Clock className="inline h-3 w-3 mr-1" />
                                  {game.slot_start_time} - {game.slot_end_time}
                                </div>
                              )}
                              {game.game_price && (
                                <div className="text-green-600 font-medium">
                                  Price: ₹{game.game_price}
                                </div>
                              )}
                            </div>
                            {game.slot_custom_title && (
                              <p className="text-xs text-muted-foreground mt-1">Slot: {game.slot_custom_title}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Payment Details */}
            {bookingDetail?.payments && Array.isArray(bookingDetail.payments) && bookingDetail.payments.length > 0 && (
              <div className="space-y-3">
                <Label className="text-lg font-bold text-lavender-700 dark:text-lavender-300 block">Payment Details</Label>
                {bookingDetail.payments.map((pmt: any, idx: number) => (
                  <div key={pmt.payment_id || idx} className="p-4 rounded-2xl bg-gradient-to-br from-lavender-50 to-skyblue-50 dark:from-lavender-950 dark:to-skyblue-950 border-2 border-lavender-200 dark:border-lavender-800">
                    <div className="grid gap-3 sm:grid-cols-4">
                      <div>
                        <Label className="text-xs font-semibold text-muted-foreground uppercase">Transaction ID</Label>
                        <p className="text-sm font-medium break-words">{pmt.transaction_id || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-muted-foreground uppercase">Amount</Label>
                        <p className="text-sm font-medium">₹{pmt.amount || '0'}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-muted-foreground uppercase">Method</Label>
                        <p className="text-sm font-medium">{pmt.payment_method || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-muted-foreground uppercase">Status</Label>
                        <p className="text-sm font-medium">{pmt.payment_status || 'N/A'}</p>
                      </div>
                    </div>
                    {pmt.payment_date && (
                      <p className="text-xs text-muted-foreground mt-2">Date: {new Date(pmt.payment_date).toLocaleString()}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Update Form */}
        <form onSubmit={handleSubmit}>
          <Card className="relative overflow-hidden shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 rounded-3xl">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-skyblue-400 via-coral-400 to-mint-400"></div>
            <CardHeader className="pb-4">
              <div className="bg-gradient-to-br from-skyblue-400/20 to-coral-400/20 p-4 rounded-2xl shadow-lg border-2 border-skyblue-400/30">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-skyblue-700 to-coral-700 bg-clip-text text-transparent">Edit Booking</CardTitle>
                <CardDescription className="mt-1">Update booking fields, children, games and payment</CardDescription>
              </div>
              
              {/* Warning if parent data is missing */}
              {(!parentName?.trim() || !parentEmail?.trim() || !parentPhone?.trim()) && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-amber-900 dark:text-amber-100">Parent Information Missing</p>
                      <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                        This booking was created without complete parent information. Please fill in the parent details below and save to update the record.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="status" className="text-sm font-semibold text-skyblue-700 dark:text-skyblue-300 mb-2 block">Booking Status</Label>
                  <Select value={status} onValueChange={setStatus} required>
                    <SelectTrigger id="status" className="border-2 border-skyblue-200 focus:border-skyblue-400 focus:ring-2 focus:ring-skyblue-200 bg-white hover:bg-skyblue-50 dark:bg-gray-800 dark:border-skyblue-600 dark:hover:bg-gray-700 h-12 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-2 border-skyblue-200">
                      {statuses.map((s) => (
                        <SelectItem key={s.id} value={s.name} className="rounded-xl">
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="totalAmount" className="text-sm font-semibold text-coral-700 dark:text-coral-300 mb-2 block">Total Amount (₹)</Label>
                  <Input id="totalAmount" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} className="border-2 border-coral-200 focus:border-coral-400 focus:ring-2 focus:ring-coral-200 bg-white hover:bg-coral-50 dark:bg-gray-800 dark:border-coral-600 dark:hover:bg-gray-700 h-12 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl" />
                </div>

                <div>
                  <Label htmlFor="parentName" className="text-sm font-semibold text-mint-700 dark:text-mint-300 mb-2 block">Parent Name</Label>
                  <Input id="parentName" value={parentName} onChange={(e) => setParentName(e.target.value)} className="border-2 border-mint-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-200 bg-white hover:bg-mint-50 dark:bg-gray-800 dark:border-mint-600 dark:hover:bg-gray-700 h-12 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl" />
                </div>

                <div>
                  <Label htmlFor="parentEmail" className="text-sm font-semibold text-lavender-700 dark:text-lavender-300 mb-2 block">Parent Email</Label>
                  <Input id="parentEmail" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} className="border-2 border-lavender-200 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-200 bg-white hover:bg-lavender-50 dark:bg-gray-800 dark:border-lavender-600 dark:hover:bg-gray-700 h-12 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl" />
                </div>

                <div>
                  <Label htmlFor="parentPhone" className="text-sm font-semibold text-skyblue-700 dark:text-skyblue-300 mb-2 block">Parent Phone</Label>
                  <Input id="parentPhone" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} className="border-2 border-skyblue-200 focus:border-skyblue-400 focus:ring-2 focus:ring-skyblue-200 bg-white hover:bg-skyblue-50 dark:bg-gray-800 dark:border-skyblue-600 dark:hover:bg-gray-700 h-12 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl" />
                </div>

              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-6"></div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-skyblue-600 to-coral-600 bg-clip-text text-transparent">Children</h3>
                  <Button type="button" size="sm" onClick={() => setChildren([...children, { full_name: "", date_of_birth: "", gender: "", school_name: "", booking_games: [] }])} className="bg-gradient-to-r from-mint-500 to-skyblue-500 hover:from-mint-600 hover:to-skyblue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl">
                    <Plus className="mr-2 h-4 w-4" /> Add Child
                  </Button>
                </div>

                {children.map((c, ci) => (
                  <Card key={ci} className="p-6 rounded-3xl bg-gradient-to-br from-white to-skyblue-50/30 dark:from-gray-800 dark:to-skyblue-900/10 border-2 border-skyblue-200 dark:border-skyblue-800 shadow-xl">
                    <div className="flex justify-between items-start">
                      <div className="w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm font-semibold text-skyblue-700 dark:text-skyblue-300 mb-2 block">Full Name</Label>
                            <Input value={c.full_name} onChange={(e) => {
                              const copy = [...children]; copy[ci].full_name = e.target.value; setChildren(copy);
                            }} className="border-2 border-skyblue-200 focus:border-skyblue-400 focus:ring-2 focus:ring-skyblue-200 bg-white hover:bg-skyblue-50 dark:bg-gray-800 dark:border-skyblue-600 h-11 rounded-xl transition-all duration-200" />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-coral-700 dark:text-coral-300 mb-2 block">Date of Birth</Label>
                            <Input type="date" value={c.date_of_birth} onChange={(e) => {
                              const copy = [...children]; copy[ci].date_of_birth = e.target.value; setChildren(copy);
                            }} className="border-2 border-coral-200 focus:border-coral-400 focus:ring-2 focus:ring-coral-200 bg-white hover:bg-coral-50 dark:bg-gray-800 dark:border-coral-600 h-11 rounded-xl transition-all duration-200" />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-mint-700 dark:text-mint-300 mb-2 block">Gender</Label>
                            <Input value={c.gender} onChange={(e) => { const copy = [...children]; copy[ci].gender = e.target.value; setChildren(copy); }} className="border-2 border-mint-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-200 bg-white hover:bg-mint-50 dark:bg-gray-800 dark:border-mint-600 h-11 rounded-xl transition-all duration-200" />
                          </div>
                          <div className="sm:col-span-3">
                            <Label className="text-sm font-semibold text-lavender-700 dark:text-lavender-300 mb-2 block">School</Label>
                            <Input value={c.school_name} onChange={(e) => { const copy = [...children]; copy[ci].school_name = e.target.value; setChildren(copy); }} className="border-2 border-lavender-200 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-200 bg-white hover:bg-lavender-50 dark:bg-gray-800 dark:border-lavender-600 h-11 rounded-xl transition-all duration-200" />
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-lg bg-gradient-to-r from-coral-600 to-mint-600 bg-clip-text text-transparent">Games</h4>
                            <div className="flex gap-2">
                              <Button size="sm" type="button" onClick={() => {
                                const copy = [...children]; copy[ci].booking_games = copy[ci].booking_games || []; copy[ci].booking_games.push({ game_id: null, slot_id: null, game_price: "" }); setChildren(copy);
                              }} className="bg-gradient-to-r from-coral-500 to-mint-500 hover:from-coral-600 hover:to-mint-600 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-xl">
                                <Plus className="mr-2 h-4 w-4" /> Add Game
                              </Button>

                              <Button
                                size="sm"
                                type="button"
                                className="bg-gradient-to-r from-skyblue-500 to-lavender-500 hover:from-skyblue-600 hover:to-lavender-600 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-xl"
                                onClick={async () => {
                                // Per-child loading state
                                setGameError(null);
                                if (!selectedEventId) {
                                  setGameError('Select an event first to fetch eligible games')
                                  return
                                }

                                const dob = c.date_of_birth
                                if (!dob) {
                                  setGameError('Child DOB is required to calculate age')
                                  return
                                }

                                const childDob = new Date(dob)
                                const selectedEvent = apiEvents.find(ev => ev.event_id === selectedEventId)
                                const eventDate = selectedEvent?.event_date ? new Date(selectedEvent.event_date) : new Date()

                                const months = Math.max(0, Math.floor((eventDate.getFullYear() - childDob.getFullYear()) * 12 + (eventDate.getMonth() - childDob.getMonth())))

                                try {
                                  setLoadingGamesForChild(prev => ({ ...prev, [ci]: true }))
                                  const gamesData = await getGamesByAgeAndEvent(selectedEventId as number, months)

                                  const copy = [...children]
                                  copy[ci].eligible_games = gamesData || []
                                  setChildren(copy)
                                } catch (err: any) {
                                  setGameError('Failed to load eligible games')
                                } finally {
                                  setLoadingGamesForChild(prev => ({ ...prev, [ci]: false }))
                                }
                              }
                              }
                              disabled={!!loadingGamesForChild[ci]}
                              title={loadingGamesForChild[ci] ? 'Loading eligible games...' : 'Fetch eligible games for this child'}
                            >
                              {loadingGamesForChild[ci] ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Loading
                                </>
                              ) : (
                                <>
                                  <ExternalLink className="mr-2 h-4 w-4" /> Load Eligible Games
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        {(c.booking_games || []).map((g: any, gi: number) => (
                          <div key={gi} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                            <div>
                              <Label>Game</Label>
                              {c.eligible_games && c.eligible_games.length > 0 ? (
                                <Select value={g.slot_id ?? ''} onValueChange={(val) => { const copy = [...children]; copy[ci].booking_games[gi].slot_id = Number(val); copy[ci].booking_games[gi].game_id = Number(c.eligible_games.find((eg: any) => String(eg.slot_id) === String(val))?.game_id ?? g.game_id); setChildren(copy); }}>
                                  <SelectTrigger className="w-full"><SelectValue placeholder="Select game slot" /></SelectTrigger>
                                  <SelectContent>
                                    {c.eligible_games.map((eg: any) => (
                                      <SelectItem key={eg.slot_id} value={String(eg.slot_id)}>
                                        {eg.custom_title || eg.slot_title || `${eg.game_name} — ${eg.start_time}`}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <>
                                  <Label className="text-xs text-muted-foreground">(Manual: enter numeric IDs)</Label>
                                  <Input value={g.game_id ?? ""} onChange={(e) => { const copy = [...children]; copy[ci].booking_games[gi].game_id = Number(e.target.value); setChildren(copy); }} />
                                </>
                              )}
                            </div>

                            <div>
                              <Label>Slot ID</Label>
                              {c.eligible_games && c.eligible_games.length > 0 ? (
                                <Input value={g.slot_id ?? ""} disabled />
                              ) : (
                                <Input value={g.slot_id ?? ""} onChange={(e) => { const copy = [...children]; copy[ci].booking_games[gi].slot_id = Number(e.target.value); setChildren(copy); }} />
                              )}
                            </div>
                            <div>
                              <Label>Price</Label>
                              <Input value={g.game_price ?? ""} onChange={(e) => { const copy = [...children]; copy[ci].booking_games[gi].game_price = e.target.value; setChildren(copy); }} />
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" type="button" onClick={() => {
                                const copy = [...children];
                                const removed = copy[ci].booking_games.splice(gi, 1)[0];
                                if (removed && removed.booking_game_id) setDeleteBookingGameIds([...deleteBookingGameIds, removed.booking_game_id]);
                                setChildren(copy);
                              }} className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-xl">
                                <Trash className="h-4 w-4" /> Remove
                              </Button>
                            </div>
                          </div>
                        ))}

                        {isLoadingGames && <p className="text-sm text-muted-foreground">Loading eligible games...</p>}
                        {gameError && <p className="text-sm text-destructive">{gameError}</p>}
                      </div>

                    </div>

                      <div className="ml-3">
                        <Button size="sm" type="button" onClick={() => {
                          const copy = [...children];
                          const removed = copy.splice(ci, 1)[0];
                          if (removed && removed.child_id) setDeleteChildIds([...deleteChildIds, removed.child_id]);
                          setChildren(copy);
                        }} className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-xl">
                          <Trash className="h-4 w-4" /> Remove Child
                        </Button>
                      </div>
                  </div>
                </Card>
              ))}
            </div>

              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-6"></div>

              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-mint-600 to-lavender-600 bg-clip-text text-transparent mb-4">Payment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-skyblue-700 dark:text-skyblue-300 mb-2 block">Transaction ID</Label>
                    <Input value={payment.transaction_id} onChange={(e) => setPayment({ ...payment, transaction_id: e.target.value })} className="border-2 border-skyblue-200 focus:border-skyblue-400 focus:ring-2 focus:ring-skyblue-200 bg-white hover:bg-skyblue-50 dark:bg-gray-800 dark:border-skyblue-600 h-11 rounded-xl transition-all duration-200" />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-coral-700 dark:text-coral-300 mb-2 block">Amount</Label>
                    <Input value={payment.amount} onChange={(e) => setPayment({ ...payment, amount: e.target.value })} className="border-2 border-coral-200 focus:border-coral-400 focus:ring-2 focus:ring-coral-200 bg-white hover:bg-coral-50 dark:bg-gray-800 dark:border-coral-600 h-11 rounded-xl transition-all duration-200" />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-mint-700 dark:text-mint-300 mb-2 block">Method</Label>
                    <Input value={payment.payment_method} onChange={(e) => setPayment({ ...payment, payment_method: e.target.value })} className="border-2 border-mint-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-200 bg-white hover:bg-mint-50 dark:bg-gray-800 dark:border-mint-600 h-11 rounded-xl transition-all duration-200" />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-lavender-700 dark:text-lavender-300 mb-2 block">Status</Label>
                    <Input value={payment.payment_status} onChange={(e) => setPayment({ ...payment, payment_status: e.target.value })} className="border-2 border-lavender-200 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-200 bg-white hover:bg-lavender-50 dark:bg-gray-800 dark:border-lavender-600 h-11 rounded-xl transition-all duration-200" />
                  </div>
                </div>
              </div>

          </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-4 sm:justify-end p-6">
              <Button variant="outline" type="button" asChild className="w-full sm:w-auto touch-manipulation border-2 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 h-12 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                <Link href={`/admin/bookings/${bookingId}`}>
                  Cancel
                </Link>
              </Button>
              <Button
                type="submit"
                disabled={isSaving || isSaved}
                className="w-full sm:w-auto touch-manipulation bg-gradient-to-r from-skyblue-500 via-coral-500 to-mint-500 hover:from-skyblue-600 hover:via-coral-600 hover:to-mint-600 text-white h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : isSaved ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}
