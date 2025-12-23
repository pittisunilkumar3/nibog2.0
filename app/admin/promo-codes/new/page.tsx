"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Loader2, AlertTriangle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { getEventsForSelector, getAllGamesFromEvents } from "@/services/eventGameService"
import { createPromoCode, transformFormDataToAPI, validatePromoCodeForm } from "@/services/promoCodeService"

// Discount types
const discountTypes = [
  { id: "1", name: "percentage", label: "Percentage" },
  { id: "2", name: "fixed", label: "Fixed Amount" },
]

export default function NewPromoCodePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [code, setCode] = useState("")
  const [discount, setDiscount] = useState("")
  const [discountType, setDiscountType] = useState("percentage")
  const [maxDiscount, setMaxDiscount] = useState("")
  const [minPurchase, setMinPurchase] = useState("")
  const [validFrom, setValidFrom] = useState("")
  const [validTo, setValidTo] = useState("")
  const [usageLimit, setUsageLimit] = useState("")
  const [description, setDescription] = useState("")
  const [applyToAll, setApplyToAll] = useState(true)
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [selectedGames, setSelectedGames] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [eventsError, setEventsError] = useState<string | null>(null)
  const [events, setEvents] = useState<Array<{id: string, name: string, games: Array<{id: string, name: string}>}>>([])
  const [allGames, setAllGames] = useState<Array<{id: string, name: string, eventName: string}>>([])
  const [formErrors, setFormErrors] = useState<string[]>([])

  // Fetch events and games data on component mount
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
      } catch (error: any) {
        console.error("Error fetching events and games:", error)
        setEventsError(error.message || "Failed to load events and games")
      } finally {
        setIsLoadingEvents(false)
      }
    }

    fetchEventsAndGames()
  }, [])

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

      // Transform form data to API format
      const apiData = transformFormDataToAPI(
        {
          code,
          discount,
          discountType,
          maxDiscount,
          minPurchase,
          validFrom,
          validTo,
          usageLimit,
          description
        },
        selectedEvents,
        selectedGames,
        applyToAll,
        events
      );

      // Call the API to create the promo code
      const response = await createPromoCode(apiData);

      if (response.success) {
        toast({
          title: "Success",
          description: "Promo code created successfully!",
        });

        // Redirect to the promo codes list
        router.push("/admin/promo-codes");
      } else {
        throw new Error(response.error || "Failed to create promo code");
      }

    } catch (error: any) {
      console.error("Error creating promo code:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create promo code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }



  // Generate a random promo code
  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = 'NIBOG'
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    setCode(result)
  }

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
            <h1 className="text-3xl font-bold tracking-tight">Create Promo Code</h1>
            <p className="text-muted-foreground">Add a new promo code for NIBOG events</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Promo Code Information</CardTitle>
            <CardDescription>Enter the details for the new promo code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Form Errors Display */}
            {formErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {formErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="code">Promo Code</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={generateRandomCode}
                >
                  Generate Random Code
                </Button>
              </div>
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
              <Link href="/admin/promo-codes">
                Cancel
              </Link>
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isLoadingEvents || (applyToAll === false && selectedEvents.length === 0)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Promo Code...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Promo Code
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
