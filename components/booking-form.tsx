"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "./ui/badge"
import { calculateAgeInMonths, formatAge, isChildEligible, formatPrice } from "@/lib/utils"
import type { Child } from "@/types"

// Mock data - in a real app, this would come from an API or context
const isAuthenticated = false
const children: Child[] = [
  { id: "1", userId: "u1", name: "Aryan", dob: "2024-01-15", createdAt: "", updatedAt: "" },
  { id: "2", userId: "u1", name: "Zara", dob: "2023-06-10", createdAt: "", updatedAt: "" },
]

type BookingFormProps = {
  eventId: string
  price: number
  spotsLeft: number
  minAgeMonths: number
  maxAgeMonths: number
  eventDate: string
  eventCity?: string
}

export default function BookingForm({
  eventId,
  price,
  spotsLeft,
  minAgeMonths,
  maxAgeMonths,
  eventDate,
  eventCity = "Hyderabad", // Default to Hyderabad if not provided
}: BookingFormProps) {
  const router = useRouter()
  const [selectedChild, setSelectedChild] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showAgeWarning, setShowAgeWarning] = useState(false)

  const handleApplyPromo = () => {
    // Mock promo code validation - in a real app, this would be an API call
    if (promoCode === "WELCOME10") {
      setDiscount(10)
    } else if (promoCode === "NIBOG20") {
      setDiscount(20)
    } else {
      setDiscount(0)
      alert("Invalid promo code")
    }
  }

  const totalPrice = price * quantity
  const discountAmount = (totalPrice * discount) / 100
  const finalAmount = totalPrice - discountAmount

  const handleBookNow = () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }

    if (!selectedChild) {
      alert("Please select a child")
      return
    }

    // Check age eligibility
    const selectedChildData = children.find((child) => child.id === selectedChild)
    if (selectedChildData) {
      const isEligible = isChildEligible(
        new Date(selectedChildData.dob),
        new Date(eventDate),
        minAgeMonths,
        maxAgeMonths,
      )

      if (!isEligible) {
        setShowAgeWarning(true)
        return
      }
    }

    // In a real app, this would be an API call to create a booking
    // For now, we'll just simulate a redirect to a payment page
    router.push(`/payment?eventId=${eventId}&childId=${selectedChild}&amount=${finalAmount}`)
  }

  // Calculate age for each child at the event date
  const childrenWithAge = children.map((child) => {
    const ageInMonths = calculateAgeInMonths(new Date(child.dob), new Date(eventDate))
    const isEligible = isChildEligible(new Date(child.dob), new Date(eventDate), minAgeMonths, maxAgeMonths)
    return {
      ...child,
      ageInMonths,
      isEligible,
    }
  })

  return (
    <div className="space-y-4">
      {isAuthenticated ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="child">Select Child</Label>
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger id="child">
                <SelectValue placeholder="Select a child" />
              </SelectTrigger>
              <SelectContent>
                {childrenWithAge.map((child) => (
                  <SelectItem
                    key={child.id}
                    value={child.id}
                    disabled={!child.isEligible}
                    className={!child.isEligible ? "opacity-50" : ""}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>
                        {child.name} ({formatAge(child.ageInMonths)})
                      </span>
                      {!child.isEligible && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Not eligible
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end">
              <Button variant="link" size="sm" className="h-auto p-0" asChild>
                <Link href="/dashboard/children">Add a child</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Number of Children</Label>
            <Select
              value={quantity.toString()}
              onValueChange={(value) => setQuantity(Number.parseInt(value))}
              disabled={spotsLeft < 2}
            >
              <SelectTrigger id="quantity">
                <SelectValue placeholder="Select quantity" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: Math.min(spotsLeft, 3) }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="promo">Promo Code</Label>
              <Input
                id="promo"
                placeholder="Enter code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={handleApplyPromo}>
                Apply
              </Button>
            </div>
          </div>

          <div className="rounded-md bg-muted p-3">
            <div className="flex items-center justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span>Discount ({discount}%)</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between font-medium">
              <span>Total</span>
              <span>{formatPrice(finalAmount)}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-md bg-muted p-4 text-center">
          <p className="mb-2 text-sm text-muted-foreground">Please log in or register to book this event</p>
        </div>
      )}

      <Button className="w-full" size="lg" asChild>
        <Link href={`/register-event?city=${eventCity}`}>
          Register Now
        </Link>
      </Button>

      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Login Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to be logged in to book an event. Would you like to login or register now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href="/login">Login</Link>
            </AlertDialogAction>
            <Button asChild>
              <Link href="/register">Register</Link>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showAgeWarning} onOpenChange={setShowAgeWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Age Requirement Not Met</AlertDialogTitle>
            <AlertDialogDescription>
              The selected child does not meet the age requirements for this event. This event is suitable for children
              aged {minAgeMonths}-{maxAgeMonths} months on the event date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowAgeWarning(false)}>Understand</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
