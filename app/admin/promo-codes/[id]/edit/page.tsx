"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import {
  getPromoCodeById,
  updatePromoCode,
  transformAPIDataToForm,
  transformFormDataToUpdateAPI,
  validatePromoCodeForm,
  type PromoCodeDetail,
  type UpdatePromoCodeRequest
} from "@/services/promoCodeService"
import { getEventsForSelector, getAllGamesFromEvents } from "@/services/eventGameService"

// Discount types
const discountTypes = [
  { id: "1", name: "percentage", label: "Percentage" },
  { id: "2", name: "fixed", label: "Fixed Amount" },
]

// Promo code statuses
const statuses = [
  { id: "1", name: "active", label: "Active" },
  { id: "2", name: "inactive", label: "Inactive" },
  { id: "3", name: "expired", label: "Expired" },
]

type Props = {
  params: { id: string }
}

export default function EditPromoCodePage({ params }: Props) {
  const router = useRouter()
  const { toast } = useToast()

  // In Next.js app router, params is already resolved
  const promoCodeId = params.id

  // Promo code data
  const [promoCode, setPromoCode] = useState<PromoCodeDetail | null>(null)
  const [isLoadingPromoCode, setIsLoadingPromoCode] = useState(true)
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null)

  // Form state
  const [code, setCode] = useState("")
  const [discount, setDiscount] = useState("")
  const [discountType, setDiscountType] = useState("")
  const [maxDiscount, setMaxDiscount] = useState("")
  const [minPurchase, setMinPurchase] = useState("")
  const [validFrom, setValidFrom] = useState("")
  const [validTo, setValidTo] = useState("")
  const [usageLimit, setUsageLimit] = useState("")
  const [status, setStatus] = useState("")
  const [description, setDescription] = useState("")
  const [applyToAll, setApplyToAll] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [selectedGames, setSelectedGames] = useState<string[]>([])

  // Events and games data
  const [events, setEvents] = useState<Array<{id: string, name: string, games: Array<{id: string, name: string}>}>>([])
  const [allGames, setAllGames] = useState<Array<{id: string, name: string, eventName: string}>>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [eventsError, setEventsError] = useState<string | null>(null)

  // Form submission state
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [formErrors, setFormErrors] = useState<string[]>([])

  // Usage statistics
  const [usageCount, setUsageCount] = useState(0)

  // Fetch promo code data
  useEffect(() => {
    const fetchPromoCodeData = async () => {
      try {
        setIsLoadingPromoCode(true)
        setPromoCodeError(null)

        console.log(`Fetching promo code with ID: ${promoCodeId}`)
        const promoCodeData = await getPromoCodeById(parseInt(promoCodeId))
        console.log("Retrieved promo code data:", promoCodeData)

        setPromoCode(promoCodeData)

        // Transform API data to form format
        const formData = transformAPIDataToForm(promoCodeData)

        // Set form values
        setCode(formData.formData.code)
        setDiscount(formData.formData.discount)
        setDiscountType(formData.formData.discountType)
        setMaxDiscount(formData.formData.maxDiscount)
        setMinPurchase(formData.formData.minPurchase)
        setValidFrom(formData.formData.validFrom)
        setValidTo(formData.formData.validTo)
        setUsageLimit(formData.formData.usageLimit)
        setDescription(formData.formData.description)
        setApplyToAll(formData.applyToAll)
        setSelectedEvents(formData.selectedEvents)
        setSelectedGames(formData.selectedGames)
        setUsageCount(formData.usageCount)

        // Set status from form data (which is derived from is_active)
        if (formData.formData.status) {
          setStatus(formData.formData.status)
        } else {
          // Fallback logic if status is not available in form data
          if (promoCodeData.valid_to) {
            const validToDate = new Date(promoCodeData.valid_to)
            const currentDate = new Date()
            setStatus(validToDate < currentDate ? "expired" : (promoCodeData.is_active === false ? "inactive" : "active"))
          } else {
            setStatus(promoCodeData.is_active === false ? "inactive" : "active")
          }
        }

      } catch (error: any) {
        console.error("Error fetching promo code:", error)
        setPromoCodeError(error.message || "Failed to load promo code details")
        toast({
          title: "Error",
          description: "Failed to load promo code details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingPromoCode(false)
      }
    }

    fetchPromoCodeData()
  }, [promoCodeId, toast])

  // Fetch events and games data
  useEffect(() => {
    const fetchEventsAndGames = async () => {
      try {
        setIsLoadingEvents(true)
        setEventsError(null)

        // Fetch events with games
        const eventsData = await getEventsForSelector()
        setEvents(eventsData)

        // Fetch all games
        const gamesData = await getAllGamesFromEvents()
        setAllGames(gamesData)

        console.log("Loaded events:", eventsData)
        console.log("Loaded games:", gamesData)
      } catch (error: any) {
        console.error("Error fetching events and games:", error)
        setEventsError(error.message || "Failed to load events and games")
        toast({
          title: "Warning",
          description: "Failed to load events and games. Some features may not work properly.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingEvents(false)
      }
    }

    fetchEventsAndGames()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Prepare form data for validation
      const formData = {
        code,
        discount,
        discountType,
        minPurchase,
        validFrom,
        validTo,
        usageLimit,
      };

      // Validate form data
      const validation = validatePromoCodeForm(formData);
      if (!validation.isValid) {
        setFormErrors(validation.errors);
        toast({
          title: "Validation Error",
          description: validation.errors.join(", "),
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Clear form errors if validation passes
      setFormErrors([]);

      // Check if events are selected when not applying to all
      if (!applyToAll && selectedEvents.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please select at least one event or apply to all events.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Transform form data to update API format
      const updateApiData = transformFormDataToUpdateAPI(
        {
          code,
          discount,
          discountType,
          maxDiscount,
          minPurchase,
          validFrom,
          validTo,
          usageLimit,
          description,
          status
        },
        selectedEvents,
        selectedGames,
        applyToAll,
        events,
        usageCount
      );

      // Add the ID for update
      const updateData: UpdatePromoCodeRequest = {
        id: parseInt(promoCodeId),
        ...updateApiData
      };

      console.log("Updating promo code with data:", updateData);

      // Call the API to update the promo code
      const response = await updatePromoCode(updateData);

      console.log("Promo code update response:", response);

      if (response.success) {
        setIsSaved(true);
        toast({
          title: "Success",
          description: "Promo code updated successfully!",
        });

        // Reset the saved state and redirect after a short delay
        setTimeout(() => {
          setIsSaved(false);
          router.push(`/admin/promo-codes/${promoCodeId}`);
        }, 1500);
      } else {
        throw new Error(response.error || "Failed to update promo code");
      }

    } catch (error: any) {
      console.error("Error updating promo code:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update promo code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleEventChange = (eventId: string, checked: boolean) => {
    if (checked) {
      setSelectedEvents([...selectedEvents, eventId])
    } else {
      setSelectedEvents(selectedEvents.filter(id => id !== eventId))
      // Also remove any games associated with this event
      setSelectedGames(selectedGames.filter(gameId => !gameId.startsWith(`${eventId}-`)))
    }
  }

  const handleGameChange = (gameId: string, checked: boolean) => {
    if (checked) {
      setSelectedGames([...selectedGames, gameId])
    } else {
      setSelectedGames(selectedGames.filter(id => id !== gameId))
    }
  }

  // Show loading state
  if (isLoadingPromoCode) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading promo code...</h2>
          <p className="text-muted-foreground">Please wait while we fetch the promo code details.</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (promoCodeError || !promoCode) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Promo code not found</h2>
          <p className="text-muted-foreground">
            {promoCodeError || "The promo code you are looking for does not exist."}
          </p>
          <Button className="mt-4" onClick={() => router.push("/admin/promo-codes")}>
            Back to Promo Codes
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
            <Link href={`/admin/promo-codes/${promoCodeId}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">Edit Promo Code</h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">Update promo code details for {promoCode.promo_code}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Promo Code Information</CardTitle>
            <CardDescription>Update the promo code details below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Promo Code</Label>
              <Input 
                id="code" 
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
                placeholder="Enter promo code"
                required
              />
              <p className="text-sm text-muted-foreground">
                This is the code that users will enter during checkout.
              </p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type</Label>
                <Select value={discountType} onValueChange={setDiscountType} required>
                  <SelectTrigger id="discountType">
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    {discountTypes.map((type) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discount">Discount Value</Label>
                <Input 
                  id="discount" 
                  type="number"
                  value={discount} 
                  onChange={(e) => setDiscount(e.target.value)} 
                  placeholder={discountType === "percentage" ? "Enter percentage" : "Enter amount"}
                  min="0"
                  required
                />
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxDiscount">Maximum Discount (Optional)</Label>
                <Input 
                  id="maxDiscount" 
                  type="number"
                  value={maxDiscount} 
                  onChange={(e) => setMaxDiscount(e.target.value)} 
                  placeholder="Enter maximum discount amount"
                  min="0"
                  disabled={discountType !== "percentage"}
                />
                <p className="text-sm text-muted-foreground">
                  Only applicable for percentage discounts.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="minPurchase">Minimum Purchase</Label>
                <Input 
                  id="minPurchase" 
                  type="number"
                  value={minPurchase} 
                  onChange={(e) => setMinPurchase(e.target.value)} 
                  placeholder="Enter minimum purchase amount"
                  min="0"
                  required
                />
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From</Label>
                <Input 
                  id="validFrom" 
                  type="date"
                  value={validFrom} 
                  onChange={(e) => setValidFrom(e.target.value)} 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="validTo">Valid To</Label>
                <Input 
                  id="validTo" 
                  type="date"
                  value={validTo} 
                  onChange={(e) => setValidTo(e.target.value)} 
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="usageLimit">Usage Limit</Label>
              <Input 
                id="usageLimit" 
                type="number"
                value={usageLimit} 
                onChange={(e) => setUsageLimit(e.target.value)} 
                placeholder="Enter usage limit"
                min="1"
                required
              />
              <p className="text-sm text-muted-foreground">
                Maximum number of times this promo code can be used.
              </p>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus} required>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Inactive promo codes cannot be used. Expired codes are automatically disabled.
              </p>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <Label>Applicable Events</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="applyToAll" 
                  checked={applyToAll} 
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedEvents([])
                      setSelectedGames([])
                    }
                    setApplyToAll(!!checked)
                  }} 
                />
                <label
                  htmlFor="applyToAll"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Apply to all events and games
                </label>
              </div>
              
              {!applyToAll && (
                <div className="space-y-4">
                  {isLoadingEvents ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2 text-sm text-muted-foreground">Loading events...</span>
                    </div>
                  ) : eventsError ? (
                    <div className="text-sm text-red-500 p-3 bg-red-50 rounded-md">
                      Error loading events: {eventsError}
                    </div>
                  ) : events.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-3 bg-gray-50 rounded-md">
                      No events available
                    </div>
                  ) : (
                    <>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Select Events:</h4>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {events.map((event) => (
                            <div key={event.id} className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`event-${event.id}`}
                                  checked={selectedEvents.includes(event.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedEvents([...selectedEvents, event.id])
                                    } else {
                                      setSelectedEvents(selectedEvents.filter(e => e !== event.id))
                                      // Remove games from this event
                                      const eventGameIds = event.games.map(g => `${event.id}-${g.id}`)
                                      setSelectedGames(selectedGames.filter(g => !eventGameIds.includes(g)))
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`event-${event.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {event.name}
                                </label>
                              </div>

                              {selectedEvents.includes(event.id) && event.games.length > 0 && (
                                <div className="ml-6 space-y-1">
                                  <p className="text-xs text-muted-foreground">Games in this event:</p>
                                  {event.games.map((game) => (
                                    <div key={game.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`game-${event.id}-${game.id}`}
                                        checked={selectedGames.includes(`${event.id}-${game.id}`)}
                                        onCheckedChange={(checked) => {
                                          const gameId = `${event.id}-${game.id}`
                                          if (checked) {
                                            setSelectedGames([...selectedGames, gameId])
                                          } else {
                                            setSelectedGames(selectedGames.filter(g => g !== gameId))
                                          }
                                        }}
                                      />
                                      <label
                                        htmlFor={`game-${event.id}-${game.id}`}
                                        className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                      >
                                        {game.name}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {!applyToAll && selectedEvents.length === 0 && !isLoadingEvents && (
                <p className="text-sm text-red-500">
                  Please select at least one event or apply to all events.
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Enter description"
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                This description is for internal use only.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href={`/admin/promo-codes/${promoCodeId}`}>
                Cancel
              </Link>
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isSaved || isLoadingEvents || (applyToAll === false && selectedEvents.length === 0)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isSaved ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>View usage statistics for this promo code</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Usage Count</h3>
                  <p className="mt-2 text-2xl font-bold">{usageCount}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Usage Limit</h3>
                  <p className="mt-2 text-2xl font-bold">{usageLimit}</p>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-muted-foreground">Usage Progress</h3>
                <div className="mt-2 h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${(usageCount / parseInt(usageLimit)) * 100}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {Math.round((usageCount / parseInt(usageLimit)) * 100)}% of total limit used
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
