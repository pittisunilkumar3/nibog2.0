"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Trash, Copy, AlertTriangle, Calendar, Tag, DollarSign, Loader2 } from "lucide-react"
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
import { deletePromoCode } from "@/services/promoCodeService"

// Types for actual API response (flattened structure)
interface PromoCodeAPIResponse {
  promo_code_id: number
  promo_code: string
  type: "percentage" | "fixed"
  value: string
  valid_from: string
  valid_to: string
  usage_limit: number
  usage_count: number
  minimum_purchase_amount: string
  maximum_discount_amount: string
  description: string
  promo_code_active: boolean
  promo_created_at: string
  promo_updated_at: string
  event_id: number
  event_title: string
  event_description: string
  event_date: string
  event_status: string
  city_id: number
  venue_id: number
  game_id: number
  game_name: string
  game_description: string
  min_age: number
  max_age: number
  duration_minutes: number
  categories: string[]
  game_active: boolean
}

// Internal type for component
interface PromoCode {
  id: string
  code: string
  discount: number
  discountType: "percentage" | "fixed"
  maxDiscount: number | null
  minPurchase: number
  validFrom: string
  validTo: string
  usageLimit: number
  usageCount: number
  status: "active" | "inactive" | "expired"
  applicableEvents: Array<{
    id: number
    title: string
  }>
  createdAt: string
  lastUpdatedAt: string
  description: string
  // All events and games data
  eventsData?: Array<{
    event_details: {
      id: number
      title: string
      description?: string
      event_date: string
      status: string
    }
    games: Array<{
      id: number
      game_name: string
      description?: string
      min_age: number
      max_age: number
      duration_minutes: number
      categories: string[]
    }>
  }>
  // Currently selected event and game details
  eventDetails?: {
    id: number
    title: string
    description: string
    date: string
    status: string
  }
  gameDetails?: {
    id: number
    name: string
    description: string
    minAge: number
    maxAge: number
    duration: number
    categories: string[]
  }
}

// Helper function to safely parse dates
const safeDateParse = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A'

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }
    return date.toISOString().split('T')[0]
  } catch (error) {
    console.warn('Error parsing date:', dateString, error)
    return 'Invalid Date'
  }
}

// Helper function to safely check if date is valid for comparison
const isValidDate = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false

  try {
    const date = new Date(dateString)
    return !isNaN(date.getTime())
  } catch (error) {
    return false
  }
}

// API function to fetch promo code details
const fetchPromoCodeDetails = async (id: string): Promise<PromoCode> => {
  try {
    const timestamp = new Date().getTime()
    const response = await fetch(`/api/promo-codes/get?t=${timestamp}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({ id: parseInt(id) }),
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch promo code details')
    }

    const responseData = await response.json()

    // The API returns an array with one object, so we need to extract the first item
    let data: any
    if (Array.isArray(responseData)) {
      if (responseData.length === 0) {
        throw new Error('Promo code not found')
      }
      data = responseData[0]
    } else {
      data = responseData
    }

    if (!data) {
      throw new Error('Promo code not found')
    }

    // Check if the response has the new nested structure with promo_data
    if (data.promo_data) {
      const promoDetails = data.promo_data.promo_details || {}
      const events = data.promo_data.events || []

      // Get the first event and game for details (can be expanded to show all)
      const firstEvent = events && events.length > 0 ? events[0] : null
      const firstGame = firstEvent && firstEvent.games && firstEvent.games.length > 0 ? firstEvent.games[0] : null
      const eventDetails = firstEvent && firstEvent.event_details ? firstEvent.event_details : null

      // Extract applicable events with id and title
      const applicableEvents = events && events.length > 0 ?
        events.map((event: any) => event && event.event_details ? {
          id: event.event_details.id || 0,
          title: event.event_details.title || 'Unknown Event'
        } : {
          id: 0,
          title: 'Unknown Event'
        }) : 
        []

      // Transform API data to component format
      const validFrom = safeDateParse(promoDetails.valid_from)
      const validTo = safeDateParse(promoDetails.valid_to)
      const currentDate = new Date()

      // Determine status
      let status: "active" | "inactive" | "expired" = "inactive"
      if (promoDetails.is_active) {
        if (isValidDate(promoDetails.valid_to)) {
          const validToDate = new Date(promoDetails.valid_to)
          status = validToDate < currentDate ? "expired" : "active"
        } else {
          status = "active" // If we can't parse the date, assume it's active if the flag says so
        }
      }

      // Safely construct the return object with defensive checks for all properties
      return {
        id: promoDetails && promoDetails.id ? promoDetails.id.toString() : 'unknown',
        code: promoDetails && promoDetails.promo_code ? promoDetails.promo_code : 'Unknown Code',
        discount: promoDetails && promoDetails.value !== undefined ? promoDetails.value : 0,
        discountType: promoDetails && promoDetails.type ? promoDetails.type : 'percentage',
        maxDiscount: promoDetails && promoDetails.maximum_discount_amount !== undefined ? promoDetails.maximum_discount_amount : null,
        minPurchase: promoDetails && promoDetails.minimum_purchase_amount !== undefined ? promoDetails.minimum_purchase_amount : 0,
        validFrom,
        validTo,
        usageLimit: promoDetails && promoDetails.usage_limit !== undefined ? promoDetails.usage_limit : 0,
        usageCount: promoDetails && promoDetails.usage_count !== undefined ? promoDetails.usage_count : 0,
        status,
        applicableEvents: applicableEvents && applicableEvents.length > 0 ? applicableEvents : [{ id: 0, title: "All" }],
        createdAt: safeDateParse(promoDetails && promoDetails.created_at),
        lastUpdatedAt: safeDateParse(promoDetails && promoDetails.updated_at),
        description: promoDetails && promoDetails.description ? promoDetails.description : 'No description available',
        eventsData: events,
        eventDetails: eventDetails ? {
          id: eventDetails.id || 0,
          title: eventDetails.title || 'Unknown Event',
          description: '', // Not available in the new API response
          date: safeDateParse(eventDetails.event_date),
          status: eventDetails.status || 'Unknown'
        } : undefined,
        gameDetails: firstGame ? {
          id: firstGame.id || 0,
          name: firstGame.game_name || 'Unknown Game',
          description: '', // Not available in the new API response
          minAge: typeof firstGame.min_age === 'number' ? firstGame.min_age : 0,
          maxAge: typeof firstGame.max_age === 'number' ? firstGame.max_age : 0,
          duration: typeof firstGame.duration_minutes === 'number' ? firstGame.duration_minutes : 0,
          categories: Array.isArray(firstGame.categories) ? firstGame.categories : []
        } : undefined
      }
    } else {
      // Handle the old API response format (flat structure) for backward compatibility
      // Transform API data to component format
      const validFrom = safeDateParse(data.valid_from)
      const validTo = safeDateParse(data.valid_to)
      const currentDate = new Date()

      // Determine status
      let status: "active" | "inactive" | "expired" = "inactive"
      if (data.promo_code_active) {
        if (isValidDate(data.valid_to)) {
          const validToDate = new Date(data.valid_to)
          status = validToDate < currentDate ? "expired" : "active"
        } else {
          status = "active" // If we can't parse the date, assume it's active if the flag says so
        }
      }

      // Extract applicable events with id and title
      const applicableEvents = data.event_title ? [{ id: data.event_id || 0, title: data.event_title }] : [{ id: 0, title: "All" }]

      return {
        id: data.promo_code_id?.toString() || 'unknown',
        code: data.promo_code || 'Unknown Code',
        discount: data.value ? parseFloat(data.value) : 0,
        discountType: data.type || 'percentage',
        maxDiscount: data.maximum_discount_amount ? parseFloat(data.maximum_discount_amount) : null,
        minPurchase: data.minimum_purchase_amount ? parseFloat(data.minimum_purchase_amount) : 0,
        validFrom,
        validTo,
        usageLimit: data.usage_limit || 0,
        usageCount: data.usage_count || 0,
        status,
        applicableEvents,
        createdAt: safeDateParse(data.promo_created_at),
        lastUpdatedAt: safeDateParse(data.promo_updated_at),
        description: data.description || 'No description available',
        eventDetails: data.event_id ? {
          id: data.event_id,
          title: data.event_title || 'Unknown Event',
          description: data.event_description || 'No description available',
          date: safeDateParse(data.event_date),
          status: data.event_status || 'Unknown'
        } : undefined,
        gameDetails: data.game_id ? {
          id: data.game_id,
          name: data.game_name || 'Unknown Game',
          description: data.game_description || 'No description available',
          minAge: data.min_age || 0,
          maxAge: data.max_age || 0,
          duration: data.duration_minutes || 0,
          categories: data.categories || []
        } : undefined
      }
    }
  } catch (error) {
    console.error('Error fetching promo code details:', error)
    throw error
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
    case "inactive":
      return <Badge variant="outline">Inactive</Badge>
    case "expired":
      return <Badge className="bg-red-500 hover:bg-red-600">Expired</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

type Props = {
  params: { id: string }
}

export default function PromoCodeDetailPage({ params }: Props) {
  const router = useRouter()
  const { toast } = useToast()

  // In Next.js app router, params is already resolved
  const promoCodeId = params.id

  const [promoCode, setPromoCode] = useState<PromoCode | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)

  // Fetch promo code details on component mount
  useEffect(() => {
    const loadPromoCodeDetails = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const details = await fetchPromoCodeDetails(promoCodeId)
        setPromoCode(details)
        
        // Set the first event as selected by default if available
        if (details.eventsData && details.eventsData.length > 0 && details.eventsData[0].event_details) {
          setSelectedEventId(details.eventsData[0].event_details.id)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load promo code details. Please try again.')
        console.error('Error loading promo code details:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadPromoCodeDetails()
  }, [promoCodeId])
  
  // Handle event selection
  const handleEventSelect = (eventId: number) => {
    if (!promoCode || !promoCode.eventsData) return
    
    setSelectedEventId(eventId)
    
    // Find the selected event
    const selectedEvent = promoCode.eventsData.find(event => 
      event.event_details && event.event_details.id === eventId
    )
    
    if (selectedEvent) {
      const eventDetails = selectedEvent.event_details
      const firstGame = selectedEvent.games && selectedEvent.games.length > 0 ? selectedEvent.games[0] : null
      
      // Update promoCode with selected event details
      setPromoCode(prev => {
        if (!prev) return prev
        
        return {
          ...prev,
          eventDetails: eventDetails ? {
            id: eventDetails.id || 0,
            title: eventDetails.title || 'Unknown Event',
            description: eventDetails.description || '',
            date: safeDateParse(eventDetails.event_date),
            status: eventDetails.status || 'Unknown'
          } : undefined,
          gameDetails: firstGame ? {
            id: firstGame.id || 0,
            name: firstGame.game_name || 'Unknown Game',
            description: firstGame.description || '',
            minAge: typeof firstGame.min_age === 'number' ? firstGame.min_age : 0,
            maxAge: typeof firstGame.max_age === 'number' ? firstGame.max_age : 0,
            duration: typeof firstGame.duration_minutes === 'number' ? firstGame.duration_minutes : 0,
            categories: Array.isArray(firstGame.categories) ? firstGame.categories : []
          } : undefined
        }
      })
    }
  }
  
  // Handle copy promo code
  const handleCopyPromoCode = () => {
    if (!promoCode) return
    
    setIsProcessing("copy")
    
    navigator.clipboard.writeText(promoCode.code)
      .then(() => {
        setIsProcessing(null)
        alert(`Promo code ${promoCode.code} copied to clipboard!`)
      })
      .catch(err => {
        setIsProcessing(null)
        console.error('Failed to copy: ', err)
      })
  }
  
  // Handle delete promo code
  const handleDeletePromoCode = async () => {
    setIsProcessing("delete")

    try {

      // Call the delete API
      const response = await deletePromoCode(parseInt(promoCodeId))

      if (response.success) {
        toast({
          title: "Success",
          description: "Promo code deleted successfully!",
        })

        // Redirect to the promo codes list
        router.push("/admin/promo-codes")
      } else {
        throw new Error(response.error || "Failed to delete promo code")
      }
    } catch (error: any) {
      console.error("Error deleting promo code:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete promo code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <h2 className="mt-4 text-xl font-semibold">Loading promo code details...</h2>
          <p className="text-muted-foreground">Please wait while we fetch the information.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Error loading promo code</h2>
          <p className="text-muted-foreground">{error}</p>
          <div className="mt-4 space-x-2">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => router.push("/admin/promo-codes")}>
              Back to Promo Codes
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!promoCode) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Promo code not found</h2>
          <p className="text-muted-foreground">The promo code you are looking for does not exist.</p>
          <Button className="mt-4" onClick={() => router.push("/admin/promo-codes")}>
            Back to Promo Codes
          </Button>
        </div>
      </div>
    )
  }
  
  // Calculate usage percentage
  const usagePercentage = Math.round((promoCode.usageCount / promoCode.usageLimit) * 100)
  
  // Check if promo code is expired
  const isExpired = new Date(promoCode.validTo) < new Date()
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/promo-codes">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{promoCode.code}</h1>
            <p className="text-muted-foreground">
              {promoCode.discountType === "percentage"
                ? `${promoCode.discount}% off`
                : `₹${promoCode.discount} off`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleCopyPromoCode}
            disabled={isProcessing === "copy"}
          >
            <Copy className="mr-2 h-4 w-4" />
            {isProcessing === "copy" ? "Copying..." : "Copy Code"}
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/promo-codes/${promoCode.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Promo Code
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20">
                <Trash className="mr-2 h-4 w-4" />
                Delete Promo Code
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Promo Code</AlertDialogTitle>
                <AlertDialogDescription>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                    <div className="space-y-2">
                      <div className="font-medium">This action cannot be undone.</div>
                      <div>
                        This will permanently delete the promo code "{promoCode.code}".
                        {promoCode.usageCount > 0 ? (
                          <>
                            <br />
                            This code has been used {promoCode.usageCount} time{promoCode.usageCount !== 1 ? "s" : ""}.
                            Deleting it may affect reporting and analytics.
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-red-500 hover:bg-red-600"
                  onClick={handleDeletePromoCode}
                  disabled={isProcessing === "delete"}
                >
                  {isProcessing === "delete" ? "Deleting..." : "Delete Promo Code"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Promo Code Details</CardTitle>
            <div className="mt-2 flex gap-2">
              {getStatusBadge(promoCode.status)}
              {isExpired && promoCode.status !== "expired" && (
                <Badge className="bg-red-500 hover:bg-red-600">Expired</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">Discount Information</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    {promoCode.discountType === "percentage" ? (
                      <span className="mt-0.5 inline-block text-muted-foreground">%</span>
                    ) : (
                      <DollarSign className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <p>
                        {promoCode.discountType === "percentage" 
                          ? `${promoCode.discount}% off` 
                          : `₹${promoCode.discount} off`}
                      </p>
                      {promoCode.maxDiscount && promoCode.discountType === "percentage" && (
                        <p className="text-sm text-muted-foreground">
                          Maximum discount: ₹{promoCode.maxDiscount}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Tag className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Minimum purchase: ₹{promoCode.minPurchase}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Validity Period</h3>
                <div className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">From: {promoCode.validFrom}</p>
                    <p className="text-sm text-muted-foreground">To: {promoCode.validTo}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="mb-2 font-medium">Usage Information</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Usage Count</span>
                  <span className="font-medium">{promoCode.usageCount} / {promoCode.usageLimit}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${usagePercentage}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {usagePercentage}% of total limit used
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="mb-2 font-medium">Applicable Events</h3>
              <div className="space-y-2">
                {promoCode.applicableEvents.length === 1 && promoCode.applicableEvents[0].title === "All" ? (
                  <p className="text-sm text-muted-foreground">This promo code is applicable to all events.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {promoCode.applicableEvents.map((event, index) => (
                      <Badge 
                        key={index} 
                        variant={selectedEventId === event.id ? "default" : "outline"}
                        className={`cursor-pointer ${selectedEventId === event.id ? 'bg-primary' : ''}`}
                        onClick={() => handleEventSelect(event.id)}
                      >
                        {event.title}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Event Details */}
            {promoCode.eventDetails && (
              <>
                <Separator />
                <div>
                  <h3 className="mb-2 font-medium">Event Details</h3>
                  <div className="space-y-2">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium">{promoCode.eventDetails.title}</p>
                        <p className="text-xs text-muted-foreground">Event ID: {promoCode.eventDetails.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date: {promoCode.eventDetails.date}</p>
                        <p className="text-xs text-muted-foreground">Status: {promoCode.eventDetails.status}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{promoCode.eventDetails.description}</p>
                  </div>
                </div>
              </>
            )}

            {/* Game Details */}
            {promoCode.gameDetails && (
              <>
                <Separator />
                <div>
                  <h3 className="mb-2 font-medium">Game Details</h3>
                  <div className="space-y-2">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium">{promoCode.gameDetails.name}</p>
                        <p className="text-xs text-muted-foreground">Game ID: {promoCode.gameDetails.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Age: {promoCode.gameDetails.minAge}-{promoCode.gameDetails.maxAge} years
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Duration: {promoCode.gameDetails.duration} minutes
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{promoCode.gameDetails.description}</p>
                    {promoCode.gameDetails.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {promoCode.gameDetails.categories.map((category, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            
            {promoCode.description && (
              <>
                <Separator />
                <div>
                  <h3 className="mb-2 font-medium">Description</h3>
                  <p className="text-sm text-muted-foreground">{promoCode.description}</p>
                </div>
              </>
            )}
            
            <Separator />
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">Created On</h3>
                <p className="text-sm text-muted-foreground">
                  {promoCode.createdAt}
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Last Updated On</h3>
                <p className="text-sm text-muted-foreground">
                  {promoCode.lastUpdatedAt}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" asChild>
              <Link href={`/admin/promo-codes/${promoCode.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Promo Code
              </Link>
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={handleCopyPromoCode}
              disabled={isProcessing === "copy"}
            >
              <Copy className="mr-2 h-4 w-4" />
              {isProcessing === "copy" ? "Copying..." : "Copy Code"}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20" 
                  variant="outline"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Promo Code
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Promo Code</AlertDialogTitle>
                  <AlertDialogDescription>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                      <div className="space-y-2">
                        <div className="font-medium">This action cannot be undone.</div>
                        <div>
                          This will permanently delete the promo code "{promoCode.code}".
                          {promoCode.usageCount > 0 ? (
                            <>
                              <br />
                              This code has been used {promoCode.usageCount} time{promoCode.usageCount !== 1 ? "s" : ""}.
                              Deleting it may affect reporting and analytics.
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-red-500 hover:bg-red-600"
                    onClick={handleDeletePromoCode}
                    disabled={isProcessing === "delete"}
                  >
                    {isProcessing === "delete" ? "Deleting..." : "Delete Promo Code"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
