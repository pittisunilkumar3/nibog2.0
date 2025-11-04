"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CreditCard, Calendar, Clock, MapPin, Baby, AlertTriangle, CheckCircle2 } from "lucide-react"
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
import { useAuth } from "@/contexts/auth-context"

// Mock data - in a real app, this would come from an API
const events = [
  {
    id: "E001",
    title: "Baby Sensory Play",
    description: "Engage your baby's senses with various textures, sounds, and colors.",
    image: "/placeholder.svg?height=200&width=300",
    venue: {
      name: "Little Explorers Center",
      address: "123 Play Street, Andheri West",
      city: "Mumbai",
    },
    date: "2025-04-15",
    slots: [
      { 
        id: "S001", 
        startTime: "10:00 AM", 
        endTime: "11:30 AM", 
        price: 799, 
      },
      { 
        id: "S002", 
        startTime: "02:00 PM", 
        endTime: "03:30 PM", 
        price: 799, 
      },
    ],
  },
]

// Mock user data - in a real app, this would come from authentication
const user = {
  isLoggedIn: true,
  name: "Priya Sharma",
  email: "priya@example.com",
  phone: "+91 9876543210",
  children: [
    {
      id: "C001",
      name: "Aryan",
      dob: "2023-02-15",
      ageInMonths: 14,
    },
    {
      id: "C002",
      name: "Zara",
      dob: "2023-06-10",
      ageInMonths: 10,
    },
  ],
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user: authUser, isLoading: authLoading, isAuthenticated } = useAuth()

  const eventId = searchParams.get("event")
  const slotId = searchParams.get("slot")
  const childId = searchParams.get("child")

  const [event, setEvent] = useState<any>(null)
  const [slot, setSlot] = useState<any>(null)
  const [child, setChild] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCvv] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [bookingId, setBookingId] = useState("")

  // Check authentication on mount
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Store the current URL for redirecting back after login
      const currentUrl = `/checkout?${searchParams.toString()}`
      router.push(`/login?callbackUrl=${encodeURIComponent(currentUrl)}`)
    }
  }, [authLoading, isAuthenticated, router, searchParams])

  // Load data based on URL params
  useEffect(() => {
    if (eventId) {
      const foundEvent = events.find((e) => e.id === eventId)
      setEvent(foundEvent)

      if (foundEvent && slotId) {
        const foundSlot = foundEvent.slots.find((s) => s.id === slotId)
        setSlot(foundSlot)
      }
    }

    if (childId) {
      const foundChild = user.children.find((c) => c.id === childId)
      setChild(foundChild)
    }
  }, [eventId, slotId, childId])

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="container flex h-[400px] items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!isAuthenticated) {
    return null
  }
  
  // Handle payment submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (paymentMethod === "card") {
      if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
        alert("Please fill in all card details.")
        return
      }
    }
    
    // Process payment
    setIsProcessing(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false)
      setIsSuccess(true)
      setBookingId(`B${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`)
    }, 2000)
  }
  
  // If any required data is missing, show error
  if (!event || !slot || !child) {
    return (
      <div className="container flex h-[400px] items-center justify-center py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Invalid Checkout</h2>
          <p className="text-muted-foreground">Missing required information for checkout.</p>
          <Button className="mt-4" asChild>
            <Link href="/events">Browse Events</Link>
          </Button>
        </div>
      </div>
    )
  }

  // If payment is successful, show success message
  if (isSuccess) {
    return (
      <div className="container py-8">
        <div className="mx-auto max-w-md">
          <div className="rounded-lg border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-500">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
            <p className="mt-2 text-muted-foreground">
              Your booking for {event.title} has been confirmed.
            </p>
            <div className="mt-4 rounded-md bg-muted p-4 text-left">
              <p className="text-sm">
                <span className="font-medium">Booking ID:</span> {bookingId}
              </p>
              <p className="text-sm">
                <span className="font-medium">Event:</span> {event.title}
              </p>
              <p className="text-sm">
                <span className="font-medium">Date:</span> {event.date}
              </p>
              <p className="text-sm">
                <span className="font-medium">Time:</span> {slot.startTime} - {slot.endTime}
              </p>
              <p className="text-sm">
                <span className="font-medium">Venue:</span> {event.venue.name}, {event.venue.city}
              </p>
              <p className="text-sm">
                <span className="font-medium">Child:</span> {child.name}
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <Button asChild>
                <Link href={`/dashboard/bookings/${bookingId}`}>View Booking Details</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/bookings">View All Bookings</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/events/${eventId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
          <p className="text-muted-foreground">Complete your booking for {event.title}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              </div>

              <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">{event.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">
                      {slot.startTime} - {slot.endTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Venue</p>
                    <p className="text-sm text-muted-foreground">
                      {event.venue.name}, {event.venue.city}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Baby className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Child</p>
                    <p className="text-sm text-muted-foreground">{child.name}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-md bg-muted p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500" />
                  <div className="text-sm">
                    <p className="font-medium">Cancellation Policy</p>
                    <p className="text-muted-foreground">
                      Full refund if cancelled at least 24 hours before the event. No refund for cancellations within 24 hours of the event.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Event Price</span>
                  <span>₹{slot.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Booking Fee</span>
                  <span>₹0</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>₹{slot.price}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Complete your payment to confirm booking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Credit/Debit Card
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi">UPI</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="netbanking" id="netbanking" />
                      <Label htmlFor="netbanking">Net Banking</Label>
                    </div>
                  </RadioGroup>
                </div>

                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input
                        id="cardName"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardExpiry">Expiry Date</Label>
                        <Input
                          id="cardExpiry"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardCvv">CVV</Label>
                        <Input
                          id="cardCvv"
                          placeholder="123"
                          value={cardCvv}
                          onChange={(e) => setCvv(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "upi" && (
                  <div className="space-y-2">
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input id="upiId" placeholder="name@upi" />
                  </div>
                )}

                {paymentMethod === "netbanking" && (
                  <div className="space-y-2">
                    <Label htmlFor="bank">Select Bank</Label>
                    <select
                      id="bank"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Select a bank</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                      <option value="kotak">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? "Processing..." : `Pay ₹${slot.price}`}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
