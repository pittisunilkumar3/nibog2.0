"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Loader2, AlertTriangle, Plus, Trash, Check, Calendar, Clock, MapPin, User, Mail, Phone, CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDateShort } from "@/lib/utils"
import { getCitiesWithBookingInfo, type BookingCity, type BookingEvent, type BookingGameSlot } from "@/services/cityService"
import { registerBooking, formatBookingDataForAPI } from "@/services/bookingRegistrationService"
import { Badge } from "@/components/ui/badge"

// Payment method options
const paymentMethods = [
  { id: "cash", name: "Cash" },
  { id: "upi", name: "UPI" },
  { id: "card", name: "Card" },
  { id: "netbanking", name: "Net Banking" },
  { id: "wallet", name: "Wallet" },
]

// Payment status options
const paymentStatuses = [
  { id: "pending", name: "Pending" },
  { id: "paid", name: "Paid" },
  { id: "failed", name: "Failed" },
  { id: "refunded", name: "Refunded" },
]

// Gender options
const genderOptions = [
  { id: "male", name: "Male" },
  { id: "female", name: "Female" },
  { id: "other", name: "Other" },
]

interface ChildForm {
  full_name: string
  date_of_birth: string
  gender: string
  school_name: string
  games: {
    slot_id: number
    game_id: number
    game_price: number
    game_name?: string
    slot_title?: string
  }[]
  eligibleGames: BookingGameSlot[]
}

export default function NewBookingPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // Loading states
  const [isLoadingCities, setIsLoadingCities] = useState(true)
  const [isLoadingGames, setIsLoadingGames] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Data
  const [cities, setCities] = useState<BookingCity[]>([])
  const [selectedCity, setSelectedCity] = useState<BookingCity | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null)
  
  // Form state - Parent
  const [parentName, setParentName] = useState("")
  const [parentEmail, setParentEmail] = useState("")
  const [parentPhone, setParentPhone] = useState("")
  
  // Form state - Children
  const [children, setChildren] = useState<ChildForm[]>([
    { full_name: "", date_of_birth: "", gender: "", school_name: "", games: [], eligibleGames: [] }
  ])
  
  // Form state - Payment
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [paymentStatus, setPaymentStatus] = useState("pending")
  const [termsAccepted, setTermsAccepted] = useState(true)
  
  // Calculated total
  const totalAmount = children.reduce((sum, child) => 
    sum + child.games.reduce((gSum, game) => gSum + Number(game.game_price || 0), 0), 0
  )

  // Fetch cities on mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setIsLoadingCities(true)
        const data = await getCitiesWithBookingInfo()
        setCities(data)
      } catch (error: any) {
        console.error("Failed to fetch cities:", error)
        toast({
          title: "Error",
          description: "Failed to load cities. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingCities(false)
      }
    }
    fetchCities()
  }, [toast])

  // Handle city selection
  const handleCityChange = (cityId: string) => {
    const city = cities.find(c => String(c.id) === cityId)
    setSelectedCity(city || null)
    setSelectedEvent(null)
    // Reset children games when city changes
    setChildren(children.map(c => ({ ...c, games: [], eligibleGames: [] })))
  }

  // Handle event selection
  const handleEventChange = (eventId: string) => {
    const event = selectedCity?.events.find(e => String(e.id) === eventId)
    setSelectedEvent(event || null)
    // Reset children games when event changes
    setChildren(children.map(c => ({ ...c, games: [], eligibleGames: [] })))
  }

  // Calculate child age in months at event date
  const calculateChildAge = (dob: string): number => {
    if (!dob || !selectedEvent?.event_date) return 0
    const birthDate = new Date(dob)
    const eventDate = new Date(selectedEvent.event_date)
    const months = (eventDate.getFullYear() - birthDate.getFullYear()) * 12 + 
                   (eventDate.getMonth() - birthDate.getMonth())
    return Math.max(0, months)
  }

  // Load eligible games for a child based on age
  const loadEligibleGames = async (childIndex: number) => {
    const child = children[childIndex]
    if (!child.date_of_birth || !selectedEvent) {
      toast({
        title: "Missing Information",
        description: "Please enter child's date of birth first.",
        variant: "destructive",
      })
      return
    }

    const childAge = calculateChildAge(child.date_of_birth)
    
    try {
      setIsLoadingGames(true)
      
      // Filter games from the event that match the child's age
      const eligibleGames = selectedEvent.games_with_slots?.filter(game => {
        const minAge = game.min_age || 0
        const maxAge = game.max_age || 120
        return childAge >= minAge && childAge <= maxAge
      }) || []
      
      const updatedChildren = [...children]
      updatedChildren[childIndex].eligibleGames = eligibleGames
      setChildren(updatedChildren)
      
      if (eligibleGames.length === 0) {
        toast({
          title: "No Games Available",
          description: `No games available for a ${childAge}-month-old child at this event.`,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Failed to load games:", error)
      toast({
        title: "Error",
        description: "Failed to load eligible games.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingGames(false)
    }
  }

  // Add a game to a child
  const addGameToChild = (childIndex: number, slotId: string) => {
    const child = children[childIndex]
    const game = child.eligibleGames.find(g => String(g.slot_id) === slotId)
    
    if (!game) return
    
    // Check if game already added
    if (child.games.some(g => g.slot_id === game.slot_id)) {
      toast({
        title: "Game Already Added",
        description: "This game has already been added to the child.",
        variant: "destructive",
      })
      return
    }
    
    const updatedChildren = [...children]
    updatedChildren[childIndex].games.push({
      slot_id: game.slot_id,
      game_id: game.game_id,
      game_price: Number(game.price) || 0,
      game_name: game.game_name,
      slot_title: game.custom_title || `${game.start_time} - ${game.end_time}`
    })
    setChildren(updatedChildren)
  }

  // Remove a game from a child
  const removeGameFromChild = (childIndex: number, gameIndex: number) => {
    const updatedChildren = [...children]
    updatedChildren[childIndex].games.splice(gameIndex, 1)
    setChildren(updatedChildren)
  }

  // Add a new child
  const addChild = () => {
    setChildren([...children, { 
      full_name: "", 
      date_of_birth: "", 
      gender: "", 
      school_name: "", 
      games: [], 
      eligibleGames: [] 
    }])
  }

  // Remove a child
  const removeChild = (index: number) => {
    if (children.length === 1) {
      toast({
        title: "Cannot Remove",
        description: "At least one child is required for a booking.",
        variant: "destructive",
      })
      return
    }
    const updatedChildren = [...children]
    updatedChildren.splice(index, 1)
    setChildren(updatedChildren)
  }

  // Update child field
  const updateChild = (index: number, field: keyof ChildForm, value: any) => {
    const updatedChildren = [...children]
    updatedChildren[index] = { ...updatedChildren[index], [field]: value }
    setChildren(updatedChildren)
  }

  // Validate form
  const validateForm = (): boolean => {
    if (!selectedEvent) {
      toast({ title: "Error", description: "Please select an event.", variant: "destructive" })
      return false
    }
    if (!parentName.trim()) {
      toast({ title: "Error", description: "Parent name is required.", variant: "destructive" })
      return false
    }
    if (!parentEmail.trim() || !parentEmail.includes("@")) {
      toast({ title: "Error", description: "Valid parent email is required.", variant: "destructive" })
      return false
    }
    if (!parentPhone.trim()) {
      toast({ title: "Error", description: "Parent phone is required.", variant: "destructive" })
      return false
    }
    
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      if (!child.full_name.trim()) {
        toast({ title: "Error", description: `Child ${i + 1} name is required.`, variant: "destructive" })
        return false
      }
      if (!child.date_of_birth) {
        toast({ title: "Error", description: `Child ${i + 1} date of birth is required.`, variant: "destructive" })
        return false
      }
      if (!child.gender) {
        toast({ title: "Error", description: `Child ${i + 1} gender is required.`, variant: "destructive" })
        return false
      }
      if (child.games.length === 0) {
        toast({ title: "Error", description: `Child ${i + 1} must have at least one game.`, variant: "destructive" })
        return false
      }
    }
    
    return true
  }

  // Submit booking
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setIsSubmitting(true)
      
      // Prepare booking data for each child
      // Note: The current API expects a single child, so we'll create bookings one at a time
      // or modify to support multiple children
      
      const bookingPromises = children.map(child => {
        const bookingData = {
          userId: 0, // Admin booking, no user ID needed
          parentName: parentName.trim(),
          email: parentEmail.trim(),
          phone: parentPhone.trim(),
          childName: child.full_name.trim(),
          childDob: child.date_of_birth,
          schoolName: child.school_name.trim(),
          gender: child.gender,
          eventId: selectedEvent!.id,
          gameId: child.games.map(g => g.game_id),
          gamePrice: child.games.map(g => g.game_price),
          slotId: child.games.map(g => g.slot_id),
          totalAmount: child.games.reduce((sum, g) => sum + g.game_price, 0),
          paymentMethod: paymentMethod,
          paymentStatus: paymentStatus,
          termsAccepted: termsAccepted,
        }
        
        return registerBooking(formatBookingDataForAPI(bookingData))
      })
      
      const results = await Promise.all(bookingPromises)
      
      toast({
        title: "Success",
        description: `Booking created successfully! ${results.length} child(ren) registered.`,
      })
      
      // Navigate to bookings list
      router.push("/admin/bookings")
      
    } catch (error: any) {
      console.error("Failed to create booking:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingCities) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <h2 className="text-xl font-semibold">Loading booking data...</h2>
          <p className="text-muted-foreground">Please wait while we fetch cities and events.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/bookings">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create New Booking</h1>
            <p className="text-muted-foreground">Register a new booking for an event</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* City and Event Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Event Selection
                </CardTitle>
                <CardDescription>Select a city and event for the booking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Select onValueChange={handleCityChange} disabled={isSubmitting}>
                      <SelectTrigger id="city">
                        <SelectValue placeholder="Select a city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city.id} value={String(city.id)}>
                            {city.city_name}, {city.state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedCity && (
                      <p className="text-xs text-muted-foreground">
                        {selectedCity.total_events} event(s) available
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="event">Event *</Label>
                    <Select 
                      onValueChange={handleEventChange} 
                      disabled={!selectedCity || isSubmitting}
                    >
                      <SelectTrigger id="event">
                        <SelectValue placeholder={selectedCity ? "Select an event" : "Select a city first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCity?.events.map(event => (
                          <SelectItem key={event.id} value={String(event.id)}>
                            {event.title} - {formatDateShort(event.event_date)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {selectedEvent && (
                  <div className="mt-4 p-4 rounded-lg border bg-muted/50">
                    <h4 className="font-medium">{selectedEvent.title}</h4>
                    <div className="grid gap-2 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDateShort(selectedEvent.event_date)}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {selectedEvent.venue_name}, {selectedEvent.venue_address}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {selectedEvent.games_with_slots?.length || 0} games available
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Parent Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Parent Information
                </CardTitle>
                <CardDescription>Enter the parent/guardian details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="parentName">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="parentName"
                        value={parentName}
                        onChange={e => setParentName(e.target.value)}
                        placeholder="Parent's name"
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="parentEmail">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="parentEmail"
                        type="email"
                        value={parentEmail}
                        onChange={e => setParentEmail(e.target.value)}
                        placeholder="parent@email.com"
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="parentPhone">Phone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="parentPhone"
                        value={parentPhone}
                        onChange={e => setParentPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Children Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Children Information
                    </CardTitle>
                    <CardDescription>Add children and their game selections</CardDescription>
                  </div>
                  <Button type="button" size="sm" onClick={addChild} disabled={isSubmitting}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Child
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {children.map((child, childIndex) => (
                  <div key={childIndex} className="p-4 rounded-lg border space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Child {childIndex + 1}</h4>
                      {children.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeChild(childIndex)}
                          disabled={isSubmitting}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-4">
                      <div className="space-y-2">
                        <Label>Full Name *</Label>
                        <Input
                          value={child.full_name}
                          onChange={e => updateChild(childIndex, "full_name", e.target.value)}
                          placeholder="Child's name"
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Date of Birth *</Label>
                        <Input
                          type="date"
                          value={child.date_of_birth}
                          onChange={e => {
                            const newDob = e.target.value
                            // Use functional update to ensure all changes are applied atomically
                            setChildren(prev => {
                              const updated = [...prev]
                              updated[childIndex] = { 
                                ...updated[childIndex], 
                                date_of_birth: newDob,
                                eligibleGames: [],
                                games: []
                              }
                              return updated
                            })
                          }}
                          onClick={(e) => {
                            // Auto-open calendar on click (especially helpful for small screens)
                            const input = e.target as HTMLInputElement;
                            if (input.showPicker) {
                              try {
                                input.showPicker();
                              } catch (err) {
                                // showPicker may fail if called multiple times, ignore
                              }
                            }
                          }}
                          onFocus={(e) => {
                            // Also trigger on focus for better mobile support
                            const input = e.target as HTMLInputElement;
                            if (input.showPicker && !child.date_of_birth) {
                              try {
                                input.showPicker();
                              } catch (err) {
                                // Ignore errors
                              }
                            }
                          }}
                          className="cursor-pointer"
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Gender *</Label>
                        <Select
                          value={child.gender}
                          onValueChange={val => updateChild(childIndex, "gender", val)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {genderOptions.map(opt => (
                              <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>School Name</Label>
                        <Input
                          value={child.school_name}
                          onChange={e => updateChild(childIndex, "school_name", e.target.value)}
                          placeholder="School (optional)"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    
                    {/* Games Selection */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Games *</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => loadEligibleGames(childIndex)}
                          disabled={!child.date_of_birth || !selectedEvent || isSubmitting || isLoadingGames}
                        >
                          {isLoadingGames ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="mr-2 h-4 w-4" />
                          )}
                          Load Eligible Games
                        </Button>
                      </div>
                      
                      {/* Selected Games */}
                      {child.games.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Selected Games:</Label>
                          <div className="flex flex-wrap gap-2">
                            {child.games.map((game, gameIndex) => (
                              <Badge key={gameIndex} variant="secondary" className="flex items-center gap-2">
                                <span>{game.game_name || `Game #${game.game_id}`}</span>
                                <span className="text-xs">({game.slot_title})</span>
                                <span className="text-green-600">₹{game.game_price}</span>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-4 w-4 p-0"
                                  onClick={() => removeGameFromChild(childIndex, gameIndex)}
                                  disabled={isSubmitting}
                                >
                                  <Trash className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Add Game Dropdown */}
                      {child.eligibleGames.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Add a game:</Label>
                          <Select onValueChange={val => addGameToChild(childIndex, val)} disabled={isSubmitting}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a game to add" />
                            </SelectTrigger>
                            <SelectContent>
                              {child.eligibleGames.map(game => (
                                <SelectItem 
                                  key={game.slot_id} 
                                  value={String(game.slot_id)}
                                  disabled={child.games.some(g => g.slot_id === game.slot_id)}
                                >
                                  {game.custom_title || game.game_name} - {game.start_time} to {game.end_time} 
                                  <span className="text-green-600 ml-2">₹{game.price}</span>
                                  {game.available_slots !== undefined && (
                                    <span className="text-muted-foreground ml-2">({game.available_slots} slots left)</span>
                                  )}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      {child.date_of_birth && child.eligibleGames.length === 0 && !isLoadingGames && (
                        <p className="text-sm text-muted-foreground">
                          Click "Load Eligible Games" to see available games for this child's age.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Payment & Summary */}
          <div className="space-y-6">
            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={isSubmitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map(method => (
                        <SelectItem key={method.id} value={method.id}>{method.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Payment Status</Label>
                  <Select value={paymentStatus} onValueChange={setPaymentStatus} disabled={isSubmitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentStatuses.map(status => (
                        <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Booking Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Event:</span>
                    <span className="font-medium">{selectedEvent?.title || "Not selected"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Children:</span>
                    <span className="font-medium">{children.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Games:</span>
                    <span className="font-medium">
                      {children.reduce((sum, c) => sum + c.games.length, 0)}
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  {children.map((child, idx) => (
                    child.games.length > 0 && (
                      <div key={idx} className="text-sm">
                        <div className="font-medium">{child.full_name || `Child ${idx + 1}`}</div>
                        {child.games.map((game, gIdx) => (
                          <div key={gIdx} className="flex justify-between text-muted-foreground pl-2">
                            <span className="truncate">{game.game_name || `Game ${gIdx + 1}`}</span>
                            <span>₹{game.game_price}</span>
                          </div>
                        ))}
                      </div>
                    )
                  ))}
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-green-600">₹{totalAmount}</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || !selectedEvent || totalAmount === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Create Booking
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push("/admin/bookings")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
